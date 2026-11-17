const express = require('express');
const { all, get, run } = require('../db');

const router = express.Router();
const STATUS_VALIDOS = ['Agendado', 'Concluído', 'Cancelado'];

// REGRA "Agendamentos (Listagem)": JOIN traz dados do agendamento + pet + tutor,
// e o ORDER BY ordena pela data do agendamento. Aceita filtro opcional ?status=
router.get('/', async (req, res) => {
  try {
    const condicoes = [];
    const parametros = [];
    if (req.query.status) {
      condicoes.push('a.status = ?');
      parametros.push(req.query.status);
    }
    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
    const lista = await all(
      `SELECT a.id, a.data_agendamento, a.servico, a.status, a.observacoes,
              p.id AS pet_id, p.nome AS pet, p.especie,
              t.nome AS tutor, t.telefone
       FROM agendamentos a
       JOIN pets p    ON p.id = a.pet_id
       JOIN tutores t ON t.id = p.tutor_id
       ${where}
       ORDER BY a.data_agendamento ASC`,
      parametros
    );
    res.json(lista);
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao listar agendamentos.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { pet_id, data_agendamento, servico, observacoes } = req.body;
    if (!pet_id || !data_agendamento || !servico || !servico.trim()) {
      return res.status(400).json({ erro: 'Pet, data e serviço são obrigatórios.' });
    }
    const pet = await get('SELECT id FROM pets WHERE id = ?', [pet_id]);
    if (!pet) return res.status(400).json({ erro: 'Pet não encontrado.' });

    // REGRA "Conflito de horário": evita dois agendamentos ativos no mesmo pet e horário
    // (falha presente no sistema original, que permitia duplicar o mesmo horário).
    const conflito = await get(
      `SELECT id FROM agendamentos
       WHERE pet_id = ? AND data_agendamento = ? AND status != 'Cancelado'`,
      [pet_id, data_agendamento]
    );
    if (conflito) return res.status(409).json({ erro: 'Já existe um agendamento para este pet nesse horário.' });

    const r = await run(
      'INSERT INTO agendamentos (pet_id, data_agendamento, servico, observacoes) VALUES (?, ?, ?, ?)',
      [pet_id, data_agendamento, servico.trim(), observacoes || null]
    );
    res.status(201).json({ id: r.lastID });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao criar agendamento.' });
  }
});

// REGRA "Agendamentos (Remarcar)": altera data e, opcionalmente, o serviço/observações.
router.put('/:id', async (req, res) => {
  try {
    const { data_agendamento, servico, observacoes } = req.body;
    if (!data_agendamento) return res.status(400).json({ erro: 'Informe a nova data.' });
    const agendamento = await get('SELECT * FROM agendamentos WHERE id = ?', [req.params.id]);
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado.' });

    await run(
      'UPDATE agendamentos SET data_agendamento=?, servico=?, observacoes=? WHERE id=?',
      [
        data_agendamento,
        servico && servico.trim() ? servico.trim() : agendamento.servico,
        observacoes !== undefined ? observacoes : agendamento.observacoes,
        req.params.id,
      ]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao atualizar agendamento.' });
  }
});

// REGRA "Agendamentos (Status)": o sistema original não permitia marcar como
// Concluído/Cancelado pela interface - só existia o status default "Agendado".
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ erro: `Status inválido. Use um de: ${STATUS_VALIDOS.join(', ')}.` });
    }
    const agendamento = await get('SELECT id FROM agendamentos WHERE id = ?', [req.params.id]);
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado.' });

    await run('UPDATE agendamentos SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao atualizar status.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const agendamento = await get('SELECT id FROM agendamentos WHERE id = ?', [req.params.id]);
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    await run('DELETE FROM agendamentos WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao excluir agendamento.' });
  }
});

module.exports = router;

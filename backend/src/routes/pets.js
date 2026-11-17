const express = require('express');
const { all, get, run } = require('../db');

const router = express.Router();

// REGRA "Pets (Listagem)": aceita filtros opcionais ?especie= e ?tutor_id=
router.get('/', async (req, res) => {
  try {
    const condicoes = [];
    const parametros = [];
    if (req.query.especie) {
      condicoes.push('p.especie = ?');
      parametros.push(req.query.especie);
    }
    if (req.query.tutor_id) {
      condicoes.push('p.tutor_id = ?');
      parametros.push(req.query.tutor_id);
    }
    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
    const pets = await all(
      `SELECT p.id, p.nome, p.especie, p.raca, p.data_nascimento, p.tutor_id, t.nome AS tutor
       FROM pets p JOIN tutores t ON t.id = p.tutor_id
       ${where}
       ORDER BY p.nome`,
      parametros
    );
    res.json(pets);
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao listar pets.' });
  }
});

// REGRA "Pets (Cadastro)": o pet só é salvo se o tutor existir.
router.post('/', async (req, res) => {
  try {
    const { nome, especie, raca, data_nascimento, tutor_id } = req.body;
    if (!nome || !nome.trim() || !especie || !especie.trim() || !tutor_id) {
      return res.status(400).json({ erro: 'Nome, espécie e tutor são obrigatórios.' });
    }
    const tutor = await get('SELECT id FROM tutores WHERE id = ?', [tutor_id]);
    if (!tutor) return res.status(400).json({ erro: 'Tutor não encontrado.' });

    const r = await run(
      'INSERT INTO pets (nome, especie, raca, data_nascimento, tutor_id) VALUES (?, ?, ?, ?, ?)',
      [nome.trim(), especie.trim(), raca || null, data_nascimento || null, tutor_id]
    );
    res.status(201).json({ id: r.lastID });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao cadastrar pet.' });
  }
});

// REGRA "Pets (Edição)": o sistema original não permitia editar um pet já cadastrado.
router.put('/:id', async (req, res) => {
  try {
    const { nome, especie, raca, data_nascimento, tutor_id } = req.body;
    if (!nome || !nome.trim() || !especie || !especie.trim() || !tutor_id) {
      return res.status(400).json({ erro: 'Nome, espécie e tutor são obrigatórios.' });
    }
    const pet = await get('SELECT id FROM pets WHERE id = ?', [req.params.id]);
    if (!pet) return res.status(404).json({ erro: 'Pet não encontrado.' });
    const tutor = await get('SELECT id FROM tutores WHERE id = ?', [tutor_id]);
    if (!tutor) return res.status(400).json({ erro: 'Tutor não encontrado.' });

    await run(
      'UPDATE pets SET nome=?, especie=?, raca=?, data_nascimento=?, tutor_id=? WHERE id=?',
      [nome.trim(), especie.trim(), raca || null, data_nascimento || null, tutor_id, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao atualizar pet.' });
  }
});

// REGRA "Pets (Exclusão)": remove o pet e, em cascata, seus agendamentos.
router.delete('/:id', async (req, res) => {
  try {
    const pet = await get('SELECT id FROM pets WHERE id = ?', [req.params.id]);
    if (!pet) return res.status(404).json({ erro: 'Pet não encontrado.' });
    await run('DELETE FROM pets WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao excluir pet.' });
  }
});

module.exports = router;

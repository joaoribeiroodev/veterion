const express = require('express');
const { all, get, run } = require('../db');
const { hashSensivel, hashBusca, soDigitos } = require('../crypto');
const { cpfValido, emailValido } = require('../validadores');

const router = express.Router();

// REGRA "Tutores (Busca)": ?busca=texto filtra por nome, e-mail ou telefone.
// O CPF nunca é devolvido pela API (fica protegido por hash).
router.get('/', async (req, res) => {
  try {
    const busca = `%${(req.query.busca || '').trim()}%`;
    const tutores = await all(
      `SELECT id, nome, telefone, email FROM tutores
       WHERE nome LIKE ? OR email LIKE ? OR telefone LIKE ?
       ORDER BY nome`,
      [busca, busca, busca]
    );
    res.json(tutores);
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao listar tutores.' });
  }
});

// Cadastro de tutor
router.post('/', async (req, res) => {
  try {
    const { nome, cpf, telefone, email } = req.body;
    const cpfLimpo = soDigitos(cpf);

    if (!nome || !nome.trim()) return res.status(400).json({ erro: 'Informe o nome do tutor.' });
    if (!cpfValido(cpfLimpo)) return res.status(400).json({ erro: 'CPF inválido.' });
    if (!emailValido(email)) return res.status(400).json({ erro: 'E-mail inválido.' });

    // REGRA "Duplicidade": impede cadastrar o mesmo CPF duas vezes
    // (o sistema original não conseguia checar isso, pois criptografava com salt aleatório).
    const cpfBusca = hashBusca(cpfLimpo);
    const existente = await get('SELECT id FROM tutores WHERE cpf_busca = ?', [cpfBusca]);
    if (existente) return res.status(409).json({ erro: 'Já existe um tutor cadastrado com esse CPF.' });

    const r = await run(
      'INSERT INTO tutores (nome, cpf_hash, cpf_busca, telefone, email) VALUES (?,?,?,?,?)',
      [nome.trim(), hashSensivel(cpfLimpo), cpfBusca, telefone || null, email || null]
    );
    res.status(201).json({ id: r.lastID });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao cadastrar tutor.' });
  }
});

// REGRA "Tutores (Edição)": atualiza os dados e salva no banco.
// O CPF só é alterado se um novo for digitado (e, nesse caso, é protegido de novo).
router.put('/:id', async (req, res) => {
  try {
    const { nome, cpf, telefone, email } = req.body;
    if (!nome || !nome.trim()) return res.status(400).json({ erro: 'O nome é obrigatório.' });
    if (!emailValido(email)) return res.status(400).json({ erro: 'E-mail inválido.' });

    const tutor = await get('SELECT id FROM tutores WHERE id = ?', [req.params.id]);
    if (!tutor) return res.status(404).json({ erro: 'Tutor não encontrado.' });

    const cpfLimpo = soDigitos(cpf);
    if (cpfLimpo) {
      if (!cpfValido(cpfLimpo)) return res.status(400).json({ erro: 'CPF inválido.' });
      const cpfBusca = hashBusca(cpfLimpo);
      const duplicado = await get('SELECT id FROM tutores WHERE cpf_busca = ? AND id != ?', [cpfBusca, req.params.id]);
      if (duplicado) return res.status(409).json({ erro: 'Já existe outro tutor cadastrado com esse CPF.' });

      await run('UPDATE tutores SET nome=?, cpf_hash=?, cpf_busca=?, telefone=?, email=? WHERE id=?',
        [nome.trim(), hashSensivel(cpfLimpo), cpfBusca, telefone || null, email || null, req.params.id]);
    } else {
      await run('UPDATE tutores SET nome=?, telefone=?, email=? WHERE id=?',
        [nome.trim(), telefone || null, email || null, req.params.id]);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao atualizar tutor.' });
  }
});

// REGRA "Tutores (Exclusão)": remove o tutor e, em cascata, seus pets e agendamentos.
router.delete('/:id', async (req, res) => {
  try {
    const tutor = await get('SELECT id FROM tutores WHERE id = ?', [req.params.id]);
    if (!tutor) return res.status(404).json({ erro: 'Tutor não encontrado.' });
    await run('DELETE FROM tutores WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao excluir tutor.' });
  }
});

module.exports = router;

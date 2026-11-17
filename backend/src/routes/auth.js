const express = require('express');
const { get } = require('../db');
const { confereSensivel } = require('../crypto');

const router = express.Router();

// REGRA "Login": credenciais erradas => 401 com mensagem (o front exibe o erro).
router.post('/login', async (req, res) => {
  try {
    const { login, senha } = req.body;
    if (!login || !senha) {
      return res.status(400).json({ erro: 'Informe usuário e senha.' });
    }
    const usuario = await get('SELECT * FROM usuarios WHERE login = ?', [login]);
    if (!usuario || !confereSensivel(senha, usuario.senha_hash)) {
      return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
    }
    res.json({ id: usuario.id, nome: usuario.nome, papel: usuario.papel });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao autenticar.' });
  }
});

module.exports = router;

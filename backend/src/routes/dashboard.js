const express = require('express');
const { get } = require('../db');

const router = express.Router();

// NOVO em relação ao sistema original: resumo numérico para a tela inicial
// (o dashboard antigo era só uma lista estática de atalhos).
router.get('/resumo', async (req, res) => {
  try {
    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0);
    const hojeFim = new Date();
    hojeFim.setHours(23, 59, 59, 999);

    const [tutores, pets, agendamentosHoje, agendamentosAbertos] = await Promise.all([
      get('SELECT COUNT(*) AS total FROM tutores'),
      get('SELECT COUNT(*) AS total FROM pets'),
      get(
        `SELECT COUNT(*) AS total FROM agendamentos
         WHERE data_agendamento BETWEEN ? AND ? AND status = 'Agendado'`,
        [hojeInicio.toISOString(), hojeFim.toISOString()]
      ),
      get(`SELECT COUNT(*) AS total FROM agendamentos WHERE status = 'Agendado'`),
    ]);

    res.json({
      totalTutores: tutores.total,
      totalPets: pets.total,
      agendamentosHoje: agendamentosHoje.total,
      agendamentosAbertos: agendamentosAbertos.total,
    });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao carregar o resumo.' });
  }
});

module.exports = router;

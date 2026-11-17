// =====================================================
// Veterion API - servidor Express
// Sistema de gestão para clínicas veterinárias
// =====================================================
const express = require('express');
const cors = require('cors');

const { iniciar } = require('./src/db');
const authRoutes = require('./src/routes/auth');
const tutoresRoutes = require('./src/routes/tutores');
const petsRoutes = require('./src/routes/pets');
const agendamentosRoutes = require('./src/routes/agendamentos');
const dashboardRoutes = require('./src/routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/saude', (req, res) => res.json({ status: 'ok', sistema: 'Veterion API' }));

app.use('/api', authRoutes);
app.use('/api/tutores', tutoresRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota desconhecida -> 404 em JSON (antes o Express devolvia HTML cru)
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// Tratador de erros central: nunca expõe detalhes internos (stack trace) ao cliente.
app.use((err, req, res, next) => {
  console.error('[veterion] erro não tratado:', err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

iniciar()
  .then(() => {
    app.listen(PORT, () => console.log(`[veterion] API rodando em http://localhost:${PORT}`));
  })
  .catch((erro) => {
    console.error('[veterion] Falha ao iniciar o banco de dados:', erro);
    process.exit(1);
  });

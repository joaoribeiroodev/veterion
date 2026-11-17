// =====================================================
// Veterion - inicialização do banco de dados (SQLite)
// Cria o schema na primeira execução e popula dados de exemplo.
// =====================================================
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { hashSensivel, hashBusca } = require('./crypto');

const DB_FILE = path.join(__dirname, '..', 'data', 'veterion.db');
const SCHEMA_FILE = path.join(__dirname, '..', 'db', 'schema.sql');

const bancoNovo = !fs.existsSync(DB_FILE);
const db = new sqlite3.Database(DB_FILE);
db.run('PRAGMA foreign_keys = ON');

const all = (sql, p = []) => new Promise((ok, erro) => db.all(sql, p, (e, r) => (e ? erro(e) : ok(r))));
const get = (sql, p = []) => new Promise((ok, erro) => db.get(sql, p, (e, r) => (e ? erro(e) : ok(r))));
const run = (sql, p = []) =>
  new Promise((ok, erro) => db.run(sql, p, function (e) { e ? erro(e) : ok(this); }));
const exec = (sql) => new Promise((ok, erro) => db.exec(sql, (e) => (e ? erro(e) : ok())));

const USUARIOS_SEED = [
  { nome: 'Administrador', login: 'admin', senha: 'admin123', papel: 'admin' },
  { nome: 'Dra. Camila Souza', login: 'camila', senha: 'vet123', papel: 'veterinario' },
  { nome: 'Recepção', login: 'recepcao', senha: '123456', papel: 'recepcao' },
];

const TUTORES_SEED = [
  { nome: 'Ana Beatriz Lima', cpf: '11122233396', telefone: '(71) 99111-1111', email: 'ana.lima@email.com' },
  { nome: 'Carlos Eduardo Santos', cpf: '22233344405', telefone: '(71) 99222-2222', email: 'carlos.santos@email.com' },
  { nome: 'Mariana Oliveira', cpf: '33344455508', telefone: '(71) 99333-3333', email: 'mariana.oliveira@email.com' },
  { nome: 'João Pedro Almeida', cpf: '44455566619', telefone: '(71) 99444-4444', email: 'joao.almeida@email.com' },
];

const PETS_SEED = [
  { nome: 'Thor', especie: 'Cachorro', raca: 'Golden Retriever', data_nascimento: '2020-03-15', tutorIndex: 0 },
  { nome: 'Mel', especie: 'Gato', raca: 'Siamês', data_nascimento: '2021-07-02', tutorIndex: 1 },
  { nome: 'Bob', especie: 'Cachorro', raca: 'Vira-lata', data_nascimento: '2019-11-20', tutorIndex: 2 },
  { nome: 'Luna', especie: 'Gato', raca: 'Persa', data_nascimento: '2022-01-10', tutorIndex: 0 },
  { nome: 'Nina', especie: 'Coelho', raca: 'Mini Lop', data_nascimento: '2023-05-05', tutorIndex: 3 },
];

const AGENDAMENTOS_SEED = [
  { petIndex: 2, data_agendamento: '2026-12-05T10:00', servico: 'Vacinação antirrábica', status: 'Agendado' },
  { petIndex: 0, data_agendamento: '2026-11-18T09:30', servico: 'Consulta de rotina', status: 'Agendado' },
  { petIndex: 4, data_agendamento: '2026-11-25T15:00', servico: 'Check-up geral', status: 'Agendado' },
  { petIndex: 1, data_agendamento: '2026-11-20T14:00', servico: 'Banho e tosa', status: 'Agendado' },
  { petIndex: 3, data_agendamento: '2026-11-12T11:00', servico: 'Vermifugação', status: 'Concluído' },
];

async function semear() {
  for (const u of USUARIOS_SEED) {
    await run('INSERT INTO usuarios (nome, login, senha_hash, papel) VALUES (?,?,?,?)',
      [u.nome, u.login, hashSensivel(u.senha), u.papel]);
  }

  const tutorIds = [];
  for (const t of TUTORES_SEED) {
    const r = await run(
      'INSERT INTO tutores (nome, cpf_hash, cpf_busca, telefone, email) VALUES (?,?,?,?,?)',
      [t.nome, hashSensivel(t.cpf), hashBusca(t.cpf), t.telefone, t.email]
    );
    tutorIds.push(r.lastID);
  }

  const petIds = [];
  for (const p of PETS_SEED) {
    const r = await run(
      'INSERT INTO pets (nome, especie, raca, data_nascimento, tutor_id) VALUES (?,?,?,?,?)',
      [p.nome, p.especie, p.raca, p.data_nascimento, tutorIds[p.tutorIndex]]
    );
    petIds.push(r.lastID);
  }

  for (const a of AGENDAMENTOS_SEED) {
    await run(
      'INSERT INTO agendamentos (pet_id, data_agendamento, servico, status) VALUES (?,?,?,?)',
      [petIds[a.petIndex], a.data_agendamento, a.servico, a.status]
    );
  }

  console.log('[veterion] Dados de exemplo inseridos.');
}

async function iniciar() {
  await exec(fs.readFileSync(SCHEMA_FILE, 'utf8'));
  if (bancoNovo) {
    console.log('[veterion] Banco novo detectado, aplicando schema e dados de exemplo...');
    await semear();
  }
}

module.exports = { db, all, get, run, iniciar };

# 🐾 Veterion

Sistema web de gestão para clínicas veterinárias: cadastro de tutores e pets,
agenda de atendimentos e um painel inicial com indicadores do dia a dia.

> Projeto reformulado a partir de um protótipo acadêmico de CRUD para clínica
> veterinária, com nova identidade, API reorganizada, correções de bugs e
> funcionalidades novas (ver seção "O que mudou" abaixo).

## Stack

- **Backend:** Node.js, Express, SQLite3
- **Frontend:** HTML, CSS e JavaScript puro (sem framework)

## Como rodar

### 1) Backend (API)

```bash
cd backend
npm install
npm start
```

A API sobe em `http://localhost:3000`. No primeiro start, o banco
`backend/data/veterion.db` é criado automaticamente a partir do schema em
`backend/db/schema.sql`, já populado com dados de exemplo. Para recomeçar do
zero, apague esse arquivo `.db` e rode `npm start` novamente.

### 2) Frontend

Abra a pasta `frontend` no VS Code e use a extensão **Live Server** em
`index.html` (ou sirva a pasta com qualquer servidor estático). O frontend
consome a API em `http://localhost:3000/api`.

### Login de teste

| Usuário  | Senha     | Papel        |
|----------|-----------|--------------|
| admin    | admin123  | Administrador|
| camila   | vet123    | Veterinária  |
| recepcao | 123456    | Recepção     |

## Estrutura

```
backend/
  db/schema.sql        -> definição das tabelas
  src/crypto.js         -> hashing de senha/CPF e hash de busca
  src/validadores.js     -> validação de CPF e e-mail
  src/db.js              -> inicialização + seed do banco
  src/routes/            -> rotas da API (auth, tutores, pets, agendamentos, dashboard)
  server.js              -> ponto de entrada da API
frontend/
  index.html, dashboard.html, tutores.html, pets.html, agendamentos.html
  app.js, style.css
docs/
  der.md                           -> Diagrama de Entidade e Relacionamento
  requisitos-funcionais.md         -> Relatório de Requisitos Funcionais
  requisitos-nao-funcionais.md     -> Relatório de Requisitos Não Funcionais
```

## O que mudou em relação ao protótipo original

- **Identidade própria:** nome, marca, paleta de cores e textos renomeados
  para Veterion; nenhuma referência ao projeto/sistema anterior.
- **API reorganizada:** rotas movidas para `/api/*`, separadas em módulos por
  domínio (`auth`, `tutores`, `pets`, `agendamentos`, `dashboard`) em vez de um
  único arquivo `server.js` monolítico.
- **Correções de bugs / falhas de validação:**
  - CPF agora é validado pelo algoritmo oficial dos dígitos verificadores
    (antes, qualquer sequência de 11 dígitos era aceita).
  - Checagem de CPF duplicado ao cadastrar tutor (antes era impossível
    detectar duplicidade, pois o CPF era armazenado apenas com hash de salt
    aleatório).
  - Checagem de conflito de horário ao criar agendamento para o mesmo pet.
  - Validação de formato de e-mail.
  - Respostas de erro deixaram de vazar mensagens internas do banco
    (`e.message` do driver SQLite) para o cliente.
  - `node_modules` deixou de ser versionado (estava no repositório original).
- **Funcionalidades novas:**
  - Exclusão de tutores, pets e agendamentos.
  - Edição de pets (antes só existia cadastro).
  - Status de agendamento (Agendado / Concluído / Cancelado), com ações de
    concluir e cancelar na tela de agendamentos.
  - Filtro de pets por espécie e de agendamentos por status.
  - Painel inicial com indicadores reais (total de tutores, de pets,
    agendamentos do dia e agendamentos em aberto).

# 🐾 Veterion

Sistema web de gestão para clínicas veterinárias: cadastro de tutores e pets,
agenda de atendimentos e um painel inicial com indicadores do dia a dia.

> Projeto reformulado a partir de um protótipo acadêmico de CRUD para clínica
> veterinária, com nova identidade, API reorganizada, correções de bugs e
> funcionalidades novas (ver seção "O que mudou" abaixo).

## Stack

- **Backend:** Node.js, Express, SQLite3
- **Frontend:** HTML, CSS e JavaScript puro (sem framework)

## Como rodar (sistema completo com um único comando)

```bash
cp .env.example .env
npm install
npm start
```

O `.env` guarda configurações e segredos locais (porta da API, porta do
frontend e o "pepper" usado no hash de busca de CPF) e nunca é commitado —
veja a seção "Variáveis de ambiente" abaixo. Se você pular o `cp` acima, o
sistema ainda funciona com valores padrão, mas o ideal é sempre ter seu
próprio `.env`.

O `npm install` na raiz usa npm workspaces e já instala as dependências do
backend. O `npm start` sobe os dois serviços juntos:

- **API** em `http://localhost:3000` (rotas em `/api/*`)
- **Frontend** em `http://localhost:5500`

No primeiro start, o banco `backend/data/veterion.db` é criado
automaticamente a partir do schema em `db/schema.sql`, já populado com dados
de exemplo. Para recomeçar do zero, apague esse arquivo `.db` e rode
`npm start` novamente. `Ctrl+C` encerra os dois serviços de uma vez.

Abra `http://localhost:5500` no navegador para usar o sistema.

### Rodando cada parte separadamente (opcional)

```bash
npm run start:backend   # só a API, em :3000
npm run start:frontend  # só o frontend estático, em :5500
```

### Login de teste

| Usuário  | Senha     | Papel        |
|----------|-----------|--------------|
| admin    | admin123  | Administrador|
| camila   | vet123    | Veterinária  |
| recepcao | 123456    | Recepção     |

## Variáveis de ambiente

As configurações sensíveis e específicas de ambiente ficam em um arquivo
`.env` na raiz do projeto (carregado automaticamente pelo backend e pelo
servidor do frontend via `dotenv`). Esse arquivo **nunca** é commitado — o
`.gitignore` já o ignora. Use [`.env.example`](.env.example) como modelo:

```bash
cp .env.example .env
```

| Variável          | Para quê serve                                                        | Padrão se ausente |
|-------------------|------------------------------------------------------------------------|--------------------|
| `PORT`            | Porta em que a API escuta                                              | `3000`              |
| `FRONTEND_PORT`   | Porta em que o frontend estático é servido                            | `5500`              |
| `VETERION_PEPPER` | "Pepper" do HMAC usado só para detectar CPF duplicado (não é a chave que protege o CPF, que sempre usa scrypt + salt aleatório) | valor de desenvolvimento fixo no código — troque em produção |

Gere um valor aleatório para `VETERION_PEPPER` em produção com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Estrutura

```
db/
  schema.sql              -> definição das tabelas (usada pelo backend na primeira execução)
backend/
  src/crypto.js           -> hashing de senha/CPF e hash de busca
  src/validadores.js      -> validação de CPF e e-mail
  src/db.js               -> inicialização + seed do banco (lê db/schema.sql)
  src/routes/             -> rotas da API (auth, tutores, pets, agendamentos, dashboard)
  server.js               -> ponto de entrada da API
frontend/
  index.html, dashboard.html, tutores.html, pets.html, agendamentos.html
  app.js, style.css
scripts/
  start-all.js             -> sobe backend + frontend juntos (usado pelo `npm start` da raiz)
  serve-frontend.js        -> servidor estático simples do frontend
docs/
  der.drawio / der.png / der.md     -> Diagrama de Entidade e Relacionamento (fonte draw.io)
  requisitos-funcionais.md          -> Relatório de Requisitos Funcionais
  requisitos-nao-funcionais.md      -> Relatório de Requisitos Não Funcionais
```

## O que mudou em relação ao protótipo original

- **Identidade própria:** nome, marca, paleta de cores e textos renomeados
  para Veterion; nenhuma referência ao projeto/sistema anterior.
- **API reorganizada:** rotas movidas para `/api/*`, separadas em módulos por
  domínio (`auth`, `tutores`, `pets`, `agendamentos`, `dashboard`) em vez de um
  único arquivo `server.js` monolítico.
- **Sobe tudo com um único `npm start`:** antes era preciso rodar a API
  manualmente e abrir o frontend à parte via Live Server; agora um script na
  raiz orquestra os dois processos (API + servidor estático do frontend).
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

-- =====================================================
-- Veterion - esquema do banco de dados (SQLite)
-- =====================================================
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        VARCHAR(100) NOT NULL,
    login       VARCHAR(50)  NOT NULL UNIQUE,
    senha_hash  VARCHAR(200) NOT NULL,
    papel       VARCHAR(20)  NOT NULL DEFAULT 'recepcao' CHECK (papel IN ('admin', 'veterinario', 'recepcao')),
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tutores (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        VARCHAR(100) NOT NULL,
    cpf_hash    VARCHAR(200) NOT NULL,   -- protegido (scrypt + salt), não reversível
    cpf_busca   VARCHAR(64)  NOT NULL UNIQUE, -- HMAC determinístico, só para checar duplicidade
    telefone    VARCHAR(20),
    email       VARCHAR(100),
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pets (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    nome             VARCHAR(50) NOT NULL,
    especie          VARCHAR(30) NOT NULL,
    raca             VARCHAR(50),
    data_nascimento  DATE,
    tutor_id         INTEGER NOT NULL,
    criado_em        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES tutores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agendamentos (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id            INTEGER NOT NULL,
    data_agendamento  DATETIME NOT NULL,
    servico           VARCHAR(100) NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'Agendado'
                      CHECK (status IN ('Agendado', 'Concluído', 'Cancelado')),
    observacoes       VARCHAR(255),
    criado_em         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pets_tutor ON pets(tutor_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_pet ON agendamentos(pet_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);

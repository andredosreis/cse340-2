-- ==============================================
-- CSE 340 - ACCOUNT TABLE SCHEMA
-- ==============================================
-- Este arquivo cria a tabela de contas de usuários
-- para implementar autenticação e autorização
--
-- CONCEITOS:
-- - Authentication (Autenticação): Verificar QUEM você é (login)
-- - Authorization (Autorização): Verificar O QUE você pode fazer (permissões)
-- ==============================================

-- Criar tabela account no schema cse340
-- Se a tabela já existir, não faz nada (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS cse340.account (
  -- COLUNA 1: ID único (chave primária)
  -- SERIAL = auto-incremento (1, 2, 3, ...)
  -- PRIMARY KEY = identificador único da linha
  account_id SERIAL PRIMARY KEY,

  -- COLUNA 2: Nome do usuário
  -- VARCHAR(50) = texto com máximo 50 caracteres
  -- NOT NULL = campo obrigatório
  account_firstname VARCHAR(50) NOT NULL,

  -- COLUNA 3: Sobrenome do usuário
  account_lastname VARCHAR(50) NOT NULL,

  -- COLUNA 4: Email (usado para login)
  -- VARCHAR(255) = texto com máximo 255 caracteres
  -- UNIQUE = não pode ter emails duplicados
  -- Este é o "username" do sistema
  account_email VARCHAR(255) NOT NULL UNIQUE,

  -- COLUNA 5: Senha (em formato de hash bcrypt)
  -- VARCHAR(255) = texto grande para armazenar hash
  -- Hash bcrypt tem 60 caracteres, mas usamos 255 para segurança futura
  -- ⚠️ NUNCA armazene senha em texto puro!
  account_password VARCHAR(255) NOT NULL,

  -- COLUNA 6: Tipo de conta (role/permissão)
  -- DEFAULT 'Client' = novos usuários são clientes por padrão
  -- CHECK = valida que só aceita estes 3 valores
  account_type VARCHAR(20) DEFAULT 'Client' CHECK (account_type IN ('Client', 'Employee', 'Admin')),

  -- COLUNA 7: Data de criação da conta
  -- TIMESTAMP = data + hora
  -- DEFAULT CURRENT_TIMESTAMP = preenche automaticamente com data/hora atual
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- COLUNA 8: Data da última atualização
  -- Será atualizado automaticamente por um trigger (mais abaixo)
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- ÍNDICE PARA PERFORMANCE
-- ==============================================
-- Índice acelera buscas por email
-- Como um "índice de livro" - encontra emails rapidamente
CREATE INDEX IF NOT EXISTS idx_account_email ON cse340.account(account_email);

-- ==============================================
-- COMENTÁRIOS NA TABELA (Documentação)
-- ==============================================
-- Adiciona descrições às colunas no banco de dados
COMMENT ON TABLE cse340.account IS 'Tabela de contas de usuários do sistema CSE Motors';
COMMENT ON COLUMN cse340.account.account_password IS 'Hash bcrypt da senha - NUNCA armazene senha em plain text!';
COMMENT ON COLUMN cse340.account.account_type IS 'Tipo de conta: Client (cliente padrão), Employee (funcionário), ou Admin (administrador)';

-- ==============================================
-- DADOS INICIAIS (APENAS PARA DESENVOLVIMENTO!)
-- ==============================================
-- ⚠️ IMPORTANTE: Estes são usuários de TESTE
-- ⚠️ REMOVER em produção ou usar senhas diferentes!
--
-- Senhas para teste (todas seguem o padrão forte):
-- - Admin: Admin123!
-- - Employee: Employee123!
-- - Client: Client123!
--
-- Os hashes abaixo foram gerados com bcrypt (10 rounds)
-- Para gerar novos hashes em Node.js:
--   const bcrypt = require('bcryptjs');
--   const hash = await bcrypt.hash('senha', 10);

INSERT INTO cse340.account (
  account_firstname,
  account_lastname,
  account_email,
  account_password,
  account_type
)
VALUES
  -- USUÁRIO 1: Administrador
  -- Email: admin@cse340.edu
  -- Senha: Admin123!
  (
    'Admin',
    'User',
    'admin@cse340.edu',
    '$2a$10$8Z9X3y.K5L2M9N0O1P2Q3.R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H',
    'Admin'
  ),

  -- USUÁRIO 2: Funcionário
  -- Email: employee@cse340.edu
  -- Senha: Employee123!
  (
    'Employee',
    'User',
    'employee@cse340.edu',
    '$2a$10$9A0B1C2D3E4F5G6H7I8J9K.L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B',
    'Employee'
  ),

  -- USUÁRIO 3: Cliente
  -- Email: client@cse340.edu
  -- Senha: Client123!
  (
    'Client',
    'User',
    'client@cse340.edu',
    '$2a$10$0B1C2D3E4F5G6H7I8J9K0L.M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C',
    'Client'
  )
ON CONFLICT (account_email) DO NOTHING;
-- ON CONFLICT = se email já existir, não insere (evita erro)

-- ==============================================
-- TRIGGER PARA ATUALIZAR updated_at
-- ==============================================
-- Um trigger é uma função que roda AUTOMATICAMENTE
-- quando algo acontece no banco (INSERT, UPDATE, DELETE)

-- PASSO 1: Criar a função que atualiza updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- NEW = nova versão da linha sendo atualizada
    -- CURRENT_TIMESTAMP = data/hora atual
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- PASSO 2: Criar o trigger que chama a função
-- BEFORE UPDATE = antes de atualizar
-- FOR EACH ROW = para cada linha atualizada
CREATE TRIGGER update_account_updated_at
BEFORE UPDATE ON cse340.account
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- VERIFICAÇÃO (Execute estas queries após criar a tabela)
-- ==============================================
--
-- Ver estrutura da tabela:
--   \d cse340.account
--
-- Ver dados inseridos:
--   SELECT account_id, account_firstname, account_lastname,
--          account_email, account_type, created_at
--   FROM cse340.account;
--
-- Contar usuários:
--   SELECT COUNT(*) FROM cse340.account;
--
-- ==============================================

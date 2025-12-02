-- =====================================================
-- SCRIPT SIMPLIFICADO PARA RENDER
-- =====================================================
-- Execute este SQL no Shell do Render Dashboard
-- =====================================================

-- Criar tabela account
CREATE TABLE IF NOT EXISTS cse340.account (
  account_id SERIAL PRIMARY KEY,
  account_firstname VARCHAR(50) NOT NULL,
  account_lastname VARCHAR(50) NOT NULL,
  account_email VARCHAR(255) NOT NULL UNIQUE,
  account_password VARCHAR(255) NOT NULL,
  account_type VARCHAR(20) DEFAULT 'Client' CHECK (account_type IN ('Client', 'Employee', 'Admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca por email
CREATE INDEX IF NOT EXISTS idx_account_email ON cse340.account(account_email);

-- Comentários
COMMENT ON TABLE cse340.account IS 'Contas de usuários do sistema CSE Motors';
COMMENT ON COLUMN cse340.account.account_password IS 'Hash bcrypt da senha';

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_account_updated_at ON cse340.account;
CREATE TRIGGER update_account_updated_at
BEFORE UPDATE ON cse340.account
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuários de teste
-- Hashes gerados com bcrypt (10 rounds)
-- Senhas: Admin123!, Employee123!, Client123!

INSERT INTO cse340.account (account_firstname, account_lastname, account_email, account_password, account_type)
VALUES
  ('Admin', 'User', 'admin@cse340.edu', '$2a$10$mNnr.aM3JrpHzUYS.p.fdOj/.tx/uBxyBrjhC3KpQ2lMCaQunJPmW', 'Admin'),
  ('Employee', 'User', 'employee@cse340.edu', '$2a$10$IqUPRQskwLQHxdqAO5QfUOa2o5o7B8QXXW9i.bgQTqpkz7F2HwcHa', 'Employee'),
  ('Client', 'User', 'client@cse340.edu', '$2a$10$/rsvqnbhrpEjiwMsOWDyWubuDlx1swn5pydqX/clhUwitygPTtfrm', 'Client')
ON CONFLICT (account_email) DO NOTHING;

-- Verificar se criou corretamente
SELECT account_id, account_firstname, account_lastname, account_email, account_type
FROM cse340.account;

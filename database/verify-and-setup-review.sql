-- =====================================================
-- VERIFICAÇÃO E SETUP DA TABELA REVIEW
-- =====================================================
-- Execute este SQL no Render PostgreSQL Console
-- para verificar se a tabela review existe e criá-la
-- se necessário
-- =====================================================

-- PASSO 1: Verificar se a tabela review existe
-- =====================================================
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'cse340' 
  AND table_name = 'review'
) AS review_table_exists;

-- Se retornar "true" → tabela já existe ✅
-- Se retornar "false" → precisa criar a tabela ❌


-- PASSO 2: Se a tabela NÃO existir, execute o conteúdo abaixo
-- =====================================================
-- (Copie do arquivo review-schema.sql OU execute diretamente)

-- Create review table
CREATE TABLE IF NOT EXISTS cse340.review (
  review_id SERIAL PRIMARY KEY,
  review_text TEXT NOT NULL,
  review_rating INTEGER NOT NULL CHECK (review_rating >= 1 AND review_rating <= 5),
  review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  inv_id INTEGER NOT NULL REFERENCES cse340.inventory(inv_id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES cse340.account(account_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_review_inv_id ON cse340.review(inv_id);
CREATE INDEX IF NOT EXISTS idx_review_account_id ON cse340.review(account_id);
CREATE INDEX IF NOT EXISTS idx_review_date ON cse340.review(review_date DESC);

-- Add comments for documentation
COMMENT ON TABLE cse340.review IS 'Vehicle reviews and ratings from customers';
COMMENT ON COLUMN cse340.review.review_text IS 'Text content of the review';
COMMENT ON COLUMN cse340.review.review_rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN cse340.review.inv_id IS 'Foreign key to inventory item';
COMMENT ON COLUMN cse340.review.account_id IS 'Foreign key to account (reviewer)';

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_review_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_review_updated_at ON cse340.review;
CREATE TRIGGER update_review_updated_at
BEFORE UPDATE ON cse340.review
FOR EACH ROW
EXECUTE FUNCTION update_review_updated_at_column();


-- PASSO 3: Verificar estrutura da tabela
-- =====================================================
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'cse340' 
AND table_name = 'review'
ORDER BY ordinal_position;

-- Deve retornar 8 colunas:
-- review_id, review_text, review_rating, review_date,
-- inv_id, account_id, created_at, updated_at


-- PASSO 4: Verificar se há reviews existentes
-- =====================================================
SELECT COUNT(*) as total_reviews FROM cse340.review;

-- Se retornar 0 → nenhuma review ainda
-- Se retornar > 0 → já existem reviews


-- PASSO 5: (OPCIONAL) Inserir review de exemplo para testar
-- =====================================================
-- Certifique-se de que as contas de teste existem primeiro!
-- E que existe pelo menos 1 veículo na tabela inventory

-- Exemplo: Review do Basic Client para o primeiro veículo
-- ATENÇÃO: Ajuste os IDs conforme seu banco
/*
INSERT INTO cse340.review (review_text, review_rating, inv_id, account_id)
VALUES (
  'Great car! Very reliable and fuel efficient. Perfect for daily commute.',
  5,
  (SELECT inv_id FROM cse340.inventory LIMIT 1),  -- Pega primeiro veículo
  (SELECT account_id FROM cse340.account WHERE account_email = 'basic@340.edu')  -- Basic Client
);
*/


-- PASSO 6: Verificar foreign keys e constraints
-- =====================================================
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'cse340'
  AND tc.table_name = 'review';

-- Deve mostrar:
-- - PRIMARY KEY em review_id
-- - FOREIGN KEY em inv_id → inventory(inv_id)
-- - FOREIGN KEY em account_id → account(account_id)
-- - CHECK constraint em review_rating (1-5)


-- =====================================================
-- RESUMO - CHECKLIST
-- =====================================================
-- [ ] Tabela review existe (PASSO 1)
-- [ ] Tabela tem 8 colunas corretas (PASSO 3)
-- [ ] Foreign keys estão configuradas (PASSO 6)
-- [ ] Triggers estão criados (updated_at)
-- [ ] Índices estão criados (performance)
-- =====================================================

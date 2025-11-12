-- =============================================
-- CSE 340 - DATABASE SCHEMA
-- =============================================
-- Este arquivo define a ESTRUTURA do banco de dados.
-- SQL = Structured Query Language (Linguagem de Consulta Estruturada)
--
-- CONCEITOS IMPORTANTES:
-- ----------------------
-- DDL (Data Definition Language) = Define estrutura
--   - CREATE: Cria tabelas, índices, etc
--   - DROP: Remove tabelas
--   - ALTER: Modifica estrutura
--
-- DML (Data Manipulation Language) = Manipula dados
--   - SELECT: Busca dados
--   - INSERT: Adiciona dados
--   - UPDATE: Atualiza dados
--   - DELETE: Remove dados

-- =============================================
-- 1. LIMPAR DADOS EXISTENTES (se houver)
-- =============================================
-- DROP = "Derrubar/Remover"
-- IF EXISTS = Só remove se a tabela existir (evita erro)
-- CASCADE = Remove em cascata (remove dependências também)
-- Ordem importa: Remover primeiro as tabelas que DEPENDEM de outras

DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS classification CASCADE;

-- =============================================
-- 2. TABELA: classification (Classificação/Tipo)
-- =============================================
-- Armazena os TIPOS de veículos (Sedan, SUV, Truck, etc)
--
-- CONCEITO: Normalização
-- ----------------------
-- Em vez de repetir "Sedan", "Sedan", "Sedan" em cada veículo,
-- criamos uma tabela separada e fazemos REFERÊNCIA ao ID.
-- Benefícios:
-- - Economiza espaço
-- - Consistência (não tem erro de digitação)
-- - Fácil de atualizar (muda em um lugar só)

CREATE TABLE classification (
  -- PRIMARY KEY (Chave Primária)
  -- -----------------------------
  -- SERIAL = Tipo especial do PostgreSQL
  --   - É um INTEGER (número inteiro)
  --   - AUTO-INCREMENT (incrementa automaticamente: 1, 2, 3...)
  --   - Você NÃO precisa inserir o ID manualmente
  -- PRIMARY KEY = Identifica UNICAMENTE cada registro
  --   - Não pode ser NULL (vazio)
  --   - Não pode repetir
  classification_id SERIAL PRIMARY KEY,

  -- VARCHAR(n) = String de tamanho variável (até n caracteres)
  -- NOT NULL = Campo obrigatório (não pode estar vazio)
  -- UNIQUE = Não pode repetir (ex: não pode ter dois "Sedan")
  classification_name VARCHAR(50) NOT NULL UNIQUE
);

-- =============================================
-- 3. TABELA: inventory (Inventário/Estoque)
-- =============================================
-- Armazena os VEÍCULOS disponíveis no estoque
--
-- CONCEITO: Foreign Key (Chave Estrangeira)
-- ------------------------------------------
-- classification_id nesta tabela "aponta para" classification_id na tabela classification
-- Isso cria um RELACIONAMENTO: "Um veículo pertence a uma classificação"

CREATE TABLE inventory (
  -- Primary Key desta tabela
  inv_id SERIAL PRIMARY KEY,

  -- Informações básicas do veículo
  inv_make VARCHAR(50) NOT NULL,        -- Fabricante (ex: Toyota, Ford)
  inv_model VARCHAR(50) NOT NULL,       -- Modelo (ex: Camry, F-150)
  inv_year INTEGER NOT NULL,            -- Ano (ex: 2020, 2023)

  -- Descrição detalhada
  inv_description TEXT NOT NULL,        -- TEXT = String sem limite de tamanho

  -- Imagem do veículo
  inv_image VARCHAR(200) NOT NULL,      -- Caminho para a imagem (ex: /images/vehicles/car.jpg)
  inv_thumbnail VARCHAR(200) NOT NULL,  -- Miniatura (versão pequena da imagem)

  -- Preço e milhagem
  -- NUMERIC(9,2) = Número decimal com até 9 dígitos, 2 após o ponto
  -- Exemplo: 1234567.89
  -- Perfeito para dinheiro (evita erros de arredondamento)
  inv_price NUMERIC(9,2) NOT NULL,      -- Preço (ex: 35000.00)
  inv_miles INTEGER NOT NULL DEFAULT 0, -- Milhagem (ex: 15000)

  -- Cor do veículo
  inv_color VARCHAR(30) NOT NULL,       -- Cor (ex: "Silver", "Black")

  -- FOREIGN KEY (Chave Estrangeira)
  -- -------------------------------
  -- Este campo cria a RELAÇÃO com a tabela classification
  -- Deve conter um classification_id VÁLIDO (que existe na outra tabela)
  classification_id INTEGER NOT NULL,

  -- CONSTRAINT = Restrição/Regra
  -- REFERENCES = Faz referência a outra tabela
  -- ON DELETE CASCADE = Se deletar uma classification, deleta todos os veículos dessa classificação
  -- ON UPDATE CASCADE = Se mudar o ID da classification, atualiza automaticamente aqui
  CONSTRAINT fk_classification
    FOREIGN KEY (classification_id)
    REFERENCES classification(classification_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- =============================================
-- 4. INSERIR DADOS DE EXEMPLO (SEED DATA)
-- =============================================
-- "Seed" = Semear = Popular o banco com dados iniciais
-- Isso é útil para desenvolvimento e testes

-- Inserir classificações
-- INSERT INTO = Insere dados em uma tabela
-- VALUES = Os valores a serem inseridos
-- Não precisamos especificar classification_id pois é SERIAL (auto-incrementa)
INSERT INTO classification (classification_name) VALUES
  ('Custom'),
  ('Sport'),
  ('SUV'),
  ('Truck'),
  ('Sedan');

-- Inserir veículos de exemplo
-- $1, $2, $3 = Placeholders (vamos usar isso nos models mais tarde)
-- Aqui usamos valores diretos
INSERT INTO inventory (
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color,
  classification_id
) VALUES
  -- Veículo 1: DMC Delorean (Custom)
  (
    'DMC',
    'Delorean',
    1981,
    'The DMC DeLorean is a rear-engine two-passenger sports car manufactured and marketed by John DeLorean''s DeLorean Motor Company (DMC) for the American market from 1981–83. The car features gull-wing doors and a stainless-steel outer body shell.',
    '/images/vehicles/delorean.jpg',
    '/images/vehicles/delorean-tn.jpg',
    35000.00,
    3000,
    'Silver',
    1  -- classification_id = 1 (Custom)
  ),

  -- Veículo 2: Ford Model T (Custom)
  (
    'Ford',
    'Model T',
    1908,
    'The Ford Model T is an automobile that was produced by Ford Motor Company from October 1, 1908, to May 26, 1927. It is generally regarded as the first affordable automobile, which made car travel available to middle-class Americans.',
    '/images/vehicles/model-t.jpg',
    '/images/vehicles/model-t-tn.jpg',
    15000.00,
    50000,
    'Black',
    1  -- classification_id = 1 (Custom)
  ),

  -- Veículo 3: Jeep Wrangler (SUV)
  (
    'Jeep',
    'Wrangler',
    2019,
    'The Jeep Wrangler is a series of compact and mid-size four-wheel drive off-road SUVs manufactured by Jeep since 1986. Features removable doors and top for open-air driving.',
    '/images/vehicles/wrangler.jpg',
    '/images/vehicles/wrangler-tn.jpg',
    28000.00,
    41000,
    'Orange',
    3  -- classification_id = 3 (SUV)
  ),

  -- Veículo 4: Chevrolet Camaro (Sport)
  (
    'Chevrolet',
    'Camaro',
    2022,
    'The Chevrolet Camaro is a mid-size American automobile manufactured by Chevrolet, classified as a pony car. It went on sale on September 29, 1966, for the 1967 model year.',
    '/images/vehicles/camaro.jpg',
    '/images/vehicles/camaro-tn.jpg',
    42000.00,
    8000,
    'Yellow',
    2  -- classification_id = 2 (Sport)
  ),

  -- Veículo 5: Ford F-150 (Truck)
  (
    'Ford',
    'F-150',
    2023,
    'The Ford F-Series is a series of trucks marketed and manufactured by Ford Motor Company since 1948. The F-150 is the most popular variant of the F-Series, and is the best-selling vehicle in the United States.',
    '/images/vehicles/f150.jpg',
    '/images/vehicles/f150-tn.jpg',
    55000.00,
    12000,
    'Blue',
    4  -- classification_id = 4 (Truck)
  );

-- =============================================
-- 5. CRIAR ÍNDICES (OPCIONAL - PERFORMANCE)
-- =============================================
-- CONCEITO: Índice (Index)
-- ------------------------
-- Como o índice de um livro: ajuda a encontrar coisas mais rápido
-- Útil em colunas que você vai BUSCAR frequentemente
-- Trade-off: Torna INSERT/UPDATE um pouco mais lentos

-- Índice na coluna classification_id da tabela inventory
-- Acelera queries como: SELECT * FROM inventory WHERE classification_id = 1
CREATE INDEX idx_inventory_classification ON inventory(classification_id);

-- Índice na coluna inv_make (fabricante)
-- Acelera queries como: SELECT * FROM inventory WHERE inv_make = 'Ford'
CREATE INDEX idx_inventory_make ON inventory(inv_make);

-- =============================================
-- 6. COMENTÁRIOS SOBRE AS TABELAS (DOCUMENTAÇÃO)
-- =============================================
-- PostgreSQL permite adicionar comentários às tabelas e colunas
-- Isso aparece em ferramentas de administração (pgAdmin, DBeaver, etc)

COMMENT ON TABLE classification IS 'Tipos/Categorias de veículos (Custom, Sport, SUV, etc)';
COMMENT ON TABLE inventory IS 'Inventário de veículos disponíveis para venda';

-- =============================================
-- FIM DO SCHEMA
-- =============================================
-- Para executar este arquivo:
-- 1. Via linha de comando:
--    psql -h host -U usuario -d database -f schema.sql
--
-- 2. Via código Node.js (vamos fazer isso depois):
--    const sql = fs.readFileSync('schema.sql', 'utf8');
--    await pool.query(sql);
--
-- 3. Via interface web do Render:
--    Dashboard > PostgreSQL > Connect > Query
--    Cole o conteúdo deste arquivo e execute
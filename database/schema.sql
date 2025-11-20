-- =============================================
-- CSE 340 - DATABASE SCHEMA (ASSIGNMENT 2)
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
-- 1. TIPO para account_type
-- =============================================
-- PostgreSQL Render tem restrições para CREATE TYPE
-- Solução: Usar VARCHAR e validar tipos em aplicação
-- Valores válidos: 'Client', 'Employee', 'Admin'
-- (Validação feita no código Node.js)

-- =============================================
-- 1. CRIAR SCHEMA cse340 (se não existir)
-- =============================================
-- SCHEMA = Namespace/Esquema para organizar tabelas
-- Render Free Tier exige uso de schemas personalizados
CREATE SCHEMA IF NOT EXISTS cse340;

-- =============================================
-- 2. LIMPAR DADOS EXISTENTES (se houver)
-- =============================================
-- DROP = "Derrubar/Remover"
-- IF EXISTS = Só remove se a tabela existir (evita erro)
-- CASCADE = Remove em cascata (remove dependências também)
-- Ordem importa: Remover primeiro as tabelas que DEPENDEM de outras

DROP TABLE IF EXISTS cse340.inventory CASCADE;
DROP TABLE IF EXISTS cse340.classification CASCADE;
DROP TABLE IF EXISTS cse340.account CASCADE;

-- =============================================
-- 3. TABELA: classification (Classificação/Tipo)
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

CREATE TABLE cse340.classification (
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

CREATE TABLE cse340.inventory (
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
    REFERENCES cse340.classification(classification_id)
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
INSERT INTO cse340.classification (classification_name) VALUES
  ('Custom'),
  ('Sport'),
  ('SUV'),
  ('Truck'),
  ('Sedan');

-- Inserir veículos de exemplo (14 veículos com imagens válidas)
INSERT INTO cse340.inventory (
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
  -- Custom vehicles (classification_id = 1)
  (
    'Batmobile',
    'Custom',
    2007,
    'Ever want to be a super hero? now you can with the batmobile. This car allows you to switch to bike mode allowing you to easily maneuver through traffic during rush hour.',
    '/images/vehicles/batmobile.jpg',
    '/images/vehicles/batmobile-tn.jpg',
    65000,
    29887,
    'Black',
    1
  ),
  (
    'FBI',
    'Surveillance Van',
    2016,
    'Do you like police shows? You will feel right at home driving this van, comes complete with survalence equipments for and extra fee of $2,000 a month.',
    '/images/vehicles/survan.jpg',
    '/images/vehicles/survan-tn.jpg',
    20000,
    19851,
    'Brown',
    1
  ),
  (
    'Dog',
    'Car',
    1997,
    'Do you like dogs? Well this car is for you straight from the 90s from Aspen, Colorado we have the orginal Dog Car complete with fluffy ears.',
    '/images/vehicles/dog-car.jpg',
    '/images/vehicles/dog-car-tn.jpg',
    35000,
    71632,
    'White',
    1
  ),
  (
    'Aerocar International',
    'Aerocar',
    1963,
    'Are you sick of rushhour trafic? This car converts into an airplane to get you where you are going fast. Only 6 of these were made, get them while they last!',
    '/images/vehicles/aerocar.jpg',
    '/images/vehicles/aerocar-tn.jpg',
    700000,
    18956,
    'Red',
    1
  ),
  (
    'Monster',
    'Truck',
    1995,
    'Most trucks are for working, this one is for fun. This beast comes with 60 inch tires giving you traction needed to jump and roll in the mud.',
    '/images/vehicles/monster-truck.jpg',
    '/images/vehicles/monster-truck-tn.jpg',
    150000,
    3998,
    'purple',
    1
  ),
  (
    'Mystery',
    'Machine',
    1999,
    'Scooby and the gang always found luck in solving their mysteries because of there 4 wheel drive Mystery Machine. This Van will help you do whatever job you are required to with a success rate of 100%.',
    '/images/vehicles/mystery-van.jpg',
    '/images/vehicles/mystery-van-tn.jpg',
    10000,
    128564,
    'Green',
    1
  ),

  -- Sport vehicles (classification_id = 2)
  (
    'Chevy',
    'Camaro',
    2018,
    'If you want to look cool this is the ar you need! This car has great performance at an affordable price. Own it today!',
    '/images/vehicles/camaro.jpg',
    '/images/vehicles/camaro-tn.jpg',
    25000,
    101222,
    'Silver',
    2
  ),
  (
    'Lamborghini',
    'Adventador',
    2016,
    'This V-12 engine packs a punch in this sporty car. Make sure you wear your seatbelt and obey all traffic laws.',
    '/images/vehicles/adventador.jpg',
    '/images/vehicles/adventador-tn.jpg',
    417650,
    71003,
    'Blue',
    2
  ),

  -- SUV vehicles (classification_id = 3)
  (
    'Jeep',
    'Wrangler',
    2019,
    'The Jeep Wrangler is small and compact with enough power to get you where you want to go. Its great for everyday driving as well as offroading weather that be on the the rocks or in the mud!',
    '/images/vehicles/wrangler.jpg',
    '/images/vehicles/wrangler-tn.jpg',
    28045,
    41205,
    'Yellow',
    3
  ),

  -- Truck vehicles (classification_id = 4)
  (
    'Cadillac',
    'Escalade',
    2019,
    'This stylin car is great for any occasion from going to the beach to meeting the president. The luxurious inside makes this car a home away from home.',
    '/images/vehicles/escalade.jpg',
    '/images/vehicles/escalade-tn.jpg',
    75195,
    41958,
    'Black',
    4
  ),
  (
    'GM',
    'Hummer',
    2016,
    'Do you have 6 kids and like to go offroading? The Hummer gives you the small interiors with an engine to get you out of any muddy or rocky situation.',
    '/images/vehicles/hummer.jpg',
    '/images/vehicles/hummer-tn.jpg',
    58800,
    56564,
    'Yellow',
    4
  ),
  (
    'Spartan',
    'Fire Truck',
    2012,
    'Emergencies happen often. Be prepared with this Spartan fire truck. Comes complete with 1000 ft. of hose and a 1000 gallon tank.',
    '/images/vehicles/fire-truck.jpg',
    '/images/vehicles/fire-truck-tn.jpg',
    50000,
    37862,
    'Red',
    4
  ),

  -- Sedan vehicles (classification_id = 5)
  (
    'Mechanic',
    'Special',
    1964,
    'Not sure where this car came from. however with a little tlc it will run as good a new.',
    '/images/vehicles/mechanic.jpg',
    '/images/vehicles/mechanic-tn.jpg',
    100,
    200125,
    'Rust',
    5
  ),
  (
    'Ford',
    'Model T',
    1921,
    'The Ford Model T can be a bit tricky to drive. It was the first car to be put into production. You can get it in any color you want as long as it is black.',
    '/images/vehicles/model-t.jpg',
    '/images/vehicles/model-t-tn.jpg',
    30000,
    26357,
    'Black',
    5
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
CREATE INDEX idx_inventory_classification ON cse340.inventory(classification_id);

-- Índice na coluna inv_make (fabricante)
-- Acelera queries como: SELECT * FROM cse340.inventory WHERE inv_make = 'Ford'
CREATE INDEX idx_inventory_make ON cse340.inventory(inv_make);

-- =============================================
-- 4. TABELA: account (Contas de Usuário)
-- =============================================
-- Armazena as contas dos usuários do sistema
-- GENERATED BY DEFAULT AS IDENTITY = Auto-incrementa o ID
-- account_type = Tipo de conta (Client, Employee, Admin)

CREATE TABLE cse340.account (
  -- Primary Key desta tabela
  -- GENERATED BY DEFAULT AS IDENTITY = Auto-incrementa automaticamente
  account_id INTEGER NOT NULL GENERATED BY DEFAULT AS IDENTITY,

  -- Informações pessoais
  account_firstname VARCHAR NOT NULL,       -- Primeiro nome (ex: Tony, John)
  account_lastname VARCHAR NOT NULL,        -- Sobrenome (ex: Stark, Doe)

  -- Informações de contato
  account_email VARCHAR NOT NULL,           -- Email (ex: tony@starkent.com)

  -- Senha (será hasheada em produção!)
  account_password VARCHAR NOT NULL,        -- Senha criptografada

  -- Tipo de conta
  -- VARCHAR ao invés de ENUM (compatibilidade com Render)
  -- Valores válidos: 'Client', 'Employee', 'Admin'
  account_type VARCHAR(20) NOT NULL DEFAULT 'Client',

  -- Definir primary key
  CONSTRAINT account_pkey PRIMARY KEY (account_id)
);

-- =============================================
-- 5. COMENTÁRIOS SOBRE AS TABELAS (DOCUMENTAÇÃO)
-- =============================================
-- PostgreSQL permite adicionar comentários às tabelas e colunas
-- Isso aparece em ferramentas de administração (pgAdmin, DBeaver, etc)

COMMENT ON TABLE cse340.classification IS 'Tipos/Categorias de veículos (Custom, Sport, SUV, etc)';
COMMENT ON TABLE cse340.inventory IS 'Inventário de veículos disponíveis para venda';
COMMENT ON TABLE cse340.account IS 'Contas de usuário do sistema (clientes, funcionários, admin)';

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
/**
 * DATABASE CONNECTION (CONNECTION POOL)
 * =====================================
 *
 * CONCEITO: Connection Pool (Pool de Conexões)
 * --------------------------------------------
 * Imagine um restaurante com mesas limitadas. Em vez de criar uma nova mesa
 * para cada cliente que chega (caro e lento), você mantém um número fixo de
 * mesas disponíveis e os clientes esperam se todas estiverem ocupadas.
 *
 * É assim que funciona o Connection Pool:
 * - Mantém um conjunto (pool) de conexões com o banco abertas e prontas
 * - Quando você precisa fazer uma query, "pega emprestado" uma conexão do pool
 * - Após usar, devolve a conexão ao pool (não fecha)
 * - Isso é MUITO mais eficiente que abrir/fechar conexões toda hora
 *
 * VANTAGENS:
 * - Rápido: Conexões já estão abertas
 * - Eficiente: Reutiliza conexões
 * - Escalável: Limita o número de conexões simultâneas
 *
 * IMPORTANTE:
 * - Sempre use pool.query() em vez de criar conexões manualmente
 * - O pool gerencia tudo automaticamente
 */

const { Pool } = require('pg'); // Importa a classe Pool do node-postgres

// Carrega as variáveis do arquivo .env
require('dotenv').config();

/**
 * CONFIGURAÇÃO DO POOL
 * ====================
 * O Pool vai criar e gerenciar conexões com o PostgreSQL
 */
const pool = new Pool({
  // connectionString: String completa de conexão (pega do .env)
  // Formato: postgresql://usuario:senha@host:porta/database
  connectionString: process.env.DATABASE_URL,

  // ssl: Segurança (criptografia) na conexão
  // Render e outros serviços cloud EXIGEM SSL
  // Detecta automaticamente se é Render pelo hostname
  // Se for Render (.render.com) ou produção, habilita SSL
  ssl: process.env.DATABASE_URL?.includes('render.com') || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false } // Cloud/Produção: aceita certificado SSL
    : false, // Desenvolvimento local: sem SSL

  // Configurações opcionais do pool (boas práticas)
  max: 10, // Máximo de 10 conexões simultâneas
  idleTimeoutMillis: 30000, // Fecha conexões ociosas após 30 segundos
  connectionTimeoutMillis: 30000, // Timeout de 30 segundos (importante para Render free tier que pode "dormir")
  statement_timeout: 30000, // Timeout de 30 segundos para executar queries
});

/**
 * TESTE DE CONEXÃO
 * ================
 * Quando o servidor inicia, tenta conectar ao banco
 * Se falhar, mostra erro detalhado
 */
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL com sucesso!');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool de conexões:', err);
  process.exit(-1); // Para o servidor se perder a conexão
});

/**
 * COMO USAR ESTE MODULE
 * =====================
 * Em outros arquivos (models, routes, etc), importe assim:
 *
 * const pool = require('../database/connection');
 *
 * Depois, use pool.query() para fazer queries:
 *
 * // Exemplo 1: SELECT simples
 * const result = await pool.query('SELECT * FROM inventory');
 * console.log(result.rows); // Array com os dados
 *
 * // Exemplo 2: Query com parâmetros (SEMPRE use $1, $2... para prevenir SQL Injection!)
 * const result = await pool.query(
 *   'SELECT * FROM inventory WHERE inv_id = $1',
 *   [vehicleId]
 * );
 *
 * // Exemplo 3: INSERT
 * const result = await pool.query(
 *   'INSERT INTO inventory (inv_make, inv_model) VALUES ($1, $2) RETURNING *',
 *   ['Toyota', 'Camry']
 * );
 *
 * NUNCA FAÇA:
 * const bad = `SELECT * FROM inventory WHERE inv_id = ${vehicleId}`; // ❌ SQL Injection!
 *
 * SEMPRE FAÇA:
 * const good = await pool.query('SELECT * FROM inventory WHERE inv_id = $1', [vehicleId]); // ✅ Seguro!
 */

// Exporta o pool para ser usado em outros arquivos
module.exports = pool;
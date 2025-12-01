/**
 * SERVER.JS - Main Express Server
 *
 * CONCEPT: Server-side Rendering (SSR)
 * ====================================
 * This file creates a web server using Express.js.
 * Think of Express as a restaurant waiter:
 * - Receives requests (HTTP)
 * - Processes them (runs our code)
 * - Sends back the response (rendered HTML)
 */

// IMPORTANTE: Carregar variáveis de ambiente PRIMEIRO (antes de qualquer outro import)
// Isso garante que process.env.DATABASE_URL estará disponível
require('dotenv').config();

// Import Express and layouts
const express = require('express');
const expressLayouts = require('express-ejs-layouts');

// Import filesystem module (para ler arquivos)
const fs = require('fs');
const path = require('path');

// Import database connection pool
// Isso vai testar a conexão quando o servidor iniciar
const pool = require('./database/connection');
const session = require("express-session")
const flash = require("connect-flash")
const bodyParser = require("body-parser")

// Import utilities and routes
const utilities = require('./utilities/');
const inventoryRoute = require('./routes/inventoryRoute');
const accountRoute = require('./routes/accountRoute');

// Import authentication middleware
const authMiddleware = require('./middleware/authMiddleware');

// Create the Express app (our server)
const app = express();

// Server port (assignment suggests 5500 locally)
const PORT = process.env.PORT || 5500;

/**
 * EJS CONFIGURATION
 * =================
 */
// Use express-ejs-layouts middleware
app.use(expressLayouts);
app.set('layout', './layout'); // Default layout file
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));
app.use('/images', express.static('images'));

/* *****************======
 * Middleware
 * *****************======*/
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(flash())
app.use(function (req, res, next) {
  res.locals.flash = req.flash('notice')
  next()
})

// Authentication Middleware - Make account data available to all views
// IMPORTANTE: Este middleware deve vir DEPOIS do session middleware
// Ele torna accountData disponível em TODAS as views EJS
app.use(authMiddleware.makeAccountDataAvailable)

/**
 * ROUTES
 * ======
 */

// Account routes (Authentication & Authorization)
// Todas as rotas de /account/* serão tratadas pelo accountRoute
// Exemplos: /account/login, /account/register, /account/logout, /account/
app.use('/account', accountRoute);

// Inventory routes (MVC architecture)
app.use('/inv', inventoryRoute);

// Home route with dynamic navigation
app.get('/', utilities.handleErrors(async (req, res) => {
  const nav = await utilities.getNav();
  const data = {
    title: 'Welcome to the CSE 340 Project',
    message: 'This is an example of Server-Side Rendering!',
    currentDate: new Date().toLocaleDateString('en-US'),
    nav
  };
  res.render('index', data);
}));

// About route with dynamic navigation
app.get('/about', utilities.handleErrors(async (req, res) => {
  const nav = await utilities.getNav();
  res.render('about', {
    title: 'About',
    course: 'CSE 340 - Web Backend Development',
    week: 1,
    topic: 'Server-Side Rendering with Express + EJS',
    nav
  });
}));

/**
 * ROTA DE TESTE DO BANCO DE DADOS
 * ================================
 * Esta rota testa se a conexão com o PostgreSQL está funcionando.
 * Acesse: http://localhost:5500/test-db
 *
 * CONCEITO: async/await
 * ---------------------
 * - async: Marca a função como assíncrona (pode usar await dentro)
 * - await: "Espera" uma Promise resolver antes de continuar
 * - Queries ao banco são assíncronas (demoram tempo)
 * - Sem await, o código continuaria antes da query terminar (erro!)
 *
 * CONCEITO: try/catch
 * -------------------
 * - try: Tenta executar o código
 * - catch: Se der erro, captura e trata o erro
 * - Essencial para operações que podem falhar (banco, rede, etc)
 */
app.get('/test-db', async (req, res) => {
  try {
    // SELECT NOW() retorna a data/hora atual do servidor PostgreSQL
    // É a query mais simples para testar conexão
    const result = await pool.query('SELECT NOW()');

    // Se chegou aqui, a conexão funcionou!
    res.json({
      success: true,
      message: '✅ Conection with PostgreSQL working!',
      timestamp: result.rows[0].now,
      info: 'Banco de dados conectado e respondendo corretamente.'
    });
  } catch (error) {
    // Se der erro, mostra detalhes para debug
    console.error('❌ Erro ao testar conexão:', error);
    res.status(500).json({
      success: false,
      message: '❌ Erro ao conectar com PostgreSQL',
      error: error.message,
      hint: 'Verifique se DATABASE_URL está configurado corretamente no arquivo .env'
    });
  }
});

/**
 * ROTA PARA CRIAR/RESETAR O BANCO DE DADOS
 * =========================================
 * Esta rota executa o arquivo schema.sql para criar as tabelas
 * ⚠️ CUIDADO: Isso APAGA todos os dados existentes!
 * Acesse: http://localhost:5500/setup-db
 *
 * CONCEITO: Executar arquivo SQL
 * -------------------------------
 * - fs.readFileSync: Lê o conteúdo do arquivo schema.sql
 * - path.join: Cria caminho absoluto para o arquivo
 * - pool.query: Executa o SQL completo no banco
 *
 * QUANDO USAR:
 * - Primeira vez configurando o banco
 * - Precisa resetar o banco para dados limpos
 * - Atualizou a estrutura das tabelas
 */
app.get('/setup-db', async (req, res) => {
  try {
    // Lê o arquivo schema.sql
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Executa todo o SQL do schema
    await pool.query(schemaSql);

    // Conta quantos registros foram criados
    const classCount = await pool.query('SELECT COUNT(*) FROM cse340.classification');
    const invCount = await pool.query('SELECT COUNT(*) FROM cse340.inventory');

    res.json({
      success: true,
      message: '✅ Banco de dados configurado com sucesso!',
      details: {
        classifications: parseInt(classCount.rows[0].count),
        vehicles: parseInt(invCount.rows[0].count)
      },
      info: 'Tabelas criadas e populadas com dados de exemplo.'
    });
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error);
    res.status(500).json({
      success: false,
      message: '❌ Erro ao criar tabelas',
      error: error.message,
      hint: 'Verifique o arquivo database/schema.sql'
    });
  }
});

/**
 * ROTA PARA LISTAR TODOS OS VEÍCULOS (TESTE)
 * ===========================================
 * Acesse: http://localhost:5500/vehicles
 *
 * Esta rota retorna todos os veículos do banco em formato JSON
 * Útil para verificar se os dados foram inseridos corretamente
 */
app.get('/vehicles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        inv.inv_id,
        inv.inv_make,
        inv.inv_model,
        inv.inv_year,
        inv.inv_price,
        inv.inv_miles,
        inv.inv_color,
        class.classification_name
      FROM cse340.inventory inv
      INNER JOIN cse340.classification class ON inv.classification_id = class.classification_id
      ORDER BY inv.inv_make, inv.inv_model
    `);

    res.json({
      success: true,
      count: result.rows.length,
      vehicles: result.rows
    });
  } catch (error) {
    console.error('❌ Erro ao buscar veículos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * INTENTIONAL ERROR ROUTE (for testing 500 error handling)
 * =========================================================
 * This route intentionally throws an error to test error middleware
 * Link will be added to footer for testing purposes
 */
app.get('/trigger-error', (req, res, next) => {
  // Intentionally throw an error
  const error = new Error('Intentional 500 error triggered for testing');
  error.status = 500;
  next(error);
});

/**
 * ERROR HANDLING MIDDLEWARE
 * ==========================
 * These middlewares MUST come after all routes
 * They catch errors from any route above
 */

// 404 Not Found handler - catches requests to non-existent routes
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// General error handler - catches all errors passed via next(error)
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav();
  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred';

  console.error(`❌ Error ${status}:`, message);

  res.status(status);
  res.render('errors/error', {
    title: status === 404 ? 'Page Not Found' : 'Server Error',
    message: message,
    nav
  });
});

/**
 * START SERVER
 * ============
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 Press Ctrl+C to stop`);
});
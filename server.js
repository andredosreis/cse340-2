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

// Import database connection pool
// Isso vai testar a conexão quando o servidor iniciar
const pool = require('./database/connection');

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

/**
 * ROUTES
 * ======
 */
app.get('/', (req, res) => {
  const data = {
    title: 'Welcome to the CSE 340 Project',
    message: 'This is an example of Server-Side Rendering!',
    currentDate: new Date().toLocaleDateString('en-US')
  };
  res.render('index', data);
});

app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About',
    course: 'CSE 340 - Web Backend Development',
    week: 1,
    topic: 'Server-Side Rendering with Express + EJS'
  });
});

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
 * START SERVER
 * ============
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 Press Ctrl+C to stop`);
});
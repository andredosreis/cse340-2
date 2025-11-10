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

// Import Express
const express = require('express');
const expressLayouts = require('express-ejs-layouts');

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
 * START SERVER
 * ============
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 Press Ctrl+C to stop`);
});
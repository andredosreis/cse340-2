// ==============================================
// ACCOUNT ROUTES
// ==============================================
// Este arquivo define todas as URLs (rotas) relacionadas
// a contas de usuários: login, registro, logout, dashboard
//
// CONCEITO: Routing
// - Router conecta URLs a Controllers
// - Define se é GET (buscar) ou POST (enviar)
// - Aplica middlewares antes de chegar no Controller
// ==============================================

// Importar Express Router
const express = require("express")
const router = express.Router()

// Importar Account Controller (lógica de negócio)
const accountController = require("../controllers/accountController")

// Importar Utilities (handleErrors, etc.)
const utilities = require("../utilities/")

// Importar validação de formulários (vamos criar depois)
const regValidate = require('../utilities/account-validation')

// Importar Middleware de autenticação
const authMiddleware = require("../middleware/authMiddleware")

/* ***************************
 *  ROTA 1: Exibir página de LOGIN
 * ***************************
 *
 * MÉTODO: GET
 * URL: /account/login
 * MIDDLEWARE: handleLoggedIn (redireciona se já está logado)
 * CONTROLLER: buildLogin (renderiza formulário)
 *
 * FLUXO:
 * 1. Usuário acessa http://localhost:5500/account/login
 * 2. Middleware verifica se já está logado
 *    - Se sim: redireciona para /account/ (dashboard)
 *    - Se não: continua
 * 3. Controller renderiza views/account/login.ejs
 * 4. Usuário vê formulário de login
 *
 * utilities.handleErrors() = wrapper para capturar erros
 */
router.get(
  "/login",
  authMiddleware.handleLoggedIn,
  utilities.handleErrors(accountController.buildLogin)
)

/* ***************************
 *  ROTA 2: Exibir página de REGISTRO
 * ***************************
 *
 * MÉTODO: GET
 * URL: /account/register
 * MIDDLEWARE: handleLoggedIn
 * CONTROLLER: buildRegister
 *
 * FLUXO:
 * 1. Usuário acessa http://localhost:5500/account/register
 * 2. Middleware verifica se já está logado (igual rota 1)
 * 3. Controller renderiza views/account/register.ejs
 * 4. Usuário vê formulário de cadastro
 */
router.get(
  "/register",
  authMiddleware.handleLoggedIn,
  utilities.handleErrors(accountController.buildRegister)
)

/* ***************************
 *  ROTA 3: Processar REGISTRO (submissão do formulário)
 * ***************************
 *
 * MÉTODO: POST
 * URL: /account/register
 * MIDDLEWARE: Validação de dados
 * CONTROLLER: registerAccount
 *
 * FLUXO:
 * 1. Usuário preenche formulário e clica "Register"
 * 2. Formulário envia dados via POST para /account/register
 * 3. MIDDLEWARE 1: regValidate.registrationRules()
 *    - Valida nome, email, senha
 *    - Exemplo: senha deve ter 12+ chars, 1 maiúscula, etc.
 * 4. MIDDLEWARE 2: regValidate.checkRegData
 *    - Verifica se validação passou
 *    - Se erro: retorna formulário com mensagens
 * 5. Controller processa registro:
 *    - Verifica email duplicado
 *    - Cria conta no banco
 *    - Redireciona para login
 *
 * POR QUE POST?
 * - POST = enviar dados sensíveis (senha)
 * - GET = apenas buscar/exibir
 * - POST não aparece na URL (mais seguro)
 */
router.post(
  "/register",
  regValidate.registrationRules(),   // Regras de validação
  regValidate.checkRegData,          // Verifica validação
  utilities.handleErrors(accountController.registerAccount)
)

/* ***************************
 *  ROTA 4: Processar LOGIN (submissão do formulário)
 * ***************************
 *
 * MÉTODO: POST
 * URL: /account/login
 * MIDDLEWARE: Validação de dados
 * CONTROLLER: accountLogin
 *
 * FLUXO:
 * 1. Usuário preenche email e senha, clica "Login"
 * 2. Formulário envia via POST para /account/login
 * 3. MIDDLEWARE: Valida email e senha
 * 4. Controller processa login:
 *    - Busca usuário por email
 *    - Compara senha com bcrypt
 *    - Cria sessão se senha correta
 *    - Redireciona para dashboard
 */
router.post(
  "/login",
  regValidate.loginRules(),          // Regras de validação
  regValidate.checkLoginData,        // Verifica validação
  utilities.handleErrors(accountController.accountLogin)
)

/* ***************************
 *  ROTA 5: LOGOUT
 * ***************************
 *
 * MÉTODO: GET
 * URL: /account/logout
 * MIDDLEWARE: Nenhum (qualquer um pode tentar fazer logout)
 * CONTROLLER: accountLogout
 *
 * FLUXO:
 * 1. Usuário clica em link "Logout"
 * 2. Browser faz requisição GET para /account/logout
 * 3. Controller destrói sessão
 * 4. Limpa cookie
 * 5. Redireciona para home (/)
 *
 * POR QUE GET?
 * - GET porque é só um link simples
 * - Não envia dados, só destrói sessão
 */
router.get(
  "/logout",
  utilities.handleErrors(accountController.accountLogout)
)

/* ***************************
 *  ROTA 6: DASHBOARD do usuário (Account Management)
 * ***************************
 *
 * MÉTODO: GET
 * URL: /account/
 * MIDDLEWARE: checkLogin (OBRIGATÓRIO estar logado)
 * CONTROLLER: buildAccountManagement
 *
 * FLUXO:
 * 1. Usuário tenta acessar http://localhost:5500/account/
 * 2. MIDDLEWARE: Verifica se está logado
 *    - Se NÃO: redireciona para /account/login
 *    - Se SIM: continua
 * 3. Controller renderiza dashboard
 * 4. Mostra:
 *    - Nome do usuário
 *    - Email
 *    - Tipo de conta
 *    - Links para editar perfil
 *    - Link para gerenciar inventário (se Admin/Employee)
 *
 * ROTA PROTEGIDA: Apenas usuários logados
 */
router.get(
  "/",
  authMiddleware.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

/* ***************************
 *  ROTA 7: Exibir formulário UPDATE ACCOUNT
 * ***************************
 *
 * MÉTODO: GET
 * URL: /account/update
 * MIDDLEWARE: checkLogin
 * CONTROLLER: buildUpdateAccount
 */
router.get(
  "/update",
  authMiddleware.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

/* ***************************
 *  ROTA 8: Processar UPDATE ACCOUNT
 * ***************************
 *
 * MÉTODO: POST
 * URL: /account/update
 * MIDDLEWARE: checkLogin, validação
 * CONTROLLER: updateAccount
 */
router.post(
  "/update",
  authMiddleware.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

/* ***************************
 *  ROTA 9: Exibir formulário UPDATE PASSWORD
 * ***************************
 *
 * MÉTODO: GET
 * URL: /account/update-password
 * MIDDLEWARE: checkLogin
 * CONTROLLER: buildUpdatePassword
 */
router.get(
  "/update-password",
  authMiddleware.checkLogin,
  utilities.handleErrors(accountController.buildUpdatePassword)
)

/* ***************************
 *  ROTA 10: Processar UPDATE PASSWORD
 * ***************************
 *
 * MÉTODO: POST
 * URL: /account/update-password
 * MIDDLEWARE: checkLogin, validação
 * CONTROLLER: updatePassword
 */
router.post(
  "/update-password",
  authMiddleware.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

// ==========================================
// ROTAS DE REVIEWS DO USUÁRIO
// ==========================================

/* ***************************
 *  ROTA 11: Exibir formulário de edição de review
 * ***************************
 *
 * MÉTODO: GET
 * URL: /account/review/edit/:review_id
 * MIDDLEWARE: checkLogin (usuário deve estar logado)
 * CONTROLLER: buildEditReview
 */
router.get(
  "/review/edit/:review_id",
  authMiddleware.checkLogin,
  utilities.handleErrors(accountController.buildEditReview)
)

/* ***************************
 *  ROTA 12: Processar atualização de review
 * ***************************
 *
 * MÉTODO: POST
 * URL: /account/review/update
 * MIDDLEWARE: checkLogin, validação
 * CONTROLLER: processUpdateReview
 */
router.post(
  "/review/update",
  authMiddleware.checkLogin,
  regValidate.reviewUpdateRules(),
  regValidate.checkReviewUpdateData,
  utilities.handleErrors(accountController.processUpdateReview)
)

/* ***************************
 *  ROTA 13: Processar exclusão de review
 * ***************************
 *
 * MÉTODO: POST
 * URL: /account/review/delete/:review_id
 * MIDDLEWARE: checkLogin
 * CONTROLLER: processDeleteReview
 */
router.post(
  "/review/delete/:review_id",
  authMiddleware.checkLogin,
  utilities.handleErrors(accountController.processDeleteReview)
)

// ==============================================
// EXPORTAR ROUTER
// ==============================================
// Este router será importado no server.js
// e montado em "/account" → app.use("/account", accountRoute)
//
// Todas as rotas acima terão prefixo /account
// Exemplo: router.get("/login") vira /account/login
module.exports = router

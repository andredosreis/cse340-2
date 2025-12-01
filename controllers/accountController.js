// ==============================================
// ACCOUNT CONTROLLER
// ==============================================
// Este arquivo contém a LÓGICA DE NEGÓCIO
// para autenticação e gerenciamento de contas
//
// CONCEITO: Controller no padrão MVC
// - Recebe requisições HTTP (GET, POST)
// - Processa dados
// - Chama Model para acessar banco
// - Retorna View (renderiza página)
// ==============================================

// Importar Account Model (acessa banco de dados)
const accountModel = require("../models/account-model")

// Importar Utilities (funções auxiliares como getNav)
const utilities = require("../utilities/")

// Importar bcrypt para comparar senhas
const bcrypt = require("bcryptjs")

// Criar objeto para armazenar funções do controller
const accountCont = {}

/* ***************************
 *  FUNÇÃO 1: Mostrar página de LOGIN
 * ***************************
 *
 * ROTA: GET /account/login
 *
 * OBJETIVO: Renderizar formulário de login
 *
 * FLUXO:
 * 1. Usuário acessa /account/login
 * 2. Controller busca navegação dinâmica (getNav)
 * 3. Controller renderiza view "account/login"
 * 4. Usuário vê formulário de login
 */
accountCont.buildLogin = async function (req, res, next) {
  // Buscar navegação dinâmica do banco (Home, Custom, Sedan, etc.)
  let nav = await utilities.getNav()

  // Renderizar view EJS
  // - Caminho: views/account/login.ejs
  // - Dados passados: title, nav, errors
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ***************************
 *  FUNÇÃO 2: Mostrar página de REGISTRO
 * ***************************
 *
 * ROTA: GET /account/register
 *
 * OBJETIVO: Renderizar formulário de cadastro
 *
 * FLUXO:
 * 1. Usuário acessa /account/register
 * 2. Controller renderiza view "account/register"
 * 3. Usuário vê formulário de cadastro
 */
accountCont.buildRegister = async function (req, res, next) {
  let nav = await utilities.getNav()

  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ***************************
 *  FUNÇÃO 3: Processar REGISTRO de nova conta
 * ***************************
 *
 * ROTA: POST /account/register
 *
 * OBJETIVO: Criar nova conta no banco de dados
 *
 * DADOS RECEBIDOS (do formulário):
 * - account_firstname (Nome)
 * - account_lastname (Sobrenome)
 * - account_email (Email)
 * - account_password (Senha em texto puro)
 *
 * FLUXO:
 * 1. Receber dados do formulário (req.body)
 * 2. Verificar se email já existe
 * 3. Se existe: mostrar erro
 * 4. Se não existe: criar conta
 * 5. Se sucesso: redirecionar para login
 * 6. Se erro: mostrar mensagem de erro
 */
accountCont.registerAccount = async function (req, res) {
  let nav = await utilities.getNav()

  // PASSO 1: Extrair dados do formulário
  // =====================================
  // req.body contém dados enviados via POST
  // Desestruturação: extrai propriedades específicas
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password
  } = req.body

  // PASSO 2: Verificar se email já existe
  // ======================================
  // Chamar Model para verificar no banco
  const emailExists = await accountModel.checkExistingEmail(account_email)

  if (emailExists) {
    // Email já cadastrado - não pode criar conta
    // req.flash = mensagem temporária (aparece 1 vez)
    req.flash("notice", "Sorry, that email is already registered. Please use a different email or login.")

    // Renderizar página de registro novamente com mensagem de erro
    // Status 409 = Conflict (conflito de dados)
    res.status(409).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
    return // Para a execução aqui
  }

  // PASSO 3: Criar nova conta
  // ==========================
  // Chamar Model para inserir no banco
  // Model vai fazer hash da senha automaticamente
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  // PASSO 4: Verificar resultado
  // =============================
  if (regResult) {
    // ✅ SUCESSO: Conta criada
    req.flash(
      "notice",
      `Congratulations, ${account_firstname}! You're registered. Please log in.`
    )

    // Redirecionar para página de login
    // Status 201 = Created (recurso criado)
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    // ❌ ERRO: Falha ao criar conta
    req.flash("notice", "Sorry, the registration failed. Please try again.")

    // Mostrar formulário de registro novamente
    // Status 501 = Not Implemented (erro no servidor)
    res.status(501).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }
}

/* ***************************
 *  FUNÇÃO 4: Processar LOGIN
 * ***************************
 *
 * ROTA: POST /account/login
 *
 * OBJETIVO: Autenticar usuário e criar sessão
 *
 * DADOS RECEBIDOS:
 * - account_email
 * - account_password
 *
 * FLUXO:
 * 1. Receber email e senha do formulário
 * 2. Buscar usuário por email no banco
 * 3. Se não encontrar: erro "credenciais inválidas"
 * 4. Se encontrar: comparar senha com bcrypt
 * 5. Se senha correta: criar sessão, redirecionar
 * 6. Se senha incorreta: erro "credenciais inválidas"
 */
accountCont.accountLogin = async function (req, res) {
  let nav = await utilities.getNav()

  // PASSO 1: Extrair dados do formulário
  const { account_email, account_password } = req.body

  // PASSO 2: Buscar usuário por email
  // ==================================
  // Chamar Model para buscar no banco
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    // ❌ Email não encontrado no banco
    // IMPORTANTE: Não diga "email não existe"
    // Diga apenas "credenciais inválidas" (segurança)
    req.flash("notice", "Please check your credentials and try again.")

    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
    return
  }

  // PASSO 3: Comparar senha com bcrypt
  // ===================================
  // accountData.account_password = hash do banco
  // account_password = senha digitada pelo usuário
  //
  // bcrypt.compare() compara:
  // - Senha em texto puro (digitada)
  // - Hash do banco
  //
  // Retorna: true (senha correta) ou false (senha incorreta)
  const passwordMatch = await bcrypt.compare(
    account_password,
    accountData.account_password
  )

  if (passwordMatch) {
    // ✅ SENHA CORRETA - Fazer login

    // PASSO 4: Remover senha dos dados antes de salvar na sessão
    // ===========================================================
    // SEGURANÇA: Nunca armazenar senha (nem hash) na sessão
    delete accountData.account_password

    // PASSO 5: Criar sessão do usuário
    // =================================
    // req.session = objeto de sessão (persiste entre requisições)
    // express-session salva automaticamente no PostgreSQL
    req.session.loggedin = true
    req.session.accountData = accountData

    // PASSO 6: Mensagem de boas-vindas
    req.flash("notice", `Welcome back, ${accountData.account_firstname}!`)

    // PASSO 7: Redirecionar para dashboard
    // =====================================
    // Depois do login, vai para /account/ (dashboard)
    res.redirect("/account/")

  } else {
    // ❌ SENHA INCORRETA
    req.flash("notice", "Please check your credentials and try again.")

    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }
}

/* ***************************
 *  FUNÇÃO 5: Processar LOGOUT
 * ***************************
 *
 * ROTA: GET /account/logout
 *
 * OBJETIVO: Destruir sessão e deslogar usuário
 *
 * FLUXO:
 * 1. Usuário clica em "Logout"
 * 2. Controller destrói sessão (req.session.destroy)
 * 3. Limpa cookie de sessão
 * 4. Redireciona para home
 */
accountCont.accountLogout = function (req, res) {
  // req.session.destroy() remove sessão do banco e memória
  req.session.destroy(err => {
    if (err) {
      // Se der erro ao destruir sessão
      console.error("Logout error:", err)
      res.redirect("/")
    } else {
      // Limpar cookie de sessão do navegador
      // 'sessionId' = nome configurado em server.js
      res.clearCookie('sessionId')

      // Redirecionar para home
      res.redirect("/")
    }
  })
}

/* ***************************
 *  FUNÇÃO 6: Mostrar DASHBOARD do usuário
 * ***************************
 *
 * ROTA: GET /account/
 *
 * OBJETIVO: Mostrar página de gerenciamento da conta
 *
 * ACESSO: Apenas usuários LOGADOS (middleware checkLogin)
 *
 * FLUXO:
 * 1. Middleware verifica se usuário está logado
 * 2. Se sim: Controller renderiza dashboard
 * 3. Dashboard mostra:
 *    - Nome do usuário
 *    - Email
 *    - Tipo de conta (Client/Employee/Admin)
 *    - Link para editar perfil
 *    - Link para gerenciar inventário (se Admin/Employee)
 */
accountCont.buildAccountManagement = async function (req, res, next) {
  let nav = await utilities.getNav()

  // Renderizar dashboard
  // accountData vem de res.locals (definido no middleware)
  res.render("account/account", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

// ==============================================
// EXPORTAR FUNÇÕES
// ==============================================
// Tornar funções disponíveis para as rotas
module.exports = accountCont

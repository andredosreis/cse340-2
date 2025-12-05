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

// Importar JWT para criar tokens
const jwt = require("jsonwebtoken")
require("dotenv").config()

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

    // PASSO 4: Remover senha dos dados antes de salvar
    // ===========================================================
    // SEGURANÇA: Nunca armazenar senha (nem hash) no token/sessão
    delete accountData.account_password

    // PASSO 5: Criar JWT Token
    // =================================
    // JWT = JSON Web Token (token criptografado)
    // Contém dados do usuário de forma segura
    // Expira em 1 hora (3600 segundos)
    const accessToken = jwt.sign(
      accountData,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 }
    )

    // PASSO 6: Enviar JWT como cookie HTTP-only
    // ===========================================
    // httpOnly: true = JavaScript não pode ler (mais seguro)
    // maxAge: 3600 * 1000 = 1 hora em milissegundos
    // secure: true em produção (HTTPS apenas)
    if (process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }

    // PASSO 7: Também salvar na sessão (fallback)
    req.session.loggedin = true
    req.session.accountData = accountData

    // PASSO 8: Mensagem de boas-vindas
    req.flash("notice", `Welcome back, ${accountData.account_firstname}!`)

    // PASSO 9: Redirecionar para dashboard
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
 * OBJETIVO: Destruir sessão, remover JWT e deslogar usuário
 *
 * FLUXO:
 * 1. Usuário clica em "Logout"
 * 2. Controller remove cookie JWT
 * 3. Controller destrói sessão
 * 4. Limpa cookie de sessão
 * 5. Redireciona para home
 */
accountCont.accountLogout = function (req, res) {
  // PASSO 1: Remover cookie JWT
  // ============================
  // Isso é ESSENCIAL para a rubrica - cookie não deve existir após logout
  res.clearCookie('jwt')

  // PASSO 2: Destruir sessão
  req.session.destroy(err => {
    if (err) {
      // Se der erro ao destruir sessão
      console.error("Logout error:", err)
      res.redirect("/")
    } else {
      // PASSO 3: Limpar cookie de sessão do navegador
      // 'sessionId' = nome configurado em server.js
      res.clearCookie('sessionId')

      // PASSO 4: Redirecionar para home
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

/* ***************************
 *  FUNÇÃO 7: Mostrar formulário de UPDATE ACCOUNT
 * ***************************
 *
 * ROTA: GET /account/update
 *
 * OBJETIVO: Exibir formulário para atualizar dados da conta
 */
accountCont.buildUpdateAccount = async function (req, res, next) {
  let nav = await utilities.getNav()

  // Pegar dados do usuário logado
  const accountData = res.locals.accountData

  res.render("account/update-account", {
    title: "Update Account Information",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

/* ***************************
 *  FUNÇÃO 8: Processar UPDATE ACCOUNT
 * ***************************
 *
 * ROTA: POST /account/update
 *
 * OBJETIVO: Atualizar nome, sobrenome e email no banco
 */
accountCont.updateAccount = async function (req, res) {
  let nav = await utilities.getNav()

  const {
    account_id,
    account_firstname,
    account_lastname,
    account_email
  } = req.body

  // Atualizar no banco de dados
  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateResult) {
    // ✅ SUCESSO - Atualizar dados na sessão e JWT

    // Buscar dados atualizados do banco
    const updatedAccount = await accountModel.getAccountById(account_id)
    delete updatedAccount.account_password

    // Atualizar JWT com novos dados
    const accessToken = jwt.sign(
      updatedAccount,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 }
    )

    if (process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }

    // Atualizar sessão
    req.session.accountData = updatedAccount

    req.flash("notice", "Account information updated successfully!")
    res.redirect("/account/")
  } else {
    // ❌ ERRO
    req.flash("notice", "Sorry, the update failed. Please try again.")
    res.status(501).render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ***************************
 *  FUNÇÃO 9: Mostrar formulário de UPDATE PASSWORD
 * ***************************
 *
 * ROTA: GET /account/update-password
 *
 * OBJETIVO: Exibir formulário para alterar senha
 */
accountCont.buildUpdatePassword = async function (req, res, next) {
  let nav = await utilities.getNav()

  const accountData = res.locals.accountData

  res.render("account/update-password", {
    title: "Change Password",
    nav,
    errors: null,
    account_id: accountData.account_id,
  })
}

/* ***************************
 *  FUNÇÃO 10: Processar UPDATE PASSWORD
 * ***************************
 *
 * ROTA: POST /account/update-password
 *
 * OBJETIVO: Atualizar senha no banco (com hash bcrypt)
 */
accountCont.updatePassword = async function (req, res) {
  let nav = await utilities.getNav()

  const { account_id, account_password } = req.body

  // Atualizar senha no banco (model faz o hash)
  const updateResult = await accountModel.updatePassword(account_id, account_password)

  if (updateResult) {
    // ✅ SUCESSO
    req.flash("notice", "Password changed successfully!")
    res.redirect("/account/")
  } else {
    // ❌ ERRO
    req.flash("notice", "Sorry, the password change failed. Please try again.")
    res.status(501).render("account/update-password", {
      title: "Change Password",
      nav,
      errors: null,
      account_id,
    })
  }
}

// ==============================================
// EXPORTAR FUNÇÕES
// ==============================================
// Tornar funções disponíveis para as rotas
module.exports = accountCont

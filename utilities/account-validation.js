// ==============================================
// ACCOUNT VALIDATION
// ==============================================
// Este arquivo contém regras de validação para
// formulários de registro e login
//
// BIBLIOTECA: express-validator
// - Valida campos de formulários
// - Sanitiza dados (remove caracteres perigosos)
// - Retorna mensagens de erro amigáveis
// ==============================================

// Importar funções de validação
const { body, validationResult } = require("express-validator")

// Importar Account Model (para verificar email duplicado)
const accountModel = require("../models/account-model")

// Importar utilities (para getNav)
const utilities = require(".")

// Criar objeto para armazenar funções de validação
const validate = {}

/*  **********************************
 *  REGRAS DE VALIDAÇÃO: REGISTRO
 * **********************************
 *
 * Define quais campos são obrigatórios e suas regras
 *
 * CONCEITO: Validação em cadeia (chain validation)
 * - Cada campo passa por múltiplas validações
 * - Se uma falhar, retorna mensagem de erro
 */
validate.registrationRules = () => {
  return [
    // ==========================================
    // VALIDAÇÃO 1: First Name (Nome)
    // ==========================================
    body("account_firstname")
      .trim()                          // Remove espaços no início/fim
      .isLength({ min: 1 })            // Mínimo 1 caractere
      .withMessage("Please provide a first name."), // Mensagem de erro

    // ==========================================
    // VALIDAÇÃO 2: Last Name (Sobrenome)
    // ==========================================
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."),

    // ==========================================
    // VALIDAÇÃO 3: Email
    // ==========================================
    body("account_email")
      .trim()                          // Remove espaços
      .isEmail()                       // Verifica formato email (ex: user@domain.com)
      .normalizeEmail()                // Converte para formato padrão
      .withMessage("A valid email is required.")

      // VALIDAÇÃO CUSTOMIZADA: Verificar email duplicado
      // .custom() permite criar validações personalizadas
      .custom(async (account_email) => {
        // Chamar Model para verificar se email já existe
        const emailExists = await accountModel.checkExistingEmail(account_email)

        if (emailExists) {
          // Se email existe, lançar erro
          // throw new Error() = validação falhou
          throw new Error("Email exists. Please log in or use different email")
        }

        // Se não existe, validação passou (return void)
      }),

    // ==========================================
    // VALIDAÇÃO 4: Password (Senha Forte)
    // ==========================================
    // CONCEITO: Strong Password (Senha Forte)
    // - Dificulta ataques de força bruta
    // - Previne senhas fracas como "123456"
    //
    // REQUISITOS:
    // ✅ Mínimo 12 caracteres
    // ✅ Pelo menos 1 letra minúscula (a-z)
    // ✅ Pelo menos 1 letra maiúscula (A-Z)
    // ✅ Pelo menos 1 número (0-9)
    // ✅ Pelo menos 1 caractere especial (@$!%*?&)
    //
    // EXEMPLOS:
    // ❌ "password" → muito curto, sem maiúscula, sem número, sem especial
    // ❌ "Password1" → muito curto, sem caractere especial
    // ✅ "MyP@ssw0rd123!" → 14 chars, tem tudo
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,           // Mínimo 12 caracteres
        minLowercase: 1,         // Mínimo 1 letra minúscula
        minUppercase: 1,         // Mínimo 1 letra maiúscula
        minNumbers: 1,           // Mínimo 1 número
        minSymbols: 1,           // Mínimo 1 caractere especial
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * VERIFICAR DADOS DE REGISTRO
 * ******************************
 *
 * OBJETIVO: Executar validações e retornar erros se houver
 *
 * ESTE É UM MIDDLEWARE
 * - Executa DEPOIS das regras de validação
 * - Verifica se alguma regra falhou
 * - Se falhou: renderiza formulário com erros
 * - Se passou: chama next() → continua para controller
 *
 * FLUXO:
 * 1. Regras de validação executam (registrationRules)
 * 2. Este middleware verifica resultado
 * 3. validationResult(req) retorna array de erros
 * 4. Se array vazio: tudo OK → next()
 * 5. Se array com erros: renderiza formulário novamente
 */
validate.checkRegData = async (req, res, next) => {
  // PASSO 1: Extrair dados do formulário (para repopular)
  const { account_firstname, account_lastname, account_email } = req.body

  // PASSO 2: Pegar erros de validação
  let errors = []
  errors = validationResult(req)

  // PASSO 3: Verificar se há erros
  if (!errors.isEmpty()) {
    // ❌ HÁ ERROS DE VALIDAÇÃO

    // Buscar navegação
    let nav = await utilities.getNav()

    // Renderizar formulário novamente COM:
    // - Mensagens de erro (errors)
    // - Dados preenchidos (para não perder o que digitou)
    res.render("account/register", {
      errors,                    // Array de erros
      title: "Registration",
      nav,
      account_firstname,         // Repopular campo
      account_lastname,          // Repopular campo
      account_email,             // Repopular campo
    })
    return // Para execução aqui (não chama next)
  }

  // ✅ SEM ERROS - Validação passou
  next() // Continua para controller (registerAccount)
}

/*  **********************************
 *  REGRAS DE VALIDAÇÃO: LOGIN
 * **********************************
 *
 * Validação mais simples que registro
 * - Apenas verifica formato do email
 * - Verifica se senha não está vazia
 * - NÃO verifica se email existe (controller faz isso)
 */
validate.loginRules = () => {
  return [
    // VALIDAÇÃO 1: Email válido
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // VALIDAÇÃO 2: Senha não vazia
    body("account_password")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Password is required."),
  ]
}

/* ******************************
 * VERIFICAR DADOS DE LOGIN
 * ******************************
 *
 * Igual a checkRegData, mas para login
 */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    // ❌ HÁ ERROS
    let nav = await utilities.getNav()

    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email, // Repopular email
    })
    return
  }

  // ✅ SEM ERROS
  next()
}

/*  **********************************
 *  REGRAS DE VALIDAÇÃO: UPDATE ACCOUNT
 * **********************************
 *
 * Valida atualização de dados da conta (nome, sobrenome, email)
 */
validate.updateAccountRules = () => {
  return [
    // VALIDAÇÃO 1: First Name
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // VALIDAÇÃO 2: Last Name
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."),

    // VALIDAÇÃO 3: Email
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      // Validação customizada: verificar se email já existe (exceto o próprio)
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id
        const account = await accountModel.getAccountByEmail(account_email)
        // Se encontrou uma conta E não é a mesma conta
        if (account && account.account_id != account_id) {
          throw new Error("Email already exists. Please use a different email.")
        }
      }),

    // VALIDAÇÃO 4: Account ID (hidden field)
    body("account_id")
      .trim()
      .isInt()
      .withMessage("Invalid account ID."),
  ]
}

/* ******************************
 * VERIFICAR DADOS DE UPDATE ACCOUNT
 * ******************************
 */
validate.checkUpdateData = async (req, res, next) => {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()

    res.render("account/update-account", {
      errors,
      title: "Update Account Information",
      nav,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }

  next()
}

/*  **********************************
 *  REGRAS DE VALIDAÇÃO: UPDATE PASSWORD
 * **********************************
 *
 * Valida a nova senha (mesmos requisitos do registro)
 */
validate.updatePasswordRules = () => {
  return [
    // VALIDAÇÃO 1: Nova senha (Strong Password)
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements. Must be 12+ characters with uppercase, lowercase, number, and special character."),

    // VALIDAÇÃO 2: Account ID
    body("account_id")
      .trim()
      .isInt()
      .withMessage("Invalid account ID."),
  ]
}

/* ******************************
 * VERIFICAR DADOS DE UPDATE PASSWORD
 * ******************************
 */
validate.checkPasswordData = async (req, res, next) => {
  const { account_id } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()

    res.render("account/update-password", {
      errors,
      title: "Change Password",
      nav,
      account_id,
    })
    return
  }

  next()
}

// ==============================================
// EXPORTAR FUNÇÕES
// ==============================================
module.exports = validate

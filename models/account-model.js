// ==============================================
// ACCOUNT MODEL
// ==============================================
// Este arquivo contém todas as funções que acessam
// a tabela 'account' no banco de dados PostgreSQL
//
// CONCEITO: Model no padrão MVC
// - Model = acessa banco de dados
// - Controller = lógica de negócio
// - View = interface do usuário
// ==============================================

// Importar pool de conexões do PostgreSQL
const pool = require("../database/connection")

// Importar bcryptjs para hashing de senhas
const bcrypt = require("bcryptjs")

/* ***************************
 *  FUNÇÃO 1: Registrar nova conta
 * ***************************
 *
 * OBJETIVO: Criar um novo usuário no banco de dados
 *
 * PARÂMETROS:
 * - account_firstname: Nome (ex: "João")
 * - account_lastname: Sobrenome (ex: "Silva")
 * - account_email: Email (ex: "joao@email.com")
 * - account_password: Senha EM TEXTO PURO (ex: "MyP@ssw0rd123!")
 *
 * PROCESSO:
 * 1. Recebe senha em texto puro
 * 2. Cria hash bcrypt da senha (10 rounds)
 * 3. Insere usuário no banco com hash (NÃO a senha original!)
 * 4. Retorna dados do usuário criado
 *
 * RETORNO:
 * - Sucesso: objeto com dados do usuário
 * - Erro: null
 */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    // PASSO 1: Fazer hash da senha
    // ============================
    // bcrypt.hash(senha, rounds)
    // - senha = texto original
    // - rounds = 10 (2^10 = 1024 iterações)
    // - Quanto maior o número de rounds, mais seguro mas mais lento
    // - 10 rounds é o padrão recomendado
    //
    // EXEMPLO:
    // Entrada: "MyP@ssw0rd123!"
    // Saída: "$2a$10$abcdefghijklmnopqrstuvwxyz123456789..." (60 caracteres)
    const hashedPassword = await bcrypt.hash(account_password, 10)

    // PASSO 2: Preparar query SQL
    // ============================
    // INSERT INTO = inserir dados
    // VALUES ($1, $2, $3, $4, 'Client') = valores a inserir
    // $1, $2, etc. = prepared statements (previne SQL injection)
    // RETURNING * = retorna os dados inseridos
    const sql = `
      INSERT INTO cse340.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
      )
      VALUES ($1, $2, $3, $4, 'Client')
      RETURNING *
    `

    // PASSO 3: Executar query no banco
    // =================================
    // pool.query(sql, [valores]) executa a query
    // Array [valores] substitui $1, $2, $3, $4
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword  // ⚠️ Salvamos o HASH, não a senha original!
    ])

    // PASSO 4: Retornar resultado
    return result
  } catch (error) {
    // Se der erro (ex: email duplicado), loga e retorna null
    console.error("registerAccount error: " + error)
    return null
  }
}

/* ***************************
 *  FUNÇÃO 2: Verificar se email já existe
 * ***************************
 *
 * OBJETIVO: Checar se um email já está cadastrado
 *
 * USO: Antes de criar conta, verificar se email é único
 *
 * PARÂMETROS:
 * - account_email: Email a verificar (ex: "joao@email.com")
 *
 * RETORNO:
 * - true = email já existe (não pode usar)
 * - false = email disponível (pode usar)
 */
async function checkExistingEmail(account_email) {
  try {
    // Buscar por email no banco
    const sql = "SELECT * FROM cse340.account WHERE account_email = $1"
    const result = await pool.query(sql, [account_email])

    // result.rowCount = número de linhas encontradas
    // Se > 0, significa que encontrou o email (já existe)
    // Se = 0, email não existe (disponível)
    return result.rowCount > 0
  } catch (error) {
    console.error("checkExistingEmail error: " + error)
    return false
  }
}

/* ***************************
 *  FUNÇÃO 3: Buscar conta por email
 * ***************************
 *
 * OBJETIVO: Encontrar usuário pelo email
 *
 * USO: Durante o LOGIN, buscar usuário para verificar senha
 *
 * PARÂMETROS:
 * - account_email: Email do usuário (ex: "admin@cse340.edu")
 *
 * RETORNO:
 * - Sucesso: objeto com dados do usuário
 *   {
 *     account_id: 1,
 *     account_firstname: "Admin",
 *     account_lastname: "User",
 *     account_email: "admin@cse340.edu",
 *     account_password: "$2a$10$...", // hash
 *     account_type: "Admin",
 *     created_at: "2025-12-01...",
 *     updated_at: "2025-12-01..."
 *   }
 * - Erro ou não encontrado: null
 */
async function getAccountByEmail(account_email) {
  try {
    const sql = "SELECT * FROM cse340.account WHERE account_email = $1"
    const result = await pool.query(sql, [account_email])

    // result.rows[0] = primeira linha encontrada
    // Se não encontrou nada, retorna undefined (que se torna null)
    return result.rows[0]
  } catch (error) {
    console.error("getAccountByEmail error: " + error)
    return null
  }
}

/* ***************************
 *  FUNÇÃO 4: Buscar conta por ID
 * ***************************
 *
 * OBJETIVO: Encontrar usuário pelo ID único
 *
 * USO: Buscar informações do usuário logado
 *
 * PARÂMETROS:
 * - account_id: ID do usuário (ex: 1, 2, 3...)
 *
 * RETORNO:
 * - Sucesso: objeto com dados do usuário
 * - Erro ou não encontrado: null
 */
async function getAccountById(account_id) {
  try {
    const sql = "SELECT * FROM cse340.account WHERE account_id = $1"
    const result = await pool.query(sql, [account_id])
    return result.rows[0]
  } catch (error) {
    console.error("getAccountById error: " + error)
    return null
  }
}

/* ***************************
 *  FUNÇÃO 5: Atualizar informações da conta
 * ***************************
 *
 * OBJETIVO: Atualizar nome e email do usuário
 *
 * USO: Página "Editar Perfil"
 *
 * PARÂMETROS:
 * - account_id: ID do usuário
 * - account_firstname: Novo nome
 * - account_lastname: Novo sobrenome
 * - account_email: Novo email
 *
 * RETORNO:
 * - Sucesso: objeto com dados atualizados
 * - Erro: null
 */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    // UPDATE = atualizar dados
    // SET = definir novos valores
    // WHERE = condição (qual linha atualizar)
    const sql = `
      UPDATE cse340.account
      SET account_firstname = $1,
          account_lastname = $2,
          account_email = $3
      WHERE account_id = $4
      RETURNING *
    `

    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id
    ])

    return result
  } catch (error) {
    console.error("updateAccount error: " + error)
    return null
  }
}

/* ***************************
 *  FUNÇÃO 6: Atualizar senha
 * ***************************
 *
 * OBJETIVO: Alterar senha do usuário
 *
 * USO: Página "Alterar Senha" ou "Esqueci minha senha"
 *
 * PARÂMETROS:
 * - account_id: ID do usuário
 * - new_password: Nova senha EM TEXTO PURO
 *
 * PROCESSO:
 * 1. Recebe nova senha em texto puro
 * 2. Cria hash bcrypt da nova senha
 * 3. Atualiza no banco com o novo hash
 *
 * RETORNO:
 * - Sucesso: objeto com dados atualizados
 * - Erro: null
 */
async function updatePassword(account_id, new_password) {
  try {
    // PASSO 1: Fazer hash da nova senha
    const hashedPassword = await bcrypt.hash(new_password, 10)

    // PASSO 2: Atualizar apenas a coluna account_password
    const sql = `
      UPDATE cse340.account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING *
    `

    const result = await pool.query(sql, [hashedPassword, account_id])
    return result
  } catch (error) {
    console.error("updatePassword error: " + error)
    return null
  }
}

// ==============================================
// EXPORTAR FUNÇÕES
// ==============================================
// Tornar funções disponíveis para outros arquivos
// Outros arquivos podem importar: require("./models/account-model")
module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword
}

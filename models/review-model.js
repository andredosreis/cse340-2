// ==============================================
// REVIEW MODEL
// ==============================================
// Este arquivo contém todas as funções que acessam
// a tabela 'review' no banco de dados PostgreSQL
//
// CONCEITO: Model no padrão MVC
// - Model = acessa banco de dados
// - Controller = lógica de negócio
// - View = interface do usuário
// ==============================================

// Importar pool de conexões do PostgreSQL
const pool = require("../database/connection")

/* ***************************
 *  FUNÇÃO 1: Adicionar nova avaliação
 * ***************************
 *
 * OBJETIVO: Criar uma nova avaliação de veículo no banco de dados
 *
 * PARÂMETROS:
 * - inv_id: ID do veículo sendo avaliado
 * - account_id: ID do usuário fazendo a avaliação
 * - review_text: Texto da avaliação
 * - review_rating: Nota de 1 a 5
 *
 * PROCESSO:
 * 1. Usar prepared statement para segurança
 * 2. Inserir dados na tabela review
 * 3. Retornar resultado
 *
 * RETORNO:
 * - Sucesso: objeto com dados da avaliação criada
 * - Erro: null
 */
async function addReview(inv_id, account_id, review_text, review_rating) {
  try {
    // Prepared statement com placeholders $1, $2, etc.
    // Isso previne SQL injection attacks
    const sql = `
      INSERT INTO cse340.review (
        inv_id,
        account_id,
        review_text,
        review_rating
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `

    // Executar query com parâmetros separados
    // O driver do PostgreSQL vai escapar automaticamente
    const result = await pool.query(sql, [
      inv_id,
      account_id,
      review_text,
      review_rating
    ])

    return result
  } catch (error) {
    console.error("addReview error: " + error)
    return null
  }
}

/* ***************************
 *  FUNÇÃO 2: Obter todas as avaliações de um veículo
 * ***************************
 *
 * OBJETIVO: Buscar todas as avaliações de um veículo específico
 *
 * PARÂMETROS:
 * - inv_id: ID do veículo
 *
 * PROCESSO:
 * 1. Buscar todas as reviews onde inv_id = valor fornecido
 * 2. Ordenar por data mais recente
 * 3. Incluir informações do usuário que fez a avaliação
 *
 * RETORNO:
 * - Sucesso: array com todas as avaliações
 * - Erro: null ou array vazio
 */
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `
      SELECT 
        r.review_id,
        r.review_text,
        r.review_rating,
        r.review_date,
        r.inv_id,
        r.account_id,
        a.account_firstname,
        a.account_lastname,
        a.account_email
      FROM cse340.review r
      INNER JOIN cse340.account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `

    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    console.error("getReviewsByInventoryId error: " + error)
    return []
  }
}

/* ***************************
 *  FUNÇÃO 3: Obter uma avaliação específica
 * ***************************
 *
 * OBJETIVO: Buscar uma avaliação pelo seu ID
 *
 * PARÂMETROS:
 * - review_id: ID da avaliação
 *
 * RETORNO:
 * - Sucesso: objeto com dados da avaliação
 * - Erro: null
 */
async function getReviewById(review_id) {
  try {
    const sql = `
      SELECT 
        r.review_id,
        r.review_text,
        r.review_rating,
        r.review_date,
        r.inv_id,
        r.account_id,
        a.account_firstname,
        a.account_lastname
      FROM cse340.review r
      INNER JOIN cse340.account a ON r.account_id = a.account_id
      WHERE r.review_id = $1
    `

    const result = await pool.query(sql, [review_id])
    return result.rows[0] || null
  } catch (error) {
    console.error("getReviewById error: " + error)
    return null
  }
}

/* ***************************
 *  FUNÇÃO 4: Atualizar uma avaliação
 * ***************************
 *
 * OBJETIVO: Modificar o texto ou nota de uma avaliação existente
 *
 * PARÂMETROS:
 * - review_id: ID da avaliação a atualizar
 * - review_text: Novo texto
 * - review_rating: Nova nota
 *
 * RETORNO:
 * - Sucesso: objeto com dados atualizados
 * - Erro: null
 */
async function updateReview(review_id, review_text, review_rating) {
  try {
    const sql = `
      UPDATE cse340.review
      SET review_text = $1,
          review_rating = $2
      WHERE review_id = $3
      RETURNING *
    `

    const result = await pool.query(sql, [
      review_text,
      review_rating,
      review_id
    ])

    return result
  } catch (error) {
    console.error("updateReview error: " + error)
    return null
  }
}

/* ***************************
 *  FUNÇÃO 5: Deletar uma avaliação
 * ***************************
 *
 * OBJETIVO: Remover uma avaliação do banco de dados
 *
 * PARÂMETROS:
 * - review_id: ID da avaliação a deletar
 *
 * RETORNO:
 * - Sucesso: objeto com resultado da operação
 * - Erro: null
 */
async function deleteReview(review_id) {
  try {
    const sql = `
      DELETE FROM cse340.review
      WHERE review_id = $1
      RETURNING *
    `

    const result = await pool.query(sql, [review_id])
    return result
  } catch (error) {
    console.error("deleteReview error: " + error)
    return null
  }
}

/* ***************************
 *  FUNÇÃO 6: Verificar se usuário já avaliou um veículo
 * ***************************
 *
 * OBJETIVO: Evitar múltiplas avaliações do mesmo usuário para o mesmo veículo
 *
 * PARÂMETROS:
 * - inv_id: ID do veículo
 * - account_id: ID do usuário
 *
 * RETORNO:
 * - true: usuário já avaliou este veículo
 * - false: usuário não avaliou ainda
 */
async function hasUserReviewedVehicle(inv_id, account_id) {
  try {
    const sql = `
      SELECT COUNT(*) as count
      FROM cse340.review
      WHERE inv_id = $1 AND account_id = $2
    `

    const result = await pool.query(sql, [inv_id, account_id])
    return result.rows[0].count > 0
  } catch (error) {
    console.error("hasUserReviewedVehicle error: " + error)
    return false
  }
}

/* ***************************
 *  FUNÇÃO 7: Obter estatísticas de um veículo
 * ***************************
 *
 * OBJETIVO: Calcular média de notas e total de avaliações
 *
 * PARÂMETROS:
 * - inv_id: ID do veículo
 *
 * RETORNO:
 * - Sucesso: { average_rating, total_reviews }
 * - Erro: { average_rating: 0, total_reviews: 0 }
 */
async function getReviewStats(inv_id) {
  try {
    const sql = `
      SELECT 
        ROUND(AVG(review_rating)::numeric, 1) as average_rating,
        COUNT(*) as total_reviews
      FROM cse340.review
      WHERE inv_id = $1
    `

    const result = await pool.query(sql, [inv_id])
    return result.rows[0] || { average_rating: 0, total_reviews: 0 }
  } catch (error) {
    console.error("getReviewStats error: " + error)
    return { average_rating: 0, total_reviews: 0 }
  }
}

/* ***************************
 *  FUNÇÃO 8: Obter reviews por account_id
 * ***************************
 *
 * OBJETIVO: Buscar todas as reviews de um usuário específico
 *
 * PARÂMETROS:
 * - account_id: ID do usuário
 *
 * PROCESSO:
 * 1. Buscar todas as reviews onde account_id = valor fornecido
 * 2. Fazer JOIN com tabela inventory para pegar dados do veículo
 * 3. Ordenar por data mais recente
 *
 * RETORNO:
 * - Sucesso: array com reviews e dados do veículo
 * - Erro: array vazio
 */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `
      SELECT 
        r.review_id,
        r.review_text,
        r.review_rating,
        r.review_date,
        r.inv_id,
        i.inv_make,
        i.inv_model,
        i.inv_year
      FROM cse340.review r
      INNER JOIN cse340.inventory i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC
    `

    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getReviewsByAccountId error: " + error)
    return []
  }
}

// ==============================================
// EXPORTAR FUNÇÕES
// ==============================================
// Tornar funções disponíveis para outros arquivos
module.exports = {
  addReview,
  getReviewsByInventoryId,
  getReviewById,
  updateReview,
  deleteReview,
  hasUserReviewedVehicle,
  getReviewStats,
  getReviewsByAccountId
}

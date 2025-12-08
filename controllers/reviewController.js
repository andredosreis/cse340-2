// ==============================================
// REVIEW CONTROLLER
// ==============================================
// Este arquivo contém a LÓGICA DE NEGÓCIO
// para gerenciar avaliações de veículos
//
// CONCEITO: Controller no padrão MVC
// - Recebe requisições HTTP (GET, POST)
// - Processa dados
// - Chama Model para acessar banco
// - Retorna View (renderiza página)
// ==============================================

// Importar Review Model (acessa banco de dados)
const reviewModel = require("../models/review-model")

// Importar Vehicle Model (para validar que veículo existe)
const vehicleModel = require("../models/vehicle-model")

// Importar Utilities (funções auxiliares)
const utilities = require("../utilities/")

// Criar objeto para armazenar funções do controller
const reviewCont = {}

/* ***************************
 *  FUNÇÃO 1: Adicionar nova avaliação
 * ***************************
 *
 * ROTA: POST /inv/review/add
 *
 * OBJETIVO: Criar uma nova avaliação para um veículo
 *
 * FLUXO:
 * 1. Receber dados do formulário (text, rating, inv_id)
 * 2. Validar dados (servidor já fez validação)
 * 3. Chamar Model para inserir no banco
 * 4. Se sucesso: retornar sucesso com mensagem
 * 5. Se erro: retornar erro
 */
reviewCont.addReview = async function (req, res) {
  try {
    const { review_text, review_rating, inv_id } = req.body

    // PASSO 1: Verificar se usuário está logado
    // accountData vem do middleware
    const accountData = res.locals.accountData

    if (!accountData || !accountData.account_id) {
      return res.status(401).json({
        success: false,
        message: "Please log in to add a review."
      })
    }

    // PASSO 2: Verificar se veículo existe
    const vehicle = await vehicleModel.getVehicleById(inv_id)
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found."
      })
    }

    // PASSO 3: Verificar se usuário já avaliou este veículo
    const alreadyReviewed = await reviewModel.hasUserReviewedVehicle(
      inv_id,
      accountData.account_id
    )

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this vehicle."
      })
    }

    // PASSO 4: Inserir avaliação no banco
    const result = await reviewModel.addReview(
      inv_id,
      accountData.account_id,
      review_text,
      review_rating
    )

    if (result && result.rows && result.rows.length > 0) {
      // ✅ SUCESSO
      return res.status(201).json({
        success: true,
        message: "Review added successfully!",
        review: result.rows[0]
      })
    } else {
      // ❌ ERRO
      return res.status(500).json({
        success: false,
        message: "Failed to add review. Please try again."
      })
    }
  } catch (error) {
    console.error("addReview error: " + error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the review."
    })
  }
}

/* ***************************
 *  FUNÇÃO 2: Obter avaliações de um veículo
 * ***************************
 *
 * ROTA: GET /inv/review/:inv_id
 *
 * OBJETIVO: Buscar todas as avaliações de um veículo
 *
 * RETORNO: JSON com array de avaliações
 */
reviewCont.getReviews = async function (req, res) {
  try {
    const inv_id = req.params.inv_id

    // Buscar avaliações
    const reviews = await reviewModel.getReviewsByInventoryId(inv_id)

    // Buscar estatísticas
    const stats = await reviewModel.getReviewStats(inv_id)

    return res.status(200).json({
      success: true,
      reviews: reviews,
      stats: stats
    })
  } catch (error) {
    console.error("getReviews error: " + error)
    return res.status(500).json({
      success: false,
      message: "Failed to load reviews."
    })
  }
}

/* ***************************
 *  FUNÇÃO 3: Atualizar uma avaliação
 * ***************************
 *
 * ROTA: PUT /inv/review/update/:review_id
 *
 * OBJETIVO: Modificar uma avaliação existente
 *
 * VALIDAÇÃO: Apenas o autor pode editar
 */
reviewCont.updateReview = async function (req, res) {
  try {
    const { review_text, review_rating } = req.body
    const review_id = req.params.review_id

    // PASSO 1: Verificar se usuário está logado
    const accountData = res.locals.accountData || req.session.accountData

    if (!accountData) {
      return res.status(401).json({
        success: false,
        message: "Please log in to edit a review."
      })
    }

    // PASSO 2: Buscar avaliação original
    const review = await reviewModel.getReviewById(review_id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found."
      })
    }

    // PASSO 3: Verificar se usuário é o autor
    if (review.account_id !== accountData.account_id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own reviews."
      })
    }

    // PASSO 4: Atualizar avaliação
    const result = await reviewModel.updateReview(
      review_id,
      review_text,
      review_rating
    )

    if (result && result.rows && result.rows.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Review updated successfully!",
        review: result.rows[0]
      })
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to update review."
      })
    }
  } catch (error) {
    console.error("updateReview error: " + error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the review."
    })
  }
}

/* ***************************
 *  FUNÇÃO 4: Deletar uma avaliação
 * ***************************
 *
 * ROTA: DELETE /inv/review/delete/:review_id
 *
 * OBJETIVO: Remover uma avaliação
 *
 * VALIDAÇÃO: Apenas o autor ou admin pode deletar
 */
reviewCont.deleteReview = async function (req, res) {
  try {
    const review_id = req.params.review_id

    // PASSO 1: Verificar se usuário está logado
    const accountData = res.locals.accountData || req.session.accountData

    if (!accountData) {
      return res.status(401).json({
        success: false,
        message: "Please log in to delete a review."
      })
    }

    // PASSO 2: Buscar avaliação original
    const review = await reviewModel.getReviewById(review_id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found."
      })
    }

    // PASSO 3: Verificar permissão (autor ou admin)
    const isAuthor = review.account_id === accountData.account_id
    const isAdmin = accountData.account_type === 'Admin'

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this review."
      })
    }

    // PASSO 4: Deletar avaliação
    const result = await reviewModel.deleteReview(review_id)

    if (result && result.rows && result.rows.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Review deleted successfully!"
      })
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to delete review."
      })
    }
  } catch (error) {
    console.error("deleteReview error: " + error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the review."
    })
  }
}

// ==============================================
// EXPORTAR FUNÇÕES
// ==============================================
module.exports = reviewCont

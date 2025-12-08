// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/vehicleController")
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/inventory-validation')
const reviewValidate = require('../utilities/review-validation')

// Import authentication middleware
const authMiddleware = require("../middleware/authMiddleware")

// ==========================================
// ROTAS PROTEGIDAS (Apenas Admin/Employee)
// ==========================================
// authMiddleware.checkAccountType verifica se usuário é Admin ou Employee
// Se não for, redireciona para /account/ com mensagem de erro

// Route to build inventory management view (PROTEGIDA)
router.get(
    "/",
    authMiddleware.checkAccountType,
    utilities.handleErrors(invController.buildManagement)
)

// Route to build add classification view (PROTEGIDA)
router.get(
    "/add-classification",
    authMiddleware.checkAccountType,
    utilities.handleErrors(invController.buildAddClassification)
)

// Route to process add classification (PROTEGIDA)
router.post(
    "/add-classification",
    authMiddleware.checkAccountType,
    regValidate.classificationRules(),
    regValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

// Route to build add inventory view (PROTEGIDA)
router.get(
    "/add-inventory",
    authMiddleware.checkAccountType,
    utilities.handleErrors(invController.buildAddInventory)
)

// Route to process add inventory (PROTEGIDA)
router.post(
    "/add-inventory",
    authMiddleware.checkAccountType,
    regValidate.inventoryRules(),
    regValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

// ==========================================
// ROTAS PÚBLICAS (Todos podem acessar)
// ==========================================
// Estas rotas são para visualização apenas
// Não precisam de autenticação

// Route to build inventory by classification view (PÚBLICA)
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build vehicle detail view (PÚBLICA)
router.get("/detail/:vehicleId", utilities.handleErrors(invController.buildByVehicleId))

// ==========================================
// ROTAS DE AVALIAÇÕES (Reviews)
// ==========================================
// Avaliações podem ser vistas por todos (pública)
// Mas adicionar/editar/deletar requer login (protegida)

// Route to get all reviews for a vehicle (PÚBLICA - API)
router.get("/review/:inv_id", utilities.handleErrors(reviewController.getReviews))

// Route to add a new review (PROTEGIDA - Requer login)
router.post(
  "/review/add",
  authMiddleware.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.addReview)
)

// Route to update a review (PROTEGIDA - Apenas autor)
router.put(
  "/review/update/:review_id",
  authMiddleware.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.updateReview)
)

// Route to delete a review (PROTEGIDA - Apenas autor ou admin)
router.delete(
  "/review/delete/:review_id",
  authMiddleware.checkLogin,
  utilities.handleErrors(reviewController.deleteReview)
)

module.exports = router
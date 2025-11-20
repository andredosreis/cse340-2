// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/vehicleController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build vehicle detail view
router.get("/detail/:vehicleId", utilities.handleErrors(invController.buildByVehicleId))

module.exports = router
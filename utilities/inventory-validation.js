const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
    return [
        // classification_name is required and must be string
        body("classification_name")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a classification name.") // on error this message is sent.
            .isAlpha()
            .withMessage("Classification name must only contain letters (no spaces or numbers)."),
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
    return [
        // classification_id is required
        body("classification_id")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please select a classification."),

        // inv_make is required and must be at least 3 chars
        body("inv_make")
            .trim()
            .isLength({ min: 3 })
            .withMessage("Please provide a make (min 3 chars)."),

        // inv_model is required and must be at least 3 chars
        body("inv_model")
            .trim()
            .isLength({ min: 3 })
            .withMessage("Please provide a model (min 3 chars)."),

        // inv_year is required and must be 4 digits
        body("inv_year")
            .trim()
            .isNumeric()
            .isLength({ min: 4, max: 4 })
            .withMessage("Please provide a valid 4-digit year."),

        // inv_description is required
        body("inv_description")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a description."),

        // inv_image is required
        body("inv_image")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide an image path."),

        // inv_thumbnail is required
        body("inv_thumbnail")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a thumbnail path."),

        // inv_price is required and must be decimal
        body("inv_price")
            .trim()
            .isFloat()
            .withMessage("Please provide a valid price."),

        // inv_miles is required and must be integer
        body("inv_miles")
            .trim()
            .isInt()
            .withMessage("Please provide valid miles (integer)."),

        // inv_color is required
        body("inv_color")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a color."),
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
    const {
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
    } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            errors,
            title: "Add New Vehicle",
            nav,
            classificationList,
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        })
        return
    }
    next()
}

module.exports = validate

/**
 * CSE 340 - Review Validation Rules
 * Validates review data for security and data quality
 */

const { body, validationResult } = require('express-validator');

// Validation rules for adding/updating reviews
const reviewRules = () => {
  return [
    body('review_text')
      .trim()
      .notEmpty()
      .withMessage('Review text is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Review must be between 10 and 1000 characters'),

    body('review_rating')
      .notEmpty()
      .withMessage('Rating is required')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5 stars'),

    body('inv_id')
      .notEmpty()
      .withMessage('Vehicle ID is required')
      .isInt({ min: 1 })
      .withMessage('Vehicle ID must be a valid number')
  ];
};

/**
 * Middleware to check validation results
 * If there are errors, respond with JSON error message
 */
const checkReviewData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }
  next();
};

module.exports = { reviewRules, checkReviewData };

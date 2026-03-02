const { body, validationResult } = require('express-validator');

const validateTodo = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Todo text must be between 1 and 200 characters')
    .escape()
    .matches(/^[a-zA-Z0-9\s\-_.,!?@#$%^&*()]+$/)
    .withMessage('Todo text contains invalid characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

const validateMongoId = [
  (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format'
      });
    }
    next();
  }
];

module.exports = {
  validateTodo,
  validateMongoId
};

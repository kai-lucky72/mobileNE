const { body } = require('express-validator');

exports.createParkingValidator = [
  body('code')
    .trim()
    .notEmpty().withMessage('Parking code is required')
    .toUpperCase(),
  
  body('name')
    .trim()
    .notEmpty().withMessage('Parking name is required'),
  
  body('totalSpaces')
    .notEmpty().withMessage('Number of spaces is required')
    .isInt({ min: 1 }).withMessage('Must have at least 1 space'),
  
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),
  
  body('feePerHour')
    .notEmpty().withMessage('Fee per hour is required')
    .isFloat({ min: 0 }).withMessage('Fee cannot be negative')
];

exports.updateParkingValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Parking name cannot be empty'),
  
  body('totalSpaces')
    .optional()
    .isInt({ min: 1 }).withMessage('Must have at least 1 space'),
  
  body('location')
    .optional()
    .trim()
    .notEmpty().withMessage('Location cannot be empty'),
  
  body('feePerHour')
    .optional()
    .isFloat({ min: 0 }).withMessage('Fee cannot be negative')
];

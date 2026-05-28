const { body } = require('express-validator');

exports.createEntryValidator = [
  body('plateNumber')
    .trim()
    .notEmpty().withMessage('Plate number is required')
    .toUpperCase(),
  
  body('parkingCode')
    .trim()
    .notEmpty().withMessage('Parking code is required')
];

exports.exitEntryValidator = [
  body('plateNumber')
    .trim()
    .notEmpty().withMessage('Plate number is required')
    .toUpperCase(),
  
  body('parkingCode')
    .trim()
    .notEmpty().withMessage('Parking code is required')
];

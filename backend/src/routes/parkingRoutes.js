const express = require('express');
const router = express.Router();
const { 
  createParking, 
  getParkings, 
  getParkingByCode, 
  updateParking, 
  deleteParking 
} = require('../controllers/parkingController');
const { createParkingValidator, updateParkingValidator } = require('../validators/parkingValidators');
const validate = require('../middleware/validate');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getParkings);
router.get('/:code', getParkingByCode);

// Protected routes (Admin only)
router.post('/', protect, admin, createParkingValidator, validate, createParking);
router.put('/:code', protect, admin, updateParkingValidator, validate, updateParking);
router.delete('/:code', protect, admin, deleteParking);

module.exports = router;

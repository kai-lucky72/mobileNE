const express = require('express');
const router = express.Router();
const { 
  createEntry, 
  processExit, 
  getEntries, 
  getEntryByTicket,
  getOutgoingReport,
  getEnteredReport
} = require('../controllers/entryController');
const { createEntryValidator, exitEntryValidator } = require('../validators/entryValidators');
const validate = require('../middleware/validate');
const { protect, parkingAttendant, admin } = require('../middleware/auth');

// Public route - get entry by ticket
router.get('/ticket/:ticketNumber', getEntryByTicket);

// Protected routes
router.get('/', protect, getEntries);
router.post('/', protect, parkingAttendant, createEntryValidator, validate, createEntry);
router.post('/exit', protect, parkingAttendant, exitEntryValidator, validate, processExit);

// Report routes (Admin only)
router.get('/reports/outgoing', protect, admin, getOutgoingReport);
router.get('/reports/entered', protect, admin, getEnteredReport);

module.exports = router;

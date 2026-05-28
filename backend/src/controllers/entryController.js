const ParkingEntry = require('../models/ParkingEntry');
const Parking = require('../models/Parking');
const logger = require('../utils/logger');

// @desc    Register car entry
// @route   POST /api/entries
// @access  Private/Parking Attendant
exports.createEntry = async (req, res) => {
  try {
    const { plateNumber, parkingCode } = req.body;

    // Check if parking exists and has available spaces
    const parking = await Parking.findOne({ code: parkingCode });
    
    if (!parking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking not found' 
      });
    }

    if (parking.availableSpaces <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No available spaces in this parking' 
      });
    }

    // Check if there's already an active entry for this plate number in this parking
    const existingActiveEntry = await ParkingEntry.findOne({
      plateNumber,
      parkingCode,
      status: 'active'
    });

    if (existingActiveEntry) {
      return res.status(400).json({ 
        success: false, 
        message: 'Car is already parked in this location' 
      });
    }

    // Create entry
    const entry = await ParkingEntry.create({
      plateNumber,
      parkingCode,
      entryDateTime: new Date()
    });

    // Update available spaces
    parking.availableSpaces -= 1;
    await parking.save();

    logger.info(`Car entry registered: ${plateNumber} at ${parkingCode}`);

    res.status(201).json({
      success: true,
      message: 'Car entry registered successfully',
      data: { 
        entry,
        ticket: {
          ticketNumber: entry.ticketNumber,
          plateNumber: entry.plateNumber,
          parkingName: parking.name,
          parkingCode: parking.code,
          entryDateTime: entry.entryDateTime,
          feePerHour: parking.feePerHour
        }
      }
    });
  } catch (error) {
    logger.error(`Create entry error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      success: false, 
      message: 'Server error registering entry' 
    });
  }
};

// @desc    Process car exit and generate bill
// @route   POST /api/entries/exit
// @access  Private/Parking Attendant
exports.processExit = async (req, res) => {
  try {
    const { plateNumber, parkingCode } = req.body;

    // Find active entry
    const entry = await ParkingEntry.findOne({
      plateNumber,
      parkingCode,
      status: 'active'
    }).populate('parkingCode');

    if (!entry) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active entry found for this vehicle' 
      });
    }

    const parking = await Parking.findOne({ code: parkingCode });
    
    // Calculate duration and charge
    const exitDateTime = new Date();
    const entryDateTime = new Date(entry.entryDateTime);
    const durationMs = exitDateTime - entryDateTime;
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to nearest hour
    const chargedAmount = durationHours * parking.feePerHour;

    // Update entry
    entry.exitDateTime = exitDateTime;
    entry.chargedAmount = chargedAmount;
    entry.duration = durationHours;
    entry.status = 'completed';
    await entry.save();

    // Update available spaces
    parking.availableSpaces += 1;
    await parking.save();

    logger.info(`Car exit processed: ${plateNumber} from ${parkingCode}`);

    res.json({
      success: true,
      message: 'Car exit processed successfully',
      data: {
        entry,
        bill: {
          ticketNumber: entry.ticketNumber,
          plateNumber: entry.plateNumber,
          parkingName: parking.name,
          entryDateTime: entry.entryDateTime,
          exitDateTime: entry.exitDateTime,
          durationHours: entry.duration,
          feePerHour: parking.feePerHour,
          totalAmount: entry.chargedAmount
        }
      }
    });
  } catch (error) {
    logger.error(`Process exit error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      success: false, 
      message: 'Server error processing exit' 
    });
  }
};

// @desc    Get all entries with pagination and filters
// @route   GET /api/entries
// @access  Private
exports.getEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by parking code
    if (req.query.parkingCode) {
      query.parkingCode = req.query.parkingCode;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.entryDateTime = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Search by plate number
    if (req.query.plateNumber) {
      query.plateNumber = { $regex: req.query.plateNumber, $options: 'i' };
    }

    const [entries, total] = await Promise.all([
      ParkingEntry.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('parkingCode', 'name code location'),
      ParkingEntry.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        entries,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error(`Get entries error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching entries' 
    });
  }
};

// @desc    Get single entry by ticket number
// @route   GET /api/entries/ticket/:ticketNumber
// @access  Public
exports.getEntryByTicket = async (req, res) => {
  try {
    const entry = await ParkingEntry.findOne({ 
      ticketNumber: req.params.ticketNumber 
    }).populate('parkingCode', 'name code location feePerHour');

    if (!entry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Entry not found' 
      });
    }

    res.json({
      success: true,
      data: { entry }
    });
  } catch (error) {
    logger.error(`Get entry error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching entry' 
    });
  }
};

// @desc    Get reports - outgoing cars between dates
// @route   GET /api/entries/reports/outgoing
// @access  Private/Admin
exports.getOutgoingReport = async (req, res) => {
  try {
    const { startDate, endDate, parkingCode } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Start date and end date are required' 
      });
    }

    const query = {
      status: 'completed',
      exitDateTime: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (parkingCode) {
      query.parkingCode = parkingCode;
    }

    const entries = await ParkingEntry.find(query)
      .populate('parkingCode', 'name code location')
      .sort({ exitDateTime: -1 });

    const totalAmount = entries.reduce((sum, entry) => sum + entry.chargedAmount, 0);

    res.json({
      success: true,
      data: {
        entries,
        summary: {
          totalCars: entries.length,
          totalAmount,
          dateRange: { startDate, endDate }
        }
      }
    });
  } catch (error) {
    logger.error(`Get outgoing report error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      success: false, 
      message: 'Server error generating report' 
    });
  }
};

// @desc    Get reports - entered cars between dates
// @route   GET /api/entries/reports/entered
// @access  Private/Admin
exports.getEnteredReport = async (req, res) => {
  try {
    const { startDate, endDate, parkingCode } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Start date and end date are required' 
      });
    }

    const query = {
      entryDateTime: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (parkingCode) {
      query.parkingCode = parkingCode;
    }

    const entries = await ParkingEntry.find(query)
      .populate('parkingCode', 'name code location')
      .sort({ entryDateTime: -1 });

    res.json({
      success: true,
      data: {
        entries,
        summary: {
          totalCars: entries.length,
          dateRange: { startDate, endDate }
        }
      }
    });
  } catch (error) {
    logger.error(`Get entered report error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      success: false, 
      message: 'Server error generating report' 
    });
  }
};

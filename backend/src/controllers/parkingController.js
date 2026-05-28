const Parking = require('../models/Parking');
const logger = require('../utils/logger');

// @desc    Create new parking
// @route   POST /api/parkings
// @access  Private/Admin
exports.createParking = async (req, res) => {
  try {
    const { code, name, totalSpaces, location, feePerHour } = req.body;

    // Check if parking code already exists
    const existingParking = await Parking.findOne({ code });
    if (existingParking) {
      logger.warn(`Create parking attempt with existing code: ${code}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Parking with this code already exists' 
      });
    }

    const parking = await Parking.create({
      code,
      name,
      totalSpaces,
      availableSpaces: totalSpaces,
      location,
      feePerHour
    });

    logger.info(`New parking created: ${parking.code}`);

    res.status(201).json({
      success: true,
      message: 'Parking created successfully',
      data: { parking }
    });
  } catch (error) {
    logger.error(`Create parking error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating parking' 
    });
  }
};

// @desc    Get all parkings with pagination
// @route   GET /api/parkings
// @access  Public
exports.getParkings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    
    // Search by location or name
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [parkings, total] = await Promise.all([
      Parking.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Parking.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        parkings,
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
    logger.error(`Get parkings error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching parkings' 
    });
  }
};

// @desc    Get single parking
// @route   GET /api/parkings/:code
// @access  Public
exports.getParkingByCode = async (req, res) => {
  try {
    const parking = await Parking.findOne({ code: req.params.code });
    
    if (!parking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking not found' 
      });
    }

    res.json({
      success: true,
      data: { parking }
    });
  } catch (error) {
    logger.error(`Get parking error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching parking' 
    });
  }
};

// @desc    Update parking
// @route   PUT /api/parkings/:code
// @access  Private/Admin
exports.updateParking = async (req, res) => {
  try {
    const { name, totalSpaces, location, feePerHour, isActive } = req.body;

    const parking = await Parking.findOneAndUpdate(
      { code: req.params.code },
      { name, totalSpaces, location, feePerHour, isActive },
      { new: true, runValidators: true }
    );

    if (!parking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking not found' 
      });
    }

    logger.info(`Parking updated: ${parking.code}`);

    res.json({
      success: true,
      message: 'Parking updated successfully',
      data: { parking }
    });
  } catch (error) {
    logger.error(`Update parking error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating parking' 
    });
  }
};

// @desc    Delete parking
// @route   DELETE /api/parkings/:code
// @access  Private/Admin
exports.deleteParking = async (req, res) => {
  try {
    const parking = await Parking.findOneAndDelete({ code: req.params.code });

    if (!parking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking not found' 
      });
    }

    logger.info(`Parking deleted: ${parking.code}`);

    res.json({
      success: true,
      message: 'Parking deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete parking error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting parking' 
    });
  }
};

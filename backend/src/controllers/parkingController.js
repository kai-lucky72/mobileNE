const { Parking, ParkingEntry } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// @desc    Create new parking
// @route   POST /api/parkings
// @access  Private/Admin
exports.createParking = async (req, res) => {
  try {
    const { code, name, totalSpaces, location, feePerHour } = req.body;

    // Check if parking code already exists
    const existingParking = await Parking.findOne({ where: { code } });
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
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
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
    const offset = (page - 1) * limit;

    const query = { isActive: true };
    
    // Search by location or name
    if (req.query.search) {
      query[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { location: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }

    const { count, rows: parkings } = await Parking.findAndCountAll({
      where: query,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        parkings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
          hasNextPage: page * limit < count,
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
    const parking = await Parking.findOne({ where: { code: req.params.code } });
    
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

    const parking = await Parking.findOne({ where: { code: req.params.code } });
    
    if (!parking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking not found' 
      });
    }

    await parking.update({
      name,
      totalSpaces,
      location,
      feePerHour,
      isActive
    });

    logger.info(`Parking updated: ${parking.code}`);

    res.json({
      success: true,
      message: 'Parking updated successfully',
      data: { parking }
    });
  } catch (error) {
    logger.error(`Update parking error: ${error.message}`, { stack: error.stack });
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
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
    const parking = await Parking.findOne({ where: { code: req.params.code } });

    if (!parking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking not found' 
      });
    }

    await parking.destroy();

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

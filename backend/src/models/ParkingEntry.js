const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ParkingEntry = sequelize.define('ParkingEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  plateNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  parkingCode: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'parkings',
      key: 'code'
    }
  },
  entryDateTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  exitDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  chargedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  ticketNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  duration: {
    type: DataTypes.FLOAT, // in hours
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'completed'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  tableName: 'parking_entries',
  hooks: {
    beforeCreate: (entry) => {
      if (!entry.ticketNumber) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        entry.ticketNumber = `TKT-${timestamp}-${random}`;
      }
    }
  }
});

module.exports = ParkingEntry;

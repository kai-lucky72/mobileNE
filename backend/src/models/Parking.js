const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Parking = sequelize.define('Parking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  totalSpaces: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  availableSpaces: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  feePerHour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'parkings',
  hooks: {
    beforeCreate: (parking) => {
      if (!parking.availableSpaces) {
        parking.availableSpaces = parking.totalSpaces;
      }
    }
  }
});

module.exports = Parking;

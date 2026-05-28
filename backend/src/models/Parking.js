const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Parking code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Parking name is required'],
    trim: true
  },
  totalSpaces: {
    type: Number,
    required: [true, 'Number of spaces is required'],
    min: [1, 'Must have at least 1 space']
  },
  availableSpaces: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  feePerHour: {
    type: Number,
    required: [true, 'Fee per hour is required'],
    min: [0, 'Fee cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update available spaces before saving
parkingSchema.pre('save', function(next) {
  if (this.isNew) {
    this.availableSpaces = this.totalSpaces;
  }
  next();
});

module.exports = mongoose.model('Parking', parkingSchema);

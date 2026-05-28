const mongoose = require('mongoose');

const parkingEntrySchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: [true, 'Plate number is required'],
    uppercase: true,
    trim: true
  },
  parkingCode: {
    type: String,
    ref: 'Parking',
    required: [true, 'Parking code is required']
  },
  entryDateTime: {
    type: Date,
    default: Date.now
  },
  exitDateTime: {
    type: Date,
    default: null
  },
  chargedAmount: {
    type: Number,
    default: 0
  },
  ticketNumber: {
    type: String,
    unique: true
  },
  duration: {
    type: Number, // in hours
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Generate ticket number before saving
parkingEntrySchema.pre('save', function(next) {
  if (this.isNew && !this.ticketNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.ticketNumber = `TKT-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('ParkingEntry', parkingEntrySchema);

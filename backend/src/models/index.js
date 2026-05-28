const User = require('./User');
const Parking = require('./Parking');
const ParkingEntry = require('./ParkingEntry');

// Define associations
User.hasMany(ParkingEntry, { 
  foreignKey: 'userId', 
  as: 'parkingEntries' 
});

ParkingEntry.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

Parking.hasMany(ParkingEntry, { 
  foreignKey: 'parkingCode', 
  sourceKey: 'code',
  as: 'entries' 
});

ParkingEntry.belongsTo(Parking, { 
  foreignKey: 'parkingCode', 
  targetKey: 'code',
  as: 'parking' 
});

module.exports = {
  User,
  Parking,
  ParkingEntry
};

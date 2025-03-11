const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  date: { type: Date, required: true },
  time_slot: { type: String, required: true },
  duration: { type: Number, required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  add_ons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AddOn' }],
  special_requirements: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);

const mongoose = require('mongoose');

const addOnSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, required: true, enum: ['food', 'decoration'],  // Only 'food' or 'decoration' are valid
  },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AddOn', addOnSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['Farmer', 'Buyer'],
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  location: {
    type: String, // Or coordinates, keeping it simple as a string for now mapping to mock distances
    default: ''
  },
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=User&background=EBF4FF&color=4F46E5'
  },
  averageRating: {
    type: Number,
    default: 0
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);

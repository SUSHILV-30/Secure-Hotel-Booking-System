const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['User', 'Staff', 'Admin'],
      default: 'User'
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    dob: { type: String, default: '' },
    gender: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    createdAt: {
      type: String,
      default: () => new Date().toISOString()
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    hotelName: {
      type: String,
      required: true
    },
    checkIn: {
      type: String,
      required: true
    },
    checkOut: {
      type: String,
      required: true
    },
    numDays: {
      type: Number,
      required: true,
      min: 1
    },
    numAdults: {
      type: Number,
      default: 1,
      min: 1
    },
    numChildren: {
      type: Number,
      default: 0,
      min: 0
    },
    roomSize: {
      type: String,
      default: 'Standard'
    },
    bedding: {
      type: String,
      default: '1'
    },
    totalPrice: {
      type: Number,
      required: true
    },
    bookingDate: {
      type: String,
      default: () => new Date().toISOString()
    },
    // Encrypted fields (AES-256 ciphertext stored as "iv:encrypted" strings)
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    guestPhone: { type: String, required: true },
    guestAddress: { type: String, required: true },
    // RSA-2048 digital signature
    signature: { type: String, default: '' },
    // QR Code data URL
    qrCode: { type: String, default: '' }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

module.exports = mongoose.model('Booking', bookingSchema);

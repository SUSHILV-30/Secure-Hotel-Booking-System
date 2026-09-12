const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    timestamp: {
      type: String,
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    details: {
      type: String,
      default: ''
    },
    userEmail: {
      type: String,
      default: 'System',
      index: true
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);

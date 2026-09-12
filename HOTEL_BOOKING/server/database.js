const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Mongoose models
const UserModel = require('./models/User');
const BookingModel = require('./models/Booking');
const AuditLogModel = require('./models/AuditLog');

// ---------- Local File Storage Fallback ----------
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const LOGS_FILE = path.join(DATA_DIR, 'audit_logs.json');

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
if (!fs.existsSync(BOOKINGS_FILE)) fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
if (!fs.existsSync(LOGS_FILE)) fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));

function readJSONFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return [];
  }
}

function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
  }
}

// ---------- Runtime Mode Flag ----------
let useMongo = false;

// ---------- Initialization ----------
async function initDB() {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      await mongoose.connect(uri);
      useMongo = true;
      console.log('[DB] ✅ Connected to MongoDB successfully');
    } catch (err) {
      useMongo = false;
      console.error('[DB] ⚠️  MongoDB connection failed, falling back to Local Storage Mode:', err.message);
    }
  } else {
    useMongo = false;
    console.log('[DB] Running in Local Storage Mode (set MONGODB_URI in .env to enable MongoDB)');
  }
}

// ---------- Users ----------
async function getUsers() {
  if (useMongo) {
    return await UserModel.find({}).lean();
  }
  return readJSONFile(USERS_FILE);
}

async function saveUser(user) {
  if (useMongo) {
    await UserModel.create(user);
    return;
  }
  const users = readJSONFile(USERS_FILE);
  users.push(user);
  writeJSONFile(USERS_FILE, users);
}

async function updateUserRole(email, newRole) {
  if (useMongo) {
    const result = await UserModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: newRole },
      { new: true }
    ).lean();
    return !!result;
  }
  const users = readJSONFile(USERS_FILE);
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index !== -1) {
    users[index].role = newRole;
    writeJSONFile(USERS_FILE, users);
    return true;
  }
  return false;
}

async function updateUserProfile(email, updatedFields) {
  if (useMongo) {
    const updated = await UserModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: updatedFields },
      { new: true }
    ).lean();
    return updated || null;
  }
  const users = readJSONFile(USERS_FILE);
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedFields };
    writeJSONFile(USERS_FILE, users);
    return users[index];
  }
  return null;
}

// ---------- Bookings ----------
async function getBookings() {
  if (useMongo) {
    return await BookingModel.find({}).lean();
  }
  return readJSONFile(BOOKINGS_FILE);
}

async function saveBooking(booking) {
  if (useMongo) {
    await BookingModel.create(booking);
    return;
  }
  const bookings = readJSONFile(BOOKINGS_FILE);
  bookings.push(booking);
  writeJSONFile(BOOKINGS_FILE, bookings);
}

// ---------- Audit Logs ----------
async function getLogs() {
  if (useMongo) {
    return await AuditLogModel.find({}).sort({ timestamp: -1 }).lean();
  }
  return readJSONFile(LOGS_FILE);
}

async function logEvent(action, details, userEmail = 'System') {
  try {
    const newLog = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      action,
      details,
      userEmail
    };

    if (useMongo) {
      await AuditLogModel.create(newLog);
    } else {
      const logs = readJSONFile(LOGS_FILE);
      logs.unshift(newLog); // Keep latest logs at the top
      writeJSONFile(LOGS_FILE, logs);
    }

    console.log(`[AUDIT LOG] ${newLog.timestamp} | ${action} | User: ${userEmail} | Info: ${details}`);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

module.exports = {
  initDB,
  getUsers,
  saveUser,
  updateUserRole,
  updateUserProfile,
  getBookings,
  saveBooking,
  getLogs,
  logEvent
};

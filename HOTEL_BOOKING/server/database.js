const fs = require('fs');
const path = require('path');

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

function getUsers() {
  return readJSONFile(USERS_FILE);
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  writeJSONFile(USERS_FILE, users);
}

function updateUserRole(email, newRole) {
  const users = getUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index !== -1) {
    users[index].role = newRole;
    writeJSONFile(USERS_FILE, users);
    return true;
  }
  return false;
}

function getBookings() {
  return readJSONFile(BOOKINGS_FILE);
}

function saveBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  writeJSONFile(BOOKINGS_FILE, bookings);
}

function getLogs() {
  return readJSONFile(LOGS_FILE);
}

function logEvent(action, details, userEmail = 'System') {
  try {
    const logs = getLogs();
    const newLog = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      action,
      details,
      userEmail
    };
    logs.unshift(newLog); // Keep latest logs at the top
    writeJSONFile(LOGS_FILE, logs);
    console.log(`[AUDIT LOG] ${newLog.timestamp} | ${action} | User: ${userEmail} | Info: ${details}`);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

function updateUserProfile(email, updatedFields) {
  const users = getUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedFields };
    writeJSONFile(USERS_FILE, users);
    return users[index];
  }
  return null;
}

module.exports = {
  getUsers,
  saveUser,
  updateUserRole,
  updateUserProfile,
  getBookings,
  saveBooking,
  getLogs,
  logEvent
};

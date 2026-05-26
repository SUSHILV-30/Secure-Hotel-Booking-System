require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const db = require('./database');
const cryptoUtils = require('./cryptoUtils');
const nodemailer = require('nodemailer');

// Create SMTP Transporter for sending MFA emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

// Function to send email
async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"LuxeStay Secure" <no-reply@luxestay.com>',
    to: email,
    subject: 'LuxeStay Verification Code',
    text: `Your LuxeStay verification code is: ${otp}. It will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #0f172a; color: #f8fafc;">
        <h2 style="color: #3b82f6; text-align: center; border-bottom: 1px solid #334155; padding-bottom: 10px;">LuxeStay MFA Verification</h2>
        <p>Dear Guest,</p>
        <p>Your one-time password (OTP) for logging in to LuxeStay is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #d4a853; background-color: #1e293b; padding: 10px 25px; border-radius: 6px; border: 1px solid #334155;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">This code is valid for 5 minutes. Please do not share it with anyone.</p>
        <p style="border-top: 1px solid #334155; padding-top: 15px; font-size: 12px; color: #64748b; text-align: center;">LuxeStay Secure Booking Platform &copy; 2026</p>
      </div>
    `
  };

  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[SMTP CONFIG] SMTP credentials not fully configured. Skipping mail sending.`);
      return false;
    }
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP SUCCESS] OTP email sent successfully to ${email}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[SMTP ERROR] Failed to send OTP email: ${error.message}`);
    return false;
  }
}

// Load environment variables or define defaults
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'luxestay_super_secret_jwt_key';

const app = express();

app.use(cors({
  origin: '*', // Allow any origin for testing
  credentials: true
}));
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../images')));

// Seed default accounts if database is empty
function seedUsers() {
  const users = db.getUsers();
  if (users.length === 0) {
    const defaultUsers = [
      {
        id: 'u1',
        name: 'LuxeStay Admin',
        email: 'admin@luxestay.com',
        password: bcrypt.hashSync('Admin@123', 10),
        role: 'Admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'u2',
        name: 'LuxeStay Staff',
        email: 'staff@luxestay.com',
        password: bcrypt.hashSync('Staff@123', 10),
        role: 'Staff',
        createdAt: new Date().toISOString()
      },
      {
        id: 'u3',
        name: 'John Doe',
        email: 'user@luxestay.com',
        password: bcrypt.hashSync('User@123', 10),
        role: 'User',
        createdAt: new Date().toISOString()
      }
    ];
    defaultUsers.forEach(u => db.saveUser(u));
    db.logEvent('SEED_USERS', 'Default Admin, Staff, and User accounts seeded');
  }
}
seedUsers();

// In-memory OTP storage
const otpMap = new Map();

// Hotel price lookup table
const HOTEL_PRICES = {
  // Shimla
  'Havens Resort': 4120,
  'Oberoi Cecil': 4200,
  'Marigold Sarovar Portico': 4150,
  'Flag House Resort': 4100,
  // Araku Valley
  'Krishna Tara Comforts': 370,
  'Sri Sai Suvarna Inn': 360,
  'Araku Haritha Valley Resort': 380,
  'Hill Park Resort': 390,
  // Manali
  'Hotel Devlok Manali': 280,
  'Sterling Manali-Resorts&Hotels': 2100,
  'Hotel Snow Park Manali': 290,
  'Hotel Jupiter': 2110,
  // Goa
  'Hotel Colva Kinara': 2120,
  'Jasminn by Mango Hotels': 2150,
  'The Queeny': 2130,
  'Amigo Plaza': 2110,
  // Ooty
  'Hotel Preethi Classic Towers': 380,
  'Hotel Lakeview': 3100,
  'Treebo Yantra Leisures': 390,
  'Berry Hills Resort': 3110,
  // Agra
  'Hotel Atulyaa Taj': 3100,
  'ITC Mughal': 3120,
  'Hotel Royale Residency': 380,
  'Hotel Pushp Villa': 390,
  // Darjeeling
  'Central Heritage Resort': 580,
  'Summit Grace Hotel': 590,
  'The Swiss Hotel': 5100,
  'Hotel Broadway (Annexe)': 5110,
  // Dalhousie
  'Snow Valley Resorts': 480,
  'Grand View Hotel': 4100,
  'Alps Resort Dalhousie': 4120,
  'A.S Clarks Inn': 490,
  // Dharamshala
  'Hotel Center Point': 270,
  'Hotel Inclover': 280,
  'Treebo GK Conifer': 290,
  'WelcomHeritage Grace Hotel': 2100,
  // Alleppey
  'Hotel Royale Park': 380,
  'Alleppey Prince Hotel': 390,
  'Hotel Bonanza': 3100,
  'Royal Homes': 370
};

// CAPTCHA helper
function generateCaptcha() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let text = '';
  for (let i = 0; i < 5; i++) {
    text += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const width = 150;
  const height = 45;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect width="100%" height="100%" fill="#121824" rx="4"/>`;
  // Add background grid lines for security noise
  for (let i = 0; i < 6; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1"/>`;
  }
  // Add characters
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const rotate = (Math.random() - 0.5) * 25; // Random rotation
    const fontSize = 24 + Math.random() * 6;
    const x = 15 + i * 25 + Math.random() * 5;
    const y = 30 + (Math.random() - 0.5) * 6;
    svg += `<text x="${x}" y="${y}" fill="#3b82f6" font-size="${fontSize}" font-family="monospace" font-weight="bold" transform="rotate(${rotate} ${x} ${y})">${char}</text>`;
  }
  svg += `</svg>`;
  return { text, svg };
}

// Security Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or expired' });
    }
    req.user = decoded;
    next();
  });
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: requires role ${roles.join(' or ')}` });
    }
    next();
  };
}

// API Routes

// Get Public Key
app.get('/api/auth/public-key', (req, res) => {
  res.json({ publicKey: cryptoUtils.getPublicKey() });
});

// CAPTCHA Endpoint
app.get('/api/auth/captcha', (req, res) => {
  const { text, svg } = generateCaptcha();
  // Encrypt the captcha text to form the token
  const token = jwt.sign({ text }, JWT_SECRET, { expiresIn: '3m' });
  res.json({ svg, token });
});

// Register Route
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  
  const users = db.getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    db.logEvent('REGISTER_FAIL', `Attempted registration for existing email: ${email}`, email);
    return res.status(400).json({ error: 'User already exists with this email' });
  }
  
  const targetRole = role && ['User', 'Staff', 'Admin'].includes(role) ? role : 'User';
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    role: targetRole,
    createdAt: new Date().toISOString()
  };
  
  db.saveUser(newUser);
  db.logEvent('REGISTER_SUCCESS', `User registered successfully with role: ${targetRole}`, email);
  
  res.status(201).json({ message: 'Registration successful! Please login.' });
});

// Login Route with CAPTCHA & MFA initialization
app.post('/api/auth/login', (req, res) => {
  const { email, password, captchaText, captchaToken } = req.body;
  
  if (!email || !password || !captchaText || !captchaToken) {
    return res.status(400).json({ error: 'Email, password, CAPTCHA text, and CAPTCHA token are required' });
  }
  
  // 1. Verify CAPTCHA
  try {
    const decoded = jwt.verify(captchaToken, JWT_SECRET);
    if (decoded.text.toUpperCase() !== captchaText.toUpperCase().trim()) {
      db.logEvent('LOGIN_FAIL_CAPTCHA', 'Invalid CAPTCHA solution', email);
      return res.status(400).json({ error: 'Invalid CAPTCHA code. Please try again.' });
    }
  } catch (err) {
    db.logEvent('LOGIN_FAIL_CAPTCHA', 'Expired CAPTCHA token', email);
    return res.status(400).json({ error: 'CAPTCHA session expired. Please refresh the CAPTCHA.' });
  }
  
  // 2. Verify Credentials
  const users = db.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    db.logEvent('LOGIN_FAIL_CREDENTIALS', 'Invalid email or password', email);
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  // 3. Generate MFA OTP (6 Digits)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins
  
  otpMap.set(email.toLowerCase(), { otp, expiresAt });
  
  // Very prominent console log simulation
  console.log('\n==============================================');
  console.log(`🔑 [MFA SIMULATOR] LuxeStay Verification Code`);
  console.log(`📧 User: ${email}`);
  console.log(`🔢 OTP Code: ${otp}`);
  console.log(`⏱️  Expires in 5 minutes`);
  console.log('==============================================\n');
  
  // Asynchronously send MFA OTP to user's email
  sendOTPEmail(email, otp);
  
  db.logEvent('MFA_OTP_GENERATED', '6-digit OTP generated, printed to console, and email initiated', email);
  
  // 4. Create temporary MFA token
  const mfaToken = jwt.sign({ email: email.toLowerCase(), step: 'mfa' }, JWT_SECRET, { expiresIn: '5m' });
  
  res.json({
    mfaRequired: true,
    mfaToken,
    message: 'MFA OTP verification required. Code has been printed to the server terminal.'
  });
});

// Verify MFA OTP Route
app.post('/api/auth/verify-mfa', (req, res) => {
  const { mfaToken, otp } = req.body;
  
  if (!mfaToken || !otp) {
    return res.status(400).json({ error: 'MFA token and OTP are required' });
  }
  
  try {
    const decoded = jwt.verify(mfaToken, JWT_SECRET);
    if (decoded.step !== 'mfa') {
      return res.status(400).json({ error: 'Invalid MFA flow token' });
    }
    
    const email = decoded.email;
    const otpData = otpMap.get(email);
    
    if (!otpData) {
      db.logEvent('MFA_FAIL', 'No OTP session found', email);
      return res.status(400).json({ error: 'OTP request expired or does not exist.' });
    }
    
    if (Date.now() > otpData.expiresAt) {
      otpMap.delete(email);
      db.logEvent('MFA_FAIL', 'OTP code expired', email);
      return res.status(400).json({ error: 'OTP code expired. Please log in again.' });
    }
    
    if (otpData.otp !== otp.trim()) {
      db.logEvent('MFA_FAIL', 'Incorrect OTP provided', email);
      return res.status(400).json({ error: 'Incorrect OTP code.' });
    }
    
    // OTP verified, remove it
    otpMap.delete(email);
    
    // Fetch full user details
    const users = db.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email);
    
    // Generate final Access JWT
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    db.logEvent('LOGIN_SUCCESS', `MFA verified. Session opened. Role: ${user.role}`, email);
    
    res.json({
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid or expired MFA token.' });
  }
});

// BOOKING ENDPOINTS

// Create Booking
app.post('/api/bookings', authenticateToken, requireRole(['User']), async (req, res) => {
  const {
    guestName, guestEmail, guestPhone,
    guestStreet, guestCity, guestPostalCode, guestCountry,
    hotelName, checkIn, checkOut, numAdults, numChildren, roomSize, bedding,
    clientCalculatedPrice
  } = req.body;
  
  if (!guestName || !guestEmail || !guestPhone || !hotelName || !checkIn || !checkOut || clientCalculatedPrice === undefined) {
    return res.status(400).json({ error: 'Missing required booking parameters' });
  }
  
  // 1. Server-Side Price Verification (Mod #34)
  const pricePerNight = HOTEL_PRICES[hotelName];
  if (!pricePerNight) {
    return res.status(400).json({ error: `Invalid hotel selection: ${hotelName}` });
  }
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const numDays = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  
  if (numDays <= 0) {
    return res.status(400).json({ error: 'Checkout date must be after check-in date' });
  }
  
  const bedCharge = parseInt(bedding) === 2 ? 20 : 0;
  const verifiedTotalPrice = (pricePerNight + bedCharge) * numDays + (100 * parseInt(numAdults || 1)) + (50 * parseInt(numChildren || 0));
  
  if (verifiedTotalPrice !== clientCalculatedPrice) {
    db.logEvent(
      'PRICE_TAMPERING_WARNING', 
      `Price discrepancy detected! Client sent ₹${clientCalculatedPrice}, verified price is ₹${verifiedTotalPrice}. Overwriting with verified price.`,
      req.user.email
    );
  }
  
  // 2. Encryption of sensitive guest info (AES-256)
  const encryptedGuestName = cryptoUtils.encryptAES(guestName);
  const encryptedGuestEmail = cryptoUtils.encryptAES(guestEmail);
  const encryptedGuestPhone = cryptoUtils.encryptAES(guestPhone);
  const encryptedAddress = cryptoUtils.encryptAES(`${guestStreet}, ${guestCity}, ${guestPostalCode}, ${guestCountry}`);
  
  db.logEvent('DATA_ENCRYPTION', 'AES-256 encryption applied to sensitive guest fields', req.user.email);
  
  // 3. Construct booking object
  const bookingId = 'BK-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase();
  
  const newBooking = {
    bookingId,
    userId: req.user.id,
    hotelName,
    checkIn,
    checkOut,
    numDays,
    numAdults,
    numChildren,
    roomSize,
    bedding,
    totalPrice: verifiedTotalPrice,
    bookingDate: new Date().toISOString(),
    // Encrypted fields stored in DB
    guestName: encryptedGuestName,
    guestEmail: encryptedGuestEmail,
    guestPhone: encryptedGuestPhone,
    guestAddress: encryptedAddress
  };
  
  // 4. Cryptographic Digital Signature (RSA-2048)
  // Signed payload does not include plaintext keys, but links the ID, hotel, dates, amount, and guest identification hash.
  const guestHash = encryptedGuestEmail.split(':')[1]; // Unique block token linking email identity
  const canonicalString = `${bookingId}|${hotelName}|${checkIn}|${checkOut}|${verifiedTotalPrice}|${guestHash}`;
  
  const signature = cryptoUtils.signRSA(canonicalString);
  newBooking.signature = signature;
  
  db.logEvent('DIGITAL_SIGNATURE_GENERATION', `RSA-2048 signature generated for booking: ${bookingId}`, req.user.email);
  
  // 5. Generate QR Code
  // Encodes booking details and signature for easy checking
  const qrPayload = JSON.stringify({
    bookingId,
    hotelName,
    checkIn,
    checkOut,
    totalPrice: verifiedTotalPrice,
    signature
  });
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);
    newBooking.qrCode = qrCodeDataUrl;
  } catch (err) {
    console.error('QR code generation failed:', err);
    newBooking.qrCode = '';
  }
  
  db.saveBooking(newBooking);
  db.logEvent('BOOKING_CREATION', `Booking ${bookingId} successfully recorded in system`, req.user.email);
  
  // Return receipt format
  res.status(201).json({
    message: 'Booking created successfully!',
    receipt: {
      bookingId,
      hotelName,
      checkIn,
      checkOut,
      numDays,
      totalPrice: verifiedTotalPrice,
      guestName, // return plaintext for confirmation UI
      guestEmail,
      guestPhone,
      guestAddress: `${guestStreet}, ${guestCity}, ${guestPostalCode}, ${guestCountry}`,
      signature,
      qrCode: newBooking.qrCode,
      bookingDate: newBooking.bookingDate
    }
  });
});

// Get Bookings (RBAC)
app.get('/api/bookings', authenticateToken, (req, res) => {
  const bookings = db.getBookings();
  let filteredBookings = [];
  
  if (req.user.role === 'Admin' || req.user.role === 'Staff') {
    filteredBookings = bookings;
  } else {
    filteredBookings = bookings.filter(b => b.userId === req.user.id);
  }
  
  // Decrypt encrypted guest fields before sending
  const decryptedBookings = filteredBookings.map(b => ({
    bookingId: b.bookingId,
    userId: b.userId,
    hotelName: b.hotelName,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    numDays: b.numDays,
    numAdults: b.numAdults,
    numChildren: b.numChildren,
    roomSize: b.roomSize,
    bedding: b.bedding,
    totalPrice: b.totalPrice,
    bookingDate: b.bookingDate,
    signature: b.signature,
    qrCode: b.qrCode,
    // Decrypt details
    guestName: cryptoUtils.decryptAES(b.guestName),
    guestEmail: cryptoUtils.decryptAES(b.guestEmail),
    guestPhone: cryptoUtils.decryptAES(b.guestPhone),
    guestAddress: cryptoUtils.decryptAES(b.guestAddress)
  }));
  
  res.json(decryptedBookings);
});

// Verify Receipt Cryptographic Integrity (Public)
app.post('/api/bookings/verify-receipt', (req, res) => {
  const { bookingId, hotelName, checkIn, checkOut, totalPrice, guestEmail, signature } = req.body;
  
  if (!bookingId || !hotelName || !checkIn || !checkOut || !totalPrice || !guestEmail || !signature) {
    return res.status(400).json({ error: 'Receipt verification payload incomplete' });
  }
  
  // Match validation flow in post booking
  // We need to re-verify using the public RSA key
  // Since we don't have the original ciphertext structure, we can reconstruct canonical components
  // To verify signature, we need to locate the actual booking in database to grab the exact guestHash block
  const bookings = db.getBookings();
  const matched = bookings.find(b => b.bookingId === bookingId);
  
  if (!matched) {
    db.logEvent('RECEIPT_VERIFICATION_FAIL', `Receipt verification failed. Booking ID not found: ${bookingId}`);
    return res.status(404).json({ valid: false, error: 'Booking ID not found in system database' });
  }
  
  // Decrypt guest email to confirm matches
  const storedEmail = cryptoUtils.decryptAES(matched.guestEmail);
  if (storedEmail.toLowerCase() !== guestEmail.toLowerCase().trim()) {
    db.logEvent('RECEIPT_VERIFICATION_FAIL', `Email mismatch for booking verification: ${bookingId}`);
    return res.status(400).json({ valid: false, error: 'Guest email does not match booking records' });
  }
  
  // Grab the encrypted email block to rebuild the guestHash
  const guestHash = matched.guestEmail.split(':')[1];
  const canonicalString = `${bookingId}|${hotelName}|${checkIn}|${checkOut}|${totalPrice}|${guestHash}`;
  
  const isValid = cryptoUtils.verifyRSA(canonicalString, signature);
  
  if (isValid) {
    db.logEvent('RECEIPT_VERIFICATION_SUCCESS', `Signature verified successfully for booking: ${bookingId}`);
    res.json({ valid: true, message: 'Cryptographic signature is valid. The receipt is genuine and untampered.' });
  } else {
    db.logEvent('RECEIPT_VERIFICATION_FAIL', `Cryptographic signature is invalid for booking: ${bookingId}`);
    res.json({ valid: false, error: 'Signature verification failed. The receipt may have been tampered with.' });
  }
});

// ADMIN ROUTES

// Get logs (Admin only)
app.get('/api/admin/logs', authenticateToken, requireRole(['Admin']), (req, res) => {
  res.json(db.getLogs());
});

// Get users (Admin only)
app.get('/api/admin/users', authenticateToken, requireRole(['Admin']), (req, res) => {
  // Strip password hash before sending
  const users = db.getUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  }));
  res.json(users);
});

// Modify Role (Admin only)
app.post('/api/admin/users/role', authenticateToken, requireRole(['Admin']), (req, res) => {
  const { email, role } = req.body;
  if (!email || !role || !['User', 'Staff', 'Admin'].includes(role)) {
    return res.status(400).json({ error: 'Valid user email and target role required' });
  }
  
  if (email.toLowerCase() === req.user.email.toLowerCase()) {
    return res.status(400).json({ error: 'Admins cannot change their own roles' });
  }
  
  const success = db.updateUserRole(email, role);
  
  if (success) {
    db.logEvent('USER_ROLE_UPDATED', `Role for user ${email} changed to ${role}`, req.user.email);
    res.json({ message: `Role successfully updated to ${role} for ${email}` });
  } else {
    res.status(404).json({ error: `User with email ${email} not found` });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 LuxeStay secure server listening on port ${PORT}`);
  console.log(`🔐 Cryptographic keys ready: AES-256 & RSA-2048`);
  console.log(`👥 Seeding test accounts complete.`);
});

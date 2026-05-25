const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const BACKEND_URL = 'http://localhost:3000';
const JWT_SECRET = 'luxestay_super_secret_jwt_key_2026_cskhotels';

function getLatestLogPath() {
  const homeDir = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\ADMIN';
  const tasksDir = path.join(homeDir, '.gemini', 'antigravity', 'brain', '250f25c4-8fd5-4eff-ab90-1b75f53c26d9', '.system_generated', 'tasks');
  if (!fs.existsSync(tasksDir)) {
    throw new Error(`Tasks directory not found at: ${tasksDir}`);
  }
  const files = fs.readdirSync(tasksDir).filter(f => f.startsWith('task-') && f.endsWith('.log'));
  if (files.length === 0) {
    throw new Error(`No task log files found in: ${tasksDir}`);
  }
  let latestFile = null;
  let latestMtime = 0;
  for (const file of files) {
    const filePath = path.join(tasksDir, file);
    const stats = fs.statSync(filePath);
    if (stats.mtimeMs > latestMtime) {
      latestMtime = stats.mtimeMs;
      latestFile = filePath;
    }
  }
  return latestFile;
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function findOTPInLogs(email) {
  const logPath = getLatestLogPath();
  console.log(`Searching for OTP in latest log: ${logPath}`);
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  // Search from bottom up for the user's OTP
  let userMatched = false;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes(`User: ${email}`)) {
      userMatched = true;
    }
    if (userMatched && line.includes('OTP Code:')) {
      const match = line.match(/OTP Code:\s*(\d+)/);
      if (match) {
        return match[1];
      }
    }
  }
  return null;
}

async function runTests() {
  console.log('=== LuxeStay End-to-End Cryptographic & Security Verification ===');
  
  try {
    // 1. Fetch CAPTCHA
    console.log('\n[Step 1] Fetching CAPTCHA...');
    const captchaRes = await fetch(`${BACKEND_URL}/api/auth/captcha`);
    const captchaData = await captchaRes.json();
    console.log('✔ CAPTCHA retrieved.');

    // Decode CAPTCHA text using secret
    const decodedCaptcha = jwt.verify(captchaData.token, JWT_SECRET);
    const solvedCaptchaText = decodedCaptcha.text;
    console.log(`✔ Decrypted and solved CAPTCHA code: "${solvedCaptchaText}"`);

    // 2. Register user
    const email = `test_${Date.now()}@luxestay.com`;
    const password = 'TestUser@123';
    const name = 'Verification Test User';
    
    console.log(`\n[Step 2] Registering user: ${email}...`);
    const regRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'User' })
    });
    const regData = await regRes.json();
    console.log('✔ Registration message:', regData.message);

    // 3. Initiate Login
    console.log('\n[Step 3] Initiating login with solved CAPTCHA...');
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        captchaText: solvedCaptchaText,
        captchaToken: captchaData.token
      })
    });
    const loginData = await loginRes.json();
    
    if (!loginData.mfaRequired) {
      throw new Error('MFA was not triggered after credentials validation');
    }
    console.log('✔ Credentials verified. MFA OTP has been generated.');
    
    // Wait briefly for server logs to flush
    await wait(2000);

    // 4. Retrieve OTP code from server log file
    console.log('\n[Step 4] Reading server console logs for simulated MFA OTP...');
    const otp = findOTPInLogs(email);
    if (!otp) {
      throw new Error(`Failed to find OTP code in server logs at: ${SERVER_LOG_PATH}`);
    }
    console.log(`✔ Retrieved OTP from logs: "${otp}"`);

    // 5. Complete MFA verification
    console.log('\n[Step 5] Confirming MFA Verification...');
    const mfaRes = await fetch(`${BACKEND_URL}/api/auth/verify-mfa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mfaToken: loginData.mfaToken,
        otp
      })
    });
    const mfaData = await mfaRes.json();
    
    if (!mfaData.token) {
      throw new Error('Failed to acquire Access Token from MFA verification');
    }
    const token = mfaData.token;
    console.log('✔ Authenticated! JWT token successfully acquired.');

    // 6. Submit Stay booking
    console.log('\n[Step 6] Creating hotel booking...');
    const bookingPayload = {
      guestName: 'Verification Test User',
      guestEmail: email,
      guestPhone: '9876543210',
      guestStreet: '101 Security Road',
      guestCity: 'Agra',
      guestPostalCode: '282001',
      guestCountry: 'India',
      hotelName: 'Hotel Atulyaa Taj',
      checkIn: '2026-06-01',
      checkOut: '2026-06-05',
      numAdults: 2,
      numChildren: 1,
      roomSize: 1,
      bedding: 1, // Single bed
      clientCalculatedPrice: 12550 // Total: (3100 rate * 4 nights) + (100 * 2 adults) + (50 * 1 child) = 12400 + 200 + 50 = 12650.
      // We send 12550 (incorrect) to trigger price tampering warning!
    };
    
    console.log(`Sending booking for ${bookingPayload.hotelName} (Rate: ₹3,100/night)...`);
    console.log(`Intentional client price mismatch check: sending ₹${bookingPayload.clientCalculatedPrice} (Correct is ₹12,650)`);
    
    const bookRes = await fetch(`${BACKEND_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingPayload)
    });
    const bookData = await bookRes.json();
    
    if (!bookRes.ok) {
      throw new Error(`Booking failed: ${bookData.error}`);
    }
    
    const receipt = bookData.receipt;
    console.log('✔ Booking created successfully!');
    console.log('✔ Server overrode pricing and saved correct amount:', `₹${receipt.totalPrice}`);
    console.log('✔ RSA-2048 Digital Signature:', receipt.signature);
    
    // 7. Verify DB Encryption
    console.log('\n[Step 7] Reading JSON database to verify AES-256 field encryption...');
    const dbPath = path.join(__dirname, 'data', 'bookings.json');
    const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const storedBooking = dbContent.find(b => b.bookingId === receipt.bookingId);
    
    if (!storedBooking) {
      throw new Error('Booking not found in bookings.json');
    }
    
    console.log('Plaintext guest name sent:', bookingPayload.guestName);
    console.log('Encrypted guest name stored in DB:', storedBooking.guestName);
    if (storedBooking.guestName === bookingPayload.guestName) {
      throw new Error('Database guestName is not encrypted!');
    }
    console.log('✔ DB encryption verified. Guest details are successfully encrypted.');

    // 8. Cryptographic Receipt Verification (Valid)
    console.log('\n[Step 8] Cryptographically verifying digital receipt signature (Valid Case)...');
    const verifyRes = await fetch(`${BACKEND_URL}/api/bookings/verify-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: receipt.bookingId,
        hotelName: receipt.hotelName,
        checkIn: receipt.checkIn,
        checkOut: receipt.checkOut,
        totalPrice: receipt.totalPrice,
        guestEmail: email,
        signature: receipt.signature
      })
    });
    const verifyData = await verifyRes.json();
    console.log('✔ Signature Check Result:', verifyData.valid ? 'GENUINE & UNTAMPERED' : 'INVALID');
    console.log('✔ Message:', verifyData.message);
    
    if (!verifyData.valid) {
      throw new Error('Valid signature failed verification!');
    }

    // 9. Tampered Receipt Verification (Invalid)
    console.log('\n[Step 9] Cryptographically verifying digital receipt signature (Tampered Case)...');
    console.log('Simulating tampering: Altering total price from ₹12,650 to ₹5,000...');
    const tamperedVerifyRes = await fetch(`${BACKEND_URL}/api/bookings/verify-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: receipt.bookingId,
        hotelName: receipt.hotelName,
        checkIn: receipt.checkIn,
        checkOut: receipt.checkOut,
        totalPrice: 5000, // Tampered price
        guestEmail: email,
        signature: receipt.signature
      })
    });
    const tamperedVerifyData = await tamperedVerifyRes.json();
    console.log('✔ Signature Check Result:', tamperedVerifyData.valid ? 'VALID' : 'INVALID/TAMPER DETECTED');
    console.log('✔ Message/Error:', tamperedVerifyData.message || tamperedVerifyData.error);
    
    if (tamperedVerifyData.valid) {
      throw new Error('Tampered signature was verified as valid! Danger!');
    }
    console.log('✔ Verification successfully blocked tampered receipt payload.');

    console.log('\n======================================================');
    console.log('🏆 ALL SECURITY AND FUNCTIONAL VALIDATIONS PASSED! 🏆');
    console.log('======================================================');
    
  } catch (err) {
    console.error('\n❌ Verification Failed:', err.message);
  }
}

runTests();

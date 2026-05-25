const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEYS_DIR = path.join(__dirname, 'keys');
if (!fs.existsSync(KEYS_DIR)) {
  fs.mkdirSync(KEYS_DIR, { recursive: true });
}

const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.pem');
const AES_KEY_PATH = path.join(KEYS_DIR, 'aes.key');

let privateKey, publicKey, aesKey;

function initCrypto() {
  // Generate RSA keys if not exist
  if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH)) {
    const { privateKey: priv, publicKey: pub } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    fs.writeFileSync(PRIVATE_KEY_PATH, priv);
    fs.writeFileSync(PUBLIC_KEY_PATH, pub);
  }
  privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
  publicKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');

  // Generate or load AES key (32 bytes for aes-256)
  if (!fs.existsSync(AES_KEY_PATH)) {
    const key = crypto.randomBytes(32);
    fs.writeFileSync(AES_KEY_PATH, key);
  }
  aesKey = fs.readFileSync(AES_KEY_PATH);
}

// Initialize key pairs
initCrypto();

function encryptAES(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptAES(ciphertext) {
  if (!ciphertext) return '';
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 2) return ciphertext; // Return raw if format not matches
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed, returning ciphertext:', err.message);
    return ciphertext;
  }
}

function signRSA(data) {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  return sign.sign(privateKey, 'base64');
}

function verifyRSA(data, signature) {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    return verify.verify(publicKey, signature, 'base64');
  } catch (err) {
    console.error('RSA verification error:', err.message);
    return false;
  }
}

function getPublicKey() {
  return publicKey;
}

module.exports = {
  encryptAES,
  decryptAES,
  signRSA,
  verifyRSA,
  getPublicKey
};

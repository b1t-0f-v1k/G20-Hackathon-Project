// firebase.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve JSON path since ES modules don't support direct JSON import in all Node versions
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, '../Service-Account-Key.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Middleware to verify Firebase ID tokens
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("🔍 Incoming Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn("⚠️ No token provided or format incorrect.");
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  console.log("🔑 Extracted Token:", idToken);

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("✅ Firebase Token Verified for user:", decodedToken.email);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('❌ Firebase token verification failed:', error.message);
    res.status(401).json({ error: 'Unauthorized. Invalid token.' });
  }
};

export default verifyFirebaseToken;

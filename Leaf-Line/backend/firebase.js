// Leaf-Line/backend/firebase.js
// This file initializes Firebase Admin SDK and exports a middleware function to verify Firebase tokens.
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = require('../Service-Account-Key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Middleware to verify Firebase ID tokens
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Log incoming Authorization header
  console.log("🔍 Incoming Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn("⚠️ No token provided or format incorrect.");
      return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  // Extract token
  const idToken = authHeader.split('Bearer ')[1];
  console.log("🔑 Extracted Token:", idToken);

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // ✅ Log decoded Firebase token details
    console.log("✅ Firebase Token Verified for user:", decodedToken.email);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('❌ Firebase token verification failed:', error.message);
    res.status(401).json({ error: 'Unauthorized. Invalid token.' });
  }

  console.log("🔥 Auth Header Received:", req.headers.authorization);

};

module.exports = verifyFirebaseToken;

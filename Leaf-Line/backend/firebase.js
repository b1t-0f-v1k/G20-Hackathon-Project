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
// This function will be used in routes to protect endpoints
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is present and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  // Extract the token from the header
  const idToken = authHeader.split('Bearer ')[1];

  // Verify the token using Firebase Admin SDK
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    res.status(401).json({ error: 'Unauthorized. Invalid token.' });
  }
};

// Export the middleware function
module.exports = verifyFirebaseToken;

const express = require('express');
const router = express.Router();

const { loginEmployee, registerEmployee } = require('../controllers/employeeControllers');

// Import Firebase token from firebase.js
const verifyFirebaseToken = require('../firebase');

// routes/employeeRoutes.js
router.post('/register', verifyFirebaseToken, registerEmployee);  // Protected (registration)
router.get('/login', verifyFirebaseToken, loginEmployee);        // Protected (login via token)


// Firebase token verification for employee dashboard
router.get('/protected', verifyFirebaseToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.email}`, user:req.user });
});

module.exports = router;

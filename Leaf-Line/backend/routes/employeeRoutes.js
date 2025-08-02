const express = require('express');
const router = express.Router();

const { loginEmployee, registerEmployee } = require('../controllers/employeeControllers');

// Import Firebase token from firebase.js
const verifyFirebaseToken = require('../firebase');

router.post('/login', loginEmployee);
router.post('/registration', registerEmployee);

// Firebase token verification for employee dashboard
router.get('#Path Still Needs To Go Here - Probably Employee Dashboard', verifyFirebaseToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.email}`, user:req.user });
});

module.exports = router;

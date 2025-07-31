const express = require('express');
const router = express.Router();
const { loginInvestor, registerInvestor } = require('../controllers/investorControllers');

// Import Firebase token from firebase.js
const verifyFirebaseToken = require('../firebase');

router.post('/login', loginInvestor);
router.post('/registration', registerInvestor);

// Firebase token verification for investor dashboard
router.get('/#Path Still Needs To Go Here - Probably Investor Dashboard', verifyFirebaseToken, (req, res) => {
    res.json({ message: `Welcome Investor ${req.user.email}`, user: req.user });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { loginInvestor, registerInvestor } = require('../controllers/investorControllers');

router.post('/login', loginInvestor);
router.post('/registration', registerInvestor);

module.exports = router;
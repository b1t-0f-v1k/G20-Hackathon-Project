const express = require('express');
const router = express.Router();

const {LoginInvestor, registerInvestor} = require('../controllers/investorControllers');

router.post( '/Investor-Login', LoginInvestor);
router.post( '/Employee-Login', registerInvestor);

module.exports = router;
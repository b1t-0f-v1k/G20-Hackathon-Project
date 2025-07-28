const express = require('express');
const router = express.Router();

const {registerInvestor} = require('../controllers/investorSignUpCont');

router.post( '/Employee-Login', registerInvestor);

module.exports = router;
const express = require('express');
const router = express.Router();

const {LoginInvestor} = require('../controllers/investorLoginCont');

router.post( '/Investor-Login', LoginInvestor);

module.exports = router;
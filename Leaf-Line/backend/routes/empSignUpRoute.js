const express = require('express');
const router = express.Router();

const {registerEmployee} = require('../controllers/empSignUpCont');

router.post( '/Employee-Registration', registerEmployee);

module.exports = router;
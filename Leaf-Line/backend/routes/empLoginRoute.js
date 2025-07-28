const express = require('express');
const router = express.Router();

const {loginEmployee} = require('../controllers/empSignUpCont');

router.post( '/Employee-Login', loginEmployee);

module.exports = router;
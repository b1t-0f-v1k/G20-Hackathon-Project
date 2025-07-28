const express = require('express');
const router = express.Router();

const {registerEmployee} = require('../controllers/empSignUpCont');

router.post( '/registerEmployee', registerEmployee);

module.exports = router;
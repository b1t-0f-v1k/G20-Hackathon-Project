const express = require('express');
const router = express.Router();

const {loginEmployee, registerEmployee} = require('../controllers/employeeControllers');

router.post( '/Employee-Login', loginEmployee);
router.post( '/Employee-Registration', registerEmployee);

module.exports = router;
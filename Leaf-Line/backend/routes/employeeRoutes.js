const express = require('express');
const router = express.Router();

const { loginEmployee, registerEmployee } = require('../controllers/employeeControllers');

router.post('/login', loginEmployee);
router.post('/registration', registerEmployee);

module.exports = router;

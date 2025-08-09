const express = require("express");
const router = express.Router();

const { createSMEEmission } = require("../controllers/smeEmissionControllers");

// SME
router.post("/sme", createSMEEmission);

module.exports = router;

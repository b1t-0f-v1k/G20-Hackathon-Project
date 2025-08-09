const express = require("express");
const router = express.Router();

const { createLifestyleEmission } = require("../controllers/lifestyleEmissionControllers");

// Lifestyle
router.post("/lifestyle", createLifestyleEmission);

module.exports = router;

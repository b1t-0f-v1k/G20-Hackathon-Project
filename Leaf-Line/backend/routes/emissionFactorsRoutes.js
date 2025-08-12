import express from "express";
import EmissionFactor from "../models/emissionFactorsModel.js";

const router = express.Router();

// GET all emission factors
router.get("/emission-factors", async (req, res) => {
  try {
    const factors = await EmissionFactor.find();
    res.json(factors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

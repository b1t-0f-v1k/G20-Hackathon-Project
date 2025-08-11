import express from "express";
import LocalBenchmark from "../models/LocalBenchmark.js";

const router = express.Router();

// Get all benchmarks grouped by province
router.get("/", async (req, res) => {
  try {
    const benchmarks = await LocalBenchmark.find({});
    res.json(benchmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

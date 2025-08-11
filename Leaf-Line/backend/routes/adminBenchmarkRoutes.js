// routes/adminBenchmarkRoutes.js (Admin UI API for thresholds)
import express from "express";
import LocalBenchmark from "../models/LocalBenchmark";

const router = express.Router();

router.get("/", async (req, res) => {
  const benchmarks = await LocalBenchmark.find();
  res.json(benchmarks);
});

router.post("/", async (req, res) => {
  const newBenchmark = await LocalBenchmark.create(req.body);
  res.status(201).json(newBenchmark);
});

router.put("/:id", async (req, res) => {
  const updated = await LocalBenchmark.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await LocalBenchmark.findByIdAndDelete(req.params.id);
  res.json({ message: "Benchmark deleted" });
});

export default router;

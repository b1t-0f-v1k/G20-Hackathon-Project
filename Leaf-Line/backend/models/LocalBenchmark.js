// models/LocalBenchmark.js
import mongoose from "mongoose";

const LocalBenchmarkSchema = new mongoose.Schema({
  province: { type: String, required: true },
  municipality: { type: String, required: true },
  threshold: { type: Number, required: true }, // Median emissions for the area
  greenThreshold: { type: Number, required: true }, // 25th percentile (excellent performance)
  yellowThreshold: { type: Number, required: true }, // Median (average performance)
  redThreshold: { type: Number, required: true }, // 75th percentile (poor performance)
  unit: { type: String, default: "kg CO₂e/year", required: true },
  isCoastal: { type: Boolean, default: false },
  isHighveld: { type: Boolean, default: false },
  source: { type: String },
  meta: {
    sourceUrl: { type: String }
  }
});

export default mongoose.model("LocalBenchmark", LocalBenchmarkSchema);
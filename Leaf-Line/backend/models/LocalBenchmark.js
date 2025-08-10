import mongoose from "mongoose";

const LocalBenchmarkSchema = new mongoose.Schema({
  province: { type: String, required: true },
  municipality: { type: String, required: true },
  threshold: { type: Number, required: true },
  unit: { type: String, default: "kg CO₂e/year" },
  meta: {
    sourceUrl: { type: String }
  }
});

export default mongoose.model("LocalBenchmark", LocalBenchmarkSchema);

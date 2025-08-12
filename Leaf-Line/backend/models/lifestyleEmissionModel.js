import mongoose from "mongoose";

const lifestyleCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  activityData: { type: Number, required: true },
  unit: { type: String, required: true },
  emissionFactor: { type: Number, required: true },
  emissions: { type: Number, required: true }
});

const LifestyleEmissionSchema = new mongoose.Schema({
  lifestyleName: { type: String, required: true },
  province: { type: String, required: true },
  municipality: { type: String, required: true },
  date: { type: Date, default: Date.now },
  sources: [lifestyleCategorySchema],
  totalEmissions: { type: Number, required: true },

  // Benchmark check results
  flag: { type: String, enum: ["green", "yellow", "red", "no-data"], default: "no-data" },
  benchmarkUsed: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

const LifestyleEmission = mongoose.model("LifestyleEmission", LifestyleEmissionSchema);
export default LifestyleEmission;

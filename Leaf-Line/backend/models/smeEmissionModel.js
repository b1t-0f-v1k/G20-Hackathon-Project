import mongoose from "mongoose";

const emissionSourceSchema = new mongoose.Schema({
  category: { type: String, required: true },
  activityData: { type: Number, required: true },
  unit: { type: String, required: true },
  emissionFactor: { type: Number, required: true },
  emissions: { type: Number, required: true }
});

const SMEProjectEmissionSchema = new mongoose.Schema({
  smeName: { type: String, required: true },
  projectName: { type: String, required: true },
  province: { type: String, required: true },
  municipality: { type: String, required: true },
  date: { type: Date, default: Date.now },
  sources: [emissionSourceSchema],
  totalEmissions: { type: Number, required: true },

  // Benchmark check results
  flag: { type: String, enum: ["green", "yellow", "red", "no-data"], default: "no-data" },
  benchmarkUsed: {
    type: mongoose.Schema.Types.Mixed, // stores snapshot of benchmark used
    default: null
  }
});

const SMEProjectEmission = mongoose.model("SMEProjectEmission", SMEProjectEmissionSchema);
export default SMEProjectEmission;

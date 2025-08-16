import mongoose from "mongoose";

const emissionSourceSchema = new mongoose.Schema({
  category: { type: String, required: true },
  activityData: { type: Number, required: true },
  unit: { type: String, required: true },
  emissionFactor: { type: Number, required: true },
  emissions: { type: Number, required: true }
});

const InvestmentsSchema = new mongoose.Schema({
  investorID: { type: String, unique: true },
  smeName: { type: String, required: true },
  projectName: { type: String, required: true },
  businessID: { type: String, required: true },
  province: { type: String, required: true },
  municipality: { type: String, required: true },
  date: { type: Date, default: Date.now },
  sources: [emissionSourceSchema],
  totalEmissions: { type: Number, required: true },

  // Benchmark check results
  flag: { type: String, enum: ["Green", "Yellow", "Red", "no-data"], default: "no-data" },
  benchmarkUsed: {
    type: mongoose.Schema.Types.Mixed, // stores snapshot of benchmark used
    default: null
  }
});

const Investments = mongoose.model("InvestmentsDB", InvestmentsSchema);
export default Investments;

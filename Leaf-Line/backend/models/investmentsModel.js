import mongoose from "mongoose";

const emissionSourceSchema = new mongoose.Schema({
  category: { type: String, required: true },
  activityData: { type: Number, required: true },
  unit: { type: String, required: true },
  emissionFactor: { type: Number, required: true },
  emissions: { type: Number, required: true }
});

const InvestmentsSchema = new mongoose.Schema({
  investorID: { type: String, required: true },
  smeName: { type: String, required: true },
  projectName: { type: String, required: true },
  businessID: { type: String, required: true },
  province: { type: String, required: true },
  municipality: { type: String, required: true },
  description: { type: String, default: "" },
  date: { type: Date, default: Date.now },
  sources: [emissionSourceSchema],
  totalEmissions: { type: Number, required: true },
  projectCost: { type: Number, required: true },
  investmentAmount: { type: Number, required: true },
  flag: { 
    type: String, 
    enum: ["green", "yellow", "red", "no-data"], 
    default: "no-data" 
  },
  benchmarkUsed: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active"
  }
}, { timestamps: true });

const Investments = mongoose.model("Investments", InvestmentsSchema);
export default Investments;
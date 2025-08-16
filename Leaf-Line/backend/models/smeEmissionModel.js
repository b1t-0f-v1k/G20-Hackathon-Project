import mongoose from "mongoose";

const emissionSourceSchema = new mongoose.Schema({
  category: { type: String, required: true },
  activityData: { type: Number, required: true },
  unit: { type: String, required: true },
  emissionFactor: { type: Number, required: true },
  emissions: { type: Number, required: true }
}, { _id: false });

const SMEProjectEmissionSchema = new mongoose.Schema({
  smeName: { type: String, required: true },
  projectName: { type: String, required: true },
  businessID: { type: String, required: true },
  province: { type: String, required: true },
  municipality: { type: String, required: true },
  date: { type: Date, default: Date.now },
  sources: [emissionSourceSchema],
  totalEmissions: { type: Number, required: true },
  projectCost: {type: Number, required: true },
  flag: { 
    type: String, 
    enum: ["green", "yellow", "orange", "red", "no-data"], 
    default: "no-data" 
  },
  benchmarkUsed: {
    province: String,
    municipality: String,
    greenThreshold: Number,
    yellowThreshold: Number,
    redThreshold: Number,
    unit: String
  }
}, { timestamps: true });

export default mongoose.model("SMEProjectEmission", SMEProjectEmissionSchema);
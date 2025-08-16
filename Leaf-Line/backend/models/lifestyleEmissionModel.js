import mongoose from "mongoose";

const lifestyleCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  activityData: { type: Number, required: true },
  unit: { type: String, required: true },
  emissionFactor: { type: Number, required: true },
  emissions: { type: Number, required: true }
}, { _id: false });

const LifestyleEmissionSchema = new mongoose.Schema({
  lifestyleName: { type: String, required: true },
  province: { type: String, required: true },
  municipality: { type: String, required: true },
  date: { type: Date, default: Date.now },
  sources: [lifestyleCategorySchema],
  totalEmissions: { type: Number, required: true },
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

export default mongoose.model("LifestyleEmission", LifestyleEmissionSchema);
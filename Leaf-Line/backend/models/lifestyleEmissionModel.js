import mongoose from "mongoose";

const lifestyleCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  activityData: { type: Number, required: true },
  unit: { type: String, required: true },
  emissionFactor: { type: Number, required: true },
  emissions: { type: Number, required: true }
});

const LifestyleEmissionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  categories: [lifestyleCategorySchema],
  totalEmissions: { type: Number, required: true }
});

const LifestyleEmission = mongoose.model("LifestyleEmission", LifestyleEmissionSchema);
export default LifestyleEmission;

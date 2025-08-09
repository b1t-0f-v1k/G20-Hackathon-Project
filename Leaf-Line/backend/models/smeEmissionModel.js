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
  date: { type: Date, default: Date.now },
  sources: [emissionSourceSchema],
  totalEmissions: { type: Number, required: true }
});

const SMEProjectEmission = mongoose.model("SMEProjectEmission", SMEProjectEmissionSchema);
export default SMEProjectEmission;

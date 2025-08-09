// models/emissionFactorsModel.js
import mongoose from "mongoose";

const EmissionFactorSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true }, // e.g., "Electricity"
  unit: { type: String, required: true }, // e.g., "kWh"
  emissionFactor: { type: Number, required: true } // kg CO₂e per unit
});

const EmissionFactor = mongoose.model("EmissionFactor", EmissionFactorSchema);

export default EmissionFactor;

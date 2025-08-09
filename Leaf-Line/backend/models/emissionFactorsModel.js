// models/EmissionFactor.js
const mongoose = require("mongoose");

const EmissionFactorSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true }, // e.g., "Electricity"
  unit: { type: String, required: true }, // e.g., "kWh"
  emissionFactor: { type: Number, required: true } // kg CO₂e per unit
});

module.exports = mongoose.model("EmissionFactor", EmissionFactorSchema);

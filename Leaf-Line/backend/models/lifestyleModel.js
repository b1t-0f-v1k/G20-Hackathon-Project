// models/LifestyleEmission.js
const mongoose = require("mongoose");

const lifestyleCategorySchema = new mongoose.Schema({

  category: { 
    type: String, 
    required: true 
  }, // e.g., "Travel", "Diet", "Energy", "Shopping"

  activityData: { 
    type: Number, 
    required: true 
  }, // e.g., 5000

  unit: { 
    type: String, 
    required: true 
  }, // e.g., "km", "kWh", "kg"

  emissionFactor: { 
    type: Number, 
    required: true 
  }, // e.g., 0.192 (kg CO₂e per unit)

  emissions: { 
    type: Number, 
    required: true 
  } // CO₂e result

});

const LifestyleEmissionSchema = new mongoose.Schema({
  
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, // Link to the person

  date: { 
    type: Date, 
    default: Date.now 
  },

  categories: [lifestyleCategorySchema], // Emission breakdown

  totalEmissions: { 
    type: Number, 
    required: true 
  } // Total lifestyle emissions in kg CO₂e

});

module.exports = mongoose.model("LifestyleEmission", LifestyleEmissionSchema);
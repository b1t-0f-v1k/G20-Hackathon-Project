// models/SMEProjectEmission.js
const mongoose = require("mongoose");

const emissionSourceSchema = new mongoose.Schema({
    // e.g., "Electricity", "Fuel", "Materials"
    category: { 
        type: String, 
        required: true 
    },

    // e.g., 1200
    activityData: { 
        type: Number, 
        required: true 
    }, 

    // e.g., "kWh", "liters", "kg"
    unit: { 
        type: String, 
        required: true 
    }, 

    // e.g., 0.92 (kg CO₂e per unit)
    emissionFactor: { 
        type: Number, 
        required: true 
    }, 

    // CO₂e result = activityData × emissionFactor
    emissions: { 
        type: Number, 
        required: true 
    } 
});

const SMEProjectEmissionSchema = new mongoose.Schema({
    smeName: { 
        type: String, 
        required: true 
    },

    projectName: { 
        type: String, 
        required: true 
    },

    date: { 
        type: Date, 
        default: Date.now 
    },

    // Array of emission categories
    sources: [emissionSourceSchema], 

    // Sum of all emissions in kg CO₂e
    totalEmissions: { 
        type: Number, 
        required: true 
    } 
});

module.exports = mongoose.model("SMEProjectEmission", SMEProjectEmissionSchema);

// seedEmissionFactors.js
const mongoose = require("mongoose");
const EmissionFactor = require("./models/EmissionFactor");
require("dotenv").config();

const seedData = [
    { category: "Electricity", unit: "kWh", emissionFactor: 0.92 },
    { category: "Diesel Fuel", unit: "liters", emissionFactor: 2.68 },
    { category: "Petrol Fuel", unit: "liters", emissionFactor: 2.31 },
    { category: "Car Travel", unit: "km", emissionFactor: 0.192 },
    { category: "Air Travel", unit: "km", emissionFactor: 0.255 }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        
        await EmissionFactor.deleteMany();
        await EmissionFactor.insertMany(seedData);
        console.log("Emission factors seeded ✅");
        process.exit();
        
    }).catch(err => console.error(err));

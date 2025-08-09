// seedEmissionFactors.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import EmissionFactor from "../models/emissionFactorsModel.js";

dotenv.config();

const emissionFactorsData = [
    // Electricity
    { category: "Electricity", unit: "kWh", emissionFactor: 0.92 },
    // Fuels
    { category: "Diesel Fuel", unit: "liters", emissionFactor: 2.68 },
    { category: "Petrol Fuel", unit: "liters", emissionFactor: 2.31 },
    { category: "Natural Gas", unit: "m3", emissionFactor: 1.9 },
    // Transport
    { category: "Flight", unit: "passenger-km", emissionFactor: 0.15 },
    { category: "Car (Average)", unit: "km", emissionFactor: 0.21 },
    { category: "Bus", unit: "passenger-km", emissionFactor: 0.05 },
    // Lifestyle
    { category: "Beef Consumption", unit: "kg", emissionFactor: 27 },
    { category: "Poultry Consumption", unit: "kg", emissionFactor: 6.9 },
    { category: "Dairy Products", unit: "kg", emissionFactor: 3 },
    { category: "Clothing Purchase", unit: "item", emissionFactor: 25 }
];

const seedEmissionFactors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
        });

        console.log("✅ MongoDB connected...");

        await EmissionFactor.deleteMany();
        console.log("🗑 Existing emission factors removed");

        await EmissionFactor.insertMany(emissionFactorsData);
        console.log("🌱 Emission factors seeded successfully!");

        process.exit();
    } catch (err) {
        console.error("❌ Error seeding emission factors:", err);
        process.exit(1);
    }
};

seedEmissionFactors();

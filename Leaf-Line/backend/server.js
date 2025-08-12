import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import emissionFactorRoutes from "./routes/emissionFactorsRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import investorRoutes from "./routes/investorRoutes.js";
import lifestyleEmissionRoutes from "./routes/lifestyleEmissionRoutes.js";
import smeEmissionRoutes from "./routes/smeEmissionRoutes.js";
import localBenchmarkRoutes from "./routes/localBenchmarkRoutes.js";
import smeProjectRoutes from "./routes/smeProjectRoutes.js";

const app = express();

// ✅ Check if MONGO_URI is loaded
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing from .env file.");
  process.exit(1);
} else {
  console.log("✅ Loaded MONGO_URI from .env");
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/employee", employeeRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api", lifestyleEmissionRoutes);
app.use("/api", smeEmissionRoutes);
app.use("/api", emissionFactorRoutes);
app.use("/api/local-benchmarks", localBenchmarkRoutes);
app.use("/api", smeProjectRoutes);

console.log("🔍 Connecting to MongoDB Atlas...");
console.log("📡 Connection string (hidden password):", process.env.MONGO_URI.replace(/\/\/(.*?):(.*?)@/, "//$1:****@"));

// ✅ Connect with extra debug options
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log("✅ MongoDB connected successfully (Atlas)");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:");
    console.error("   📄 Error message:", err.message);
    console.error("   🛠 Possible causes:");
    console.error("      1. Your IP is not whitelisted in MongoDB Atlas");
    console.error("      2. Wrong database name in connection string");
    console.error("      3. Username or password is incorrect");
    console.error("      4. Internet/DNS issues preventing connection");
    console.error("🔗 Fix guide: https://www.mongodb.com/docs/atlas/troubleshoot-connection");
    process.exit(1);
  });

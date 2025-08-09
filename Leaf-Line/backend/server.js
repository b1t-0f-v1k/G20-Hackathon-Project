import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import emissionFactorRoutes from "./routes/emissionFactorsRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import investorRoutes from "./routes/investorRoutes.js";
import lifestyleEmissionRoutes from "./routes/lifestyleEmissionRoutes.js";
import smeEmissionRoutes from "./routes/smeEmissionRoutes.js";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/employee', employeeRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api', lifestyleEmissionRoutes);
app.use('/api', smeEmissionRoutes);
app.use("/api", emissionFactorRoutes);

console.log("MONGO_URI from .env:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected (Atlas)");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error("MongoDB connection error:", err));

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
// Middleware to parse JSON request body
app.use(express.json());

// Import Routes
const employeeRoutes = require('./routes/employeeRoutes');
const investorRoutes = require('./routes/investorRoutes');
const lifestyleRoutes = require("./routes/lifestyleEmissionsRoutes");
const smeRoutes = require("./routes/smeEmissionsRoutes");

// Use routes
app.use('/api/employee', employeeRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/lifestyle-Emissions', lifestyleRoutes);
app.use('/api/sme-Emissions', smeRoutes);

console.log("MONGO_URI from .env:", process.env.MONGO_URI);

// Connect to MongoDB first, then start the server
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected (Atlas)")

    // start server only after DB connects successfully
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})
.catch( (err) => console.error("MongoDB connection error: ", err));

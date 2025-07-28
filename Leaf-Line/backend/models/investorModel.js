const mongoose = require("mongoose");

const investorSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
});

// Prevent OverwriteModelError during hot reload
module.exports = mongoose.models.Investor || mongoose.model("Investor", investorSchema);

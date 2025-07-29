const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
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
    },
    businessName: {
        type: String,
    },
    businessID: {
        type: String,
        unique: true,
    },
});

// Export model safely (avoids OverwriteModelError)
module.exports = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

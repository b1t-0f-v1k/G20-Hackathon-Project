const mongoose = require("mongoose");

const employeeSignUpSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: true, 
        unique: true,
        lowercase: true
    },

    username: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true,
    },

    businessName: {
        type: String,
        required: true,
    },

    businessID: {
        type: String,
        unique: true,
    },
})

module.exports = mongoose.model("User", employeeSignUpSchema);
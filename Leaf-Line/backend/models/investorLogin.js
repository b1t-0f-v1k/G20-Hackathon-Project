const mongoose = require("mongoose");

const investorLoginSchema = new mongoose.Schema({
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

    
})

module.exports = mongoose.model("User", investorLoginSchema);
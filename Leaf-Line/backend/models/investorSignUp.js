const mongoose = require("mongoose");

const investorSignUpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    
    username: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true,
    },

})

module.exports = mongoose.model("User", investorSignUpSchema);
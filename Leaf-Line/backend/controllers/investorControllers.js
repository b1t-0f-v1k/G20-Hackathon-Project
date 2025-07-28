// Importing tools 
const express = require('express');
// Importing router
const router = express.Router();

// fetching the relevent file using file path
const User = require('../models/investorModel');

// Asynchronous function for requesting and responding to user inputs
const LoginInvestor = async (req, res) => {

    // try-catch for error handling
    try {
        
        const {email, username, password} = req.body;

        const user = await User.create({
            email, 
            username, 
            password,
        });

        res.status(201).json({ message: "User"})
    } catch (error) {

        console.error("Error login in investor: ", error.message);
        res.status(500).json({ error: "Failed to log in user!"});

    }
};

const User = require('../models/investorModel');

// Asynchronous function for requesting and responding to user inputs
const registerInvestor = async (req, res) => {

    // try-catch for error handling
    try {
        
        const {email, username, password} = req.body;

        const user = await User.create({
            email, 
            username, 
            password,
        });

        res.status(201).json({ message: "User"})
    } catch (error) {

        console.error("Error registering investor: ", error.message);
        res.status(500).json({ error: "Failed to register user!"});

    }
};

module.exports = {registerInvestor};
module.exports = {LoginInvestor};
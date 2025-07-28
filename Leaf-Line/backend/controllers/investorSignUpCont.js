// Importing tools 
const express = require('express');
// Importing router
const router = express.Router();

// fetching the relevent file using file path
const User = require('../models/employeeSignUp');

// Asynchronous function for requesting and responding to user inputs
const registerEmployee = async (req, res) => {

    // try-catch for error handling
    try {
        
        const {email, username, password, businessName, businessID} = req.body;

        const user = await User.create({
            email, 
            username, 
            password, 
            businessName, 
            businessID,
        });

        res.status(201).json({ message: "User"})
    } catch (error) {

        console.error("Error registering employee: ", error.message);
        res.status(500).json({ error: "Failed to register user!"});

    }
};

module.exports = {registerEmployee};
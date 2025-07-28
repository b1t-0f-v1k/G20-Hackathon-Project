const Employee = require('../models/employeeModel');

const loginEmployee = async (req, res) => {
    console.log(req.body);
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await Employee.findOne({ email });
        if (!user) {
        return res.status(404).json({ error: "User not found" });
        }

        // 2. Check if password matches (plain text for now, bcrypt recommended later)
        if (user.password !== password) {
        return res.status(401).json({ error: "Invalid password" });
        }

        // 3. Success
        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        console.error("Error logging in:", error.message);
        res.status(500).json({ error: "Failed to log in user!" });
    }
};

// Register employee
const registerEmployee = async (req, res) => {
    try {
        const { email, username, password, businessName, businessID } = req.body;

        const user = await Employee.create({ email, username, password, businessName, businessID });
        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        console.error("Error registering employee:", error.message);
        res.status(500).json({ error: "Failed to register user!" });
    }
};

// Export both functions properly
module.exports = { loginEmployee, registerEmployee };

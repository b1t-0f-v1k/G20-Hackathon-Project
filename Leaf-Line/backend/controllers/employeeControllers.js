const Employee = require('../models/employeeModel');

const loginEmployee = async (req, res) => {
    try {
        // ✅ Log decoded Firebase user from middleware
        console.log("Decoded Firebase User in login:", req.user);

        // Get email from Firebase token
        const email = req.user.email;

        // Fetch user data from MongoDB
        const user = await Employee.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found in database" });
        }

        // ✅ Success: return user profile (no password check needed)
        res.status(200).json({ 
            message: "Login successful",
            user 
        });
    } catch (error) {
        console.error("Error logging in:", error.message);
        res.status(500).json({ error: "Failed to log in user!" });
    }
};


// Register employee
const registerEmployee = async (req, res) => {
    try {
        console.log("🔥 Incoming Signup Data (req.body):", req.body);
        console.log("🔥 Firebase Verified User (req.user):", req.user);

        const { email, username, password, businessName, businessID } = req.body;

        if (req.user.email !== email) {
            console.warn("⚠️ Email mismatch between Firebase token and request body");
            return res.status(403).json({ error: "Email mismatch with Firebase token" });
        }

        const user = await Employee.create({ email, username, password, businessName, businessID });
        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        console.error("Error registering employee:", error.message);
        res.status(500).json({ error: "Failed to register user!" });
    }
};


// Export both functions properly
module.exports = { loginEmployee, registerEmployee };

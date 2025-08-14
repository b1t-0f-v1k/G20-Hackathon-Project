import Employee from '../models/employeeModel.js';

export const loginEmployee = async (req, res) => {
    try {
    // req.user is set by verifyFirebaseToken middleware
    const email = req.user.email;

    const user = await Employee.findOne({ email });
    if (!user) return res.status(404).json({ error: "Investor not found" });

    // No password check needed — Firebase already authenticated

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error logging in investor:", error.message);
    res.status(500).json({ error: "Failed to log in investor!" });
  }
};

export const registerEmployee = async (req, res) => {
    try {
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
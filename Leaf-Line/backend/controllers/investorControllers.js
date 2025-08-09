import Investor from '../models/investorModel.js';

export const loginInvestor = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Investor.findOne({ email });
        if (!user) return res.status(404).json({ error: "Investor not found" });

        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid password" });
        }

        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        console.error("Error logging in investor:", error.message);
        res.status(500).json({ error: "Failed to log in investor!" });
    }
};

export const registerInvestor = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const user = await Investor.create({ email, username, password });
        res.status(201).json({ message: "Investor registered successfully", user });
    } catch (error) {
        console.error("Error registering investor:", error.message);
        res.status(500).json({ error: "Failed to register investor!" });
    }
};

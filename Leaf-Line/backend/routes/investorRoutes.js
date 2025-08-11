import express from "express";
import { loginInvestor, registerInvestor } from "../controllers/investorControllers.js";
import verifyFirebaseToken from "../firebase.js";

const router = express.Router();

router.post("/login", verifyFirebaseToken, loginInvestor);
router.post("/register", registerInvestor);

// Firebase token verification for investor dashboard
router.get("/protected", verifyFirebaseToken, (req, res) => {
  res.json({ message: `Welcome Investor ${req.user.email}`, user: req.user });
});

export default router;

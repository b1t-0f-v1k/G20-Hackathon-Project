import express from "express";
import { loginInvestor, registerInvestor } from "../controllers/investorControllers.js";
import verifyFirebaseToken from "../firebase.js";

const router = express.Router();

router.post("/login", loginInvestor);
router.post("/registration", registerInvestor);

// Firebase token verification for investor dashboard
router.get("/protected", verifyFirebaseToken, (req, res) => {
  res.json({ message: `Welcome Investor ${req.user.email}`, user: req.user });
});

export default router;

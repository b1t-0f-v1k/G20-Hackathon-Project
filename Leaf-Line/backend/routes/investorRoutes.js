import express from "express";
import { loginInvestor, registerInvestor, getInvestorID  } from "../controllers/investorControllers.js";
import verifyFirebaseToken from "../firebase.js";

const router = express.Router();

router.post("/login", verifyFirebaseToken, loginInvestor);
router.post("/register", registerInvestor);
router.post('/id', verifyFirebaseToken, getInvestorID);
router.get("/protected", verifyFirebaseToken, (req, res) => {
  res.json({ message: `Welcome Investor ${req.user.email}`, user: req.user });
});
export default router;

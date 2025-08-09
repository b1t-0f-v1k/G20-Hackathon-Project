import express from "express";
import { loginEmployee, registerEmployee } from "../controllers/employeeControllers.js";
import verifyFirebaseToken from "../firebase.js";

const router = express.Router();

// Protected (registration)
router.post("/register", verifyFirebaseToken, registerEmployee);

// Protected (login via token)
router.get("/login", verifyFirebaseToken, loginEmployee);

// Firebase token verification for employee dashboard
router.get("/protected", verifyFirebaseToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.email}`, user: req.user });
});

export default router;

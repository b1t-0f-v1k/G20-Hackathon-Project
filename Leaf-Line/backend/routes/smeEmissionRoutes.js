import express from "express";
import { createSMEEmission, getAllSMEEmissions } from "../controllers/smeEmissionControllers.js";

const router = express.Router();

router.post("/sme", createSMEEmission);
router.get("/sme", getAllSMEEmissions)

export default router;


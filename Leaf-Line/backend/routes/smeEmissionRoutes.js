import express from "express";
import { createSMEEmission } from "../controllers/smeEmissionControllers.js";

const router = express.Router();

router.post("/sme", createSMEEmission);

export default router;


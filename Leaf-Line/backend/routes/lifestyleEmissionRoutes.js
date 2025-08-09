import express from "express";
import { createLifestyleEmission } from "../controllers/lifestyleEmissionControllers.js";

const router = express.Router();

router.post("/lifestyle", createLifestyleEmission);

export default router;


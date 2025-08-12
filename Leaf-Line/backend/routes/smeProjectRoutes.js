// routes/smeProjectRoutes.js
import express from "express";
import { getProjectsByBusinessID, deleteProject, updateProject } from "../controllers/smeProjectController.js";

const router = express.Router();

router.get("/sme-projects/:businessID", getProjectsByBusinessID);
router.delete("/sme-projects/:id", deleteProject);
router.put("/sme-projects/:id", updateProject);

export default router;

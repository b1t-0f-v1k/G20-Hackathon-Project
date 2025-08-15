// routes/smeProjectRoutes.js
import express from "express";
import {
  getProjectsByBusinessID,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from "../controllers/smeProjectController.js";

const router = express.Router();

router.get("/sme-projects/:businessID", getProjectsByBusinessID);
router.delete("/sme-projects/:id", deleteProject);
router.put("/sme-projects/:id", updateProject);
router.get("/sme-project/:id", getProjectById);
router.post("/", createProject);
router.get("/projects/:businessID", getProjectsByBusinessID);

// Add a source
router.post('/projects/:projectId/sources', async (req, res) => {
  try {
    const project = await SMEProjectEmission.findById(req.params.projectId);
    project.sources.push(req.body);
    project.totalEmissions = project.sources.reduce((sum, s) => sum + s.emissions, 0);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove a source
router.delete('/projects/:projectId/sources/:sourceId', async (req, res) => {
  try {
    const project = await SMEProjectEmission.findById(req.params.projectId);
    project.sources = project.sources.filter(s => s._id.toString() !== req.params.sourceId);
    project.totalEmissions = project.sources.reduce((sum, s) => sum + s.emissions, 0);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

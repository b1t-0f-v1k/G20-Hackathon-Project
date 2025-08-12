// controllers/smeProjectController.js
import SMEProjectEmission from '../models/smeEmissionModel.js';

export const getProjectsByBusinessID = async (req, res) => {
  const { businessID } = req.params;

  if (!businessID) {
    return res.status(400).json({ error: "Business ID is required" });
  }

  try {
    // Now we fetch ALL fields so dropdown can display details
    const projects = await SMEProjectEmission.find({ businessID });

    return res.json({ projects });
  } catch (error) {
    return res.status(500).json({ error: "Server error fetching projects" });
  }
};

// DELETE project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SMEProjectEmission.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error deleting project" });
  }
};

// UPDATE project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await SMEProjectEmission.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Project not found" });
    res.json({ message: "Project updated successfully", project: updated });
  } catch (error) {
    res.status(500).json({ error: "Server error updating project" });
  }
};

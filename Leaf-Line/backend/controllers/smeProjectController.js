import SMEProjectEmission from "../models/smeEmissionModel.js";

// Helper to normalize flag casing
const normalizeFlag = (flag) => {
  if (!flag) return null;
  const lower = flag.toLowerCase();
  if (lower === "red") return "Red";
  if (lower === "green") return "Green";
  if (lower === "yellow") return "Yellow";
  if (lower === "orange") return "Orange";
  if (lower === "no-data") return "No-data";
  return flag;
};

// Get all projects for a specific businessID
export const getProjectsByBusinessID = async (req, res) => {
  try {
    const { businessID } = req.params;
    const projects = await SMEProjectEmission.find({ businessID });
    
    // Normalize flags before returning
    const normalizedProjects = projects.map(project => ({
      ...project.toObject(),
      flag: project.flag ? project.flag.toLowerCase() : "no-data"
    }));
    
    res.json(normalizedProjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single project by _id
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await SMEProjectEmission.findById(id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all projects for a specific Business Name
export const getProjectsBySMEName = async (req, res) => {
  try {
    const { smeName } = req.params;
    const projects = await SMEProjectEmission.find({ smeName });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get projects by Name
export const getProjectsByProjectName = async (req, res) => {
  try {
    const { projectName } = req.params;
    const projects = await SMEProjectEmission.find({ projectName });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new project
export const createProject = async (req, res) => {
  try {
    const { province, municipality, activityData, emissionFactor, projectCost, description } = req.body;

    // Calculate total emissions
    const totalEmissions = activityData * emissionFactor;

    // Default flag
    let flag = null;
    let benchmarkUsed = null;

    if (province && municipality) {
      const LocalBenchmark = (await import("../models/LocalBenchmark.js")).default;
      const benchmark = await LocalBenchmark.findOne({ province, municipality });
      benchmarkUsed = benchmark;

      if (!benchmark) {
        flag = "no-data";
      } else {
        if (totalEmissions <= benchmark.greenThreshold) {
          flag = "green";
        } else if (totalEmissions <= benchmark.yellowThreshold) {
          flag = "yellow";
        }  else if (totalEmissions <= benchmark.redThreshold) {
          flag = "orange";
        } else {
          flag = "red";
        }
      }
    } else {
      flag = "no-data";
    }

    const newProject = new SMEProjectEmission({
      ...req.body,
      description,
      totalEmissions,
      projectCost,
      benchmarkUsed,
      flag: normalizeFlag(flag), // ALWAYS override after spreading
    });

    await newProject.save();
    res.status(201).json(newProject);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { province, municipality, sources, projectCost, description } = req.body;

    if (!Array.isArray(sources)) {
      return res.status(400).json({ error: "Sources must be an array" });
    }

    const totalEmissions = sources.reduce((sum, src) => {
      const emissions = Number(src.emissions);
      return sum + (isNaN(emissions) ? 0 : emissions);
    }, 0);

    let flag = null;
    let benchmarkUsed = null;

    if (province && municipality) {
      const LocalBenchmark = (await import("../models/LocalBenchmark.js")).default;
      const benchmark = await LocalBenchmark.findOne({ province, municipality });
      benchmarkUsed = benchmark;

      if (!benchmark) {
        flag = "no-data";
      } else {
        if (totalEmissions <= benchmark.greenThreshold) {
          flag = "green";
        } else if (totalEmissions <= benchmark.yellowThreshold) {
          flag = "yellow";
        } else if (totalEmissions <= benchmark.redThreshold) {
          flag = "orange";
        } else {
          flag = "red";
        }
      }
    } else {
      flag = "no-data";
    }

    const updateData = {
      ...req.body,
      description,
      totalEmissions,
      projectCost,
      benchmarkUsed,
      flag: normalizeFlag(flag), // ALWAYS override
    };

    const updated = await SMEProjectEmission.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: "Project not found" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SMEProjectEmission.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    const projects = await SMEProjectEmission.find(query);
    const normalizedProjects = projects.map(project => ({
      ...project.toObject(),
      flag: project.flag ? project.flag.toLowerCase() : "no-data"
    }));
    
    res.json(normalizedProjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!["active", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    
    const updated = await SMEProjectEmission.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
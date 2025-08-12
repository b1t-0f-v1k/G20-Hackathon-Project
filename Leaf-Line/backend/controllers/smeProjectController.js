import SMEProjectEmission from "../models/smeEmissionModel.js";

// Get all projects for a specific businessID
export const getProjectsByBusinessID = async (req, res) => {
  try {
    const { businessID } = req.params;
    const projects = await SMEProjectEmission.find({ businessID });
    res.json(projects);
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

export const createProject = async (req, res) => {
  try {
    const { province, municipality, activityData, emissionFactor } = req.body;

    // Calculate total emissions
    const totalEmissions = activityData * emissionFactor;

    let flag = "Green";
    let benchmarkUsed = null;

    if (province && municipality) {
      const LocalBenchmark = (await import("../models/LocalBenchmark.js")).default;
      const benchmark = await LocalBenchmark.findOne({ province, municipality });

      if (!benchmark) {
        return res.status(200).json({ flag: "no-data", benchmarkUsed: null });
      }

      benchmarkUsed = benchmark;

      if (totalEmissions > benchmark.redThresholdKg) {
        flag = "Red";
      } else if (totalEmissions < benchmark.greenThresholdKg) {
        flag = "Green";
      } else {
        flag = "Yellow";
      }
    }

    const newProject = new SMEProjectEmission({
      ...req.body,
      totalEmissions,
      flag,
      benchmarkUsed,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { province, municipality, sources } = req.body;

    if (!Array.isArray(sources)) {
      return res.status(400).json({ error: "Sources must be an array" });
    }

    // Calculate total emissions by summing emissions in all sources
    const totalEmissions = sources.reduce((sum, src) => {
      const emissions = Number(src.emissions);
      return sum + (isNaN(emissions) ? 0 : emissions);
    }, 0);

    let flag = "Green";
    let benchmarkUsed = null;

    if (province && municipality) {
      const LocalBenchmark = (await import("../models/LocalBenchmark.js")).default;
      const benchmark = await LocalBenchmark.findOne({ province, municipality });

      if (!benchmark) {
        return res.status(200).json({ flag: "no-data", benchmarkUsed: null });
      }

      benchmarkUsed = benchmark;

      if (totalEmissions > benchmark.redThresholdKg) {
        flag = "Red";
      } else if (totalEmissions < benchmark.greenThresholdKg) {
        flag = "Green";
      } else {
        flag = "Yellow";
      }
    }

    const updateData = {
      ...req.body,
      totalEmissions,
      flag,
      benchmarkUsed,
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

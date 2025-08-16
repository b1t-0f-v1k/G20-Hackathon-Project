import SMEProjectEmission from "../models/smeEmissionModel.js";
import EmissionFactor from "../models/emissionFactorsModel.js";
import { checkAgainstBenchmark } from "../helpers/benchmarkHelper.js";

export const createSMEEmission = async (req, res) => {
  try {
    const { smeName, businessID, projectName, province, municipality, sources, sector, projectCost } = req.body;

    if (!sources?.length) {
      return res.status(400).json({ error: "No emission sources provided" });
    }
    if (!province || !municipality) {
      return res.status(400).json({ error: "Location data required" });
    }

    // Calculate emissions
    let totalEmissions = 0;
    const calculatedSources = await Promise.all(sources.map(async (src) => {
      const factorDoc = await EmissionFactor.findOne({ category: src.category });
      if (!factorDoc) throw new Error(`Factor not found: ${src.category}`);
      
      const emissions = src.activityData * factorDoc.emissionFactor;
      totalEmissions += emissions;
      
      return {
        category: src.category,
        activityData: src.activityData,
        unit: factorDoc.unit,
        emissionFactor: factorDoc.emissionFactor,
        emissions
      };
    }));

    // Check against benchmarks
    const { flag, benchmarkUsed } = await checkAgainstBenchmark(
      province,
      municipality,
      totalEmissions,
      sector // Optional sector parameter
    );

    // Save record
    const newEmission = await SMEProjectEmission.create({
      smeName,
      businessID,
      projectName,
      province,
      municipality,
      sources: calculatedSources,
      totalEmissions,
      projectCost,
      flag,
      benchmarkUsed,
      status: "active" // Default
    });

    res.status(201).json({
      message: "Emissions calculated",
      data: newEmission
    });

  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// smeEmissionControllers.js
export const getAllSMEEmissions = async (req, res) => {
  try {
    const emissions = await SMEProjectEmission.find({}); // Fetch all records
    // Optional: select fields you want for the graph
    const data = emissions.map(e => ({
      projectName: e.projectName,
      totalEmissions: e.totalEmissions,
      flag: e.flag
    }));
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch SME emissions" });
  }
};

// Add this new function for status updates
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
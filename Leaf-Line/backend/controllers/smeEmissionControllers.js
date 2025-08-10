import SMEProjectEmission from "../models/smeEmissionModel.js";
import EmissionFactor from "../models/emissionFactorsModel.js";
import LocalBenchmark from "../models/LocalBenchmark.js";

export const createSMEEmission = async (req, res) => {
  try {
    const { smeName, projectName, province, municipality, sources } = req.body;

    if (!sources || sources.length === 0) {
      return res.status(400).json({ error: "No emission sources provided" });
    }
    if (!province || !municipality) {
      return res.status(400).json({ error: "Province and municipality are required" });
    }

    let totalEmissions = 0;
    let calculatedSources = [];

    for (let src of sources) {
      const factorDoc = await EmissionFactor.findOne({ category: src.category });
      if (!factorDoc) {
        return res.status(400).json({ error: `Emission factor not found for category: ${src.category}` });
      }
      const emissions = src.activityData * factorDoc.emissionFactor;
      totalEmissions += emissions;

      calculatedSources.push({
        category: src.category,
        activityData: src.activityData,
        unit: factorDoc.unit,
        emissionFactor: factorDoc.emissionFactor,
        emissions
      });
    }

    // 🔍 Find benchmark for location
    const benchmarkDoc = await LocalBenchmark.findOne({ 
      province: new RegExp(`^${province}$`, "i"),
      municipality: new RegExp(`^${municipality}$`, "i") 
    });
    
    if (!benchmarkDoc) {
      return res.status(404).json({ error: "No benchmark found for this location" });
    }

    const benchmarkValue = benchmarkDoc.threshold;
    const flag = totalEmissions > benchmarkValue ? "red" : "green";

    const newEmission = await SMEProjectEmission.create({
      smeName,
      projectName,
      province,
      municipality,
      sources: calculatedSources,
      totalEmissions,
      flag,
      benchmarkUsed: benchmarkValue
    });

    res.status(201).json({
      message: "SME emissions calculated successfully",
      data: newEmission
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

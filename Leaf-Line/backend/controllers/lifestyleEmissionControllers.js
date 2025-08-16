import LifestyleEmission from "../models/lifestyleEmissionModel.js";
import EmissionFactor from "../models/emissionFactorsModel.js";
import { checkAgainstBenchmark } from "../helpers/benchmarkHelper.js";

export const createLifestyleEmission = async (req, res) => {
  try {
    const { lifestyleName, province, municipality, sources } = req.body;

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
      totalEmissions
    );

    // Save record
    const newEmission = await LifestyleEmission.create({
      lifestyleName,
      province,
      municipality,
      sources: calculatedSources,
      totalEmissions,
      flag,
      benchmarkUsed
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
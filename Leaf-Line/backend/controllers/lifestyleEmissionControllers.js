import LifestyleEmission from "../models/lifestyleEmissionModel.js";
import EmissionFactor from "../models/emissionFactorsModel.js";
import { checkAgainstBenchmark } from "../helpers/benchmarkHelper.js";

export const createLifestyleEmission = async (req, res) => {
  try {
    const { lifestyleName, province, municipality, sources } = req.body;

    // ✅ Validation
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


    // ✅ Get benchmark result from helper
    const benchmarkCheck = await checkAgainstBenchmark(
      province.trim(),
      municipality.trim(),
      totalEmissions
    );

    // If no benchmark data
    if (benchmarkCheck.flag === "no-data") {
      return res.status(404).json({ error: "No benchmark found for this location" });
    }

    const newEmission = await LifestyleEmission.create({
      lifestyleName,
      province,
      municipality,
      sources: calculatedSources,
      totalEmissions,
      flag: benchmarkCheck.flag,
      benchmarkUsed: benchmarkCheck.benchmarkUsed
    });

    res.status(201).json({
      message: "Lifestyle emissions calculated successfully",
      data: newEmission
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


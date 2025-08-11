import LifestyleEmission from "../models/lifestyleEmissionModel.js";
import EmissionFactor from "../models/emissionFactorsModel.js";
import LocalBenchmark from "../models/LocalBenchmark.js";

export const createLifestyleEmission = async (req, res) => {
  try {
    const { userId, province, municipality, categories } = req.body;

    if (!categories || categories.length === 0) {
      return res.status(400).json({ error: "No lifestyle categories provided" });
    }
    if (!province || !municipality) {
      return res.status(400).json({ error: "Province and municipality are required" });
    }

    let totalEmissions = 0;
    let calculatedCategories = [];

    for (let cat of categories) {
      const factorDoc = await EmissionFactor.findOne({ category: cat.category });
      if (!factorDoc) {
        return res.status(400).json({ error: `Emission factor not found for category: ${cat.category}` });
      }
      const emissions = cat.activityData * factorDoc.emissionFactor;
      totalEmissions += emissions;

      calculatedCategories.push({
        category: cat.category,
        activityData: cat.activityData,
        unit: factorDoc.unit,
        emissionFactor: factorDoc.emissionFactor,
        emissions
      });
    }

    // 🔍 Find benchmark for location
    const benchmarkDoc = await LocalBenchmark.findOne({ 
      province: province.trim(), 
      municipality: municipality.trim()
    });
    if (!benchmarkDoc) {
      return res.status(404).json({ error: "No benchmark found for this location" });
    }

    const benchmarkValue = benchmarkDoc.threshold;
    const flag = totalEmissions > benchmarkValue ? "red" : "green";

    const newEmission = await LifestyleEmission.create({
      userId,
      province,
      municipality,
      categories: calculatedCategories,
      totalEmissions,
      flag,
      benchmarkUsed: benchmarkValue
    });

    res.status(201).json({
      message: "Lifestyle emissions calculated successfully",
      data: newEmission
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


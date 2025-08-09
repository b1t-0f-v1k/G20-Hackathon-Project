import LifestyleEmission from "../models/lifestyleEmissionModel.js";
import EmissionFactor from "../models/emissionFactorsModel.js";

export const createLifestyleEmission = async (req, res) => {
  try {
    const { userId, categories } = req.body;

    if (!categories || categories.length === 0) {
      return res.status(400).json({ error: "No lifestyle categories provided" });
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

    const newEmission = await LifestyleEmission.create({
      userId,
      categories: calculatedCategories,
      totalEmissions
    });

    console.log("New emission object being sent:", newEmission);

    res.status(201).json({
      message: "Lifestyle emissions calculated successfully",
      data: newEmission
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

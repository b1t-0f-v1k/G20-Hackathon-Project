// controllers/lifestyleEmissionController.js
const LifestyleEmission = require("../models/LifestyleEmission");
const EmissionFactor = require("../models/EmissionFactor");

exports.createLifestyleEmission = async (req, res) => {
  try {
    const { userId, categories } = req.body;

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

    const newEmission = new LifestyleEmission({
      userId,
      categories: calculatedCategories,
      totalEmissions
    });

    await newEmission.save();
    res.status(201).json(newEmission);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

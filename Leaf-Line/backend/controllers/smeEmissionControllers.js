// controllers/smeEmissionController.js
const SMEProjectEmission = require("../models/smeEmissionModel");
const EmissionFactor = require("../models/emissionFactorsModel");

exports.createSMEEmission = async (req, res) => {
  try {
    const { smeName, projectName, sources } = req.body;

    if (!sources || sources.length === 0) {
      return res.status(400).json({ error: "No emission sources provided" });
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

    const newEmission = await SMEProjectEmission.create({
      smeName,
      projectName,
      sources: calculatedSources,
      totalEmissions
    });

    res.status(201).json({
      message: "SME emissions calculated successfully",
      data: newEmission
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

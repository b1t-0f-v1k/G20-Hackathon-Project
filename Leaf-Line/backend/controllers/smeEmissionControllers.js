// controllers/smeEmissionController.js
const SMEProjectEmission = require("../models/SMEProjectEmission");
const EmissionFactor = require("../models/EmissionFactor");

exports.createSMEEmission = async (req, res) => {
  try {
    const { smeName, projectName, sources } = req.body;

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

    const newEmission = new SMEProjectEmission({
      smeName,
      projectName,
      sources: calculatedSources,
      totalEmissions
    });

    await newEmission.save();
    res.status(201).json(newEmission);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

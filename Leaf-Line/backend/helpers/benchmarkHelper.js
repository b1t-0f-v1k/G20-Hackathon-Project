// helpers/benchmarkHelper.js
import LocalBenchmark from "../models/LocalBenchmark.js";

export const checkAgainstBenchmark = async (province, municipality, totalEmissions) => {
  try {
    const benchmark = await LocalBenchmark.findOne({ province, municipality });
    
    if (!benchmark) {
      return { flag: "no-data", benchmarkUsed: null };
    }

    // Apply sector multiplier if provided (default 1.0)
    const sectorMultiplier = 1.0; // Can be passed as parameter if needed
    const adjustedThresholds = {
      green: benchmark.greenThreshold * sectorMultiplier,
      yellow: benchmark.yellowThreshold * sectorMultiplier,
      red: benchmark.redThreshold * sectorMultiplier
    };

    let flag;
    if (totalEmissions <= adjustedThresholds.green) {
      flag = "green";
    } else if (totalEmissions <= adjustedThresholds.yellow) {
      flag = "yellow";
    } else if (totalEmissions <= adjustedThresholds.red) {
      flag = "orange";
    } else {
      flag = "red";
    }

    return {
      flag,
      benchmarkUsed: {
        province: benchmark.province,
        municipality: benchmark.municipality,
        greenThreshold: adjustedThresholds.green,
        yellowThreshold: adjustedThresholds.yellow,
        redThreshold: adjustedThresholds.red,
        unit: benchmark.unit
      }
    };
  } catch (error) {
    console.error("Benchmark check error:", error);
    return { flag: "no-data", benchmarkUsed: null };
  }
};
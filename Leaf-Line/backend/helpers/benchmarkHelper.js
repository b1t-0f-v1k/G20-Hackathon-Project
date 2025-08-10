// helpers/benchmarkHelper.js
import LocalBenchmark from "../models/LocalBenchmark.js";

export const checkAgainstBenchmark = async (province, municipality, totalEmissions) => {
  const benchmark = await LocalBenchmark.findOne({ province, municipality });

  if (!benchmark) {
    return { flag: "no-data", benchmarkUsed: null };
  }

  if (totalEmissions > benchmark.redThresholdKg) {
    return { flag: "red", benchmarkUsed: benchmark };
  } else if (totalEmissions < benchmark.greenThresholdKg) {
    return { flag: "green", benchmarkUsed: benchmark };
  } else {
    return { flag: "yellow", benchmarkUsed: benchmark };
  }
};

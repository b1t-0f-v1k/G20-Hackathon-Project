import mongoose from "mongoose";
import dotenv from "dotenv";
import LocalBenchmark from "../models/LocalBenchmark.js";

dotenv.config();

const benchmarks = [
  // Gauteng
  {
    province: "Gauteng",
    municipality: "City of Johannesburg",
    threshold: 15000, // Required field
    greenThreshold: 10000,
    yellowThreshold: 15000,
    redThreshold: 20000,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: true,
    source: "Gauteng DARD Climate Change Strategy 2022",
    meta: { sourceUrl: "https://example.com/jhb" }
  },
  {
    province: "Gauteng",
    municipality: "Lesedi Local Municipality",
    threshold: 8000,
    greenThreshold: 6000,
    yellowThreshold: 8000,
    redThreshold: 10000,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: false,
    source: "Lesedi IDP 2023/24",
    meta: { sourceUrl: "https://example.com/lesedi" }
  },

  // Western Cape (Coastal adjustment -10%)
  {
    province: "Western Cape",
    municipality: "City of Cape Town",
    threshold: 14000,
    greenThreshold: 9000,  // 10000 * 0.9
    yellowThreshold: 12600, // 14000 * 0.9
    redThreshold: 16200,   // 18000 * 0.9
    unit: "kg CO₂e/year",
    isCoastal: true,
    isHighveld: false,
    source: "CCT Energy2040 Strategy",
    meta: { sourceUrl: "https://example.com/cpt" }
  },
  {
    province: "Western Cape",
    municipality: "Beaufort West Municipality",
    threshold: 7000,
    greenThreshold: 4900,  // 7000 * 0.7 (arid adjustment)
    yellowThreshold: 6300,
    redThreshold: 7700,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: false,
    source: "Karoo District IDP",
    meta: { sourceUrl: "https://example.com/beaufort" }
  },

  // KwaZulu-Natal (Coastal)
  {
    province: "KwaZulu-Natal",
    municipality: "eThekwini Metropolitan",
    threshold: 5100,
    greenThreshold: 3600,  // 4000 * 0.9
    yellowThreshold: 4500,
    redThreshold: 5400,
    unit: "kg CO₂e/year",
    isCoastal: true,
    isHighveld: false,
    source: "eThekwini GHG Inventory 2023",
    meta: { sourceUrl: "https://example.com/ethekwini-benchmark" }
  },
  {
    province: "KwaZulu-Natal",
    municipality: "uMzinyathi District",
    threshold: 2700,
    greenThreshold: 1890,  // 2700 * 0.7 (rural adjustment)
    yellowThreshold: 2160,
    redThreshold: 2430,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: false,
    source: "KZN Provincial Climate Plan",
    meta: { sourceUrl: "https://example.com/umzinyathi-benchmark" }
  },

  // Eastern Cape
  {
    province: "Eastern Cape",
    municipality: "Nelson Mandela Bay",
    threshold: 4800,
    greenThreshold: 3360,  // 4800 * 0.7 (coastal industrial)
    yellowThreshold: 4080,
    redThreshold: 4800,
    unit: "kg CO₂e/year",
    isCoastal: true,
    isHighveld: false,
    source: "NMB Coastal Management Plan",
    meta: { sourceUrl: "https://example.com/nmb-benchmark" }
  },
  {
    province: "Eastern Cape",
    municipality: "Alfred Nzo District",
    threshold: 2600,
    greenThreshold: 1820,  // 2600 * 0.7
    yellowThreshold: 2080,
    redThreshold: 2340,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: false,
    source: "Alfred Nzo IDP",
    meta: { sourceUrl: "https://example.com/alfrednzo-benchmark" }
  },

  // Free State (Highveld adjustment +15%)
  {
    province: "Free State",
    municipality: "Mangaung Metropolitan",
    threshold: 4700,
    greenThreshold: 3525,  // 3000 * 1.15
    yellowThreshold: 4600,
    redThreshold: 5750,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: true,
    source: "Mangaung Air Quality Plan",
    meta: { sourceUrl: "https://example.com/mangaung-benchmark" }
  },
  {
    province: "Free State",
    municipality: "Xhariep District",
    threshold: 2500,
    greenThreshold: 1875,  // 2500 * 0.75 (rural)
    yellowThreshold: 2250,
    redThreshold: 2625,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: false,
    source: "Xhariep Development Plan",
    meta: { sourceUrl: "https://example.com/xhariep-benchmark" }
  },

  // Limpopo
  {
    province: "Limpopo",
    municipality: "Polokwane Local",
    threshold: 4500,
    greenThreshold: 3150,  // 4500 * 0.7
    yellowThreshold: 4050,
    redThreshold: 4950,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: false,
    source: "Polokwane Environmental Report",
    meta: { sourceUrl: "https://example.com/polokwane-benchmark" }
  },
  {
    province: "Limpopo",
    municipality: "Vhembe District",
    threshold: 2400,
    greenThreshold: 1680,  // 2400 * 0.7
    yellowThreshold: 1920,
    redThreshold: 2160,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: false,
    source: "Vhembe Climate Response",
    meta: { sourceUrl: "https://example.com/vhembe-benchmark" }
  },

  // Mpumalanga (Highveld)
  {
    province: "Mpumalanga",
    municipality: "Mbombela Local",
    threshold: 4600,
    greenThreshold: 3220,  // 4600 * 0.7
    yellowThreshold: 4140,
    redThreshold: 5060,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: true,
    source: "Mbombela AQMP",
    meta: { sourceUrl: "https://example.com/mbombela-benchmark" }
  },
  {
    province: "Mpumalanga",
    municipality: "Gert Sibande District",
    threshold: 2300,
    greenThreshold: 1610,  // 2300 * 0.7
    yellowThreshold: 1840,
    redThreshold: 2070,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: false,
    source: "Gert Sibande IDP",
    meta: { sourceUrl: "https://example.com/gertsibande-benchmark" }
  },

  // North West
  {
    province: "North West",
    municipality: "Rustenburg Local",
    threshold: 4400,
    greenThreshold: 3080,  // 4400 * 0.7
    yellowThreshold: 3960,
    redThreshold: 4840,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: false,
    source: "Rustenburg Mining Charter",
    meta: { sourceUrl: "https://example.com/rustenburg-benchmark" }
  },
  {
    province: "North West",
    municipality: "Ngaka Modiri Molema District",
    threshold: 2200,
    greenThreshold: 1540,  // 2200 * 0.7
    yellowThreshold: 1760,
    redThreshold: 1980,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: false,
    source: "Ngaka Modiri Molema EPWP",
    meta: { sourceUrl: "https://example.com/ngaka-benchmark" }
  },

  // Northern Cape (Arid adjustment)
  {
    province: "Northern Cape",
    municipality: "Sol Plaatje Local",
    threshold: 4300,
    greenThreshold: 2580,  // 4300 * 0.6 (extra arid)
    yellowThreshold: 3440,
    redThreshold: 4300,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: false,
    source: "Sol Plaatje Drought Report",
    meta: { sourceUrl: "https://example.com/solplaatje-benchmark" }
  },
  {
    province: "Northern Cape",
    municipality: "John Taolo Gaetsewe District",
    threshold: 2100,
    greenThreshold: 1260,  // 2100 * 0.6
    yellowThreshold: 1680,
    redThreshold: 2100,
    unit: "kg CO₂e/year",
    isCoastal: false,
    isHighveld: false,
    source: "JTG District Plan",
    meta: { sourceUrl: "https://example.com/johntaolo-benchmark" }
  }
];

(async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Clearing old benchmarks...");
    await LocalBenchmark.deleteMany({});

    console.log("Inserting new benchmarks...");
    await LocalBenchmark.insertMany(benchmarks);

    console.log(`✅ Success! Inserted ${benchmarks.length} benchmarks`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
})();
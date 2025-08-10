import mongoose from "mongoose";
import dotenv from "dotenv";
import LocalBenchmark from "../models/LocalBenchmark.js";

dotenv.config();

const benchmarks = [
    // Gauteng
    { province: "Gauteng", municipality: "City of Johannesburg", threshold: 15000, unit: "kg CO₂e/year", meta: { sourceUrl: "https://example.com/jhb" } },
    { province: "Gauteng", municipality: "Lesedi Local Municipality", threshold: 8000, unit: "kg CO₂e/year", meta: { sourceUrl: "https://example.com/lesedi" } },

    // Western Cape
    { province: "Western Cape", municipality: "City of Cape Town", threshold: 14000, unit: "kg CO₂e/year", meta: { sourceUrl: "https://example.com/cpt" } },
    { province: "Western Cape", municipality: "Beaufort West Municipality", threshold: 7000, unit: "kg CO₂e/year", meta: { sourceUrl: "https://example.com/beaufort" } },
    
    //Kwa-Zulu Natal
    { province: "KwaZulu-Natal", municipality: "eThekwini Metropolitan", threshold: 5100, meta: { sourceUrl: "https://example.com/ethekwini-benchmark" } },
    { province: "KwaZulu-Natal", municipality: "uMzinyathi District", threshold: 2700, meta: { sourceUrl: "https://example.com/umzinyathi-benchmark" } },

    // Eastern Cape
    { province: "Eastern Cape", municipality: "Nelson Mandela Bay", threshold: 4800, meta: { sourceUrl: "https://example.com/nmb-benchmark" } },
    { province: "Eastern Cape", municipality: "Alfred Nzo District", threshold: 2600, meta: { sourceUrl: "https://example.com/alfrednzo-benchmark" } },

    // Free State
    { province: "Free State", municipality: "Mangaung Metropolitan", threshold: 4700, meta: { sourceUrl: "https://example.com/mangaung-benchmark" } },
    { province: "Free State", municipality: "Xhariep District", threshold: 2500, meta: { sourceUrl: "https://example.com/xhariep-benchmark" } },

    // Limpopo
    { province: "Limpopo", municipality: "Polokwane Local", threshold: 4500, meta: { sourceUrl: "https://example.com/polokwane-benchmark" } },
    { province: "Limpopo", municipality: "Vhembe District", threshold: 2400, meta: { sourceUrl: "https://example.com/vhembe-benchmark" } },

    // Mpumalanga
    { province: "Mpumalanga", municipality: "Mbombela Local", threshold: 4600, meta: { sourceUrl: "https://example.com/mbombela-benchmark" } },
    { province: "Mpumalanga", municipality: "Gert Sibande District", threshold: 2300, meta: { sourceUrl: "https://example.com/gertsibande-benchmark" } },

    // North West
    { province: "North West", municipality: "Rustenburg Local", threshold: 4400, meta: { sourceUrl: "https://example.com/rustenburg-benchmark" } },
    { province: "North West", municipality: "Ngaka Modiri Molema District", threshold: 2200, meta: { sourceUrl: "https://example.com/ngaka-benchmark" } },

    // Northern Cape
    { province: "Northern Cape", municipality: "Sol Plaatje Local", threshold: 4300, meta: { sourceUrl: "https://example.com/solplaatje-benchmark" } },
    { province: "Northern Cape", municipality: "John Taolo Gaetsewe District", threshold: 2100, meta: { sourceUrl: "https://example.com/johntaolo-benchmark" } },
];

(async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Clearing old benchmarks...");
        await LocalBenchmark.deleteMany({});

        console.log("Inserting new benchmarks...");
        await LocalBenchmark.insertMany(benchmarks);

        console.log("✅ Benchmark seeding complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding benchmarks:", err);
        process.exit(1);
    }
})();

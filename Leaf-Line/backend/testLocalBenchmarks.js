import mongoose from "mongoose";

// Replace with your actual MONGO_URI and database name
const MONGO_URI = "mongodb+srv://group4:group4Password@hackathon-cluster.0x8dphs.mongodb.net/test?retryWrites=true&w=majority&appName=Hackathon-Cluster";

// LocalBenchmark model
const localBenchmarkSchema = new mongoose.Schema({
  province: { type: String, required: true },
  municipality: { type: String, required: true },
  threshold: { type: Number, required: true },
  unit: { type: String, default: "kgCO2e/year" },
  meta: { type: Object }
});

const LocalBenchmark = mongoose.model("LocalBenchmark", localBenchmarkSchema);

async function runTest() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB");

    const benchmarks = await LocalBenchmark.find({});
    console.log(`📊 Found ${benchmarks.length} benchmarks:`);
    console.log(JSON.stringify(benchmarks, null, 2));
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

runTest();

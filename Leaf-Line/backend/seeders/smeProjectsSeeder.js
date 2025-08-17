import SMEProjectEmission from "../models/smeEmissionModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB for seeding"))
  .catch(err => console.error("MongoDB connection error:", err));

// Sample data generators
const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const smeNames = [
  "GreenTech Solutions", "EcoBuild Ltd", "Sustainable Farms", "Clean Energy Co",
  "Organic Harvest", "EcoTransport", "RecycleWorks", "SolarWave Energy",
  "WindPower SA", "WaterWise", "BioFuel Innovations", "EcoManufacturing",
  "Sustainable Textiles", "Green Logistics", "CleanAir Tech", "EcoTourism SA",
  "Renewable Resources", "CarbonZero", "EcoConsulting", "Sustainable Living"
];

const projectNames = [
  "Solar Panel Installation", "Wind Farm Development", "Organic Farming Expansion",
  "Waste Recycling Program", "Water Conservation System", "Green Building Retrofit",
  "Electric Fleet Conversion", "Sustainable Packaging", "Carbon Offset Initiative",
  "Biodiversity Conservation", "Community Garden", "Energy Efficiency Upgrade",
  "Rainwater Harvesting", "Composting Facility", "Eco-Tourism Development",
  "Sustainable Forestry", "Clean Cookstove Distribution", "Plastic Waste Reduction",
  "Urban Greening Project", "Renewable Energy Training"
];

// Only the provinces and municipalities you specified
const provinces = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
];

const municipalities = {
  "Eastern Cape": ["Buffalo City", "OR Tambo District"],
  "Free State": ["Mangaung Metro", "Thabo Mofutsanyana"],
  "Gauteng": ["City of Johannesburg", "Sedibeng District"],
  "KwaZulu-Natal": ["eThekwini Metro", "uMzinyathi District"],
  "Limpopo": ["Polokwane", "Vhembe District"],
  "Mpumalanga": ["City of Mbombela", "Gert Sibande District"],
  "Northern Cape": ["Sol Plaatje", "Namakwa District"],
  "North West": ["Rustenburg", "Ngaka Modiri Molema"],
  "Western Cape": ["City of Cape Town", "Eden District"]
};

const emissionCategories = [
  // Electricity
    { category: "Electricity", unit: "kWh", emissionFactor: 0.92 },
    // Fuels
    { category: "Diesel Fuel", unit: "liters", emissionFactor: 2.68 },
    { category: "Petrol Fuel", unit: "liters", emissionFactor: 2.31 },
    { category: "Natural Gas", unit: "m3", emissionFactor: 1.9 },
    // Transport
    { category: "Flight", unit: "passenger-km", emissionFactor: 0.15 },
    { category: "Car (Average)", unit: "km", emissionFactor: 0.21 },
    { category: "Bus", unit: "passenger-km", emissionFactor: 0.05 },
    // Lifestyle
    { category: "Beef Consumption", unit: "kg", emissionFactor: 27 },
    { category: "Poultry Consumption", unit: "kg", emissionFactor: 6.9 },
    { category: "Dairy Products", unit: "kg", emissionFactor: 3 },
    { category: "Clothing Purchase", unit: "item", emissionFactor: 25 }
];

const projectDescriptions = [
  "A project aimed at reducing carbon emissions through renewable energy solutions.",
  "Sustainable agriculture initiative to promote eco-friendly farming practices.",
  "Community-based program to improve waste management and recycling.",
  "Infrastructure development with a focus on energy efficiency and sustainability.",
  "Educational program to raise awareness about climate change and carbon footprint.",
  "Implementation of clean technology to reduce industrial emissions.",
  "Urban development project incorporating green spaces and sustainable design.",
  "Transportation initiative to promote electric and hybrid vehicle usage.",
  "Water conservation program to reduce consumption and improve efficiency.",
  "Forestry project focused on reforestation and carbon sequestration."
];

// Generate random project data
const generateRandomProject = (index) => {
  const province = provinces[Math.floor(Math.random() * provinces.length)];
  const municipality = municipalities[province][Math.floor(Math.random() * municipalities[province].length)];
  
  // Generate 1-3 emission sources
  const numSources = Math.floor(Math.random() * 3) + 1;
  const sources = [];
  let totalEmissions = 0;
  
  for (let i = 0; i < numSources; i++) {
    const category = emissionCategories[Math.floor(Math.random() * emissionCategories.length)];
    const activityData = Math.floor(Math.random() * 1000) + 100;
    const emissions = activityData * category.emissionFactor;
    totalEmissions += emissions;
    
    sources.push({
      category: category.category,
      activityData,
      unit: category.unit,
      emissionFactor: category.emissionFactor,
      emissions
    });
  }
  
  // Determine flag based on emissions (simplified logic)
  let flag;
  if (totalEmissions < 500) flag = "green";
  else if (totalEmissions < 1000) flag = "yellow";
  else if (totalEmissions < 1500) flag = "orange";
  else flag = "red";
  
  // Create benchmark data
  const benchmarkUsed = {
    province,
    municipality,
    greenThreshold: 500,
    yellowThreshold: 1000,
    redThreshold: 1500,
    unit: "kg CO₂e"
  };
  
  return {
    smeName: smeNames[index % smeNames.length],
    projectName: projectNames[index % projectNames.length],
    businessID: `BUS${Math.floor(1000 + Math.random() * 9000)}`,
    province,
    municipality,
    description: projectDescriptions[Math.floor(Math.random() * projectDescriptions.length)],
    sources,
    totalEmissions,
    projectCost: Math.floor(Math.random() * 900000) + 100000, // 100k - 1M
    flag,
    benchmarkUsed,
    status: Math.random() > 0.8 ? (Math.random() > 0.5 ? "completed" : "cancelled") : "active"
  };
};

// Seed function
const seedProjects = async () => {
  try {
    // Clear existing data
    await SMEProjectEmission.deleteMany({});
    console.log("Cleared existing projects");
    
    // Generate and insert 20 projects
    const projects = [];
    for (let i = 0; i < 20; i++) {
      projects.push(generateRandomProject(i));
    }
    
    await SMEProjectEmission.insertMany(projects);
    console.log(`Successfully seeded ${projects.length} projects`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding projects:", error);
    process.exit(1);
  }
};

// Run the seeder
seedProjects();
import mongoose from "mongoose";

const investorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }
});

const Investor = mongoose.models.Investor || mongoose.model("Investor", investorSchema);
export default Investor;

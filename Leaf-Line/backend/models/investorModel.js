import mongoose from "mongoose";
import shortid from 'shortid';

const investorSchema = new mongoose.Schema({
  investorID: {
    type: String,
    unique: true,
    default: shortid.generate
  },

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

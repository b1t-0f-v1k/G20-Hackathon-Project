import express from 'express';
import {
  createInvestment,
  getAllInvestments,
  updateInvestment,
  deleteInvestment,
  getInvestmentsByInvestorID
} from '../controllers/investmentsController.js';

const router = express.Router();

// Create a new investment
router.post('/', createInvestment);

// Get all investments
router.get('/', getAllInvestments);

// Get investments by investorID
router.get('/investor/:investorID', getInvestmentsByInvestorID);

// Update investment
router.put('/:id', updateInvestment);

// Delete investment
router.delete('/:id', deleteInvestment);

export default router;
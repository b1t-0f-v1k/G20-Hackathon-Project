import Investments from '../models/investmentsModel.js';

// Create new investment
export const createInvestment = async (req, res) => {
  try {
    const { 
      investorID,
      smeName, 
      projectName, 
      businessID, 
      province, 
      municipality, 
      sources, 
      totalEmissions,
      flag,
      benchmarkUsed,
      projectCost,
      investmentAmount
    } = req.body;

    // Validate required fields
    if (!investorID || !smeName || !projectName || !businessID || !projectCost || !investmentAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    const investment = await Investments.create({
      investorID,
      smeName, 
      projectName, 
      businessID, 
      province, 
      municipality, 
      sources, 
      totalEmissions,
      flag,
      benchmarkUsed,
      projectCost,
      investmentAmount
    });

    res.status(201).json({
      success: true,
      message: "Investment created successfully",
      data: investment
    });
  } catch (error) {
    console.error("Error creating investment:", error);
    res.status(500).json({
      success: false,
      message: error.code === 11000 ? "Investment already exists" : "Failed to create investment",
      error: error.message
    });
  }
};

// Get all investments
export const getAllInvestments = async (req, res) => {
  try {
    const investments = await Investments.find();
    res.status(200).json({
      success: true,
      count: investments.length,
      data: investments
    });
  } catch (error) {
    console.error("Error fetching investments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch investments",
      error: error.message
    });
  }
};

// Get investments by investorID with filtering
export const getInvestmentsByInvestorID = async (req, res) => {
  try {
    const { investorID } = req.params;
    const { status, sortBy, limit } = req.query;
    
    // Build query
    const query = { investorID };
    if (status) query.status = status;
    
    // Build sort
    let sort = {};
    if (sortBy) {
      const parts = sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort = { createdAt: -1 }; // Default sort by newest first
    }
    
    // Execute query
    const investments = await Investments.find(query)
      .sort(sort)
      .limit(parseInt(limit) || 0);
    
    // Calculate totals
    const totalInvested = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
    const totalProjects = investments.length;
    
    res.status(200).json({
      success: true,
      count: investments.length,
      totalInvested,
      totalProjects,
      data: investments
    });
  } catch (error) {
    console.error("Error fetching investments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch investments",
      error: error.message
    });
  }
};

// Update investment
export const updateInvestment = async (req, res) => {
  try {
    const { sources, ...updateData } = req.body;
    
    // Recalculate total emissions if sources are updated
    if (sources) {
      updateData.totalEmissions = sources.reduce((sum, source) => sum + source.emissions, 0);
      updateData.sources = sources;
    }
    
    const investment = await Investments.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: "Investment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Investment updated successfully",
      data: investment
    });
  } catch (error) {
    console.error("Error updating investment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update investment",
      error: error.message
    });
  }
};

// Delete investment
export const deleteInvestment = async (req, res) => {
  try {
    const investment = await Investments.findByIdAndDelete(req.params.id);
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: "Investment not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Investment deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting investment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete investment",
      error: error.message
    });
  }
};
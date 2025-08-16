import Investor from '../models/investorModel.js';

export const loginInvestor = async (req, res) => {
  try {
    // req.user is set by verifyFirebaseToken middleware
    const email = req.user.email;

    const user = await Investor.findOne({ email });
    if (!user) return res.status(404).json({ error: "Investor not found" });

    // No password check needed — Firebase already authenticated
    res.status(200).json({ 
      message: "Login successful", 
      user: {
        investorID: user.investorID,
        email: user.email,
        username: user.username
    } });
  } catch (error) {
    console.error("Error logging in investor:", error.message);
    res.status(500).json({ error: "Failed to log in investor!" });
  }
};

export const registerInvestor = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const user = await Investor.create({ email, username, password });
        res.status(201).json({ 
            message: "Investor registered successfully", 
            user: {
                investorID: user.investorID,
                email: user.email,
                username: user.username
                // Don't send password back
            }
        });
    } catch (error) {
        console.error("Error registering investor:", error.message);
        
        // More specific error handling
        if (error.code === 11000) {
            return res.status(400).json({ 
                error: "Email or investorID already exists!" 
            });
        }
        
        res.status(500).json({ error: "Failed to register investor!" });
    }
};

export const getInvestorID = async (req, res) => {
  console.log('\n=== GET INVESTOR ID ===');
  console.log('Authenticated User:', req.user);
  
  try {
    if (!req.user?.email) {
      console.warn('No email in user object');
      return res.status(400).json({ 
        error: "Bad Request",
        message: "User email not available"
      });
    }

    console.log('Looking up investor with email:', req.user.email);
    const investor = await Investor.findOne({ email: req.user.email })
      .select('investorID email')
      .lean();

    if (!investor) {
      console.warn('Investor not found in database');
      return res.status(404).json({ 
        error: "Not Found",
        message: "Investor not registered in our system"
      });
    }

    if (!investor.investorID) {
      console.warn('Investor found but no investorID');
      return res.status(404).json({ 
        error: "Not Found",
        message: "Investor ID not assigned"
      });
    }

    console.log('Successfully found investor:', {
      investorID: investor.investorID,
      email: investor.email
    });

    return res.status(200).json({ 
      success: true,
      investorID: investor.investorID,
      email: investor.email
    });
    
  } catch (error) {
    console.error('Controller Error:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      error: "Internal Server Error",
      message: "Could not retrieve investor ID"
    });
  }
};
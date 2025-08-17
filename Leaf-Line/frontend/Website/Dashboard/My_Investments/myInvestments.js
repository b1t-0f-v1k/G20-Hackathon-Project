document.addEventListener("DOMContentLoaded", () => {
  // Authentication DOM Elements
  const authContainer = document.getElementById('investorAuthContainer');
  const mainContainer = document.getElementById('investmentsMainContainer');
  const authForm = document.getElementById('investorAuthForm');
  const authInput = document.getElementById('authInvestorID');
  
  // Investments DOM Elements
  const investorNameEl = document.getElementById('investorName');
  const investorIDEl = document.getElementById('investorID');
  const totalInvestedEl = document.getElementById('totalInvested');
  const activeProjectsEl = document.getElementById('activeProjects');
  const totalEmissionsEl = document.getElementById('totalEmissions');
  const searchInput = document.getElementById('searchInvestments');
  const filterStatus = document.getElementById('filterStatus');
  const sortInvestments = document.getElementById('sortInvestments');
  const refreshBtn = document.getElementById('refreshInvestments');
  const investmentsTable = document.getElementById('investmentsTable');
  const investmentCountEl = document.getElementById('investmentCount');
  const modal = document.getElementById('investmentDetailsModal');
  const closeBtn = document.querySelector('.close');
  const modalTitle = document.getElementById('modalProjectTitle');
  const modalContent = document.getElementById('investmentDetailsContent');

  // State variables
  let investorID = null;
  let allInvestments = [];
  let filteredInvestments = [];

  // Initialize the application
  init();

  function init() {
    // Always show auth form initially
    showAuthForm();
    
    // Auth form submission
    authForm.addEventListener('submit', handleAuthSubmit);
  }

  function showAuthForm() {
    authContainer.style.display = 'flex';
    mainContainer.style.display = 'none';
    authInput.value = ''; // Clear input field
  }

  function showInvestments() {
    authContainer.style.display = 'none';
    mainContainer.style.display = 'block';
    initializeInvestmentApp();
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    const enteredID = authInput.value.trim();
    
    // Basic client-side validation
    if (!enteredID) {
      alert('Please enter your Investor ID');
      return;
    }
    
    await verifyInvestorID(enteredID);
  }

  async function verifyInvestorID(id) {
    try {
      // Show loading state
      authInput.disabled = true;
      const authButton = authForm.querySelector('button');
      authButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
      authButton.disabled = true;
      
      // Verify the investor ID with the backend
      // In verifyInvestorID function, update the fetch call:
      const response = await fetch(`http://localhost:5000/api/investor/id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investorID: id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid Investor ID');
      }
      
      const investorData = await response.json();
      
      // Store the ID
      localStorage.setItem('investorID', id);
      investorID = id;
      
      // Update the URL without reloading
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('investorID', id);
      window.history.pushState({}, '', newUrl);
      
      // Show the investments
      showInvestments();
      
    } catch (error) {
      console.error('Verification error:', error);
      alert(`Error: ${error.message}`);
      
      // Reset auth form
      authInput.disabled = false;
      const authButton = authForm.querySelector('button');
      authButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> View Investments';
      authButton.disabled = false;
    }
  }

  function initializeInvestmentApp() {
    // Set up investor info
    investorIDEl.textContent = `ID: ${investorID}`;
    
    // Load data
    loadInvestorData();
    loadInvestments();
    
    // Set up event listeners
    if (searchInput) searchInput.addEventListener('input', filterInvestments);
    if (filterStatus) filterStatus.addEventListener('change', filterInvestments);
    if (sortInvestments) sortInvestments.addEventListener('change', filterInvestments);
    if (refreshBtn) refreshBtn.addEventListener('click', loadInvestments);
    if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
    
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  async function loadInvestorData() {
    try {
      investorNameEl.textContent = 'Loading...';
      
      // Fetch investor data from backend
      const response = await fetch(`http://localhost:5000/api/investors/id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investorID: investorID
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch investor data');
      }
      
      const investorData = await response.json();
      investorNameEl.textContent = investorData.data?.name || 'Carbon Investor';
      
    } catch (error) {
      console.error('Error loading investor data:', error);
      investorNameEl.textContent = 'Carbon Investor'; // Fallback
    }
  }

  async function loadInvestments() {
    try {
      investmentsTable.innerHTML = '<div class="loading">Loading investments...</div>';
      
      // Fetch investments for this investor from backend
      const response = await fetch(`http://localhost:5000/api/investments/investor/${investorID}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      allInvestments = data.data || [];
      
      // Update summary
      totalInvestedEl.textContent = `ZAR ${data.totalInvested?.toLocaleString() || '0'}`;
      activeProjectsEl.textContent = allInvestments.filter(i => i.status === 'active').length;
      
      const totalCO2 = allInvestments.reduce((sum, inv) => sum + (inv.totalEmissions || 0), 0);
      totalEmissionsEl.textContent = `${totalCO2.toFixed(2)} kg CO₂`;
      
      filterInvestments();
    } catch (error) {
      console.error('Error loading investments:', error);
      investmentsTable.innerHTML = `<div class="error">Error loading investments: ${error.message}</div>`;
    }
  }

  function filterInvestments() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterStatus.value;
    const sortValue = sortInvestments.value;
    
    // Filter by search term and status
    filteredInvestments = allInvestments.filter(investment => {
      const matchesSearch = 
        investment.projectName?.toLowerCase().includes(searchTerm) ||
        investment.smeName?.toLowerCase().includes(searchTerm);
      
      const matchesStatus = statusFilter ? investment.status === statusFilter : true;
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort investments
    const [sortField, sortDirection] = sortValue.split(':');
    filteredInvestments.sort((a, b) => {
      let valueA, valueB;
      
      switch(sortField) {
        case 'date':
          valueA = new Date(a.createdAt);
          valueB = new Date(b.createdAt);
          break;
        case 'amount':
          valueA = a.investmentAmount;
          valueB = b.investmentAmount;
          break;
        default:
          valueA = a.projectName;
          valueB = b.projectName;
      }
      
      return sortDirection === 'desc' ? 
        (valueA > valueB ? -1 : 1) : 
        (valueA < valueB ? -1 : 1);
    });
    
    renderInvestments();
  }

  function renderInvestments() {
    if (filteredInvestments.length === 0) {
      investmentsTable.innerHTML = '<div class="no-results">No investments found matching your criteria.</div>';
      investmentCountEl.textContent = '0';
      return;
    }
    
    investmentCountEl.textContent = filteredInvestments.length;
    
    investmentsTable.innerHTML = '';
    
    filteredInvestments.forEach(investment => {
      const item = document.createElement('div');
      item.className = 'investment-item';
      item.dataset.id = investment._id;
      
      const formattedDate = new Date(investment.createdAt).toLocaleDateString();
      const formattedAmount = `ZAR ${investment.investmentAmount?.toLocaleString() || '0'}`;
      
      item.innerHTML = `
        <div class="investment-main">
          <div class="investment-project">${investment.projectName || 'Unnamed Project'}</div>
          <div class="investment-sme">${investment.smeName || 'N/A'}</div>
          <div class="investment-location">${investment.province || 'N/A'}, ${investment.municipality || 'N/A'}</div>
        </div>
        <div class="investment-amount">${formattedAmount}</div>
        <div class="investment-status">
          <span class="status-badge status-${investment.status || 'active'}">${investment.status || 'active'}</span>
        </div>
        <div class="investment-date">${formattedDate}</div>
      `;
      
      item.addEventListener('click', () => showInvestmentDetails(investment._id));
      investmentsTable.appendChild(item);
    });
  }

  async function showInvestmentDetails(investmentId) {
    try {
      modalContent.innerHTML = '<div class="loading">Loading details...</div>';
      modal.style.display = 'block';
      
      // Find the investment in our cached data
      const investment = allInvestments.find(i => i._id === investmentId);
      if (!investment) throw new Error('Investment not found');
      
      modalTitle.textContent = investment.projectName || 'Project Details';
      
      // Format dates
      const createdDate = new Date(investment.createdAt).toLocaleDateString();
      const updatedDate = investment.updatedAt ? new Date(investment.updatedAt).toLocaleDateString() : 'N/A';
      
      // Format amounts
      const formattedInvestment = `ZAR ${investment.investmentAmount?.toLocaleString() || '0'}`;
      const formattedProjectCost = `ZAR ${investment.projectCost?.toLocaleString() || '0'}`;
      const formattedEmissions = `${(investment.totalEmissions || 0).toFixed(2)} kg CO₂`;
      
      // Build details HTML
      let detailsHTML = `
        <div class="detail-row">
          <div class="detail-label">Business</div>
          <div class="detail-value">${investment.smeName || 'N/A'}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Location</div>
          <div class="detail-value">${investment.province || 'N/A'}, ${investment.municipality || 'N/A'}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Project Cost</div>
          <div class="detail-value">${formattedProjectCost}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Your Investment</div>
          <div class="detail-value">${formattedInvestment}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">CO₂ Offset</div>
          <div class="detail-value">${formattedEmissions}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Status</div>
          <div class="detail-value">
            <span class="status-badge status-${investment.status || 'active'}">${investment.status || 'active'}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Created</div>
          <div class="detail-value">${createdDate}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Last Updated</div>
          <div class="detail-value">${updatedDate}</div>
        </div>
      `;
      
      // Add emission sources if available
      if (investment.sources && investment.sources.length > 0) {
        detailsHTML += `
          <div class="emission-sources">
            <h3>Emission Sources</h3>
            ${investment.sources.map(source => `
              <div class="emission-source">
                <h4>${source.category || 'Uncategorized'}</h4>
                <div class="source-details">
                  <div class="source-detail">
                    <span>Activity:</span>
                    <span>${source.activityData || '0'} ${source.unit || 'units'}</span>
                  </div>
                  <div class="source-detail">
                    <span>Emission Factor:</span>
                    <span>${source.emissionFactor || '0'}</span>
                  </div>
                  <div class="source-detail">
                    <span>Emissions:</span>
                    <span>${source.emissions || '0'} kg CO₂</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
      
      modalContent.innerHTML = detailsHTML;
    } catch (error) {
      console.error('Error showing investment details:', error);
      modalContent.innerHTML = `<div class="error">Error loading details: ${error.message}</div>`;
    }
  }
});
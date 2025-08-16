document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
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

  // State
  let investorID = '';
  let allInvestments = [];
  let filteredInvestments = [];

  // Initialize
  init();

  function init() {
    // Get investor ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    investorID = urlParams.get('investorID') || localStorage.getItem('investorID');
    
    if (!investorID) {
      alert('No investor ID found. Please login first.');
      window.location.href = '/login.html';
      return;
    }
    
    localStorage.setItem('investorID', investorID);
    investorIDEl.textContent = `ID: ${investorID}`;
    
    // Load investor data and investments
    loadInvestorData();
    loadInvestments();
    
    // Event listeners
    searchInput.addEventListener('input', filterInvestments);
    filterStatus.addEventListener('change', filterInvestments);
    sortInvestments.addEventListener('change', filterInvestments);
    refreshBtn.addEventListener('click', loadInvestments);
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  async function loadInvestorData() {
    try {
      // In a real app, you'd fetch this from your API
      investorNameEl.textContent = 'Loading...';
      
      // Simulate API call
      setTimeout(() => {
        investorNameEl.textContent = 'Carbon Investor'; // Replace with actual name from API
      }, 500);
    } catch (error) {
      console.error('Error loading investor data:', error);
      investorNameEl.textContent = 'Error loading data';
    }
  }

  async function loadInvestments() {
    try {
      investmentsTable.innerHTML = '<div class="loading">Loading investments...</div>';
      
      const response = await fetch(`/api/investments/investor/${investorID}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      allInvestments = data.data;
      
      // Update summary
      totalInvestedEl.textContent = `ZAR ${data.totalInvested.toLocaleString()}`;
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
        investment.projectName.toLowerCase().includes(searchTerm) ||
        investment.smeName.toLowerCase().includes(searchTerm);
      
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
      const formattedAmount = `ZAR ${investment.investmentAmount.toLocaleString()}`;
      
      item.innerHTML = `
        <div class="investment-main">
          <div class="investment-project">${investment.projectName}</div>
          <div class="investment-sme">${investment.smeName}</div>
          <div class="investment-location">${investment.province}, ${investment.municipality}</div>
        </div>
        <div class="investment-amount">${formattedAmount}</div>
        <div class="investment-status">
          <span class="status-badge status-${investment.status}">${investment.status}</span>
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
      
      const investment = allInvestments.find(i => i._id === investmentId);
      if (!investment) throw new Error('Investment not found');
      
      modalTitle.textContent = investment.projectName;
      
      // Format dates
      const createdDate = new Date(investment.createdAt).toLocaleDateString();
      const updatedDate = new Date(investment.updatedAt).toLocaleDateString();
      
      // Format amounts
      const formattedInvestment = `ZAR ${investment.investmentAmount.toLocaleString()}`;
      const formattedProjectCost = `ZAR ${investment.projectCost.toLocaleString()}`;
      const formattedEmissions = `${investment.totalEmissions.toFixed(2)} kg CO₂`;
      
      // Build details HTML
      let detailsHTML = `
        <div class="detail-row">
          <div class="detail-label">Business</div>
          <div class="detail-value">${investment.smeName}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Location</div>
          <div class="detail-value">${investment.province}, ${investment.municipality}</div>
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
            <span class="status-badge status-${investment.status}">${investment.status}</span>
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
                <h4>${source.category}</h4>
                <div class="source-details">
                  <div class="source-detail">
                    <span>Activity:</span>
                    <span>${source.activityData} ${source.unit}</span>
                  </div>
                  <div class="source-detail">
                    <span>Emission Factor:</span>
                    <span>${source.emissionFactor}</span>
                  </div>
                  <div class="source-detail">
                    <span>Emissions:</span>
                    <span>${source.emissions} kg CO₂</span>
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
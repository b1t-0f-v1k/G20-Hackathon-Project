document.addEventListener("DOMContentLoaded", async () => {
  // DOM Elements
  const addSourceBtn = document.getElementById("add-sme-source");
  const form = document.getElementById("sme-form");
  const resultsContainer = document.getElementById("sme-results");
  
  // State
  let emissionFactors = [];
  let provincesData = {};

  // Initialize
  addSourceBtn.disabled = true;
  await Promise.all([loadEmissionFactors(), loadProvincesAndMunicipalities()]);
  addSourceBtn.disabled = false;
  showPlaceholder();

  // Event Listeners
  addSourceBtn.addEventListener("click", addSourceInputs);
  form.addEventListener("submit", handleFormSubmit);

  // Functions
  async function loadEmissionFactors() {
    try {
      const res = await fetch("http://localhost:5000/api/emission-factors");
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      emissionFactors = await res.json();
    } catch (err) {
      console.error("Error loading emission factors:", err);
      emissionFactors = [];
      showError("Failed to load emission factors. Please refresh the page.");
    }
  }

  async function loadProvincesAndMunicipalities() {
    try {
      const res = await fetch("http://localhost:5000/api/local-benchmarks");
      if (!res.ok) throw new Error("Failed to load location data");
      const data = await res.json();

      provincesData = data.reduce((acc, b) => {
        acc[b.province] = acc[b.province] || [];
        if (!acc[b.province].includes(b.municipality)) {
          acc[b.province].push(b.municipality);
        }
        return acc;
      }, {});

      const provinceSelect = document.getElementById("province");
      provinceSelect.innerHTML = `<option value="">-- Select Province --</option>`;
      Object.keys(provincesData).forEach(prov => {
        provinceSelect.innerHTML += `<option value="${prov}">${prov}</option>`;
      });

      provinceSelect.addEventListener("change", () => {
        const muniSelect = document.getElementById("municipality");
        muniSelect.innerHTML = `<option value="">-- Select Municipality --</option>`;
        provincesData[provinceSelect.value]?.forEach(muni => {
          muniSelect.innerHTML += `<option value="${muni}">${muni}</option>`;
        });
      });
    } catch (err) {
      console.error("Error loading benchmarks:", err);
      showError("Failed to load location data. Please refresh the page.");
    }
  }

  function addSourceInputs() {
    const div = document.createElement("div");
    div.classList.add("source-group");
    div.innerHTML = `
      <label>Category:</label>
      <select class="category" required>
        <option value="">-- Select Category --</option>
        ${emissionFactors.map(f => `
          <option value="${f.category}">${f.category} (${f.unit})</option>
        `).join("")}
      </select>
      <label>Activity Data:</label>
      <input type="number" class="activityData" required min="0" step="any">
      <button type="button" class="remove-source">Remove Source</button>
    `;
    document.getElementById("sme-sources").appendChild(div);
    
    // Add remove functionality
    div.querySelector(".remove-source").addEventListener("click", () => {
      div.remove();
    });
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    showLoading();

    const formData = {
      smeName: document.getElementById("smeName").value,
      businessID: document.getElementById("businessID").value,
      projectName: document.getElementById("projectName").value,
      projectDescription: document.getElementById("projectDescription").value,
      projectCost: parseFloat(document.getElementById("projectCost").value),
      province: document.getElementById("province").value,
      municipality: document.getElementById("municipality").value,
      sources: [...document.querySelectorAll(".source-group")].map(group => ({
        category: group.querySelector(".category").value,
        activityData: parseFloat(group.querySelector(".activityData").value)
      }))
    };

    // Validation
    if (!formData.province || !formData.municipality) {
      showError("Please select both province and municipality");
      return;
    }
    if (formData.sources.length === 0) {
      showError("Please add at least one emission source");
      return;
    }
    if (formData.sources.some(src => !src.category || isNaN(src.activityData))) {
      showError("Please complete all source fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/sme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (res.ok) {
        displayResults(data);
      } else {
        showError(data.error || "Failed to calculate emissions");
      }
    } catch (err) {
      console.error("Submission error:", err);
      showError("Network error. Please try again.");
    }
  }

  function displayResults(data) {
    const flag = data.data.flag.toLowerCase();
    const flagClass = `flag-${flag}`;
    const flagColors = {
      green: '#28a745',
      yellow: '#ffc107',
      orange: '#fd7e14',
      red: '#dc3545'
    };

    // Add status display
    const statusColors = {
      active: '#28a745',
      completed: '#17a2b8',
      cancelled: '#dc3545'
    };

    resultsContainer.innerHTML = `
      <h3>Emissions Report</h3>
      <div class="result-item">
        <h4>Project Summary</h4>
        <p><strong>Name:</strong> ${data.data.projectName}</p>
        <p><strong>Status:</strong> 
          <span style="color:${statusColors[data.data.status || 'active']}">
            ${(data.data.status || 'active').toUpperCase()}
          </span>
        </p>
        <p><strong>Location:</strong> ${data.data.municipality}, ${data.data.province}</p>
        <p><strong>Project Cost:</strong> R${data.data.projectCost.toFixed(2)}</p>
      </div>
      
      <div class="result-item">
        <h4>Total Carbon Emissions</h4>
        <p class="total-emissions">${data.data.totalEmissions.toFixed(2)} kg CO₂e</p>
        <div class="result-flag ${flagClass}">
          <span class="flag-icon" style="background-color: ${flagColors[flag] || '#6c757d'}"></span>
          Status: ${data.data.flag.toUpperCase()}
        </div>
      </div>
      
      <div class="result-item">
        <h4>Emission Sources</h4>
        <table class="sources-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Emissions</th>
            </tr>
          </thead>
          <tbody>
            ${data.data.sources.map(source => `
              <tr>
                <td>${source.category}</td>
                <td>${source.activityData} ${source.unit}</td>
                <td>${source.emissions.toFixed(2)} kg CO₂e</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="result-item">
        <h4>Cost Efficiency</h4>
        <p>${(data.data.totalEmissions / data.data.projectCost).toFixed(4)} kg CO₂e per ZAR</p>
      </div>
      
      ${data.data.benchmarkUsed ? `
      <div class="result-item">
        <h4>Benchmark Comparison</h4>
        <div class="benchmark-metrics">
          <div class="metric">
            <span class="metric-value">${data.data.benchmarkUsed.greenThreshold.toFixed(2)}</span>
            <span class="metric-label">Green Threshold</span>
          </div>
          <div class="metric">
            <span class="metric-value">${data.data.benchmarkUsed.redThreshold.toFixed(2)}</span>
            <span class="metric-label">Red Threshold</span>
          </div>
        </div>
      </div>
      ` : ''}
    `;
  }

  function showLoading() {
    resultsContainer.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Calculating emissions...</p>
      </div>
    `;
  }

  function showPlaceholder() {
    resultsContainer.innerHTML = `
      <h3>Emissions Calculator</h3>
      <div class="placeholder">
        <p>Complete the form to calculate your carbon footprint</p>
        <p>Your results will appear here</p>
      </div>
    `;
  }

  function showError(message) {
    resultsContainer.innerHTML = `
      <div class="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>${message}</p>
      </div>
    `;
  }
});
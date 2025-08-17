document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return alert("No project ID provided");

  // DOM Elements
  const smeNameInput = document.getElementById("smeName");
  const businessIDInput = document.getElementById("businessID");
  const projectNameInput = document.getElementById("projectName");
  const projectCostInput = document.getElementById("projectCost");
  const provinceSelect = document.getElementById("province");
  const municipalitySelect = document.getElementById("municipality");
  const addSourceBtn = document.getElementById("add-source-btn");
  const sourcesListDiv = document.getElementById("sources-list");
  const updateForm = document.getElementById("update-form");
  const addSourceFormDiv = document.getElementById("add-source-form");
  const flagDisplay = document.getElementById("flag-display");
  const emissionsTotalDisplay = document.getElementById("emissions-total");
  const descriptionInput = document.getElementById("projectDescription");

  // State
  let localBenchmarks = [];
  let emissionFactors = [];
  let municipalitiesByProvince = {};
  let sources = [];
  let inputsVisible = false;
  let newCategorySelect = null;
  let newActivityDataInput = null;

  // Flag colors definition
  const flagColors = {
    green: '#28a745',
    yellow: '#ffc107',
    orange: '#fd7e14',
    red: '#dc3545',
    "no-data": '#6c757d'
  };

  // Fetch local benchmarks
  async function fetchBenchmarks() {
    try {
      const res = await fetch("http://localhost:5000/api/local-benchmarks");
      if (!res.ok) throw new Error("Failed to fetch local benchmarks");
      localBenchmarks = await res.json();

      const provinces = [...new Set(localBenchmarks.map(lb => lb.province))];
      provinceSelect.innerHTML = '<option value="">Select Province</option>';
      provinces.forEach(prov => {
        const option = document.createElement("option");
        option.value = prov;
        option.textContent = prov;
        provinceSelect.appendChild(option);
      });

      municipalitiesByProvince = {};
      localBenchmarks.forEach(lb => {
        if (!municipalitiesByProvince[lb.province]) {
          municipalitiesByProvince[lb.province] = new Set();
        }
        municipalitiesByProvince[lb.province].add(lb.municipality);
      });
    } catch (err) {
      console.error("Error loading benchmarks:", err);
      alert("Failed to load location data. Please refresh the page.");
    }
  }

  // Fetch emission factors
  async function fetchEmissionFactors() {
    try {
      const res = await fetch("http://localhost:5000/api/emission-factors");
      if (!res.ok) throw new Error("Failed to fetch emission factors");
      emissionFactors = await res.json();
    } catch (err) {
      console.error("Error loading emission factors:", err);
      alert("Failed to load emission factors. Please refresh the page.");
    }
  }

  // Calculate and display the flag status
  async function updateFlagDisplay() {
    if (!provinceSelect.value || !municipalitySelect.value) {
      flagDisplay.innerHTML = '<span style="color:#6c757d">Select province and municipality</span>';
      return;
    }

    const totalEmissions = sources.reduce((sum, source) => sum + source.emissions, 0);
    
    if (emissionsTotalDisplay) {
      emissionsTotalDisplay.textContent = `${totalEmissions.toFixed(2)} kg CO₂e`;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/local-benchmarks?province=${encodeURIComponent(provinceSelect.value)}&municipality=${encodeURIComponent(municipalitySelect.value)}`
      );
      if (!res.ok) throw new Error("Failed to fetch benchmarks");
      const benchmarks = await res.json();
      const benchmark = benchmarks[0];

      if (!benchmark) {
        flagDisplay.innerHTML = '<span style="color:#6c757d">No benchmark data</span>';
        return;
      }

      let flag;
      if (totalEmissions <= benchmark.greenThreshold) {
        flag = "green";
      } else if (totalEmissions <= benchmark.yellowThreshold) {
        flag = "yellow";
      } else if (totalEmissions <= benchmark.redThreshold) {
        flag = "orange";
      } else {
        flag = "red";
      }

      flagDisplay.innerHTML = `
        <span style="color:${flagColors[flag]}">
          ${flag.toUpperCase()} (${totalEmissions.toFixed(2)}/${benchmark.redThreshold} kg CO₂e)
        </span>
      `;
    } catch (err) {
      console.error("Flag calculation error:", err);
      flagDisplay.innerHTML = '<span style="color:#6c757d">Error calculating flag</span>';
    }
  }

  // Province change handler
  provinceSelect.addEventListener("change", () => {
    municipalitySelect.innerHTML = '<option value="">Select Municipality</option>';
    const selectedProv = provinceSelect.value;
    if (selectedProv && municipalitiesByProvince[selectedProv]) {
      Array.from(municipalitiesByProvince[selectedProv]).forEach(mun => {
        const option = document.createElement("option");
        option.value = mun;
        option.textContent = mun;
        municipalitySelect.appendChild(option);
      });
    }
    updateFlagDisplay();
  });

  municipalitySelect.addEventListener("change", updateFlagDisplay);

  // Render sources list
  function renderSources() {
    sourcesListDiv.innerHTML = "";
    sources.forEach((source, idx) => {
      const div = document.createElement("div");
      div.classList.add("source-item");
      div.innerHTML = `
        <div>
          <strong>${source.category}</strong><br>
          ${source.activityData} ${source.unit} × EF ${source.emissionFactor}<br>
          <em>${source.emissions.toFixed(2)} kg CO₂e</em>
        </div>
      `;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        sources.splice(idx, 1);
        renderSources();
        updateFlagDisplay();
      });

      div.appendChild(removeBtn);
      sourcesListDiv.appendChild(div);
    });
  }

  // Show/hide source input form
  function showAddSourceInputs() {
    newCategorySelect = document.createElement("select");
    newCategorySelect.required = true;
    newCategorySelect.id = "new-category";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select Category";
    newCategorySelect.appendChild(defaultOption);

    const categories = [...new Set(emissionFactors.map(e => e.category))];
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      newCategorySelect.appendChild(option);
    });

    newActivityDataInput = document.createElement("input");
    newActivityDataInput.type = "number";
    newActivityDataInput.placeholder = "Activity Data";
    newActivityDataInput.required = true;
    newActivityDataInput.min = "0";
    newActivityDataInput.step = "any";
    newActivityDataInput.id = "new-activityData";

    addSourceFormDiv.innerHTML = `
      <div class="form-row">
        <label for="new-category">Category:</label>
        ${newCategorySelect.outerHTML}
      </div>
      <div class="form-row">
        <label for="new-activityData">Activity Data:</label>
        ${newActivityDataInput.outerHTML}
      </div>
    `;

    inputsVisible = true;
    addSourceBtn.textContent = "Confirm Add";
  }

  function hideAddSourceInputs() {
    addSourceFormDiv.innerHTML = "";
    inputsVisible = false;
    addSourceBtn.textContent = "Add Source";
  }

  // Add source button handler
  addSourceBtn.addEventListener("click", () => {
    if (!inputsVisible) {
      showAddSourceInputs();
      return;
    }

    const category = document.getElementById("new-category").value;
    const activityData = parseFloat(document.getElementById("new-activityData").value);

    if (!category) return alert("Please select a category");
    if (isNaN(activityData)) return alert("Please enter valid activity data");

    const factor = emissionFactors.find(e => e.category === category);
    if (!factor) return alert("Emission factor not found");

    sources.push({
      category,
      activityData,
      unit: factor.unit,
      emissionFactor: factor.emissionFactor,
      emissions: activityData * factor.emissionFactor
    });

    hideAddSourceInputs();
    renderSources();
    updateFlagDisplay();
  });

  // Load existing project data
  async function loadProject() {
    try {
      const res = await fetch(`http://localhost:5000/api/sme-projects/${id}`);
      if (!res.ok) throw new Error("Failed to load project");
      const project = await res.json();

      smeNameInput.value = project.smeName || "";
      businessIDInput.value = project.businessID || "";
      projectNameInput.value = project.projectName || "";
      projectCostInput.value = project.projectCost || "";
      descriptionInput.value = project.description || "";

      provinceSelect.value = project.province || "";
      if (provinceSelect.value) {
        provinceSelect.dispatchEvent(new Event("change"));
        setTimeout(() => {
          municipalitySelect.value = project.municipality || "";
          updateFlagDisplay();
        }, 100);
      }

      sources = project.sources || [];
      renderSources();
      updateFlagDisplay();
    } catch (err) {
      console.error("Error loading project:", err);
      alert("Failed to load project data");
    }
  }

  // Form submission handler
  updateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!provinceSelect.value || !municipalitySelect.value) {
      return alert("Please select province and municipality");
    }
    if (sources.length === 0) {
      return alert("Please add at least one emission source");
    }

    const projectCost = parseFloat(projectCostInput.value);
    if (isNaN(projectCost)) {
      return alert("Please enter a valid project cost");
    }

    const payload = {
      smeName: smeNameInput.value.trim(),
      businessID: businessIDInput.value.trim(),
      projectName: projectNameInput.value.trim(),
      description: descriptionInput.value.trim(),
      projectCost,
      province: provinceSelect.value,
      municipality: municipalitySelect.value,
      sources
    };

    try {
      const res = await fetch(`http://localhost:5000/api/sme-projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Update failed");
      }

      alert("Project updated successfully!");
      window.location.href = "smeProjects.html";
    } catch (err) {
      console.error("Update error:", err);
      alert(`Error updating project: ${err.message}`);
    }
  });

  // Initialize
  try {
    await Promise.all([fetchBenchmarks(), fetchEmissionFactors()]);
    await loadProject();
  } catch (err) {
    console.error("Initialization error:", err);
    alert("Error initializing application");
  }
});
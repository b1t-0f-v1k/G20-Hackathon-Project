document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return alert("No project ID provided");

  const smeNameInput = document.getElementById("smeName");
  const businessIDInput = document.getElementById("businessID");
  const projectNameInput = document.getElementById("projectName");
  const provinceSelect = document.getElementById("province");
  const municipalitySelect = document.getElementById("municipality");
  const addSourceBtn = document.getElementById("add-source-btn");
  const sourcesListDiv = document.getElementById("sources-list");
  const updateForm = document.getElementById("update-form");
  const addSourceFormDiv = document.getElementById("add-source-form");

  let localBenchmarks = [];
  let emissionFactors = [];
  let municipalitiesByProvince = {};
  let sources = [];

  let inputsVisible = false;
  let newCategorySelect = null;
  let newActivityDataInput = null;

  // Fetch local benchmarks
  async function fetchBenchmarks() {
    const res = await fetch("http://localhost:5000/api/local-benchmarks");
    if (!res.ok) throw new Error("Failed to fetch local benchmarks");
    localBenchmarks = await res.json();

    const provinces = [...new Set(localBenchmarks.map(lb => lb.province))];
    provinces.forEach(prov => {
      const option = document.createElement("option");
      option.value = prov;
      option.textContent = prov;
      provinceSelect.appendChild(option);
    });

    municipalitiesByProvince = {};
    localBenchmarks.forEach(lb => {
      if (!municipalitiesByProvince[lb.province]) municipalitiesByProvince[lb.province] = new Set();
      municipalitiesByProvince[lb.province].add(lb.municipality);
    });
  }

  // Fetch emission factors
  async function fetchEmissionFactors() {
    const res = await fetch("http://localhost:5000/api/emission-factors");
    if (!res.ok) throw new Error("Failed to fetch emission factors");
    emissionFactors = await res.json();
  }

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
  });

  function renderSources() {
    sourcesListDiv.innerHTML = "";
    sources.forEach((source, idx) => {
      const div = document.createElement("div");
      div.classList.add("source-item");
      div.textContent = `${source.category}, ${source.activityData} ${source.unit} (EF: ${source.emissionFactor}), Emissions: ${source.emissions.toFixed(2)}`;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        sources.splice(idx, 1);
        renderSources();
      });

      div.appendChild(removeBtn);
      sourcesListDiv.appendChild(div);
    });
  }

  // Show inputs dynamically inside add-source-form div
  function showAddSourceInputs() {
    // Create category select
    newCategorySelect = document.createElement("select");
    newCategorySelect.required = true;
    newCategorySelect.id = "new-category";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select Category";
    newCategorySelect.appendChild(defaultOption);

    // Add categories from emissionFactors
    const categories = [...new Set(emissionFactors.map(e => e.category))];
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      newCategorySelect.appendChild(option);
    });

    // Create activity data input
    newActivityDataInput = document.createElement("input");
    newActivityDataInput.type = "number";
    newActivityDataInput.placeholder = "Activity Data";
    newActivityDataInput.required = true;
    newActivityDataInput.id = "new-activityData";

    // Clear addSourceFormDiv then append inputs
    addSourceFormDiv.innerHTML = "";
    addSourceFormDiv.appendChild(document.createElement("label")).textContent = "Category:";
    addSourceFormDiv.appendChild(newCategorySelect);
    addSourceFormDiv.appendChild(document.createElement("br"));
    addSourceFormDiv.appendChild(document.createElement("label")).textContent = "Activity Data:";
    addSourceFormDiv.appendChild(newActivityDataInput);

    inputsVisible = true;
    addSourceBtn.textContent = "Confirm Add";
  }

  // Hide inputs and clear add-source-form div
  function hideAddSourceInputs() {
    addSourceFormDiv.innerHTML = "";
    newCategorySelect = null;
    newActivityDataInput = null;
    inputsVisible = false;
    addSourceBtn.textContent = "Add Source";
  }

  // Add source button click
  addSourceBtn.addEventListener("click", () => {
    if (!inputsVisible) {
      // Show inputs first
      showAddSourceInputs();
      return;
    }

    // Inputs visible: validate and add source
    const cat = newCategorySelect.value;
    const actData = parseFloat(newActivityDataInput.value);

    if (!cat) return alert("Please select a category");
    if (isNaN(actData) || actData <= 0) return alert("Please enter valid activity data > 0");

    const efObj = emissionFactors.find(e => e.category === cat);
    if (!efObj) return alert("Emission factor for selected category not found");

    const emissions = actData * efObj.emissionFactor;

    sources.push({
      category: cat,
      activityData: actData,
      unit: efObj.unit,
      emissionFactor: efObj.emissionFactor,
      emissions,
    });

    renderSources();
    hideAddSourceInputs();
  });

  async function loadProject() {
    const res = await fetch(`http://localhost:5000/api/sme-project/${id}`);
    if (!res.ok) throw new Error("Failed to load project");
    const project = await res.json();

    smeNameInput.value = project.smeName || "";
    businessIDInput.value = project.businessID || "";
    projectNameInput.value = project.projectName || "";

    provinceSelect.value = project.province || "";
    provinceSelect.dispatchEvent(new Event("change"));
    setTimeout(() => {
      municipalitySelect.value = project.municipality || "";
    }, 100);

    sources = project.sources || [];
    renderSources();
  }

  updateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!provinceSelect.value || !municipalitySelect.value) {
      return alert("Please select province and municipality");
    }
    if (sources.length === 0) {
      return alert("Please add at least one emission source");
    }

    const payload = {
      smeName: smeNameInput.value.trim(),
      businessID: businessIDInput.value.trim(),
      projectName: projectNameInput.value.trim(),
      province: provinceSelect.value,
      municipality: municipalitySelect.value,
      sources,
    };

    try {
      const res = await fetch(`http://localhost:5000/api/sme-projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
      alert("Project updated successfully!");
      window.location.href = "smeProjects.html";
    } catch (err) {
      alert("Error updating project: " + err.message);
    }
  });

  // Initialize
  try {
    await fetchBenchmarks();
    await fetchEmissionFactors();
    await loadProject();
  } catch (err) {
    alert("Error loading data: " + err.message);
  }
});

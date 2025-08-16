async function loadEmissionFactors() {
  try {
    const res = await fetch("http://localhost:5000/api/emission-factors");
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    window.emissionFactors = await res.json();
  } catch (err) {
    console.error("Error loading emission factors:", err);
    window.emissionFactors = [];
  }
}

async function loadProvincesAndMunicipalities() {
  try {
    const res = await fetch("http://localhost:5000/api/local-benchmarks");
    const data = await res.json();

    const grouped = data.reduce((acc, b) => {
      acc[b.province] = acc[b.province] || [];
      if (!acc[b.province].includes(b.municipality)) {
        acc[b.province].push(b.municipality);
      }
      return acc;
    }, {});

    const provinceSelect = document.getElementById("province");
    provinceSelect.innerHTML = `<option value="">-- Select Province --</option>`;
    Object.keys(grouped).forEach(prov => {
      provinceSelect.innerHTML += `<option value="${prov}">${prov}</option>`;
    });

    provinceSelect.addEventListener("change", () => {
      const muniSelect = document.getElementById("municipality");
      muniSelect.innerHTML = `<option value="">-- Select Municipality --</option>`;
      grouped[provinceSelect.value]?.forEach(muni => {
        muniSelect.innerHTML += `<option value="${muni}">${muni}</option>`;
      });
    });
  } catch (err) {
    console.error("Error loading benchmarks:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const addSourceBtn = document.getElementById("add-sme-source");
  addSourceBtn.disabled = true;

  await Promise.all([loadEmissionFactors(), loadProvincesAndMunicipalities()]);
  addSourceBtn.disabled = false;

  addSourceBtn.addEventListener("click", () => {
    const div = document.createElement("div");
    div.classList.add("source-group");
    div.innerHTML = `
      <label>Category:</label>
      <select class="category" required>
        ${window.emissionFactors.map(f => `<option value="${f.category}">${f.category}</option>`).join("")}
      </select>
      <label>Activity Data:</label>
      <input type="number" class="activityData" required min="0" step="any">
      <button type="button" class="remove-source">Remove</button>
    `;
    document.getElementById("sme-sources").appendChild(div);
    
    // Add remove functionality
    div.querySelector(".remove-source").addEventListener("click", () => div.remove());
  });

  document.getElementById("sme-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = {
      smeName: document.getElementById("smeName").value,
      businessID: document.getElementById("businessID").value,
      projectName: document.getElementById("projectName").value,
      province: document.getElementById("province").value,
      municipality: document.getElementById("municipality").value,
      sources: [...document.querySelectorAll(".source-group")].map(group => ({
        category: group.querySelector(".category").value,
        activityData: parseFloat(group.querySelector(".activityData").value)
      }))
    };

    try {
      const res = await fetch("http://localhost:5000/api/sme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      const resultsDiv = document.getElementById("sme-results");
      
      if (res.ok) {
        resultsDiv.innerHTML = `
          <h3>Results for ${data.data.smeName}</h3>
          <h4>Breakdown:</h4>
          <ul>
            ${data.data.sources.map(s => `
              <li>${s.category}: ${s.emissions.toFixed(2)} ${s.unit}</li>
            `).join("")}
          </ul>
          <p><strong>Total:</strong> ${data.data.totalEmissions.toFixed(2)} kg CO₂e</p>
          <p class="flag-${data.data.flag}">
            <strong>Status:</strong> ${data.data.flag.toUpperCase()}
          </p>
        `;
      } else {
        resultsDiv.innerHTML = `<p class="error">${data.error}</p>`;
      }
    } catch (err) {
      document.getElementById("sme-results").innerHTML = `
        <p class="error">Network error: ${err.message}</p>
      `;
    }
  });
});
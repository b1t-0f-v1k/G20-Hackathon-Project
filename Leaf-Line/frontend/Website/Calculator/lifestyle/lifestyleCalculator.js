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

    const grouped = {};
    data.forEach(b => {
      if (!grouped[b.province]) grouped[b.province] = [];
      grouped[b.province].push(b.municipality);
    });

    const provinceSelect = document.getElementById("province");
    provinceSelect.innerHTML = `<option value="">-- Select Province --</option>`;
    Object.keys(grouped).forEach(prov => {
      provinceSelect.innerHTML += `<option value="${prov}">${prov}</option>`;
    });

    provinceSelect.addEventListener("change", () => {
      const muniSelect = document.getElementById("municipality");
      muniSelect.innerHTML = `<option value="">-- Select Municipality --</option>`;
      const selectedProvince = provinceSelect.value;
      if (grouped[selectedProvince]) {
        grouped[selectedProvince].forEach(muni => {
          muniSelect.innerHTML += `<option value="${muni}">${muni}</option>`;
        });
      }
    });
  } catch (err) {
    console.error("Error loading benchmarks:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const addSourceBtn = document.getElementById("add-lifestyle-source");
  const categoriesContainer = document.getElementById("lifestyle-sources");  // Add this line

  addSourceBtn.disabled = true;

  await loadEmissionFactors();
  await loadProvincesAndMunicipalities();

  addSourceBtn.disabled = false;

  addSourceBtn.addEventListener("click", () => {   // Use addSourceBtn, not addCategoryBtn
    const div = document.createElement("div");
    div.classList.add("source-group");
    div.innerHTML = `
      <label>Category:</label>
      <select class="category" required>
        ${window.emissionFactors.map(f => `<option value="${f.category}">${f.category}</option>`).join("")}
      </select>
      <label>Activity Data:</label>
      <input type="number" class="activityData" placeholder="Enter value" required min="0" step="any">
    `;
    categoriesContainer.appendChild(div);
  });

  document.getElementById("lifestyle-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const lifestyleName = document.getElementById("lifestyleName").value;
    const province = document.getElementById("province").value;
    const municipality = document.getElementById("municipality").value;

    const sources = [...document.querySelectorAll(".source-group")].map(group => ({
      category: group.querySelector(".category").value,
      activityData: parseFloat(group.querySelector(".activityData").value)
    }));

    try {
      const res = await fetch("http://localhost:5000/api/lifestyle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lifestyleName, province, municipality, sources })
      });

      const data = await res.json();
      if (res.ok) {
        let sourcesHtml = "";
        if (data.data.sources && Array.isArray(data.data.sources)) {
          sourcesHtml = "<h4>Breakdown by Source:</h4><ul>";
          data.data.sources.forEach(src => {
            sourcesHtml += `<li>${src.category}: ${src.emissions.toFixed(2)} kg CO₂e</li>`;
          });
          sourcesHtml += "</ul>";
        }

        // Determine color based on flag value
        let flagHtml = "";
        if (data?.data?.flag) {
          let color = "black";

          switch (data.data.flag.toLowerCase()) {
            case "green":
              color = "green";
              break;
            case "yellow":
              color = "orange";
              break;
            case "red":
              color = "red";
              break;
          }

          flagHtml = `<p><strong>Flag:</strong> <span style="color:${color}">${data.data.flag}</span></p>`;
        }

        document.getElementById("lifestyle-results").innerHTML = `
          <h3>Results for ${data.data.lifestyleName}</h3>
          ${sourcesHtml}
          <p><strong>Total Emissions:</strong> ${data.data.totalEmissions.toFixed(2)} kg CO₂e</p>
          ${flagHtml}
        `;

      } else {
        document.getElementById("lifestyle-results").innerHTML = `<p class="error">${data.error}</p>`;
      }
    } catch (err) {
      document.getElementById("lifestyle-results").innerHTML = `<p class="error">Network error: ${err.message}</p>`;
    }
  });
});

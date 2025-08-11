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
  const addCategoryBtn = document.getElementById("add-lifestyle-source");
  const categoriesContainer = document.getElementById("lifestyle-sources");
  const form = document.getElementById("lifestyle-form");
  const resultsDiv = document.getElementById("lifestyle-results");

  addCategoryBtn.disabled = true;

  await loadEmissionFactors();
  await loadProvincesAndMunicipalities();

  addCategoryBtn.disabled = false;

  addCategoryBtn.addEventListener("click", () => {
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userId = document.getElementById("lifestyleName").value;
    const province = document.getElementById("province").value;
    const municipality = document.getElementById("municipality").value;

    const categories = [...categoriesContainer.querySelectorAll(".source-group")].map(group => ({
      category: group.querySelector(".category").value,
      activityData: parseFloat(group.querySelector(".activityData").value)
    }));

    try {
      const res = await fetch("http://localhost:5000/api/lifestyle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, province, municipality, categories })
      });

      const data = await res.json();
      if (res.ok) {
        let categoriesHtml = "";
        if (data.data.categories && Array.isArray(data.data.categories)) {
          categoriesHtml = "<h4>Breakdown by Category:</h4><ul>";
          data.data.categories.forEach(cat => {
            categoriesHtml += `<li>${cat.category}: ${cat.emissions.toFixed(2)} kg CO₂e</li>`;
          });
          categoriesHtml += "</ul>";
        }

        resultsDiv.innerHTML = `
          <h3>Results for ${data.data.userId}</h3>
          ${categoriesHtml}
          <p><strong>Total Emissions:</strong> ${data.data.totalEmissions.toFixed(2)} kg CO₂e</p>
          ${data.data.flag ? `<p><strong>Flag:</strong> <span style="color:${data.data.flagColor || 'black'}">${data.data.flag}</span></p>` : ""}
        `;

      } else {
        resultsDiv.innerHTML = `<p class="error">${data.error}</p>`;
      }
    } catch (err) {
      resultsDiv.innerHTML = `<p class="error">Network error: ${err.message}</p>`;
    }
  });
});

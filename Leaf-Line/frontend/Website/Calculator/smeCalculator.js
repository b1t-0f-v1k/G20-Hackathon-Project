async function loadEmissionFactors() {
  try {
    console.log("Fetching emission factors...");
    const res = await fetch("http://localhost:5000/api/emission-factors");
    console.log("Fetch status:", res.status);

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }

    const factors = await res.json();
    console.log("Emission Factors Loaded:", factors);

    if (!Array.isArray(factors) || factors.length === 0) {
      console.warn("Warning: Emission factors array is empty or invalid");
    }

    window.emissionFactors = factors; // Store globally
  } catch (err) {
    console.error("Error loading emission factors:", err);
    window.emissionFactors = [];
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Disable button initially in case it isn't disabled in HTML
  const addSourceBtn = document.getElementById("add-sme-source");
  addSourceBtn.disabled = true;

  await loadEmissionFactors();

  // Enable the add source button only after emission factors loaded
  addSourceBtn.disabled = false;

  addSourceBtn.addEventListener("click", () => {
    console.log("Add Source clicked. Emission Factors:", window.emissionFactors);

    if (!window.emissionFactors || window.emissionFactors.length === 0) {
      alert("Emission factors not loaded yet.");
      return;
    }

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

    document.getElementById("sme-sources").appendChild(div);
  });

  // Your existing form submit handler here, unchanged
  document.getElementById("sme-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const smeName = document.getElementById("smeName").value;
    const projectName = document.getElementById("projectName").value;

    const sources = [...document.querySelectorAll(".source-group")].map(group => ({
      category: group.querySelector(".category").value,
      activityData: parseFloat(group.querySelector(".activityData").value)
    }));

    try {
      const res = await fetch("http://localhost:5000/api/sme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smeName, projectName, sources })
      });

      const data = await res.json();
      const resultsDiv = document.getElementById("sme-results");

      if (res.ok) {
        resultsDiv.innerHTML = `
          <h3>Results for ${data.data.smeName}</h3>
          <p><strong>Project:</strong> ${data.data.projectName}</p>
          <p><strong>Total Emissions:</strong> ${data.data.totalEmissions.toFixed(2)} kg CO₂e</p>
          <ul>
            ${data.data.sources.map(s => `<li>${s.category}: ${s.emissions.toFixed(2)} kg CO₂e</li>`).join("")}
          </ul>
        `;
      } else {
        resultsDiv.innerHTML = `<p class="error">${data.error || "An error occurred"}</p>`;
      }
    } catch (err) {
      document.getElementById("sme-results").innerHTML = `<p class="error">Network error: ${err.message}</p>`;
    }
  });
});

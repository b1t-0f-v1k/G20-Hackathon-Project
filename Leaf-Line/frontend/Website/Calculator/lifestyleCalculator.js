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
  const addCategoryBtn = document.getElementById("add-lifestyle-source");
  const categoriesContainer = document.getElementById("lifestyle-sources");
  const form = document.getElementById("lifestyle-form");
  const resultsDiv = document.getElementById("lifestyle-results");

  addCategoryBtn.disabled = true; // Disable initially

  await loadEmissionFactors();

  addCategoryBtn.disabled = false; // Enable after load

  addCategoryBtn.addEventListener("click", () => {
    console.log("Add Category clicked. Emission Factors:", window.emissionFactors);

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

    categoriesContainer.appendChild(div);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = document.getElementById("lifestyleName").value;

    const sources = [...categoriesContainer.querySelectorAll(".source-group")].map(group => ({
      category: group.querySelector(".category").value,
      activityData: parseFloat(group.querySelector(".activityData").value)
    }));

    try {
      const res = await fetch("http://localhost:5000/api/lifestyle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, categories: sources }) // Note: key 'categories'
      });

      const data = await res.json();
      console.log("Backend response data:", data);  // Debug log

      if (res.ok && data.data && Array.isArray(data.data.categories)) {
        resultsDiv.innerHTML = `
          <h3>Results for User: ${data.data.userId || userId}</h3>
          <p><strong>Total Emissions:</strong> ${data.data.totalEmissions.toFixed(2)} kg CO₂e</p>
          <ul>
            ${data.data.categories.map(s => `<li>${s.category}: ${s.emissions.toFixed(2)} kg CO₂e</li>`).join("")}
          </ul>
        `;
      } else {
        resultsDiv.innerHTML = `<p class="error">${data.error || "No categories data returned."}</p>`;
      }
    } catch (err) {
      resultsDiv.innerHTML = `<p class="error">Network error: ${err.message}</p>`;
    }
  });
});


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

document.addEventListener("DOMContentLoaded", async () => {
  const addSourceBtn = document.getElementById("add-sme-source");
  addSourceBtn.disabled = true;
  await loadEmissionFactors();
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
      <input type="number" class="activityData" placeholder="Enter value" required min="0" step="any">
    `;
    document.getElementById("sme-sources").appendChild(div);
  });

  document.getElementById("sme-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const smeName = document.getElementById("smeName").value;
    const projectName = document.getElementById("projectName").value;
    const province = document.getElementById("province").value;
    const municipality = document.getElementById("municipality").value;

    const sources = [...document.querySelectorAll(".source-group")].map(group => ({
      category: group.querySelector(".category").value,
      activityData: parseFloat(group.querySelector(".activityData").value)
    }));

    try {
      const res = await fetch("http://localhost:5000/api/sme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smeName, projectName, province, municipality, sources })
      });

      const data = await res.json();
      if (res.ok) {
        document.getElementById("sme-results").innerHTML = `
          <h3>Results for ${data.data.smeName}</h3>
          <p><strong>Total Emissions:</strong> ${data.data.totalEmissions.toFixed(2)} kg CO₂e</p>
          <p><strong>Flag:</strong> <span style="color:${data.data.flag}">${data.data.flag}</span></p>
        `;
      } else {
        document.getElementById("sme-results").innerHTML = `<p class="error">${data.error}</p>`;
      }
    } catch (err) {
      document.getElementById("sme-results").innerHTML = `<p class="error">Network error: ${err.message}</p>`;
    }
  });
});

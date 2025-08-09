document.getElementById("add-sme-source").addEventListener("click", () => {
  const div = document.createElement("div");
  div.classList.add("source-group");
  div.innerHTML = `
    <label>Category:</label>
    <input type="text" class="category" placeholder="Electricity" required>
    <label>Activity Data:</label>
    <input type="number" class="activityData" placeholder="1200" required>
  `;
  document.getElementById("sme-sources").appendChild(div);
});

document.getElementById("sme-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const smeName = document.getElementById("smeName").value;
  const projectName = document.getElementById("projectName").value;

  const sources = [...document.querySelectorAll(".source-group")].map(group => ({
    category: group.querySelector(".category").value,
    activityData: parseFloat(group.querySelector(".activityData").value)
  }));

  try {
    const res = await fetch("http://localhost:5000/api/sme", { // Make sure URL matches backend
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ smeName, projectName, sources })
    });

    const data = await res.json();
    const resultsDiv = document.getElementById("sme-results");

    if (res.ok) {
      resultsDiv.innerHTML = `
        <h3>Results for ${data.smeName}</h3>
        <p><strong>Project:</strong> ${data.projectName}</p>
        <p><strong>Total Emissions:</strong> ${data.totalEmissions.toFixed(2)} kg CO₂e</p>
        <ul>
          ${data.sources.map(s => `<li>${s.category}: ${s.emissions.toFixed(2)} kg CO₂e</li>`).join("")}
        </ul>
      `;
    } else {
      resultsDiv.innerHTML = `<p class="error">${data.error || "An error occurred"}</p>`;
    }
  } catch (err) {
    document.getElementById("sme-results").innerHTML = `<p class="error">Network error: ${err.message}</p>`;
  }
});

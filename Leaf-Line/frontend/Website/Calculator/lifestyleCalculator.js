document.getElementById("add-lifestyle-category").addEventListener("click", () => {
  const div = document.createElement("div");
  div.classList.add("category-group");
  div.innerHTML = `
    <label>Category:</label>
    <input type="text" class="category" placeholder="Travel" required>
    <label>Activity Data:</label>
    <input type="number" class="activityData" placeholder="500" required>
  `;
  document.getElementById("lifestyle-categories").appendChild(div);
});

document.getElementById("lifestyle-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userId = document.getElementById("userId").value;

  const categories = [...document.querySelectorAll(".category-group")].map(group => ({
    category: group.querySelector(".category").value,
    activityData: parseFloat(group.querySelector(".activityData").value)
  }));

  try {
    const res = await fetch("http://localhost:5000/api/lifestyle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, categories })
    });

    const data = await res.json();
    const resultsDiv = document.getElementById("lifestyle-results");

    if (res.ok) {
      resultsDiv.innerHTML = `
        <h3>Results for User ID: ${data.userId}</h3>
        <p><strong>Total Lifestyle Emissions:</strong> ${data.totalEmissions.toFixed(2)} kg CO₂e</p>
        <ul>
          ${data.categories.map(c => `<li>${c.category}: ${c.emissions.toFixed(2)} kg CO₂e</li>`).join("")}
        </ul>
      `;
    } else {
      resultsDiv.innerHTML = `<p class="error">${data.error || "An error occurred"}</p>`;
    }
  } catch (err) {
    document.getElementById("lifestyle-results").innerHTML = `<p class="error">Network error: ${err.message}</p>`;
  }
});

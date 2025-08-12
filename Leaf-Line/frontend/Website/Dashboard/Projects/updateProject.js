document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return alert("No project ID provided");

  // Load project
  try {
    const res = await fetch(`http://localhost:5000/api/sme-projects-by-id/${id}`);
    const proj = await res.json();

    document.getElementById("smeName").value = proj.smeName;
    document.getElementById("businessID").value = proj.businessID;
    document.getElementById("projectName").value = proj.projectName;
    document.getElementById("province").value = proj.province;
    document.getElementById("municipality").value = proj.municipality;
  } catch (err) {
    alert(`Error loading project: ${err.message}`);
  }

  document.getElementById("update-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
      smeName: document.getElementById("smeName").value,
      businessID: document.getElementById("businessID").value,
      projectName: document.getElementById("projectName").value,
      province: document.getElementById("province").value,
      municipality: document.getElementById("municipality").value
    };

    try {
      const res = await fetch(`http://localhost:5000/api/sme-projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Update failed");
      alert("Project updated successfully!");
      window.location.href = "smeProjects.html";
    } catch (err) {
      alert(`Error updating project: ${err.message}`);
    }
  });
});

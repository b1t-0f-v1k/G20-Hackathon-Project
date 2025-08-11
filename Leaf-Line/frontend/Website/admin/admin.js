let accessLevel = "none";
let benchmarks = [];

// Login handling
document.getElementById("login-btn").addEventListener("click", () => {
    const pwd = document.getElementById("admin-password").value;
    const errorEl = document.getElementById("login-error");

    if (pwd === "Leaf-Admin") {
        accessLevel = "view";
        loadAdminPanel();
    } else if (pwd === "Leaf-AdminX") {
        accessLevel = "edit";
        loadAdminPanel();
    } else {
        errorEl.textContent = "Invalid password.";
    }
});

function loadAdminPanel() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
    document.getElementById("access-level").textContent = `Access Level: ${accessLevel}`;

    if (accessLevel === "edit") {
        document.getElementById("add-section").style.display = "block";
    }

    fetchBenchmarks();
}

// Fetch all benchmarks
async function fetchBenchmarks() {
    const res = await fetch("/api/admin/benchmarks");
    benchmarks = await res.json();
    renderTable();
}

// Render table rows
function renderTable() {
    const tbody = document.querySelector("#benchmark-table tbody");
    tbody.innerHTML = "";

    benchmarks.forEach(bm => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${bm.province}</td>
            <td>${bm.municipality}</td>
            <td>${accessLevel === "edit" ? `<input type="number" value="${bm.threshold}" data-id="${bm._id}" data-field="threshold">` : bm.threshold}</td>
            <td>${bm.unit || ""}</td>
            <td>${accessLevel === "edit" ? `<input type="text" value="${bm.meta?.sourceUrl || ""}" data-id="${bm._id}" data-field="meta.sourceUrl">` : (bm.meta?.sourceUrl || "")}</td>
            <td>${accessLevel === "edit" ? `<input type="date" value="${bm.meta?.lastUpdated ? bm.meta.lastUpdated.split("T")[0] : ""}" data-id="${bm._id}" data-field="meta.lastUpdated">` : (bm.meta?.lastUpdated ? new Date(bm.meta.lastUpdated).toLocaleDateString() : "")}</td>
            <td>${accessLevel === "edit" ? `<input type="text" value="${bm.meta?.notes || ""}" data-id="${bm._id}" data-field="meta.notes">` : (bm.meta?.notes || "")}</td>
            <td>
                ${accessLevel === "edit" ? `
                    <button onclick="saveBenchmark('${bm._id}')">Save</button>
                    <button onclick="deleteBenchmark('${bm._id}')">Delete</button>` : ""}
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Save benchmark changes
async function saveBenchmark(id) {
    const updatedBm = {};
    document.querySelectorAll(`input[data-id="${id}"]`).forEach(input => {
        const field = input.getAttribute("data-field");
        if (field.includes("meta.")) {
            const metaField = field.split(".")[1];
            updatedBm.meta = updatedBm.meta || {};
            updatedBm.meta[metaField] = input.value;
        } else {
            updatedBm[field] = input.value;
        }
    });

    await fetch(`/api/admin/benchmarks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBm)
    });

    fetchBenchmarks();
}

// Delete benchmark
async function deleteBenchmark(id) {
    if (!confirm("Are you sure you want to delete this benchmark?")) return;
    await fetch(`/api/admin/benchmarks/${id}`, { method: "DELETE" });
    fetchBenchmarks();
}

// Add new benchmark
document.getElementById("add-btn").addEventListener("click", async () => {
    const newBm = {
        province: document.getElementById("new-province").value,
        municipality: document.getElementById("new-municipality").value,
        threshold: Number(document.getElementById("new-threshold").value),
        unit: document.getElementById("new-unit").value,
        meta: {
            sourceUrl: document.getElementById("new-sourceUrl").value,
            lastUpdated: document.getElementById("new-lastUpdated").value,
            notes: document.getElementById("new-notes").value
        }
    };

    await fetch("/api/admin/benchmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBm)
    });

    fetchBenchmarks();

    // clear form
    document.querySelectorAll("#add-section input").forEach(input => input.value = "");
});

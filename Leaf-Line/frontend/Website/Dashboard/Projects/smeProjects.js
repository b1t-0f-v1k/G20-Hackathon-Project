document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById('loadProjects');
  const projectsList = document.getElementById('projectsList');

  btn.addEventListener('click', async () => {
    const businessID = document.getElementById('businessID').value.trim();
    if (!businessID) {
      alert('Please enter a Business ID');
      return;
    }

    projectsList.innerHTML = '<p>Loading projects...</p>';

    try {
      // Use full backend URL and encode businessID safely
      const res = await fetch(`http://localhost:5000/api/sme-projects/${encodeURIComponent(businessID)}`);
      if (!res.ok) throw new Error('Failed to fetch projects');

      const projects = await res.json();

      if (!Array.isArray(projects) || projects.length === 0) {
        projectsList.innerHTML = '<p>No projects found for this Business ID.</p>';
        return;
      }

      projectsList.innerHTML = ''; // Clear previous results

      projects.forEach(proj => {
        const card = document.createElement('div');
        card.classList.add('project-card');

        // Header with project name and flag, plus toggle button
        const header = document.createElement('div');
        header.classList.add('project-header');

        // Container for title and flag stacked vertically
        const titleFlagContainer = document.createElement('div');
        titleFlagContainer.style.display = 'flex';
        titleFlagContainer.style.flexDirection = 'column';
        titleFlagContainer.style.flexGrow = '1';  // Take up remaining space so toggle button stays on right

        const title = document.createElement('h1');
        title.textContent = proj.projectName || 'Untitled Project';
        title.style.margin = '0';  // Optional: remove bottom margin for tighter layout
        
        
        const flag = document.createElement('div');
        flag.classList.add('project-flag');
        flag.textContent = `Project Emission Status: ${proj.flag || "No flag" }`;
        flag.style.fontWeight = 'bold'; // Optional styling
        flag.style.marginTop = '4px';   // Small spacing below project name

        // Define flag colors
        const flagColors = {
          red: '#ff4d4d',     // bright red
          yellow: '#ffcc00',  // bright yellow
          green: '#28a745',   // green
          "no-data": '#6c757d' // gray for no data
        };

        // Normalize flag value to lowercase for matching
        const flagKey = (proj.flag || "").toLowerCase();

        // Apply color if found, fallback to black
        flag.style.color = flagColors[flagKey] || 'black';

        titleFlagContainer.appendChild(title);
        titleFlagContainer.appendChild(flag);

        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = "Show Details";
        toggleBtn.classList.add('toggle-details');

        header.appendChild(titleFlagContainer);
        header.appendChild(toggleBtn);

        // Details section hidden by default
        const details = document.createElement('div');
        details.classList.add('details');
        details.style.display = "none";
        details.innerHTML = `
          <p><strong>SME Name:</strong> ${proj.smeName || "N/A"}</p>
          <p><strong>Province:</strong> ${proj.province || "N/A"}</p>
          <p><strong>Municipality:</strong> ${proj.municipality || "N/A"}</p>
          <p><strong>Description:</strong> ${proj.description || "No description provided"}</p>
          <p><strong>Created At:</strong> ${proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : "N/A"}</p>
          <p><strong>Total Emissions:</strong> ${proj.totalEmissions?.toFixed(2) ?? "N/A"} kg CO2e</p>
        `;

        toggleBtn.addEventListener('click', () => {
          const isVisible = details.style.display === "block";
          details.style.display = isVisible ? "none" : "block";
          toggleBtn.textContent = isVisible ? "Show Details" : "Hide Details";
        });

        // Action buttons: Update and Delete
        const actions = document.createElement('div');
        actions.classList.add('project-actions');

        const updateBtn = document.createElement('button');
        updateBtn.textContent = "Update";
        updateBtn.classList.add('update-btn');
        updateBtn.addEventListener('click', () => {
          window.location.href = `updateProject.html?id=${proj._id}`;
        });
        updateBtn.style.margin = "20px"

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', async () => {
          if (confirm(`Are you sure you want to delete project "${proj.projectName}"?`)) {
            try {
              const delRes = await fetch(`http://localhost:5000/api/sme-projects/${proj._id}`, { method: 'DELETE' });
              if (!delRes.ok) throw new Error('Failed to delete project');
              card.remove();
            } catch (err) {
              alert(`Error: ${err.message}`);
            }
          }
        });

        actions.appendChild(updateBtn);
        actions.appendChild(deleteBtn);

        // Compose the card
        card.appendChild(header);
        card.appendChild(details);
        card.appendChild(actions);

        projectsList.appendChild(card);
      });

    } catch (err) {
      projectsList.innerHTML = `<p class="error">Error: ${err.message}</p>`;
      console.error(err);
    }
  });
});

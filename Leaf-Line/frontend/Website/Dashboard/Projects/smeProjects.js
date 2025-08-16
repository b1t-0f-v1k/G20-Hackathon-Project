document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById('loadProjects');
  const projectsList = document.getElementById('projectsList');

  // Define flag colors at the top level
  const flagColors = {
    green: '#28a745',
    yellow: '#ffc107',
    orange: '#fd7e14',
    red: '#dc3545',
    "no-data": '#6c757d'
  };

  btn.addEventListener('click', async () => {
    const businessID = document.getElementById('businessID').value.trim();
    if (!businessID) {
      alert('Please enter a Business ID');
      return;
    }

    projectsList.innerHTML = '<p>Loading projects...</p>';

    try {
      const res = await fetch(`http://localhost:5000/api/sme-projects/business-id/${encodeURIComponent(businessID)}`);
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
        titleFlagContainer.style.flexGrow = '1';

        const title = document.createElement('h1');
        title.textContent = proj.projectName || 'Untitled Project';
        title.style.margin = '0';
        
        const flag = document.createElement('div');
        flag.classList.add('project-flag');
        
        // Get the flag value from the project, default to "no-data"
        const flagValue = proj.flag ? proj.flag.toLowerCase() : "no-data";
        const flagDisplayText = flagValue === "no-data" ? "No status available" : `Status: ${flagValue.toUpperCase()}`;
        
        flag.textContent = flagDisplayText;
        flag.style.fontWeight = 'bold';
        flag.style.marginTop = '4px';
        
        // Apply the color based on the flag value
        flag.style.color = flagColors[flagValue] || flagColors["no-data"];
        
        // Add a colored circle indicator before the text
        flag.innerHTML = `
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; 
                      background-color: ${flagColors[flagValue] || flagColors["no-data"]}; 
                      margin-right: 6px;"></span>
          ${flagDisplayText}
          ${proj.totalEmissions ? `(${proj.totalEmissions.toFixed(2)} kg CO₂e)` : ''}
        `;

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
          <p><strong>Business ID:</strong> ${proj.businessID || "N/A"}</p>
          <p><strong>Project Cost:</strong> $${proj.projectCost?.toFixed(2) || "N/A"}</p>
          <p><strong>Province:</strong> ${proj.province || "N/A"}</p>
          <p><strong>Municipality:</strong> ${proj.municipality || "N/A"}</p>
          <p><strong>Status:</strong> <span style="color:${flagColors[flagValue]}">${flagValue.toUpperCase()}</span></p>
          <p><strong>Total Emissions:</strong> ${proj.totalEmissions?.toFixed(2) ?? "N/A"} kg CO₂e</p>
          <p><strong>Cost Efficiency:</strong> ${proj.projectCost ? (proj.totalEmissions / proj.projectCost).toFixed(4) : "N/A"} kg CO₂e/$</p>
          <p><strong>Created At:</strong> ${proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : "N/A"}</p>
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
        updateBtn.style.margin = "20px";

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
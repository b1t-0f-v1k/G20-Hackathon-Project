const btn = document.getElementById('loadProjectsBtn');
const projectsList = document.getElementById('projectsList');

btn.addEventListener('click', async () => {
  const businessID = document.getElementById('businessIDInput').value.trim();
  if (!businessID) {
    alert('Please enter a Business ID');
    return;
  }
  projectsList.innerHTML = '<p>Loading projects...</p>';

  try {
    const res = await fetch(`http://localhost:5000/api/sme-projects/${encodeURIComponent(businessID)}`);
    if (!res.ok) throw new Error('Failed to fetch projects');

    const data = await res.json();
    if (!data.projects || data.projects.length === 0) {
      projectsList.innerHTML = '<p>No projects found for this Business ID.</p>';
      return;
    }

    projectsList.innerHTML = ''; // clear

    data.projects.forEach(proj => {
      const div = document.createElement('div');
      div.classList.add('project-card');

      const flagColor = (proj.flag || '').toLowerCase() === 'green' ? '#4CAF50' :
                        (proj.flag || '').toLowerCase() === 'red' ? '#f44336' :
                        (proj.flag || '').toLowerCase() === 'yellow' ? '#ff9800' : '#888';

      div.innerHTML = `
        <h3>${proj.projectName || 'Untitled Project'}</h3>
        <span class="flag" style="background-color: ${flagColor}">${proj.flag || 'N/A'}</span>
        <button class="toggle-details">Show Details</button>
        <div class="details" style="display:none;">
          <pre>${JSON.stringify(proj, null, 2)}</pre>
        </div>
        <button class="update-btn">Update</button>
        <button class="delete-btn">Delete</button>
      `;

      // Toggle details
      div.querySelector('.toggle-details').addEventListener('click', () => {
        const detailsDiv = div.querySelector('.details');
        const isHidden = detailsDiv.style.display === 'none';
        detailsDiv.style.display = isHidden ? 'block' : 'none';
      });

      // Delete project
      div.querySelector('.delete-btn').addEventListener('click', async () => {
        if (confirm(`Are you sure you want to delete project "${proj.projectName}"?`)) {
          try {
            const delRes = await fetch(`http://localhost:5000/api/sme-projects/${proj._id}`, { method: 'DELETE' });
            if (!delRes.ok) throw new Error('Failed to delete project');
            div.remove();
          } catch (err) {
            alert(`Error: ${err.message}`);
          }
        }
      });

      // Update project
      div.querySelector('.update-btn').addEventListener('click', () => {
        window.location.href = `updateProject.html?id=${proj._id}`;
      });

      projectsList.appendChild(div);
    });
  } catch (err) {
    projectsList.innerHTML = `<p class="error">Error: ${err.message}</p>`;
  }
});

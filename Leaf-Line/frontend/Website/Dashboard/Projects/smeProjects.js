import { StatusManager } from './utils/StatusManager.js';

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById('loadProjects');
  const projectsList = document.getElementById('projectsList');
  const statusFilter = document.getElementById('statusFilter');
  const businessIDInput = document.getElementById('businessID');

  // Define flag colors for benchmark status
  const flagColors = {
    green: '#28a745',
    yellow: '#ffc107',
    orange: '#fd7e14',
    red: '#dc3545',
    "no-data": '#6c757d'
  };

  // Load projects when button is clicked
  btn.addEventListener('click', loadProjects);

  // Allow Enter key to trigger search
  businessIDInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loadProjects();
    }
  });

  async function loadProjects() {
    const businessID = businessIDInput.value.trim();
    if (!businessID) {
      alert('Please enter a Business ID');
      return;
    }

    projectsList.innerHTML = '<div class="loading-spinner"></div><p>Loading projects...</p>';

    try {
      // Build API URL with filters
      let url = `http://localhost:5000/api/sme-projects/business-id/${encodeURIComponent(businessID)}`;
      if (statusFilter.value) {
        url += `?status=${statusFilter.value}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load projects: ${res.statusText}`);

      const projects = await res.json();

      if (!Array.isArray(projects) || projects.length === 0) {
        projectsList.innerHTML = '<p class="no-projects">No projects found for this Business ID.</p>';
        return;
      }

      renderProjects(projects);
    } catch (err) {
      console.error('Error loading projects:', err);
      projectsList.innerHTML = `<p class="error-message">Error: ${err.message}</p>`;
    }
  }

  function renderProjects(projects) {
    projectsList.innerHTML = '';

    projects.forEach(project => {
      const card = createProjectCard(project);
      projectsList.appendChild(card);
    });
  }

  function createProjectCard(project) {
    const card = document.createElement('div');
    card.classList.add('project-card');
    const statusManager = new StatusManager(project._id);

    // Create card header
    const header = document.createElement('div');
    header.classList.add('project-header');

    // Project title and metadata
    const metaContainer = document.createElement('div');
    metaContainer.classList.add('project-meta-container');

    const title = document.createElement('h2');
    title.textContent = project.projectName || 'Untitled Project';
    title.classList.add('project-title');

    // Project status badge
    const statusValue = project.status || 'active';
    const statusBadge = createStatusBadge(statusValue);

    // Benchmark flag badge
    const flagValue = project.flag ? project.flag.toLowerCase() : "no-data";
    const flagBadge = createFlagBadge(flagValue, project.totalEmissions);

    metaContainer.appendChild(title);
    metaContainer.appendChild(statusBadge);
    metaContainer.appendChild(flagBadge);

    // Toggle details button
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = "Show Details";
    toggleBtn.classList.add('toggle-details');

    header.appendChild(metaContainer);
    header.appendChild(toggleBtn);

    // Project details section (hidden by default)
    const details = createProjectDetails(project, statusValue, flagValue);

    // Toggle details visibility
    toggleBtn.addEventListener('click', () => {
      const isVisible = details.style.display === "block";
      details.style.display = isVisible ? "none" : "block";
      toggleBtn.textContent = isVisible ? "Show Details" : "Hide Details";
    });

    // Action buttons
    const actions = document.createElement('div');
    actions.classList.add('project-actions');

    // Update button
    const updateBtn = document.createElement('button');
    updateBtn.textContent = "Update";
    updateBtn.classList.add('btn', 'btn-update');
    updateBtn.addEventListener('click', () => {
      window.location.href = `updateProject.html?id=${project._id}`;
    });

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add('btn', 'btn-delete');
    deleteBtn.addEventListener('click', () => confirmDeleteProject(project, card));

    // Status change dropdown
    const statusSelect = createStatusDropdown(statusValue, async (newStatus) => {
      try {
        await statusManager.updateStatus(newStatus);
        updateStatusDisplay(newStatus, statusBadge, details);
      } catch (err) {
        console.error('Status update failed:', err);
        alert(`Failed to update status: ${err.message}`);
        statusSelect.value = statusValue; // Revert on error
      }
    });

    const statusContainer = document.createElement('div');
    statusContainer.classList.add('status-control');
    statusContainer.innerHTML = '<span>Change Status:</span>';
    statusContainer.appendChild(statusSelect);

    actions.appendChild(updateBtn);
    actions.appendChild(deleteBtn);
    actions.appendChild(statusContainer);

    // Compose the complete card
    card.appendChild(header);
    card.appendChild(details);
    card.appendChild(actions);

    return card;
  }

  function createStatusBadge(statusValue) {
    const badge = document.createElement('div');
    badge.classList.add('status-badge');
    badge.innerHTML = `
      <span class="status-indicator" style="background-color: ${StatusManager.getStatusColor(statusValue)}"></span>
      <span class="status-text">${statusValue.toUpperCase()}</span>
    `;
    return badge;
  }

  function createFlagBadge(flagValue, totalEmissions) {
    const badge = document.createElement('div');
    badge.classList.add('flag-badge');
    const displayText = flagValue === "no-data" ? "No benchmark data" : `Benchmark: ${flagValue.toUpperCase()}`;
    badge.innerHTML = `
      <span class="flag-indicator" style="background-color: ${flagColors[flagValue] || flagColors["no-data"]}"></span>
      <span class="flag-text">${displayText}</span>
      ${totalEmissions ? `<span class="emissions">(${totalEmissions.toFixed(2)} kg CO₂e)</span>` : ''}
    `;
    return badge;
  }

  function createProjectDetails(project, statusValue, flagValue) {
    const details = document.createElement('div');
    details.classList.add('project-details');
    details.style.display = "none";
    
    const formattedDate = project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "N/A";
    const formattedUpdate = project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "N/A";
    const costEfficiency = project.projectCost ? (project.totalEmissions / project.projectCost).toFixed(4) : "N/A";

    details.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">SME Name:</span>
        <span class="detail-value">${project.smeName || "N/A"}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Business ID:</span>
        <span class="detail-value">${project.businessID || "N/A"}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value" style="color:${StatusManager.getStatusColor(statusValue)}">
          ${statusValue.toUpperCase()}
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Project Cost:</span>
        <span class="detail-value">ZAR ${project.projectCost?.toFixed(2) || "N/A"}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Location:</span>
        <span class="detail-value">${project.municipality || "N/A"}, ${project.province || "N/A"}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Benchmark Status:</span>
        <span class="detail-value" style="color:${flagColors[flagValue]}">
          ${flagValue.toUpperCase()}
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Emissions:</span>
        <span class="detail-value">${project.totalEmissions?.toFixed(2) || "N/A"} kg CO₂e</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Cost Efficiency:</span>
        <span class="detail-value">${costEfficiency} kg CO₂e/ZAR</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Created:</span>
        <span class="detail-value">${formattedDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Last Updated:</span>
        <span class="detail-value">${formattedUpdate}</span>
      </div>
    `;

    return details;
  }

  function createStatusDropdown(currentStatus, onChangeHandler) {
    const select = document.createElement('select');
    select.classList.add('status-select');
    
    StatusManager.getStatusOptions().forEach(option => {
      const optElement = document.createElement('option');
      optElement.value = option.value;
      optElement.textContent = option.label;
      optElement.selected = option.value === currentStatus;
      select.appendChild(optElement);
    });

    select.addEventListener('change', (e) => {
      onChangeHandler(e.target.value);
    });

    return select;
  }

  function updateStatusDisplay(newStatus, statusBadge, detailsElement) {
    // Update status badge
    const indicator = statusBadge.querySelector('.status-indicator');
    const text = statusBadge.querySelector('.status-text');
    
    indicator.style.backgroundColor = StatusManager.getStatusColor(newStatus);
    text.textContent = newStatus.toUpperCase();

    // Update details display
    const statusDetail = detailsElement.querySelector('.detail-row:nth-child(3) .detail-value');
    statusDetail.textContent = newStatus.toUpperCase();
    statusDetail.style.color = StatusManager.getStatusColor(newStatus);
  }

  async function confirmDeleteProject(project, cardElement) {
    if (!confirm(`Are you sure you want to delete project "${project.projectName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/sme-projects/${project._id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to delete project');
      }

      cardElement.remove();
    } catch (err) {
      console.error('Delete failed:', err);
      alert(`Error: ${err.message}`);
    }
  }
});
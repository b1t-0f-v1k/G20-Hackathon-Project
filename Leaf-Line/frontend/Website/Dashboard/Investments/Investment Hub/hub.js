document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById('loadProjects');
    const projectsList = document.getElementById('projectsList');
    const searchTypeSelect = document.getElementById('searchType');
    
    // Modal elements
    const modal = document.getElementById("investModal");
    const closeBtn = document.querySelector(".close");
    const confirmInvestBtn = document.getElementById("confirmInvest");
    const investorIDInput = document.getElementById("investorIDInput");
    let currentProjectId = null;

    // Modal event listeners
    closeBtn.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    confirmInvestBtn.addEventListener("click", investInProject);

    btn.addEventListener('click', async () => {
        const name = document.getElementById('name').value.trim();
        const searchType = searchTypeSelect.value;
        
        if (!name) {
            alert('Please enter a Business/Project Name');
            return;
        }

        projectsList.innerHTML = '<p>Loading projects...</p>';

        try {
            let projects = [];
            
            if (searchType === 'both') {
                // Search both endpoints in parallel
                const [projectRes, businessRes] = await Promise.all([
                    fetchProjectByName(name),
                    fetchProjectsByBusinessName(name)
                ]);
                
                projects = [...projectRes, ...businessRes];
                
                // Remove duplicates
                projects = projects.filter((project, index, self) =>
                    index === self.findIndex(p => p._id === project._id)
                );
            } else if (searchType === 'project') {
                projects = await fetchProjectByName(name);
            } else if (searchType === 'business') {
                projects = await fetchProjectsByBusinessName(name);
            }

            if (projects.length === 0) {
                const message = searchType === 'both' 
                    ? 'No projects found matching this name as either project or business name.'
                    : `No projects found matching this ${searchType === 'project' ? 'project' : 'business'} name.`;
                
                projectsList.innerHTML = `<p>${message}</p>`;
                return;
            }

            displayProjects(projects);

        } catch (err) {
            projectsList.innerHTML = `<p class="error">Error: ${err.message}</p>`;
            console.error('Fetch error:', err);
        }
    });

    // Helper function to fetch by project name
    async function fetchProjectByName(name) {
        const res = await fetch(`http://localhost:5000/api/sme-projects/project-name/${encodeURIComponent(name)}`);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch projects by name. Status: ${res.status}`);
        }
        return await res.json();
    }

    // Helper function to fetch by business name
    async function fetchProjectsByBusinessName(name) {
        const res = await fetch(`http://localhost:5000/api/sme-projects/business-name/${encodeURIComponent(name)}`);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch projects by business name. Status: ${res.status}`);
        }
        return await res.json();
    }

    // Function to display projects
    function displayProjects(projects) {
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
            flag.textContent = `Project Emission Status: ${proj.flag || "No flag" }`;
            flag.style.fontWeight = 'bold';
            flag.style.marginTop = '4px';

            // Define flag colors
            const flagColors = {
                red: '#ff4d4d',
                yellow: '#ffcc00',
                green: '#28a745',
                "no-data": '#6c757d'
            };

            const flagKey = (proj.flag || "").toLowerCase();
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

            // Add Invest Now button
            const investBtn = document.createElement('button');
            investBtn.textContent = "Invest Now";
            investBtn.classList.add('invest-now-btn');
            investBtn.addEventListener('click', () => {
                currentProjectId = proj._id; // Store the project ID
                modal.style.display = "block";
            });
            details.appendChild(investBtn);

            toggleBtn.addEventListener('click', () => {
                const isVisible = details.style.display === "block";
                details.style.display = isVisible ? "none" : "block";
                toggleBtn.textContent = isVisible ? "Show Details" : "Hide Details";
            });

            card.appendChild(header);
            card.appendChild(details);
            projectsList.appendChild(card);
        });
    }

    // Function to handle investment
    async function investInProject() {
        const investorID = investorIDInput.value.trim();
        if (!investorID) {
            alert('Please enter your Investor ID');
            return;
        }

        try {
            // 1. Get the project data
            const projectRes = await fetch(`http://localhost:5000/api/sme-projects/${currentProjectId}`);
            if (!projectRes.ok) {
                const errorData = await projectRes.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch project. Status: ${projectRes.status}`);
            }
            const project = await projectRes.json();

            // 2. Create investment
            const investmentRes = await fetch('http://localhost:5000/api/investments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    investorID,
                    smeName: project.smeName,
                    projectName: project.projectName,
                    businessID: project.businessID,
                    province: project.province,
                    municipality: project.municipality,
                    sources: project.sources,
                    totalEmissions: project.totalEmissions,
                    flag: project.flag,
                    benchmarkUsed: project.benchmarkUsed
                })
            });

            if (!investmentRes.ok) {
                const errorData = await investmentRes.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to create investment. Status: ${investmentRes.status}`);
            }

            alert('Investment successful!');
            modal.style.display = "none";
            investorIDInput.value = "";
        } catch (err) {
            console.error('Investment error:', err);
            alert(`Investment failed: ${err.message}`);
        }
    }
});
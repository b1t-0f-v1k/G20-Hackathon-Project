document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const filterType = document.getElementById('filterType');
    const sortBy = document.getElementById('sortBy');
    const resetFilters = document.getElementById('resetFilters');
    const projectsList = document.getElementById('projectsList');
    const resultsCount = document.getElementById('resultsCount');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    // Modal elements
    const modal = document.getElementById("investModal");
    const closeBtn = document.querySelector(".close");
    const confirmInvestBtn = document.getElementById("confirmInvest");
    const investorIDInput = document.getElementById("investorIDInput");
    const investmentAmount = document.getElementById("investmentAmount");
    
    // State variables
    let currentProjectId = null;
    let allProjects = [];
    let filteredProjects = [];
    const itemsPerPage = 9;
    let currentPage = 1;
    let totalPages = 1;

    // Initialize the page
    init();

    function init() {
        // Load all projects initially
        loadAllProjects();
        
        // Event listeners
        searchBtn.addEventListener('click', handleSearch);
        resetFilters.addEventListener('click', resetAllFilters);
        filterType.addEventListener('change', applyFilters);
        sortBy.addEventListener('change', applyFilters);
        prevPageBtn.addEventListener('click', goToPreviousPage);
        nextPageBtn.addEventListener('click', goToNextPage);
        
        // Modal events
        closeBtn.onclick = closeModal;
        window.onclick = (event) => {
            if (event.target == modal) closeModal();
        };
        confirmInvestBtn.addEventListener("click", investInProject);
        
        // Allow Enter key to trigger search
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    async function loadAllProjects() {
        try {
            projectsList.innerHTML = '<div class="loading">Loading projects...</div>';
            
            const response = await fetch('http://localhost:5000/api/sme-projects');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            allProjects = await response.json();
            
            // Normalize flag values to lowercase
            allProjects = allProjects.map(project => ({
                ...project,
                flag: (project.flag || "no-data").toLowerCase()
            }));
            
            applyFilters();
        } catch (error) {
            console.error('Error loading projects:', error);
            projectsList.innerHTML = `<div class="error">Error loading projects: ${error.message}</div>`;
        }
    }

    function handleSearch() {
        currentPage = 1; // Reset to first page on new search
        applyFilters();
    }

    function applyFilters() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedFilter = filterType.value;
        const [sortField, sortDirection] = sortBy.value.split('-');
        
        // Filter projects based on search term and filter type
        filteredProjects = allProjects.filter(project => {
            if (!searchTerm) return true;
            
            switch(selectedFilter) {
                case 'projectName':
                    return project.projectName?.toLowerCase().includes(searchTerm);
                case 'smeName':
                    return project.smeName?.toLowerCase().includes(searchTerm);
                case 'province':
                    return project.province?.toLowerCase().includes(searchTerm);
                case 'municipality':
                    return project.municipality?.toLowerCase().includes(searchTerm);
                case 'flag':
                    return project.flag?.includes(searchTerm);
                default:
                    return (
                        project.projectName?.toLowerCase().includes(searchTerm) ||
                        project.smeName?.toLowerCase().includes(searchTerm)
                    );
            }
        });
        
        // Sort projects
        filteredProjects.sort((a, b) => {
            let valueA, valueB;
            
            // Handle different sort fields
            switch(sortField) {
                case 'projectCost':
                    valueA = a.projectCost || 0;
                    valueB = b.projectCost || 0;
                    break;
                case 'totalEmissions':
                    valueA = a.totalEmissions || 0;
                    valueB = b.totalEmissions || 0;
                    break;
                case 'createdAt':
                    valueA = new Date(a.createdAt || 0);
                    valueB = new Date(b.createdAt || 0);
                    break;
                default:
                    valueA = a.projectName || '';
                    valueB = b.projectName || '';
            }
            
            // Apply sort direction
            if (sortDirection === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });
        
        updatePagination();
        displayProjects();
    }

    function displayProjects() {
        if (filteredProjects.length === 0) {
            projectsList.innerHTML = '<div class="no-results">No projects found matching your criteria.</div>';
            return;
        }
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const projectsToShow = filteredProjects.slice(startIndex, endIndex);
        
        projectsList.innerHTML = '';
        
        projectsToShow.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            
            // Format project cost
            const formattedCost = project.projectCost 
                ? `ZAR${project.projectCost.toLocaleString()}` 
                : 'Not specified';
            
            // Format emissions
            const formattedEmissions = project.totalEmissions 
                ? `${project.totalEmissions.toFixed(2)} kg CO₂` 
                : 'Not available';
            
            // Format date
            const formattedDate = project.createdAt 
                ? new Date(project.createdAt).toLocaleDateString() 
                : 'Unknown';
            
            // Determine flag class
            const flagClass = `flag-${project.flag || 'no-data'}`;
            
            card.innerHTML = `
                <div class="project-header">
                    <div>
                        <h3 class="project-title">${project.projectName || 'Unnamed Project'}</h3>
                        <div class="project-flag ${flagClass}">
                            ${(project.flag || 'no-data').toUpperCase()}
                        </div>
                    </div>
                </div>
                
                <div class="project-body">
                    <div class="project-meta">
                        <span class="meta-item">
                            <i class="fas fa-building"></i> ${project.smeName || 'N/A'}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-map-marker-alt"></i> ${project.province || 'N/A'}, ${project.municipality || 'N/A'}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-calendar-alt"></i> ${formattedDate}
                        </span>
                    </div>
                    
                    <div class="project-cost">${formattedCost}</div>
                    <div class="project-description">${project.description || 'No description available.'}</div>
                    
                    <div class="project-actions">
                        <button class="invest-button" data-project-id="${project._id}">
                            <i class="fas fa-hand-holding-usd"></i> Invest
                        </button>
                    </div>
                </div>
            `;
            
            projectsList.appendChild(card);
        });
        
        // Add event listeners to all invest buttons
        document.querySelectorAll('.invest-button').forEach(button => {
            button.addEventListener('click', (e) => {
                currentProjectId = e.target.closest('button').dataset.projectId;
                modal.style.display = "block";
            });
        });
        
        // Update results count
        resultsCount.textContent = filteredProjects.length;
    }

    function updatePagination() {
        totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
        
        // Update page info
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        
        // Enable/disable pagination buttons
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    function goToPreviousPage() {
        if (currentPage > 1) {
            currentPage--;
            displayProjects();
            updatePagination();
        }
    }

    function goToNextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            displayProjects();
            updatePagination();
        }
    }

    function resetAllFilters() {
        searchInput.value = '';
        filterType.value = 'projectName';
        sortBy.value = 'createdAt-desc';
        currentPage = 1;
        applyFilters();
    }

    function closeModal() {
        modal.style.display = "none";
        investorIDInput.value = "";
        investmentAmount.value = "";
    }

    async function investInProject() {
        const investorId = investorIDInput.value.trim();
        const amount = parseFloat(investmentAmount.value);
        
        if (!investorId) {
            alert('Please enter your Investor ID');
            return;
        }
        
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid investment amount');
            return;
        }
        
        try {
            // 1. Get the project data
            const projectRes = await fetch(`http://localhost:5000/api/sme-projects/${currentProjectId}`);
            if (!projectRes.ok) {
                throw new Error(`Failed to fetch project: ${projectRes.status}`);
            }
            const project = await projectRes.json();
            
            // 2. Create investment in MongoDB
            const investmentRes = await fetch('http://localhost:5000/api/investments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    investorID: investorId,
                    smeName: project.smeName,
                    projectName: project.projectName,
                    businessID: project.businessID,
                    province: project.province,
                    municipality: project.municipality,
                    sources: project.sources || [], // Ensure sources is an array
                    totalEmissions: project.totalEmissions || 0, // Default to 0 if undefined
                    flag: project.flag ? project.flag.toLowerCase() : "no-data",
                    benchmarkUsed: project.benchmarkUsed || null,
                    projectCost: project.projectCost || 0, // Default to 0 if undefined
                    investmentAmount: amount,
                    status: "active" // Set default status
                })
            });
            
            const responseData = await investmentRes.json();
            
            if (!investmentRes.ok) {
                throw new Error(responseData.message || 'Failed to create investment');
            }
            
            alert('Investment successful!');
            closeModal();
            
            // Refresh projects list to reflect changes
            await loadAllProjects();
            
            // Store investorID for future reference
            localStorage.setItem('investorID', investorId);
            
        } catch (error) {
            console.error('Investment error:', error);
            alert(`Investment failed: ${error.message}`);
        }
    }
});
// Chart instances storage
let chartInstances = {};
let investorID = null;
let allInvestments = [];

document.addEventListener("DOMContentLoaded", () => {
    // Hide dashboard initially
    document.querySelector('.topbar').style.display = 'none';
    document.querySelector('.summary-cards').style.display = 'none';
    document.querySelector('.dashboard-controls').style.display = 'none';
    document.querySelector('.dashboard-container').style.display = 'none';

    // Always show auth form initially
    document.getElementById('authContainer').style.display = 'flex';
    
    // Set up auth form submission
    document.getElementById('authForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const enteredID = document.getElementById('investorIdInput').value.trim();
        
        if (!enteredID) {
            alert("Please enter your Investor ID");
            return;
        }
        
        await verifyInvestorID(enteredID);
    });
    
    // Set up refresh button listener (will be enabled after auth)
    document.getElementById('refreshBtn').addEventListener('click', loadInvestments);
    
    // Set up section navigation (will be enabled after auth)
    document.querySelectorAll('.chart-toggle').forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            document.querySelectorAll('.chart-toggle').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            // Show selected section
            showSection(button.dataset.chart);
        });
    });
});

async function verifyInvestorID(id) {
    try {
        // Show loading state
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        loginBtn.disabled = true;
        
        // Verify the investor ID with the backend
        const response = await fetch(`http://localhost:5000/api/investor/id`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                investorID: id
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Invalid Investor ID');
        }
        
        const investorData = await response.json();
        
        // Store the ID
        localStorage.setItem('investorID', id);
        investorID = id;
        
        // Update the URL without reloading
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('investorID', id);
        window.history.pushState({}, '', newUrl);
        
        // Hide auth form and show dashboard
        document.getElementById('authContainer').style.display = 'none';
        document.querySelector('.topbar').style.display = 'block';
        document.querySelector('.summary-cards').style.display = 'flex';
        document.querySelector('.dashboard-controls').style.display = 'flex';
        document.querySelector('.dashboard-container').style.display = 'grid';
        
        // Set investor info
        document.getElementById('investorID').textContent = `ID: ${investorID}`;
        if (investorData.data?.name) {
            document.getElementById('investorName').textContent = investorData.data.name;
        }
        
        // Load investments
        loadInvestments();
        
    } catch (error) {
        console.error('Verification error:', error);
        alert(`Error: ${error.message}`);
        
        // Reset login button
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> View Dashboard';
        loginBtn.disabled = false;
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.chart-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const section = document.getElementById(`${sectionId}-section`);
    if (section) {
        section.classList.remove('hidden');
        
        // Force chart resize after a small delay
        setTimeout(() => {
            Object.values(chartInstances).forEach(chart => {
                if (chart) chart.resize();
            });
        }, 50);
    }
}

async function loadInvestments() {
    try {
        // Show loading state
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        refreshBtn.disabled = true;
        
        const response = await fetch(`http://localhost:5000/api/investments/investor/${investorID}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        allInvestments = data.data || [];
        
        // Update summary
        document.getElementById('totalInvested').textContent = `ZAR ${data.totalInvested?.toLocaleString() || '0'}`;
        document.getElementById('activeProjects').textContent = allInvestments.filter(i => i.status === 'active').length;
        
        const totalCO2 = allInvestments.reduce((sum, inv) => sum + (inv.totalEmissions || 0), 0);
        document.getElementById('totalEmissions').textContent = `${totalCO2.toFixed(2)} kg CO₂`;
        
        // Create charts
        destroyAllCharts();
        createInvestmentAmountChart();
        createInvestmentDistributionChart();
        createSectorBreakdownChart();
        createRoiChart();
        createCostEfficiencyChart();
        createProvinceDistributionChart();
        
        // Show overview section by default
        showSection('overview');
        
    } catch (error) {
        console.error("Error loading investments:", error);
        alert(`Error: ${error.message}`);
    } finally {
        // Reset refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        refreshBtn.disabled = false;
    }
}

function destroyAllCharts() {
    // Destroy all chart instances
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
    
    // Clear the chart instances object
    chartInstances = {};
    
    // Clear canvas elements
    document.querySelectorAll('canvas').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

function createInvestmentAmountChart() {
    const container = document.querySelector('#overview-section .chart-container:first-child');
    const canvas = container.querySelector('canvas');
    canvas.id = 'investmentAmountChart';
    
    // Sort investments by amount (descending)
    const sortedInvestments = [...allInvestments].sort((a, b) => b.investmentAmount - a.investmentAmount);
    
    chartInstances.investmentAmount = new Chart(canvas, {
        type: "bar",
        data: {
            labels: sortedInvestments.map(p => p.projectName || 'Unnamed Project'),
            datasets: [{
                label: "Investment Amount (ZAR)",
                data: sortedInvestments.map(p => p.investmentAmount),
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Investments by Amount"
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: "ZAR" },
                    beginAtZero: true
                },
                y: { 
                    title: { display: true, text: "Project" },
                    ticks: {
                        autoSkip: false
                    }
                }
            }
        }
    });
}

function createInvestmentDistributionChart() {
    const container = document.querySelector('#overview-section .chart-container:nth-child(2)');
    const canvas = container.querySelector('canvas');
    canvas.id = 'investmentDistributionChart';

    // Group by project type or category (using SME name as proxy here)
    const categories = [...new Set(allInvestments.map(i => i.smeName))];
    const categoryData = categories.map(category => {
        const investments = allInvestments.filter(i => i.smeName === category);
        return {
            category,
            total: investments.reduce((sum, i) => sum + i.investmentAmount, 0)
        };
    });

    chartInstances.investmentDistribution = new Chart(canvas, {
        type: "pie",
        data: {
            labels: categoryData.map(c => c.category),
            datasets: [{
                data: categoryData.map(c => c.total),
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
                    "#FF9F40", "#8AC24A", "#EA80FC", "#00ACC1", "#FF5722"
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Investment Distribution by SME"
                },
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ZAR ${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createSectorBreakdownChart() {
    const container = document.querySelector('#breakdown-section .chart-container');
    const canvas = container.querySelector('canvas');
    canvas.id = 'sectorBreakdownChart';
    
    // Group by sector (using SME name as proxy here)
    const sectors = [...new Set(allInvestments.map(i => i.smeName))];
    
    chartInstances.sectorBreakdown = new Chart(canvas, {
        type: "bar",
        data: {
            labels: sectors,
            datasets: [{
                label: "Investment Amount (ZAR)",
                data: sectors.map(sector => {
                    return allInvestments
                        .filter(i => i.smeName === sector)
                        .reduce((sum, i) => sum + i.investmentAmount, 0);
                }),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Investment by Sector"
                }
            },
            scales: {
                y: { 
                    title: { display: true, text: "ZAR" },
                    beginAtZero: true
                },
                x: { 
                    title: { display: true, text: "Sector" },
                    ticks: {
                        autoSkip: false
                    }
                }
            }
        }
    });
}

function createRoiChart() {
    const container = document.querySelector('#performance-section .chart-container:first-child');
    const canvas = container.querySelector('canvas');
    canvas.id = 'roiChart';
    
    // Calculate ROI (simplified as emissions per ZAR invested)
    const roiData = allInvestments.map(i => ({
        project: i.projectName,
        roi: i.totalEmissions / i.investmentAmount // kg CO₂ per ZAR
    })).sort((a, b) => b.roi - a.roi);
    
    chartInstances.roiChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: roiData.map(d => d.project),
            datasets: [{
                label: "CO₂ Offset per ZAR (kg/ZAR)",
                data: roiData.map(d => d.roi),
                backgroundColor: roiData.map(d => {
                    // Color based on ROI performance
                    if (d.roi > 0.1) return "rgba(40, 167, 69, 0.8)"; // Green - high efficiency
                    if (d.roi > 0.05) return "rgba(255, 193, 7, 0.8)"; // Yellow - medium
                    return "rgba(220, 53, 69, 0.8)"; // Red - low efficiency
                }),
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Carbon Efficiency (Higher is Better)"
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: "kg CO₂ per ZAR" },
                    beginAtZero: true
                },
                y: { 
                    title: { display: true, text: "Project" },
                    ticks: {
                        autoSkip: false
                    }
                }
            }
        }
    });
}

function createCostEfficiencyChart() {
    const container = document.querySelector('#performance-section .chart-container:nth-child(2)');
    const canvas = container.querySelector('canvas');
    canvas.id = 'costEfficiencyChart';
    
    // Calculate cost efficiency (ZAR per kg CO₂ offset)
    const efficiencyData = allInvestments.map(i => ({
        project: i.projectName,
        efficiency: i.investmentAmount / i.totalEmissions // ZAR per kg CO₂
    })).sort((a, b) => a.efficiency - b.efficiency);
    
    chartInstances.costEfficiency = new Chart(canvas, {
        type: "bar",
        data: {
            labels: efficiencyData.map(d => d.project),
            datasets: [{
                label: "Cost per kg CO₂ Offset (ZAR/kg)",
                data: efficiencyData.map(d => d.efficiency),
                backgroundColor: efficiencyData.map(d => {
                    // Color based on efficiency
                    if (d.efficiency < 50) return "rgba(40, 167, 69, 0.8)"; // Green - high efficiency
                    if (d.efficiency < 100) return "rgba(255, 193, 7, 0.8)"; // Yellow - medium
                    return "rgba(220, 53, 69, 0.8)"; // Red - low efficiency
                }),
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Cost Efficiency (Lower is Better)"
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: "ZAR per kg CO₂" },
                    beginAtZero: true
                },
                y: { 
                    title: { display: true, text: "Project" },
                    ticks: {
                        autoSkip: false
                    }
                }
            }
        }
    });
}

function createProvinceDistributionChart() {
    const container = document.querySelector('#geographic-section .chart-container');
    const canvas = container.querySelector('canvas');
    canvas.id = 'provinceDistributionChart';
    
    // Group by province
    const provinces = [...new Set(allInvestments.map(i => i.province))];
    const provinceData = provinces.map(province => {
        const investments = allInvestments.filter(i => i.province === province);
        return {
            province,
            count: investments.length,
            totalAmount: investments.reduce((sum, i) => sum + i.investmentAmount, 0),
            totalEmissions: investments.reduce((sum, i) => sum + (i.totalEmissions || 0), 0)
        };
    });
    
    chartInstances.provinceDistribution = new Chart(canvas, {
        type: "bar",
        data: {
            labels: provinceData.map(d => d.province),
            datasets: [
                {
                    label: "Investment Amount (ZAR)",
                    data: provinceData.map(d => d.totalAmount),
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: "CO₂ Offset (kg)",
                    data: provinceData.map(d => d.totalEmissions),
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Investment by Province"
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: "ZAR" }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: "kg CO₂" },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: { 
                    title: { display: true, text: "Province" },
                    ticks: {
                        autoSkip: false
                    }
                }
            }
        }
    });
}
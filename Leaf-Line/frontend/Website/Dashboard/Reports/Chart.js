// Chart instances storage
let chartInstances = {};

document.getElementById("loadGraphBtn").addEventListener("click", async () => {
    const businessID = document.getElementById("businessIdInput").value.trim();
    if (!businessID) {
        alert("Please enter a business ID");
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/sme-projects/business-id/${businessID}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const projects = await res.json();
        console.log("API Response:", projects);

        if (!projects?.length) {
            alert("No projects found for this Business ID");
            return;
        }

        // Clear previous charts
        destroyAllCharts();
        
        // Create all charts
        createTotalEmissionsChart(projects);
        createEmissionsDistributionChart(projects);
        createStackedEmissionsChart(projects);
        createEmissionsTrendChart(projects);
        createRadarComparisonChart(projects);
        createEfficiencyChart(projects);
        createCostEmissionsChart(projects);
        createCostEfficiencyChart(projects);

        // Show overview section by default
        showSection('overview');

    } catch (error) {
        console.error("Error:", error);
        alert(`Error: ${error.message}`);
    }
});

function destroyAllCharts() {
    // Destroy all chart instances
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
    
    // Clear the chart instances object
    chartInstances = {};
    
    // Don't remove canvas elements since they're explicitly defined in HTML
    // Just clear their contents if needed
    document.querySelectorAll('canvas').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

function createTotalEmissionsChart(projects) {
    const container = document.querySelector('#overview-section .chart-container:first-child');
    const canvas = container.querySelector('canvas');
    canvas.id = 'totalEmissionsChart';
    
    if (!projects.every(p => p.projectName && typeof p.totalEmissions === 'number')) {
        console.error("Invalid data for Total Emissions Chart");
        return;
    }

    chartInstances.totalEmissions = new Chart(canvas, {
        type: "bar",
        data: {
            labels: projects.map(p => p.projectName),
            datasets: [{
                label: "Total Emissions (kg CO₂)",
                data: projects.map(p => p.totalEmissions),
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
                    text: "Total Emissions by Project"
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: "kg CO₂" },
                    beginAtZero: true
                },
                y: { title: { display: true, text: "Project" } }
            }
        }
    });
}

function createEmissionsDistributionChart(projects) {
    const container = document.querySelector('#overview-section .chart-container:nth-child(2)');
    const canvas = container.querySelector('canvas');
    canvas.id = 'emissionsDistributionChart';

    if (!projects.every(p => p.projectName && typeof p.totalEmissions === 'number')) {
        console.error("Invalid data for Emissions Distribution Chart");
        return;
    }

    chartInstances.emissionsDistribution = new Chart(canvas, {
        type: "pie",
        data: {
            labels: projects.map(p => p.projectName),
            datasets: [{
                data: projects.map(p => p.totalEmissions),
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
                    text: "Emissions Distribution"
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function createStackedEmissionsChart(projects) {
    const container = document.querySelector('#breakdown-section .chart-container');
    const canvas = container.querySelector('canvas');
    canvas.id = 'stackedEmissionsChart';
    
    const allCategories = [...new Set(projects.flatMap(p => p.sources?.map(s => s.category) || []))];
    
    if (allCategories.length === 0) {
        console.error("No categories found for Stacked Emissions Chart");
        return;
    }

    chartInstances.stackedEmissions = new Chart(canvas, {
        type: "bar",
        data: {
            labels: projects.map(p => p.projectName),
            datasets: allCategories.map((category, i) => ({
                label: category,
                data: projects.map(project => {
                    const source = project.sources?.find(s => s.category === category);
                    return source ? source.emissions : 0;
                }),
                backgroundColor: `hsl(${(i * 360 / allCategories.length)}, 70%, 50%)`
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Emissions by Category (Stacked)"
                }
            },
            scales: {
                x: { 
                    stacked: true,
                    title: { display: true, text: "kg CO₂" },
                    beginAtZero: true
                },
                y: { 
                    stacked: true,
                    title: { display: true, text: "Project" }
                }
            }
        }
    });
}

function createEmissionsTrendChart(projects) {
    const container = document.querySelector('#trend-section .chart-container');
    const canvas = container.querySelector('canvas');
    canvas.id = 'emissionsTrendChart';
    
    const datedProjects = projects.filter(p => p.date);
    if (datedProjects.length === 0) {
        console.error("No dated projects for Emissions Trend Chart");
        return;
    }
    
    const sortedProjects = [...datedProjects].sort((a, b) => new Date(a.date) - new Date(b.date));

    chartInstances.emissionsTrend = new Chart(canvas, {
        type: "line",
        data: {
            labels: sortedProjects.map(p => new Date(p.date).toLocaleDateString()),
            datasets: [{
                label: "Total Emissions",
                data: sortedProjects.map(p => p.totalEmissions),
                borderColor: "#FF6384",
                backgroundColor: "rgba(255, 99, 132, 0.1)",
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Emissions Trend Over Time"
                }
            },
            scales: {
                y: { 
                    title: { display: true, text: "kg CO₂" },
                    beginAtZero: true
                },
                x: { title: { display: true, text: "Date" } }
            }
        }
    });
}

function createRadarComparisonChart(projects) {
    const container = document.querySelector('#comparison-section .chart-container:first-child');
    const canvas = container.querySelector('canvas');
    canvas.id = 'radarComparisonChart';

    chartInstances.radarComparison = new Chart(canvas, {
        type: "radar",
        data: {
            labels: ["Total Emissions", "Efficiency", "Categories", "Benchmark Score"],
            datasets: projects.map((project, i) => ({
                label: project.projectName,
                data: [
                    project.totalEmissions,
                    project.sources ? project.totalEmissions / project.sources.length : 0,
                    project.sources ? project.sources.length : 0,
                    Math.random() * 100
                ],
                backgroundColor: `rgba(${i * 50}, ${i * 70}, ${i * 90}, 0.2)`,
                borderColor: `rgba(${i * 50}, ${i * 70}, ${i * 90}, 1)`,
                borderWidth: 1
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Project Comparison"
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
}

function createEfficiencyChart(projects) {
    const container = document.querySelector('#comparison-section .chart-container:nth-child(2)');
    const canvas = container.querySelector('canvas');
    canvas.id = 'efficiencyChart';
    
    const validProjects = projects.filter(p => p.sources && p.sources.length > 0);
    if (validProjects.length === 0) {
        console.error("No valid projects for Efficiency Chart");
        return;
    }

    const efficiencyData = validProjects.map(p => ({
        project: p.projectName,
        efficiency: p.totalEmissions / p.sources.length
    }));

    chartInstances.efficiencyChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: efficiencyData.map(d => d.project),
            datasets: [{
                label: "Emissions per Category (kg CO₂/category)",
                data: efficiencyData.map(d => d.efficiency),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
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
                    text: "Project Efficiency"
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: "kg CO₂ per Category" },
                    beginAtZero: true
                },
                y: { title: { display: true, text: "Project" } }
            }
        }
    });
}

function createCostEmissionsChart(projects) {
    const canvas = document.getElementById('costEmissionsChart');
    if (!canvas) {
        console.error("Cost Emissions Chart canvas not found");
        return;
    }
    
    const validProjects = projects.filter(p => 
        typeof p.projectCost === 'number' && 
        typeof p.totalEmissions === 'number' &&
        !isNaN(p.projectCost) && 
        !isNaN(p.totalEmissions)
    );
    
    if (validProjects.length === 0) {
        console.error("No valid projects for Cost Emissions Chart");
        canvas.parentElement.innerHTML = '<p class="error-message">No valid cost/emissions data available</p>';
        return;
    }
    const data = {
        datasets: [{
            label: 'Projects',
            data: validProjects.map(p => ({
                x: p.projectCost,
                y: p.totalEmissions,
                project: p.projectName,
                efficiency: (p.totalEmissions / p.projectCost).toFixed(2),
                flag: p.flag?.toLowerCase() || 'no-data'
            })),
            backgroundColor: validProjects.map(p => {
                const flag = p.flag?.toLowerCase() || 'no-data';
                const colors = {
                    'green': 'rgba(40, 167, 69, 0.8)',
                    'yellow': 'rgba(255, 193, 7, 0.8)',
                    'orange': 'rgba(253, 126, 20, 0.8)',
                    'red': 'rgba(220, 53, 69, 0.8)',
                    'no-data': 'rgba(108, 117, 125, 0.8)'
                };
                return colors[flag];
            }),
            borderColor: '#fff',
            borderWidth: 1,
            radius: 8,
            hoverRadius: 10
        }]
    };

    chartInstances.costEmissions = new Chart(canvas, {
        type: 'bubble',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Cost vs Emissions Analysis',
                    font: { size: 16 }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const p = context.raw;
                            return [
                                `Project: ${p.project}`,
                                `Cost: $${p.x.toLocaleString()}`,
                                `Emissions: ${p.y.toFixed(2)} kg CO₂`,
                                `Efficiency: ${p.efficiency} kg CO₂/$`,
                                `Status: ${p.flag.toUpperCase()}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Project Cost ($)',
                        font: { weight: 'bold' }
                    },
                    ticks: {
                        callback: (value) => '$' + value.toLocaleString()
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Total Emissions (kg CO₂)',
                        font: { weight: 'bold' }
                    }
                }
            }
        }
    });
}

function createCostEfficiencyChart(projects) {
    const canvas = document.getElementById('costEfficiencyChart');
    if (!canvas) {
        console.error("Cost Efficiency Chart canvas not found");
        return;
    }
    
    const validProjects = projects.filter(p => 
        typeof p.projectCost === 'number' && 
        p.projectCost > 0 && 
        typeof p.totalEmissions === 'number' &&
        !isNaN(p.projectCost) && 
        !isNaN(p.totalEmissions)
    );
    
    if (validProjects.length === 0) {
        console.error("No valid projects for Cost Efficiency Chart");
        canvas.parentElement.innerHTML = '<p class="error-message">No valid cost/efficiency data available</p>';
        return;
    }

    const efficiencyData = validProjects.map(p => ({
        project: p.projectName,
        efficiency: (p.totalEmissions / p.projectCost).toFixed(4),
        flag: p.flag?.toLowerCase() || 'no-data'
    }));

    chartInstances.costEfficiency = new Chart(canvas, {
        type: "bar",
        data: {
            labels: efficiencyData.map(d => d.project),
            datasets: [{
                label: "kg CO₂ per $",
                data: efficiencyData.map(d => d.efficiency),
                backgroundColor: efficiencyData.map(d => {
                    const colors = {
                        'green': 'rgba(40, 167, 69, 0.8)',
                        'yellow': 'rgba(255, 193, 7, 0.8)',
                        'orange': 'rgba(253, 126, 20, 0.8)',
                        'red': 'rgba(220, 53, 69, 0.8)',
                        'no-data': 'rgba(108, 117, 125, 0.8)'
                    };
                    return colors[d.flag];
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
                    title: { display: true, text: "kg CO₂ per $" },
                    beginAtZero: true
                },
                y: { title: { display: true, text: "Project" } }
            }
        }
    });
}

// Section navigation
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
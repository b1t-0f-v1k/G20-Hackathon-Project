document.getElementById("loadGraphBtn").addEventListener("click", async () => {
    const businessID = document.getElementById("businessIdInput").value.trim();
    if (!businessID) {
        alert("Please enter a Business ID.");
        return;
    }

    try {
        // Fetch all projects for this businessID
        const response = await fetch(`http://localhost:5000/api/projects/${businessID}`);
        if (!response.ok) throw new Error("Failed to fetch projects");

        const projects = await response.json();
        if (!projects.length) {
            alert("No projects found for this Business ID.");
            return;
        }

        // Clear old charts
        document.getElementById("chart").innerHTML = "";
        document.getElementById("categoryCharts").innerHTML = "";

        // BUSINESS NAME (take from first project)
        const businessName = projects[0].smeName;

        // ===== FIRST GRAPH: ALL PROJECTS TOTAL EMISSIONS =====
        drawTotalEmissionsChart(projects, businessName);

        // ===== SECOND GRAPHS: CATEGORY EMISSIONS PER PROJECT =====
        projects.forEach(project => {
            drawCategoryChart(project);
        });

    } catch (error) {
        console.error("Error loading graphs:", error);
    }
});

function drawTotalEmissionsChart(projects, businessName) {
    const width = 600;
    const height = 400;
    const margin = { top: 50, right: 30, bottom: 50, left: 70 };

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleBand()
        .domain(projects.map(d => d.projectName))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(projects, d => d.totalEmissions)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Bars
    svg.selectAll(".bar")
        .data(projects)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.projectName))
        .attr("y", d => y(d.totalEmissions))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.totalEmissions))
        .attr("fill", "#4CAF50");

    // X Axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    // Y Axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text(`All Projects X Emissions for ${businessName}`);
}

function drawCategoryChart(project) {
    const data = project.sources.map(s => ({
        category: s.category,
        emissions: s.emissions
    }));

    const width = 500;
    const height = 300;
    const margin = { top: 50, right: 30, bottom: 50, left: 70 };

    const container = d3.select("#categoryCharts")
        .append("div")
        .style("margin-bottom", "40px");

    const svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleBand()
        .domain(data.map(d => d.category))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.emissions)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.category))
        .attr("y", d => y(d.emissions))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.emissions))
        .attr("fill", "#2196F3");

    // X Axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    // Y Axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`Category X Emissions for ${project.projectName}`);
}

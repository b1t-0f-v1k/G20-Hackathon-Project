async function drawChart() {
    try {
        const response = await fetch("http://localhost:5000/api/sme"); // ✅ correct endpoint
        const data = await response.json();

        const width = 600;
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 30, left: 50 };

        d3.select("#chart").selectAll("*").remove();

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const x = d3.scaleBand()
            .domain(data.map(d => d.projectName))  // ✅ use projectName
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.totalEmissions)]) // ✅ use totalEmissions
            .nice()
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("fill", "steelblue")
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => x(d.projectName))
            .attr("y", d => y(d.totalEmissions))
            .attr("height", d => y(0) - y(d.totalEmissions))
            .attr("width", x.bandwidth());

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
    } catch (err) {
        console.error("Error loading chart data:", err);
    }
}

drawChart();

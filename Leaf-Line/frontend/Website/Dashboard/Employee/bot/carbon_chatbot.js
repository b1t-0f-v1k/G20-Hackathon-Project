const greenEnergyKnowledge = {
    solarPanels: {
        efficiency: "Modern panels: 18-20% efficiency common in South Africa, premium up to 22%",
        cost: "Around R20,000-R30,000 per kW installed (approx. $1,200 - $1,800/kW), prices dropping yearly",
        lifespan: "25 years typical, with 80% performance warranty over 25 years",
        maintenance: "Minimal – mostly panel cleaning due to dust and occasional inspections",
        types: "Monocrystalline, polycrystalline, thin-film",
        emergingTech: "Perovskite cells and bifacial panels gaining attention locally"
    },
    windEnergy: {
        residential: "Small turbines (400W-10kW) are less common but suitable for rural, windy areas like the Western Cape",
        commercial: "Large turbines 1.5-3MW mainly in wind-rich regions like Eastern Cape and Western Cape",
        offshore: "South Africa is exploring offshore wind but currently no commercial projects",
        investment: "About R20-30 million per MW installed capacity",
        emergingTech: "Vertical-axis turbines and hybrid solar-wind systems being piloted"
    },
    energyStorage: {
        lithium: "Tesla Powerwall, LG Chem batteries available, lifespan 10-15 years",
        costs: "Currently R7,000-R10,000 per kWh, prices steadily decreasing",
        applications: "Backup power (common due to load shedding), peak shaving, solar integration"
    },
    geothermal: {
        overview: "Geothermal is not widely developed due to limited high-heat resources in South Africa",
        cost: "High upfront, limited local installations",
        lifespan: "Potentially 30-50 years",
        typicalSites: "Not a major energy source locally"
    },
    hydroelectric: {
        overview: "Hydro power is limited but present in small-scale projects, no large dams recently constructed",
        scale: "Small hydropower (<100kW) possible in rural areas with rivers",
        benefits: "Reliable but geographically limited",
        lifespan: "40-80 years with maintenance"
    },
    incentives: {
        federal: "No direct national solar tax credits, but Eskom and municipalities offer rebates and incentives",
        state: "Provincial programs vary; some municipalities have green tariffs and net metering options",
        business: "Section 12B and 12L tax incentives for energy efficiency and renewable projects",
        emerging: "Carbon tax implementation encourages clean energy investment"
    },
    hydrogen: {
        overview: "South Africa is investing in green hydrogen research and pilot projects",
        applications: "Potential for export, transport, and industry",
        challenges: "High costs and infrastructure under development",
        outlook: "Government strategy supports hydrogen economy growth by 2030"
    }
};

document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
    let input = document.getElementById("user-input");
    let message = input.value.trim();
    if (message === "") return;

    addMessage(message, "user-message");
    input.value = "";
    
    let typingIndicator = addTypingIndicator();

    try {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
        
        let reply = await getSouthAfricaGreenEnergyResponse(message);
        
        typingIndicator.remove();
        addMessage(reply, "bot-message");
    } catch (err) {
        typingIndicator.remove();
        addMessage("⚠️ Sorry, I'm having trouble connecting. Please try again.", "bot-message");
    }
}

function addTypingIndicator() {
    let chatBody = document.getElementById("chat-body");
    let typingDiv = document.createElement("div");
    typingDiv.classList.add("typing-indicator");
    typingDiv.innerHTML = `
        <span>🤔 Analysing South African green energy data...</span>
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    return typingDiv;
}

function addMessage(text, className) {
    let chatBody = document.getElementById("chat-body");
    let messageDiv = document.createElement("div");
    messageDiv.classList.add(className);
    messageDiv.innerHTML = `<span>${text}</span>`;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    return messageDiv;
}

async function getSouthAfricaGreenEnergyResponse(userMessage) {
    const msg = userMessage.toLowerCase();

    if (msg.includes("solar") && (msg.includes("cost") || msg.includes("price"))) {
        return `
        💰 <strong>Solar Costs in South Africa (2025)</strong><br><br>
        - Installed costs range between R20,000 - R30,000 per kW (~$1,200 - $1,800)<br>
        - Typical 5-6 kW residential system costs R100,000 - R180,000 before incentives<br>
        - No direct national tax credits, but some municipalities and Eskom offer rebates<br>
        - Payback typically 5-8 years depending on electricity tariffs and system size<br><br>
        <em>Note:</em> Maintenance mostly involves cleaning due to dust and load shedding impacts system usage.
        `;
    }

    if (msg.includes("solar") && msg.includes("efficiency")) {
        return `
        ☀️ <strong>Solar Panel Efficiency in South Africa</strong><br><br>
        - Panels typically offer 18-20% efficiency under local conditions<br>
        - Premium panels can reach up to 22% efficiency<br>
        - High solar irradiance in SA means excellent energy yield despite slightly lower efficiency<br>
        - Dust and heat can reduce panel output; regular cleaning helps<br><br>
        Want advice on optimizing your solar system’s performance?
        `;
    }

    if (msg.includes("wind") && (msg.includes("residential") || msg.includes("small"))) {
        return `
        💨 <strong>Residential Wind Energy in South Africa</strong><br><br>
        - Small turbines (400W-10kW) are best for windy rural areas like Western Cape<br>
        - Requires average wind speeds over 10 mph (4.5 m/s)<br>
        - Less common than solar due to variable winds and urban restrictions<br><br>
        Combining solar and wind can improve energy security.
        `;
    }

    if (msg.includes("wind") && msg.includes("offshore")) {
        return `
        🌊 <strong>Offshore Wind in South Africa</strong><br><br>
        - No commercial offshore wind farms yet, but government plans exist<br>
        - Offshore wind offers higher energy yield than onshore<br>
        - Emerging floating turbine tech may be deployed in future<br><br>
        Interested in how offshore wind could impact SA’s energy mix?
        `;

    }
    if (msg.includes("green energy")) {
        return `
        🌱 <strong>Green Energy Trends in 2024</strong><br><br>
        - Renewable energy adoption is accelerating globally, with solar and wind leading the charge<br>
        - Energy storage solutions, like advanced batteries, are enabling grid stability<br>
        - Governments and companies are investing in decarbonization and net-zero targets<br>
        - Innovations include floating solar farms, offshore wind, and AI-powered energy management<br><br>
        Curious how these trends could impact South Africa’s green energy landscape?
        `
    }

    if (msg.includes("solar") || msg.includes("wind")) {
    return `
    ☀️🌬️ <strong>Solar vs Wind Energy in South Africa</strong><br><br>
    - <strong>Solar</strong>: Best for most regions; abundant sunlight year-round, especially in Northern Cape, Free State, and Limpopo<br>
    - Cost: ~R10,000 - R15,000 per kW installed; declining 5-8% annually<br>
    - Output: Predictable daily generation; affected by cloudy weather<br><br>
    - <strong>Wind</strong>: Strong potential along coastal regions (Western & Eastern Cape) and some inland ridges<br>
    - Cost: ~R15,000 - R20,000 per kW installed; requires average wind speeds above 6 m/s<br>
    - Output: Generates day & night; seasonal wind variations<br><br>
    💡 <em>Hybrid solar-wind systems</em> can ensure more consistent power output and reduce reliance on the grid.<br><br>
    `;
    }

    if (msg.includes("battery") || msg.includes("storage")) {
    return `
    🔋 <strong>Best Battery Storage Solutions for Renewable Energy in South Africa</strong><br><br>
    - <strong>Lithium-ion</strong> (Tesla Powerwall, Sunsynk, LG Chem): High efficiency (90-95%), long lifespan (10-15 years), ideal for daily cycling<br>
    - <strong>Lead-acid (AGM/Gel)</strong>: Lower upfront cost, shorter lifespan (3-7 years), suited for backup rather than continuous cycling<br>
    - <strong>Flow batteries</strong> (Vanadium Redox): Long lifespan (>20 years), scalable for large systems, higher initial cost<br><br>
    📦 <strong>Storage Size</strong>: 5kWh for small households, 10-15kWh for larger homes, 50kWh+ for commercial use<br>
    💰 <strong>Costs</strong>: ~R7,000 - R10,000 per kWh installed; prices dropping ~5% annually<br>
    ⚡ <strong>Tip</strong>: Pairing storage with solar/wind reduces load shedding impact and increases self-consumption<br><br>
    💡 <em>Hybrid inverters</em> enable seamless switching between grid, solar, and battery power.<br><br>
    `;
    }



    if (msg.includes("geothermal")) {
        return `
        🌍 <strong>Geothermal Energy in South Africa</strong><br><br>
        - Currently limited due to geology; not widely used<br>
        - Potential for heating applications but no large electricity projects<br>
        - High initial costs and limited resources<br><br>
        Ask about alternative renewables better suited for SA’s landscape.
        `;
    }

    if (msg.includes("hydroelectric") || msg.includes("hydro")) {
        return `
        💧 <strong>Hydroelectric Power in South Africa</strong><br><br>
        - Small-scale hydro possible but limited by geography<br>
        - No recent large dam projects; most capacity from older plants<br>
        - Reliable, clean power but site-dependent<br><br>
        Need info on small hydro or mini-grid options?
        `;
    }

    if (msg.includes("hydrogen")) {
        return `
        ⚗️ <strong>Green Hydrogen in South Africa</strong><br><br>
        - SA is investing heavily in green hydrogen R&D and pilot projects<br>
        - Expected to become an export commodity and clean fuel source<br>
        - Challenges include infrastructure and current high costs<br><br>
        Want insights on hydrogen’s role in SA’s energy future?
        `;
    }
    if (msg.includes("full transition")) {
        return `
        🔄 <strong>Full Transition to Sustainable Energy in 2024</strong><br><br>
        - Countries and companies are accelerating the shift from fossil fuels to renewables<br>
        - Integration of solar, wind, green hydrogen, and energy storage is becoming standard<br>
        - Smart grids and AI-driven energy management optimize efficiency and reliability<br>
        - Policy frameworks and investments are enabling a faster, cleaner energy transition<br><br>
        Curious how a full energy transition could impact South Africa and global markets?
        `
    }

    if (msg.includes("100% renewable energy")) {
        return `
        🔄 <strong>Transition Your Company to 100% Renewable Energy</strong><br><br>
        - Conduct an energy audit to identify consumption hotspots and inefficiencies<br>
        - Invest in on-site renewable generation like solar panels or wind turbines<br>
        - Purchase renewable energy through green tariffs or power purchase agreements (PPAs)<br>
        - Implement energy storage and smart management systems to maximize usage<br>
        - Set clear targets, monitor progress, and communicate sustainability goals internally and externally<br><br>
        Want a step-by-step roadmap for making your company fully green and energy-efficient?
        `
}

    if (msg.includes("incentive") || msg.includes("rebate") || msg.includes("grant")) {
        return `
        💸 <strong>Incentives & Rebates in South Africa</strong><br><br>
        - No national solar tax credits currently<br>
        - Eskom and some municipalities offer rebates or green tariffs<br>
        - Section 12B and 12L tax incentives for businesses investing in energy efficiency and renewables<br>
        - Carbon tax encourages transition to clean energy<br><br>
        Share your location or project details for tailored advice!
        `;
    }

    if (msg.includes("roi") || msg.includes("payback") || msg.includes("return")) {
        return `
        📈 <strong>Return on Investment (ROI) for Green Energy in SA</strong><br><br>
        - Typical solar payback periods: 5-8 years depending on tariffs and system size<br>
        - Wind ROI varies, generally longer due to site constraints<br>
        - Storage ROI depends on load shedding frequency and tariff structures<br><br>
        Want me to help you calculate ROI for your project?
        `;
    }

    if (msg.includes("calculator") || msg.includes("calculate")) {
        return `
        🧮 <strong>Calculator</strong><br><br>
        Use the calculator button to input your data and get customized savings and impact estimates based on South African tariffs and conditions.
        `;
    }
    if (msg.includes("Hello") || msg.includes("hi") || msg.includes("WK")) {
        return `
        <strong>🌿 Hello! I’m Leaf-Line Green Bot — your personal guide to going green.</strong><br><br>
        - From cutting carbon emissions to finding smarter energy choices,
         I’m here to help you make eco-friendly decisions that matter.<br>
        - Whether you’re curious about solar panels, wind energy, or just want to chat about sustainability,
         I’ve got you covered.<br>
        - Let’s grow a cleaner future together!"<br>  
        - Please tell me how can i help you
        `;
    }

    return `
    🌱 <strong>Green Energy Insights for South Africa</strong><br><br>
    I can provide detailed info on solar, wind, batteries, hydrogen, and local incentives.<br>
    Please share your location, energy use, or specific questions so I can tailor my advice for you.
    `;
}

// Quick ask buttons helper
function quickAsk(question) {
    document.getElementById("user-input").value = question;
    sendMessage();
}

// Calculator modal controls
function openCalculator() {
    document.getElementById("calculator-modal").style.display = "block";
}

function closeCalculator() {
    document.getElementById("calculator-modal").style.display = "none";
}

// Calculator tailored to South African context with Rand and tariffs
function calculateAdvanced() {
    let electricity = parseFloat(document.getElementById("electricity").value) || 0; // kWh per month
    let rate = parseFloat(document.getElementById("rate").value) || 2.00; // R/kWh default ~R2
    let roofspace = parseFloat(document.getElementById("roofspace").value) || 0; // sq ft
    let sunlight = parseFloat(document.getElementById("sunlight").value) || 5; // hours per day
    let budget = parseFloat(document.getElementById("budget").value) || 0; // Rands

    // Calculations
    let annualUsage = electricity * 12; // kWh/year
    let currentBill = annualUsage * rate;

    // Solar panel assumptions
    let panelArea = 20; // sq ft per panel approx
    let panelPower = 0.4; // kW per panel (400W)
    let solarCapacity = Math.floor(roofspace / panelArea);
    let systemSizeKw = solarCapacity * panelPower;
    let annualProduction = systemSizeKw * sunlight * 365 * 0.8; // 80% derate factor

    // Financials
    let systemCost = systemSizeKw * 30000; // R30,000 per kW approx
    let afterIncentives = systemCost; // No direct national tax credit
    let annualSavings = Math.min(annualProduction * rate, currentBill);
    let paybackYears = afterIncentives / (annualSavings || 1);
    let twentyFiveYearSavings = (annualSavings * 25) - afterIncentives;

    // Environmental impact
    let co2ReductionKg = annualProduction * 0.18; // SA grid avg ~0.18 kg CO2/kWh (IEA data)
    let treesEquivalent = Math.floor(co2ReductionKg / 21); // 1 tree absorbs ~21 kg CO2/year (SA-specific)

    let results = `
        <h3>🔋 Your South Africa Green Energy Analysis</h3>
        
        <strong>📊 Current Situation:</strong><br>
        • Annual usage: ${annualUsage.toLocaleString()} kWh<br>
        • Current electricity bill: R${currentBill.toLocaleString(undefined, {minimumFractionDigits:2})} per year<br><br>
        
        <strong>☀️ Solar Potential:</strong><br>
        • Roof capacity: ${solarCapacity} panels (${systemSizeKw.toFixed(1)} kW)<br>
        • Annual production: ${annualProduction.toLocaleString(undefined, {maximumFractionDigits:0})} kWh<br>
        • Estimated system cost: R${systemCost.toLocaleString(undefined, {minimumFractionDigits:2})}<br><br>
        
        <strong>💰 Financial Projections:</strong><br>
        • Annual savings: R${annualSavings.toLocaleString(undefined, {minimumFractionDigits:2})}<br>
        • Payback period: ${paybackYears.toFixed(1)} years<br>
        • 25-year profit: R${twentyFiveYearSavings.toLocaleString(undefined, {minimumFractionDigits:2})}<br><br>
        
        <strong>🌱 Environmental Impact:</strong><br>
        • CO₂ reduction: ${co2ReductionKg.toLocaleString(undefined, {maximumFractionDigits:0})} kg/year<br>
        • Equivalent to planting ${treesEquivalent} trees annually
    `;

    document.getElementById("result").innerHTML = results;
}

// Welcome message tailored to South Africa
window.addEventListener('load', function() {
    setTimeout(() => {
        addMessage("💡 <strong>Tip:</strong> South Africa's high solar irradiance makes solar power especially effective! Although there’s no national tax credit, Eskom rebates and provincial programs may be available.", "bot-message");
    }, 2000);
});

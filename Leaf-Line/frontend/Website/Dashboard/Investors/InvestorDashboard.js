// InvestorDashboard.js
function toggleMenu() {
    document.querySelector(".sidebar").classList.toggle("collapsed");
}

let coll = document.getElementsByClassName("collapsible");
for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        let content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}

// Add this function to InvestorDashboard.js
function showInvestorIDPopup(investorID) {
  const popup = document.createElement('div');
  popup.className = 'investor-id-popup';
  popup.innerHTML = `
    <div class="popup-content">
      <h3>Your Investor ID</h3>
      <p class="investor-id">${investorID}</p>
      <p>Please save this ID for future reference</p>
      <button class="close-popup">OK</button>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  popup.querySelector('.close-popup').addEventListener('click', () => {
    document.body.removeChild(popup);
  });
}

// Update the DOMContentLoaded listener
document.addEventListener("DOMContentLoaded", () => {
  // Check for investor ID in both sessionStorage and URL
  const sessionID = sessionStorage.getItem('newInvestorID');
  const urlParams = new URLSearchParams(window.location.search);
  const urlID = urlParams.get('investorID');
  
  const investorID = sessionID || urlID;
  
  if (investorID) {
    showInvestorIDPopup(investorID);
    sessionStorage.removeItem('newInvestorID');
    
    // Clean URL without reloading
    if (urlID) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
  
  // Initialize menu toggle
  document.querySelector('.menu-toggle')?.addEventListener('click', toggleMenu);
});
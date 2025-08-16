// investorID.js
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  // Check if we have a new investor ID to show (from signup redirect)
  const newInvestorID = sessionStorage.getItem('newInvestorID');
  if (newInvestorID) {
    showInvestorIDPopup(newInvestorID);
    sessionStorage.removeItem('newInvestorID');
  }
  
  // Setup investor ID retrieval form if on admin page
  if (window.location.pathname.includes("admin.html")) {
    setupInvestorIDRetrieval();
  }
});

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

function setupInvestorIDRetrieval() {
  const retrieveBtn = document.getElementById('retrieve-id-btn');
  
  if (!retrieveBtn) return; // Exit if button doesn't exist
  
  retrieveBtn.addEventListener('click', async () => {
    const email = document.getElementById('retrieve-id-email')?.value.trim();
    const password = document.getElementById('retrieve-id-password')?.value.trim();
    const resultDiv = document.getElementById('investor-id-result');
    const originalText = retrieveBtn.textContent;
    
    // Clear previous results
    if (resultDiv) {
      resultDiv.innerHTML = '';
      resultDiv.className = 'result-container';
    }
    
    if (!email || !password) {
      if (resultDiv) resultDiv.innerHTML = '<p class="error">Please enter both email and password</p>';
      return;
    }
    
    try {
      retrieveBtn.disabled = true;
      retrieveBtn.textContent = 'Loading...';
      
      // First authenticate with Firebase
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      // Then fetch investor ID from your backend
      const response = await fetch('/api/investor/id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok && resultDiv) {
        resultDiv.className = 'result-container success';
        resultDiv.innerHTML = `
          <p>Your Investor ID: <strong>${data.investorID}</strong></p>
          <p>Please save this ID for future reference</p>
        `;
        
        // Also show as popup
        showInvestorIDPopup(data.investorID);
      } else if (resultDiv) {
        resultDiv.className = 'result-container error';
        resultDiv.innerHTML = `<p>${data.error || 'Failed to retrieve investor ID'}</p>`;
      }
    } catch (error) {
      console.error('Error retrieving investor ID:', error);
      if (resultDiv) {
        resultDiv.className = 'result-container error';
        resultDiv.innerHTML = '<p>Invalid email or password</p>';
      }
    } finally {
      retrieveBtn.disabled = false;
      retrieveBtn.textContent = originalText;
    }
  });
}
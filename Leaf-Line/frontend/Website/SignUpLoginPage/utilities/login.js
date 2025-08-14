// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBla6PaWsRXb9eaSWP6KnJ5LhqH0tAGaR4",
  authDomain: "hackathon-auth-4fa00.firebaseapp.com",
  projectId: "hackathon-auth-4fa00",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Detect page type (investor or employee)
const isInvestorPage = window.location.pathname.toLowerCase().includes("investor");
const apiBase = "http://localhost:5000/api";
const loginEndpoint = isInvestorPage ? `${apiBase}/investor/login` : `${apiBase}/employee/login`;

// ✅ Handle login form submit
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email-input").value;
  const password = document.getElementById("password-input").value;

  try {
    // 1️⃣ Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Firebase auth successful!");

    // 2️⃣ Get Firebase token
    const token = await userCredential.user.getIdToken();
    console.log("Got Firebase token!");

    // 3️⃣ Send token + email to backend
    const response = await fetch(loginEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }), // Send email if your backend needs it
    });

    // 4️⃣ Safely parse response
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (err) {
      console.error("Server did not return JSON:", responseText);
      alert("Login failed: Unexpected server response (check console).");
      return;
    }

    console.log("Login response:", data);

    // 5️⃣ Redirect to dashboard if successful
    if (response.ok) {
      window.location.href = isInvestorPage ? "../../Dashboard/Investors/InvestorDashboard.html" : "../../Dashboard/Employee/EmployeeDashboard.html";
    } else {
      alert("Login failed: " + (data.error || "Unknown error"));
    }

  } catch (err) {
    console.error("Login failed:", err);
    alert("Login failed: " + err.message);
  }
});

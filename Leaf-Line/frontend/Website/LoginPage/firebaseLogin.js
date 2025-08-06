// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "leaf-line.firebaseapp.com",
  projectId: "leaf-line",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    // Send token to backend API
    const response = await fetch("http://localhost:5000/api/protected", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("API Response:", data);

    // Redirect to dashboard (example)
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error("Login failed:", err.message);
  }
});

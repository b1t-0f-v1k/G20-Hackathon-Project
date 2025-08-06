// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "leaf-line.firebaseapp.com",
  projectId: "leaf-line",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Handle login form submit
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect login form values
  const email = document.getElementById("user-input").value;    // Adjusted to match your HTML ID
  const password = document.getElementById("password-input").value;

  try {
    // 1️⃣ Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // 2️⃣ Get Firebase token
    const token = await userCredential.user.getIdToken();

    // 3️⃣ Send token to backend (protected login endpoint)
    const response = await fetch("http://localhost:5000/api/employee/login", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    // 4️⃣ Handle backend response
    const data = await response.json();
    console.log("Login response:", data);

    // Redirect to dashboard or next page
    if (response.ok) {
      window.location.href = "dashboard.html";
    } else {
      alert("Login failed: " + data.error);
    }
  } catch (err) {
    console.error("Login failed:", err.message);
    alert("Login failed: " + err.message);
  }
});

// signup.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "leaf-line.firebaseapp.com",
  projectId: "leaf-line",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Handle Signup Form Submission
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect form values
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const username = document.getElementById("signup-username").value;
  const company = document.getElementById("signup-company").value;
  const project = document.getElementById("signup-project").value;

  try {
    // 1️⃣ Register user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    // 2️⃣ Send additional user details to backend (MongoDB)
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Send Firebase token for secure verification
      },
      body: JSON.stringify({ email, username, company, project }),
    });

    const data = await response.json();
    console.log("Signup successful:", data);

    // ✅ Redirect to dashboard or login page
    window.location.href = "login.html";
  } catch (err) {
    console.error("Signup failed:", err.message);
  }
});

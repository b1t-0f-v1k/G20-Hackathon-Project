// signup.js (Debug version)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBla6PaWsRXb9eaSWP6KnJ5LhqH0tAGaR4",
  authDomain: "hackathon-auth-4fa00.firebaseapp.com",
  projectId: "hackathon-auth-4fa00",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Handle Signup Form Submission
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("🚀 Signup form submitted.");

  // Collect form values
  const username = document.getElementById("user-input2").value;
  const email = document.getElementById("signup-email-input").value;
  const password = document.getElementById("password-input2").value;
  const businessName = document.getElementById("SME_NAME-input").value;
  const businessID = document.getElementById("SME_ID-input").value;

  console.log("📥 Collected Form Data:", { username, email, password, businessName, businessID });

  // Validate fields before proceeding
  if (!username || !email || !password || !businessName || !businessID) {
    console.warn("⚠️ Missing field(s). Cannot submit signup.");
    alert("Please fill in all fields.");
    return;
  }

  try {
    // 1️⃣ Register user in Firebase Auth
    console.log("🔑 Creating Firebase user...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("✅ Firebase user created:", userCredential.user.email);

    // 2️⃣ Retrieve Firebase ID token
    console.log("🔑 Fetching Firebase token...");
    const token = await userCredential.user.getIdToken();
    console.log("✅ Firebase token retrieved:", token.substring(0, 30) + "..."); // Print partial token

    // 3️⃣ Send data to backend
    console.log("📤 Sending data to backend:", {
      email,
      username,
      password,
      businessName,
      businessID,
    });

    const response = await fetch("http://localhost:5000/api/employee/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, username, password, businessName, businessID }),
    });

    console.log("📡 Backend response status:", response.status);

    // 4️⃣ Parse backend response
    const data = await response.json();
    console.log("📥 Backend response data:", data);

    if (response.ok) {
      console.log("🎉 Signup successful:", data);
      alert("Signup successful! Redirecting to login...");
      window.location.href = "login.html";
    } else {
      console.error("❌ Signup failed (server error):", data);
      alert("Signup failed: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("🔥 Signup failed (frontend error):", err.message);
    alert("Signup failed: " + err.message);
  }
});

// signup.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBla6PaWsRXb9eaSWP6KnJ5LhqH0tAGaR4",
  authDomain: "hackathon-auth-4fa00.firebaseapp.com",
  projectId: "hackathon-auth-4fa00",
};

// ✅ Initialize Firebase only once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Handle Signup Form Submission
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("🚀 Signup form submitted.");

  // Required for all signups
  const username = document.getElementById("signup-name-input").value;
  const email = document.getElementById("signup-email-input").value;
  const password = document.getElementById("signup-password-input").value;

  // ✅ Only collect SME fields if they exist on the page
  const businessNameEl = document.getElementById("SME_NAME-input");
  const businessIDEl = document.getElementById("SME_ID-input");
  const businessName = businessNameEl ? businessNameEl.value : null;
  const businessID = businessIDEl ? businessIDEl.value : null;

  console.log("📥 Collected Form Data:", { username, email, password, businessName, businessID });

  // 🔹 Validation: If SME fields exist, require them. Otherwise, skip.
  if (!username || !email || !password) {
    alert("Please fill in all required fields.");
    return;
  }
  if ((businessNameEl && !businessName) || (businessIDEl && !businessID)) {
    alert("Please fill in all business details.");
    return;
  }

  try {
    // 1️⃣ Register in Firebase Auth
    console.log("🔑 Creating Firebase user...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("✅ Firebase user created:", userCredential.user.email);

    // 2️⃣ Get Firebase token
    const token = await userCredential.user.getIdToken();

    // 3️⃣ Prepare payload
    const payload = { username, email, password };
    if (businessName && businessID) {
      payload.businessName = businessName;
      payload.businessID = businessID;
    }

    // 4️⃣ Send to backend (choose correct endpoint based on presence of SME fields)
    const endpoint = businessName && businessID
      ? "http://localhost:5000/api/employee/register"
      : "http://localhost:5000/api/investor/register";

    console.log("📤 Sending data to backend:", endpoint, payload);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Signup successful! Redirecting to login...");
      window.location.href = "login.html";
    } else {
      alert("Signup failed: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("🔥 Signup failed:", err.message);
    alert("Signup failed: " + err.message);
  }
});

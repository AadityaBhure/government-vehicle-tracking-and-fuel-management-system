// ==========================
// Global Auth System (Login, Register, Logout, Access Control)
// ==========================
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import { app } from "./firebase-config.js";
const auth = getAuth(app);

// ==========================
// Register
// ==========================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Registered:", email);
      window.location.href = "./dashboard/dashboard.html";
    } catch (error) {
      console.error("❌ Registration failed:", error.message);
      alert(error.message);
    }
  });
}

// ==========================
// Login
// ==========================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Logged in as:", email);
      window.location.href = "./dashboard/dashboard.html";
    } catch (error) {
      console.error("❌ Login failed:", error.message);
      alert("Invalid email or password.");
    }
  });
}

// ==========================
// Logout (Universal)
// ==========================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      console.log("👋 Logged out successfully");

      // ✅ Works whether inside /dashboard/ or root
      let redirectPath = "./login.html";
      if (window.location.pathname.includes("/dashboard/")) {
        redirectPath = "../login.html";
      }

      window.location.href = redirectPath;
    } catch (error) {
      console.error("❌ Logout failed:", error.message);
    }
  });
}

// ==========================
// Auth State Control
// ==========================
onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname;

  if (!user) {
    if (!path.includes("login.html") && !path.includes("register.html")) {
      console.warn("⚠️ No user logged in → redirecting...");
      const redirectPath = path.includes("/dashboard/")
        ? "../login.html"
        : "./login.html";
      window.location.href = redirectPath;
    }
    return;
  }

  console.log("👤 Logged in as:", user.email);

  // ✅ Admin-only: Start Vehicle Generator
  if (user.email === "aadityabhure001@gmail.com") {
    try {
      await import("./data-generator.js");
      console.log("🚀 Admin data generator running...");
    } catch (err) {
      console.error("❌ Generator load failed:", err);
    }
  }
});

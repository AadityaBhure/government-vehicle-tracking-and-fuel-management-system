// ==========================
// Firebase Imports & Setup
// ==========================
import { app } from "../js/firebase-config.js";
import {
  getFirestore,
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const db = getFirestore(app);

// ==========================
// Elements
// ==========================
const vehicleCount = document.getElementById("vehicleCount");

// ==========================
// Live Vehicle Count
// ==========================
const vehicleRef = collection(db, "vehicles");

// Listen for real-time updates
onSnapshot(vehicleRef, (snapshot) => {
  const count = snapshot.size;
  vehicleCount.textContent = count > 0 ? `${count} Active` : "No vehicles yet";
});

// ==========================
// Logout Button
// ==========================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}

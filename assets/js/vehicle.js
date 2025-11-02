// ==========================
// Firebase Imports & Setup
// ==========================
import { app } from "../js/firebase-config.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

// ==========================
// Elements
// ==========================
const addVehicleBtn = document.getElementById("addVehicleBtn");
const vehName = document.getElementById("vehName");
const vehNumber = document.getElementById("vehNumber");
const vehType = document.getElementById("vehType");
const vehicleTableBody = document.getElementById("vehicleTableBody");
const vehicleForm = document.querySelector(".vehicle-form");

let isAdmin = false;

// ==========================
// Auth State Listener
// ==========================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log(`👤 Logged in as: ${user.email}`);

    // ✅ Admin email check
    if (user.email === "aadityabhure001@gmail.com") {
      isAdmin = true;
      vehicleForm.style.display = "block"; // show form for admin
    } else {
      isAdmin = false;
      vehicleForm.style.display = "none"; // hide form for non-admin
    }

    // Load data after login check
    listenToVehicles();
  } else {
    console.warn("No user logged in");
    window.location.href = "../index.html";
  }
});

// ==========================
// Add Vehicle (Admins Only)
// ==========================
if (addVehicleBtn) {
  addVehicleBtn.addEventListener("click", async () => {
    if (!isAdmin) return alert("Access denied.");

    const name = vehName.value.trim();
    const number = vehNumber.value.trim().toUpperCase();
    const type = vehType.value;

    if (!name || !number || !type) return;
    const regPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    if (!regPattern.test(number)) return;

    try {
      await addDoc(collection(db, "vehicles"), {
        name,
        number,
        type,
        createdAt: new Date(),
        location: {
          lat: 19.95 + (Math.random() - 0.5) * 0.05,
          lng: 79.29 + (Math.random() - 0.5) * 0.05,
        },
      });
    } catch (error) {
      console.error("Error adding vehicle:", error);
    }
  });
}

// ==========================
// Real-time Vehicle Table
// ==========================
function renderVehicles(snapshot) {
  vehicleTableBody.innerHTML = "";
  let index = 1;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index++}</td>
      <td>${data.name}</td>
      <td>${data.number}</td>
      <td>${data.type}</td>
      <td>
        ${
          isAdmin
            ? `<button class="remove-btn" data-id="${docSnap.id}">Remove</button>`
            : `<span style="color:gray;">View Only</span>`
        }
      </td>
    `;
    vehicleTableBody.appendChild(row);
  });

  if (isAdmin) {
    const deleteButtons = document.querySelectorAll(".remove-btn");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        await deleteDoc(doc(db, "vehicles", id));
      });
    });
  }
}

// ==========================
// Firestore Live Sync
// ==========================
function listenToVehicles() {
  onSnapshot(collection(db, "vehicles"), renderVehicles);
}

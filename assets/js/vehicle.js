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
  onSnapshot
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
// Auth Listener
// ==========================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  console.log(`👤 Logged in: ${user.email}`);

  // Admin check
  isAdmin = user.email === "aadityabhure001@gmail.com";

  vehicleForm.style.display = isAdmin ? "block" : "none";

  listenToVehicles();
});

// ==========================
// Add Vehicle
// ==========================
if (addVehicleBtn) {
  addVehicleBtn.addEventListener("click", async () => {
    if (!isAdmin) return alert("❌ Access denied!");

    const name = vehName.value.trim();
    const number = vehNumber.value.trim().toUpperCase();
    const type = vehType.value;

    if (!name || !number || !type) return alert("Enter all fields");

    const regPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    if (!regPattern.test(number)) return alert("Invalid vehicle number format");

    try {
      await addDoc(collection(db, "vehicles"), {
        name,
        number,
        type,
        createdAt: new Date(),
        location: {
          lat: 19.95 + (Math.random() - 0.5) * 0.05,
          lng: 79.29 + (Math.random() - 0.5) * 0.05
        },
        fuelLevel: 100
      });

      vehName.value = "";
      vehNumber.value = "";
      vehType.value = "";

    } catch (err) {
      console.error("Error adding vehicle:", err);
    }
  });
}

// ==========================
// Delete Vehicle + FuelData
// ==========================
async function deleteVehicleAndFuel(id) {
  try {
    // Delete vehicle
    await deleteDoc(doc(db, "vehicles", id));

    // Also delete related fuelData entry
    await deleteDoc(doc(db, "fuelData", id));

    console.log(`🗑️ Deleted vehicle + fuelData for ${id}`);

  } catch (err) {
    console.error("Delete failed:", err);
  }
}

// ==========================
// Render Vehicles Table
// ==========================
function renderVehicles(snapshot) {
  vehicleTableBody.innerHTML = "";
  let index = 1;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index++}</td>
      <td>${data.name}</td>
      <td>${data.number}</td>
      <td>${data.type}</td>
      <td>
        ${
          isAdmin
            ? `<button class="remove-btn" data-id="${id}">Remove</button>`
            : `<span style="color:gray;">View Only</span>`
        }
      </td>
    `;

    vehicleTableBody.appendChild(row);
  });

  // Enable delete buttons
  if (isAdmin) {
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        deleteVehicleAndFuel(id);
      });
    });
  }
}

// ==========================
// Live Sync
// ==========================
function listenToVehicles() {
  onSnapshot(collection(db, "vehicles"), renderVehicles);
}

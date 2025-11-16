// assets/js/fuel.js
console.log("fuel.js loaded");

import { app } from "/assets/js/firebase-config.js";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const db = getFirestore(app);

// DOM
const tableBody = document.querySelector("#fuel-table tbody");
const vehicleSelect = document.getElementById("vehicleSelect");
const nodata = document.getElementById("nodata");
const vehicleInfo = document.getElementById("vehicleInfo");

const vId = document.getElementById("vId");
const vFuel = document.getElementById("vFuel");
const vDist = document.getElementById("vDist");

let overviewChart = null;
let vehicleChart = null;

// Helper: fetch vehicle name from /vehicles and write it to fuelData (merge)
async function ensureNameInFuelData(id, fuelEntry) {
  try {
    // If name already present, return it
    if (fuelEntry && fuelEntry.name) return fuelEntry.name;

    const vSnap = await getDoc(doc(db, "vehicles", id));
    if (!vSnap.exists()) return id;

    const v = vSnap.data();
    const name = v.name ?? id;

    // Write name into fuelData (merge) so future reads are simpler
    try {
      await setDoc(doc(db, "fuelData", id), { name }, { merge: true });
    } catch (e) {
      // non-fatal: continue even if we couldn't write the name
      console.warn("Could not write name to fuelData for", id, e);
    }

    return name;
  } catch (err) {
    console.warn("Failed to fetch vehicle name for", id, err);
    return id;
  }
}

// LIVE fuelData listener
onSnapshot(collection(db, "fuelData"), async (snapshot) => {
  if (snapshot.empty) {
    nodata.style.display = "block";
    tableBody.innerHTML = "";
    // reset charts
    if (overviewChart) {
      overviewChart.data.labels = [];
      overviewChart.data.datasets[0].data = [];
      overviewChart.update();
    }
    return;
  }

  nodata.style.display = "none";

  // read all fuelData entries into an object
  const data = {};
  for (const docSnap of snapshot.docs) {
    data[docSnap.id] = docSnap.data();
  }

  // ensure names exist for all (best-effort) — do not block UI for too long
  await Promise.all(
    Object.keys(data).map(async (id) => {
      if (!data[id].name) {
        data[id].name = await ensureNameInFuelData(id, data[id]);
      }
    })
  );

  renderTable(data);
  populateDropdown(data);
  updateOverviewChart(data);
});

// Render table rows: show name instead of uid
function renderTable(data) {
  tableBody.innerHTML = "";

  Object.keys(data).forEach((id) => {
    const v = data[id];

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${v.name ?? id}</td>
      <td>${Number(v.currentFuel ?? 0).toFixed(2)}</td>
      <td>${Number(v.totalDistance ?? 0).toFixed(3)}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Populate dropdown; default option = combined overview (empty value)
function populateDropdown(data) {
  vehicleSelect.innerHTML = `<option value="">Combined Overview</option>`;

  Object.keys(data).forEach((id) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = data[id].name ?? id;
    vehicleSelect.appendChild(opt);
  });
}

// When user selects an individual vehicle
vehicleSelect.addEventListener("change", async () => {
  const id = vehicleSelect.value;

  if (!id) {
    // Combined overview selected
    vehicleInfo.style.display = "none";
    // charts updated already by listener; nothing else to do
    return;
  }

  // show individual data
  const snap = await getDoc(doc(db, "fuelData", id));
  if (!snap.exists()) return;

  const v = snap.data();

  vId.textContent = v.name ?? id;
  vFuel.textContent = Number(v.currentFuel ?? 0).toFixed(2);
  vDist.textContent = Number(v.totalDistance ?? 0).toFixed(3);

  const history = v.history || [];
  const labels = history.map((h) => new Date(h.ts).toLocaleTimeString());
  const values = history.map((h) => Number(h.fuel ?? 0));

  vehicleInfo.style.display = "block";
  drawVehicleChart(labels, values);
});

// Overview chart uses names & currentFuel
function updateOverviewChart(data) {
  const labels = Object.keys(data).map((id) => data[id].name ?? id);
  const values = Object.keys(data).map((id) => Number(data[id].currentFuel ?? 0));

  drawOverviewChart(labels, values);
}

function drawOverviewChart(labels, values) {
  const canvas = document.getElementById("overviewChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (overviewChart) {
    overviewChart.data.labels = labels;
    overviewChart.data.datasets[0].data = values;
    overviewChart.update();
    return;
  }

  overviewChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Fuel (%)", data: values }],
    },
    options: {
      animation: { duration: 400 },
      scales: { y: { beginAtZero: true, max: 100 } },
    },
  });
}

function drawVehicleChart(labels, values) {
  const canvas = document.getElementById("vehicleChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (vehicleChart) {
    vehicleChart.data.labels = labels;
    vehicleChart.data.datasets[0].data = values;
    vehicleChart.update();
    return;
  }

  vehicleChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{ label: "Fuel (%)", data: values, fill: false, tension: 0.25 }],
    },
    options: { animation: { duration: 300 }, scales: { y: { beginAtZero: true, max: 100 } } },
  });
}

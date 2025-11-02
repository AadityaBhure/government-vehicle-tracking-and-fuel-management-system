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
// Leaflet Map Setup
// ==========================
const map = L.map("map").setView([19.95, 79.29], 12); // Chandrapur

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const vehicleMarkers = {};

// ==========================
// Real-time Vehicle Tracking
// ==========================
onSnapshot(collection(db, "vehicles"), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const data = change.doc.data();
    const id = change.doc.id;

    if (!data.location) return;

    if (change.type === "added" || change.type === "modified") {
      const { lat, lng } = data.location;

      if (vehicleMarkers[id]) {
        // Move marker smoothly
        vehicleMarkers[id].setLatLng([lat, lng]);
      } else {
        // Create new marker
        const marker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`<b>${data.name}</b><br>${data.number}<br>${data.type}`);
        vehicleMarkers[id] = marker;
      }
    }

    if (change.type === "removed") {
      if (vehicleMarkers[id]) {
        map.removeLayer(vehicleMarkers[id]);
        delete vehicleMarkers[id];
      }
    }
  });
});

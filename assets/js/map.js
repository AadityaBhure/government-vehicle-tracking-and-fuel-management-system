// assets/js/map.js
// ==========================
// Map + Fuel calculation (Map-driven fuel updates by distance)
// ==========================
import { app } from "./firebase-config.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const db = getFirestore(app);

console.log("map.js loaded");

// Leaflet map setup
const map = L.map("map").setView([19.95, 79.29], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const vehicleMarkers = {};

// Haversine distance (km)
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Fuel consumption parameters (tweakable)
const CONSUMPTION_PER_KM = 0.7; // percent fuel drop per km (0.7%/km)
const MIN_MOVEMENT_THRESHOLD_KM = 0.00001; // ignore micro-movements

// Update fuelData document for a vehicle based on map movement.
// vehData = the vehicle document data (from /vehicles)
async function updateFuelStats(vehicleId, vehData) {
  try {
    const { location } = vehData;
    if (!location) return;

    const fuelRef = doc(db, "fuelData", vehicleId);
    const fuelSnap = await getDoc(fuelRef);

    // vehicle's reported name (ensure we persist it)
    const vehicleName = vehData.name ?? `Vehicle-${vehicleId.slice(0, 6)}`;

    // If a fuel document exists, read its values; otherwise prepare defaults
    let currentFuel = 100;
    let totalDistance = 0;
    let lastLat = null;
    let lastLng = null;

    if (fuelSnap.exists()) {
      const d = fuelSnap.data();
      currentFuel = typeof d.currentFuel === "number" ? d.currentFuel : 100;
      totalDistance = typeof d.totalDistance === "number" ? d.totalDistance : 0;
      if (d.lastLocation) {
        lastLat = d.lastLocation.lat;
        lastLng = d.lastLocation.lng;
      }
    }

    // FIRST TIME: if lastLocation is missing, create and set currentFuel to either:
    // - If vehicle doc reports a fuelLevel > 0, prefer that, otherwise 100
    if (lastLat === null || lastLng === null) {
      const initialFuel = (typeof vehData.fuelLevel === "number" && vehData.fuelLevel > 0)
        ? vehData.fuelLevel
        : currentFuel;

      await setDoc(
        fuelRef,
        {
          name: vehicleName,
          currentFuel: Number(initialFuel.toFixed ? initialFuel.toFixed(6) : initialFuel),
          totalDistance: totalDistance,
          lastLocation: { lat: location.lat, lng: location.lng },
          history: [],
        },
        { merge: true }
      );
      console.debug(`fuelData initialized for ${vehicleId} (${vehicleName}) -> ${initialFuel}`);
      return;
    }

    // Calculate distance moved since last recorded pos
    const distKm = haversineKm(lastLat, lastLng, location.lat, location.lng);

    // If movement is tiny, skip distance-based drop (but still keep fuel as-is)
    if (distKm < MIN_MOVEMENT_THRESHOLD_KM) {
      // still ensure name is up-to-date
      if (!fuelSnap.exists() || fuelSnap.data().name !== vehicleName) {
        await updateDoc(fuelRef, { name: vehicleName });
      }
      return;
    }

    // Fuel drop calculation
    const fuelDrop = distKm * CONSUMPTION_PER_KM; // percent
    const newFuel = Math.max(0, currentFuel - fuelDrop);
    const newTotalDistance = totalDistance + distKm;

    // Write new fuelData with history entry
    await updateDoc(fuelRef, {
      name: vehicleName,
      currentFuel: Number(newFuel.toFixed(6)),
      totalDistance: Number(newTotalDistance.toFixed(6)),
      lastLocation: { lat: location.lat, lng: location.lng },
      history: arrayUnion({
        ts: Date.now(),
        fuel: Number(newFuel.toFixed(6)),
        distance: Number(distKm.toFixed(6)),
      }),
    });

    console.log(`Fuel updated for ${vehicleId} (${vehicleName}): -${fuelDrop.toFixed(4)}% | dist ${distKm.toFixed(4)} km -> ${newFuel.toFixed(3)}%`);
  } catch (err) {
    console.error("Fuel update failed:", err);
  }
}

// Listen to vehicles and update map + fuelData
onSnapshot(collection(db, "vehicles"), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const data = change.doc.data();
    const id = change.doc.id;

    if (!data || !data.location) return;

    // Update fuel based on distance moved
    updateFuelStats(id, data);

    // Marker updates for map visual
    const { lat, lng } = data.location;

    if (change.type === "added" || change.type === "modified") {
      if (vehicleMarkers[id]) {
        vehicleMarkers[id].setLatLng([lat, lng]);
      } else {
        vehicleMarkers[id] = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`<b>${data.name ?? id}</b><br>${data.number ?? ""}`);
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

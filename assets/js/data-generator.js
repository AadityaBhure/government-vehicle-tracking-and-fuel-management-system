// assets/js/data-generator.js
// ==========================
// Vehicle Data Generator (moves vehicles; initializes fuelLevel if missing)
// ==========================
import { app } from "./firebase-config.js";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const db = getFirestore(app);

const BASE_LAT = 19.95;
const BASE_LNG = 79.30;

// Small random offset generator
function randomOffset() {
  return (Math.random() - 0.5) * 0.003; // ~ ±150-300m
}

// One tick: move vehicles and lightly reduce their internal fuelLevel (simulates hardware)
async function updateVehicles() {
  try {
    const snapshot = await getDocs(collection(db, "vehicles"));
    if (snapshot.empty) return;

    console.log("🔁 Data generator tick — vehicles:", snapshot.size);

    for (const v of snapshot.docs) {
      const ref = doc(db, "vehicles", v.id);
      const data = v.data();

      // Ensure name exists (do not overwrite)
      const name = data.name ?? `Vehicle-${v.id.slice(0, 6)}`;

      // Current position
      let lat = data.location?.lat ?? BASE_LAT;
      let lng = data.location?.lng ?? BASE_LNG;

      // Move
      lat += randomOffset();
      lng += randomOffset();

      // Initialize fuelLevel if missing (don't reset positive existing levels)
      let fuel = typeof data.fuelLevel === "number" ? data.fuelLevel : 100;

      // Simulate small generator drain to reflect "device" reported fuel (0-1.2% per tick)
      fuel = Math.max(0, fuel - Math.random() * 1.2);

      // Build payload
      const payload = {
        name, // ensure name saved if missing
        location: { lat, lng },
        fuelLevel: Number(fuel.toFixed(6)),
        lastUpdated: new Date().toISOString(),
      };

      await updateDoc(ref, payload);
    }
  } catch (err) {
    console.error("Data generator error:", err);
  }
}

// start ticks
setInterval(updateVehicles, 5000);
console.log("⚙️ Vehicle Data Generator running (every 5s).");

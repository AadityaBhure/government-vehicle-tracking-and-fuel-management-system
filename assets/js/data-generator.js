// ==========================
// Vehicle Data Generator Debug Version
// ==========================
import { app } from "../js/firebase-config.js";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const db = getFirestore(app);

// Base coords (Chandrapur)
const BASE_LAT = 19.95;
const BASE_LNG = 79.30;

function randomOffset() {
  return (Math.random() - 0.5) * 0.0015; // ~150m offset
}

async function updateVehicles() {
  console.log("🚀 Running vehicle update tick...");

  try {
    const snapshot = await getDocs(collection(db, "vehicles"));
    console.log(`📦 Found ${snapshot.size} vehicles in Firestore`);

    for (const docSnap of snapshot.docs) {
      const ref = doc(db, "vehicles", docSnap.id);
      const data = docSnap.data();

      console.log(`🔄 Updating: ${data.name} (${docSnap.id})`);

      let lat = data?.location?.lat ?? BASE_LAT;
      let lng = data?.location?.lng ?? BASE_LNG;
      let fuel = data?.fuelLevel ?? 100;

      lat += randomOffset();
      lng += randomOffset();
      fuel = Math.max(fuel - Math.random() * 1.5, 0);

      const payload = {
        location: { lat, lng },
        fuelLevel: fuel,
        lastUpdated: new Date().toISOString(),
      };

      console.log("📤 Writing:", payload);
      await updateDoc(ref, payload);
      console.log("✅ Successfully updated!");
    }
  } catch (err) {
    console.error("❌ Firestore update failed:", err);
  }
}

// Interval: every 5 seconds
setInterval(updateVehicles, 5000);
console.log("⚙️ Vehicle Data Generator initialized (every 5s)");

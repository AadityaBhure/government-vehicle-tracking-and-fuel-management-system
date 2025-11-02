// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"; // ✅ Firestore import

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAEmlJ7-_OYxY_mRJFnS3GkIDXZDrajPk",
  authDomain: "gvtfms.firebaseapp.com",
  projectId: "gvtfms",
  storageBucket: "gvtfms.firebasestorage.app",
  messagingSenderId: "115435034089",
  appId: "1:115435034089:web:7153a3e9148783f472e778",
  measurementId: "G-74TDQ605VY"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app); // ✅ Firestore instance

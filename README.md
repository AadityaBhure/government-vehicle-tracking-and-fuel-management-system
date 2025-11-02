# 🚗 GVTFMS - Government Vehicle Tracking & Fuel Management System

**GVTFMS** (Government Vehicle Tracking and Fuel Management System) is a web-based admin portal built to monitor, track, and manage government vehicles efficiently.  
It features **real-time vehicle location tracking**, **fuel monitoring**, **geofencing**, and **data analytics**, with Firebase as the backend and Leaflet for interactive maps.

---

## 🌍 **Live Demo**
🔗 [Visit GVTFMS on Vercel]([https://your-vercel-project-url.vercel.app](https://government-vehicle-tracking-and-fue.vercel.app/login.html)

---

## 🧩 **Core Features**

### 🔐 Authentication
- Firebase Authentication (Email/Password)
- Admin: full control (add/remove vehicles)
- Regular users: read-only access (view map, data)

### 🚘 Vehicle Management
- Add and remove vehicles (Admin only)
- Store vehicle details in Firestore:
  - Vehicle Name
  - Registration Number (Format: `MH12AB1234`)
  - Type (Car, Truck, JCB, etc.)
- Real-time sync with Firestore

### 🗺️ Live Tracking
- Leaflet.js-based dynamic map
- Vehicles update their positions automatically
- Simulated GPS data (Chandrapur, Maharashtra)
- Marker popup with name, number, and type

### ⛽ Fuel Data (Coming Soon)
- Live fuel level visualization
- Alerts for refills and low fuel

### 🧠 Intelligent Data Generator
- Admin-only background script that:
  - Moves each vehicle randomly every 5 seconds
  - Simulates realistic fuel consumption
  - Updates Firestore in real-time

---

## 🏗️ **Tech Stack**

| Category | Technology |
|-----------|-------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Firebase Firestore |
| Authentication | Firebase Auth |
| Mapping | Leaflet.js + OpenStreetMap |
| Hosting | Vercel |
| Version Control | Git + GitHub |

---


---

## ⚙️ **Setup & Installation**

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/AadityaBhure/GVTFMS.git
cd GVTFMS

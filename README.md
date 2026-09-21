# 🚆 Daily Commute & Travel Tracker

A modern, secure, and responsive web application built to log and track your daily travel modes (**Metro**, **Bus**, or **Holiday**) with real-time statistics, historical backfilling, and user authentication.

Deployed live on [Vercel](https://daily-travel-tracker.vercel.app/).

---

## ✨ Features

* **Secure Authentication:** User accounts powered by Firebase Auth (Email/Password sign-in & sign-up).
* **Daily Choice Dashboard:** A clean landing page featuring time-sensitive warm greetings, current date tracking, and 3 distinct interactive mode selectors (**Metro**, **Bus**, and **Holiday**).
* **Statistics & Analytics:** Real-time breakdown of your travel habits filtered by **This Month**, **All-Time**, or **Custom Date Ranges**, complete with a visual distribution bar.
* **History & Backfilling:** Easily view past logs and catch up on missed days by backfilling or editing previous dates.
* **Dark Mode UI:** Built with Tailwind CSS using a sleek, low-light slate palette and neon accents.
* **Cloud Persistence:** Securely syncs your travel history across devices using Firebase Firestore.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, Tailwind CSS, JavaScript (ES6 Modules), FontAwesome
* **Backend & Database:** Firebase Authentication & Cloud Firestore (Free Tier)
* **Hosting:** Vercel

---

## 📂 Project Structure

```text
travel-tracker/
├── index.html           # Main UI structure & views
├── style.css            # Custom styling & font configuration
├── firebase-config.js   # Firebase SDK initialization & keys
├── app.js               # Application logic, auth handlers, & Firestore sync
└── vercel.json          # Routing configuration for Vercel deployment

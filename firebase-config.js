// Firebase web config for the quartermass-merci / powellriver-8fa73 project.
// NOTE: `databaseURL` must be filled in AFTER you create the Realtime Database
// in the Firebase console (Build → Realtime Database → Create database). The
// console will show it; paste it below. Until then, the app runs in LOCAL ONLY
// mode (saves to browser localStorage only).
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAOxupEsXqLvcZzDOVoSlAMCgNjEqDwS6Q",
  authDomain: "powellriver-8fa73.firebaseapp.com",
  // Typical default form — replace with the exact URL shown in the Realtime
  // Database console once you create it (e.g. "...-default-rtdb.firebaseio.com"
  // or "...-default-rtdb.northamerica-northeast1.firebasedatabase.app").
  databaseURL: "https://powellriver-8fa73-default-rtdb.firebaseio.com",
  projectId: "powellriver-8fa73",
  storageBucket: "powellriver-8fa73.firebasestorage.app",
  messagingSenderId: "434974521652",
  appId: "1:434974521652:web:dc7f690ad2555f4a710d61",
  measurementId: "G-LWGVPVKXHX",
};

// Which trip document to read/write. Change if you run multiple trips off the
// same Firebase project.
window.TRIP_ID = "meridian-powell-river";

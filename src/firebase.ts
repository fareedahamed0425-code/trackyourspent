import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, initializeAuth, browserLocalPersistence, indexedDBLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJDkI1eW0HCJWSNF3MXf1Ikp2HJeBvR1E",
  authDomain: "trackyourspent.firebaseapp.com",
  projectId: "trackyourspent",
  storageBucket: "trackyourspent.firebasestorage.app",
  messagingSenderId: "104736479081",
  appId: "1:104736479081:web:ed20d687b76bac82788ff8",
  measurementId: "G-FH8G39QLFG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics safely (it might fail if blocked by adblockers, but we'll export it anyway)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics initialization failed:", e);
}

export { analytics };
// Explicitly initialize auth with local persistence to prevent refresh logouts
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence]
});
export const db = getFirestore(app);

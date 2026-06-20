import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBU_QV0EqrhP2luX2Zm-ZNpTAqKb8JG6y0",
  authDomain: "caloriescalc-a6da6.firebaseapp.com",
  projectId: "caloriescalc-a6da6",
  storageBucket: "caloriescalc-a6da6.firebasestorage.app",
  messagingSenderId: "617548968939",
  appId: "1:617548968939:web:855e18d2422b3d6e74dfae",
  measurementId: "G-LYWM3S11HQ"
};

// Initialize Firebase (singleton pattern for Next.js SSR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, googleProvider, analytics };

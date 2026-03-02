
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDRqBClAY2DtNH6Gf6RzJ__mHOyJ0wsNo0",
  authDomain: "seteuk-angle.firebaseapp.com",
  projectId: "seteuk-angle",
  storageBucket: "seteuk-angle.firebasestorage.app",
  messagingSenderId: "762079873690",
  appId: "1:762079873690:web:92fb5661471eae4ce6ed23",
  measurementId: "G-02STC6ECEM"
};

// Initialize Firebase (Singleton Pattern)
// Prevents "Firebase App named '[DEFAULT]' already exists" error during HMR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);

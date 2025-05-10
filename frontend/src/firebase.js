// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Import Firebase Authentication
import { getFirestore } from "firebase/firestore";  // Import Firestore
import { getAnalytics } from "firebase/analytics";  // Import Firebase Analytics (if needed)
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDQhqQAXP5_kuR9Jg0poh9EEOparuy9ac",
  authDomain: "gennews-2e5b4.firebaseapp.com",
  projectId: "gennews-2e5b4",
  storageBucket: "gennews-2e5b4.appspot.com",
  messagingSenderId: "683783578270",
  appId: "1:683783578270:web:412d2ec688104a4889d18f",
  measurementId: "G-P6W8NS36GK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);  // Initialize Firebase Analytics

// Initialize Firebase services
const auth = getAuth(app);  // Initialize Firebase Authentication
const db = getFirestore(app);  // Initialize Firestore

export { auth, db };  // Export Firebase services to use in other files

export const storage = getStorage(app);
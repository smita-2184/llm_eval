import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQ7VSQNN-xXLKMYAcA0uMSkTe6a--MgOw",
  authDomain: "llm-compare-79a2c.firebaseapp.com",
  projectId: "llm-compare-79a2c",
  storageBucket: "llm-compare-79a2c.firebasestorage.app",
  messagingSenderId: "859699356557",
  appId: "1:859699356557:web:e582c86dc389a0d78513c4",
  measurementId: "G-MZ63XTF7W4",
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { app, db, auth }


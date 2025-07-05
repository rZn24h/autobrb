import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyABqoSUQFyIR5NsrKqOhRRo_LsxLKEftPs",
  authDomain: "autod-c1eb7.firebaseapp.com",
  projectId: "autod-c1eb7",
  storageBucket: "autod-c1eb7.firebasestorage.app",
  messagingSenderId: "1059205423463",
  appId: "1:1059205423463:web:7c59008e37ea4cd6250fc2",
  measurementId: "G-R1HGYJEYE4"
};

// Initialize Firebase
let app: any;
let auth: any;
let db: any;
let storage: any;

// Lazy initialization pentru a evita problemele cu undici în build
if (typeof window !== 'undefined') {
  // Client-side initialization
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  // Server-side initialization cu fallback
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('Firebase initialization failed on server:', error);
    // Fallback pentru server-side rendering
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
}

// Export the services
export { auth, db, storage };
export default app; 
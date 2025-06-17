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
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the app instance if needed
export default app; 
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD1tAXu5CyLRqTGABxpZr7Wq9oEVpFJXD0",
  authDomain: "times-up-etud-2025.firebaseapp.com",
  projectId: "times-up-etud-2025",
  storageBucket: "times-up-etud-2025.firebasestorage.app",
  messagingSenderId: "746604160214",
  appId: "1:746604160214:web:564f3686ef59ea345e9577"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

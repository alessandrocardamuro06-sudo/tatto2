import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB7hlQvABDBpZiz27MROAD5Uar-YqgZC7s",
  authDomain: "tattostudio-871a8.firebaseapp.com",
  projectId: "tattostudio-871a8",
  storageBucket: "tattostudio-871a8.firebasestorage.app",
  messagingSenderId: "356880787394",
  appId: "1:356880787394:web:1f20922496f5e8db9c985b",
  measurementId: "G-JBKGRR53H8"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

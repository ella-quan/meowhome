import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Lazy initialization - only initialize when first accessed
let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

const getApp = () => {
  if (!_app) {
    _app = initializeApp(firebaseConfig);
  }
  return _app;
};

export const db = new Proxy({} as Firestore, {
  get: (_target, prop) => {
    if (!_db) {
      _db = getFirestore(getApp());
    }
    return (_db as any)[prop];
  }
});

export const storage = new Proxy({} as FirebaseStorage, {
  get: (_target, prop) => {
    if (!_storage) {
      _storage = getStorage(getApp());
    }
    return (_storage as any)[prop];
  }
});

// Lazy load analytics only when needed (improves initial load performance)
export const initAnalytics = async () => {
  const { getAnalytics } = await import("firebase/analytics");
  return getAnalytics(getApp());
};
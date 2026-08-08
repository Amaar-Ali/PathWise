import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";

function buildFirebaseConfig() {
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    ...(measurementId ? { measurementId } : {}),
  };
}

function assertConfig() {
  const required = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ] as const;

  for (const key of required) {
    if (!import.meta.env[key]) {
      throw new Error(`Missing Firebase env: ${key}. Copy .env.example → .env.local`);
    }
  }
}

export function getFirebaseApp(): FirebaseApp {
  assertConfig();
  return getApps().length ? getApp() : initializeApp(buildFirebaseConfig());
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

let analytics: Analytics | null = null;

export function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === "undefined") return null;
  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) return null;
  if (!analytics) {
    analytics = getAnalytics(getFirebaseApp());
  }
  return analytics;
}

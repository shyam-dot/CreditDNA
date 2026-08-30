import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD3g0VKNj1eEC_ijI7TP7Xm8vB2nCz3lPI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "credit-dna.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "credit-dna",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "credit-dna.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1001502583985",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1001502583985:web:33adaaf67bb095d0750690",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NQTG2H4Y8V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (supported in browser environments)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export default app;



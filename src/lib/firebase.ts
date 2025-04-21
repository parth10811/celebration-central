import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, Timestamp, doc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const logoutUser = () => {
  return signOut(auth);
};

// Enhanced helper functions for Firestore Timestamp
export const formatTimestamp = (timestamp: Timestamp | undefined | null): string => {
  if (!timestamp) return '';
  
  try {
    if (typeof timestamp === 'object' && 'toDate' in timestamp) {
      return timestamp.toDate().toLocaleString();
    } else if (typeof timestamp === 'string') {
      return timestamp;
    } else {
      console.error("Invalid timestamp format:", timestamp);
      return 'Invalid date';
    }
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return 'Invalid date';
  }
};

// Format timestamp specifically for display in event cards
export const formatEventDate = (timestamp: Timestamp | string | undefined | null): string => {
  if (!timestamp) return '';
  
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  
  try {
    if (typeof timestamp === 'object' && 'toDate' in timestamp) {
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      console.error("Invalid timestamp format:", timestamp);
      return 'Invalid date';
    }
  } catch (error) {
    console.error("Error formatting event date:", error);
    return 'Invalid date';
  }
};

export default app;

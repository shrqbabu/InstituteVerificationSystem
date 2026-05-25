/**
 * Firebase Configuration and Initialization
 * Configures Firebase app with all required services
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// Firebase Configuration
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyCm7G7x0bPr3yv_tDybt5OMeOpHkk3UXwM",
  authDomain: "ludo-app-e057c.firebaseapp.com",
  projectId: "ludo-app-e057c",
  storageBucket: "ludo-app-e057c.firebasestorage.app",
  messagingSenderId: "411916703311",
  appId: "1:411916703311:web:efe12916dba86bd5993c3a",
  measurementId: "G-RC7H37JFZ9"
};

// ============================================================
// Initialize Firebase App (Singleton Pattern)
// ============================================================
const app = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

// ============================================================
// Initialize Firebase Auth with AsyncStorage Persistence
// ============================================================
let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Auth already initialized
  auth = getAuth(app);
}

// ============================================================
// Initialize Firestore Database
// ============================================================
const db = getFirestore(app);

// ============================================================
// Initialize Firebase Storage
// ============================================================
const storage = getStorage(app);

export { app, auth, db, storage };

// ============================================================
// Firestore Collection Names
// ============================================================
export const COLLECTIONS = {
  USERS: 'users',
  CERTIFICATES: 'certificates',
  DOWNLOADS: 'downloads',
  VERIFICATION_LOGS: 'verification_logs',
};

// ============================================================
// Storage Paths
// ============================================================
export const STORAGE_PATHS = {
  CERTIFICATES: 'certificates',
  PHOTOS: 'photos',
  PDFS: 'pdfs',
};

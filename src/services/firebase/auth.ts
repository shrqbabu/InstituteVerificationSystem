/**
 * Firebase Authentication Service
 * Handles all auth operations: login, logout, user management
 */

import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, COLLECTIONS } from './config';
import { User, UserRole } from '../../types';

// ============================================================
// Admin Login
// ============================================================
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const userDoc = await getDoc(
      doc(db, COLLECTIONS.USERS, userCredential.user.uid)
    );

    if (!userDoc.exists()) {
      throw new Error('User profile not found. Contact administrator.');
    }

    const userData = userDoc.data();
    
    // Update last login timestamp
    await updateDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
      lastLoginAt: serverTimestamp(),
    });

    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      displayName: userData.displayName || userCredential.user.displayName || '',
      role: userData.role as UserRole,
      createdAt: userData.createdAt?.toDate() || new Date(),
      lastLoginAt: new Date(),
    };
  } catch (error: any) {
    // Map Firebase errors to user-friendly messages
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('No account found with this email.');
      case 'auth/wrong-password':
        throw new Error('Invalid password. Please try again.');
      case 'auth/invalid-email':
        throw new Error('Invalid email format.');
      case 'auth/too-many-requests':
        throw new Error('Too many attempts. Account temporarily locked.');
      case 'auth/network-request-failed':
        throw new Error('Network error. Check your connection.');
      default:
        throw new Error(error.message || 'Login failed. Please try again.');
    }
  }
};

// ============================================================
// Create Admin User (Setup Only)
// ============================================================
export const createAdminUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(userCredential.user, { displayName });

    const userData: Omit<User, 'uid'> = {
      email,
      displayName,
      role: 'admin',
      createdAt: new Date(),
    };

    await setDoc(
      doc(db, COLLECTIONS.USERS, userCredential.user.uid),
      {
        ...userData,
        createdAt: serverTimestamp(),
      }
    );

    return {
      uid: userCredential.user.uid,
      ...userData,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create admin user.');
  }
};

// ============================================================
// Logout
// ============================================================
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error('Logout failed. Please try again.');
  }
};

// ============================================================
// Get User Profile from Firestore
// ============================================================
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    
    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    return {
      uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role as UserRole,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate(),
      photoURL: data.photoURL,
    };
  } catch (error) {
    return null;
  }
};

// ============================================================
// Auth State Observer
// ============================================================
export const observeAuthState = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

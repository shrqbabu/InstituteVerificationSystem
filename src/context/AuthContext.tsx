/**
 * Authentication Context
 * Provides auth state and operations throughout the app
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { User } from '../types';
import {
  loginWithEmail,
  logout as firebaseLogout,
  getUserProfile,
  observeAuthState,
} from '../services/firebase/auth';

// ============================================================
// Context Interface
// ============================================================
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

// ============================================================
// Create Context
// ============================================================
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ============================================================
// Auth Provider Component
// ============================================================
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // Observe Firebase Auth State
  // ============================================================
  useEffect(() => {
    const unsubscribe = observeAuthState(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setUser(userProfile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ============================================================
  // Login Handler
  // ============================================================
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await loginWithEmail(email, password);
      setUser(userData);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================
  // Logout Handler
  // ============================================================
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await firebaseLogout();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// Custom Hook
// ============================================================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

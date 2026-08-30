import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { syncUser } from '../lib/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Timeout after 6 seconds so app never hangs if backend is slow
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('sync timeout')), 6000)
          );
          const syncResult = await Promise.race([
            syncUser(
              firebaseUser.uid,
              firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              firebaseUser.email || ''
            ),
            timeout,
          ]);
          setHasOnboarded(syncResult.has_onboarded);
        } catch {
          // Backend unreachable or timed out — still allow app to proceed
          setHasOnboarded(false);
        }
      } else {
        setHasOnboarded(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const result = await syncUser(
      cred.user.uid,
      cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
      cred.user.email || ''
    );
    setHasOnboarded(result.has_onboarded);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const result = await syncUser(
      cred.user.uid,
      cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
      cred.user.email || ''
    );
    setHasOnboarded(result.has_onboarded);
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const result = await syncUser(cred.user.uid, name, cred.user.email || '');
    setHasOnboarded(result.has_onboarded);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setHasOnboarded(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        hasOnboarded,
        setHasOnboarded,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


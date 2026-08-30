import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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
  const loadingDone = useRef(false);

  const finishLoading = () => {
    if (!loadingDone.current) {
      loadingDone.current = true;
      setLoading(false);
    }
  };

  useEffect(() => {
    // Hard timeout: never stay in loading state for more than 3 seconds
    const globalTimeout = setTimeout(() => {
      finishLoading();
    }, 3000);

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(globalTimeout);
      setUser(firebaseUser);

      if (firebaseUser) {
        // Try to sync with backend but don't block the UI
        syncUser(
          firebaseUser.uid,
          firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          firebaseUser.email || ''
        )
          .then((res) => setHasOnboarded(res.has_onboarded))
          .catch(() => setHasOnboarded(false));
      } else {
        setHasOnboarded(false);
      }

      finishLoading();
    });

    return () => {
      clearTimeout(globalTimeout);
      unsub();
    };
  }, []);

  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    try {
      const result = await syncUser(
        cred.user.uid,
        cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
        cred.user.email || ''
      );
      setHasOnboarded(result.has_onboarded);
    } catch {
      setHasOnboarded(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    try {
      const result = await syncUser(
        cred.user.uid,
        cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
        cred.user.email || ''
      );
      setHasOnboarded(result.has_onboarded);
    } catch {
      setHasOnboarded(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    try {
      const result = await syncUser(cred.user.uid, name, cred.user.email || '');
      setHasOnboarded(result.has_onboarded);
    } catch {
      setHasOnboarded(false);
    }
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

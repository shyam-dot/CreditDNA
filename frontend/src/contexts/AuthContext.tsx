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
  signInDemo: () => Promise<void>;
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
    // Check if demo user is stored in session
    const demoUser = sessionStorage.getItem('creditdna_demo_user');
    if (demoUser) {
      try {
        const parsed = JSON.parse(demoUser);
        setUser(parsed as unknown as User);
        setHasOnboarded(true);
        finishLoading();
        return;
      } catch {
        sessionStorage.removeItem('creditdna_demo_user');
      }
    }

    // Hard timeout: max 2.5s waiting for Firebase initialization
    const globalTimeout = setTimeout(() => {
      finishLoading();
    }, 2500);

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(globalTimeout);
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fire-and-forget sync: never block the UI
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
    // With 15s safety timeout
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Google sign-in timed out. Please try again or use email login.')), 15000)
    );
    const cred = await Promise.race([
      signInWithPopup(auth, googleProvider),
      timeout
    ]);
    
    syncUser(
      cred.user.uid,
      cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
      cred.user.email || ''
    )
      .then((res) => setHasOnboarded(res.has_onboarded))
      .catch(() => setHasOnboarded(false));
  };

  const signInWithEmail = async (email: string, password: string) => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Authentication timed out. Check your connection.')), 10000)
    );
    const cred = await Promise.race([
      signInWithEmailAndPassword(auth, email, password),
      timeout
    ]);

    syncUser(
      cred.user.uid,
      cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
      cred.user.email || ''
    )
      .then((res) => setHasOnboarded(res.has_onboarded))
      .catch(() => setHasOnboarded(false));
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Registration timed out. Check your connection.')), 10000)
    );
    const cred = await Promise.race([
      createUserWithEmailAndPassword(auth, email, password),
      timeout
    ]);
    await updateProfile(cred.user, { displayName: name });
    syncUser(cred.user.uid, name, cred.user.email || '')
      .then((res) => setHasOnboarded(res.has_onboarded))
      .catch(() => setHasOnboarded(false));
  };

  const signInDemo = async () => {
    const mockDemoUser = {
      uid: 'mock_token_demo_user',
      displayName: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      getIdToken: async () => 'mock_token_demo_user',
    };
    sessionStorage.setItem('creditdna_demo_user', JSON.stringify(mockDemoUser));
    setUser(mockDemoUser as unknown as User);
    setHasOnboarded(true);
    syncUser('mock_token_demo_user', 'Alex Morgan', 'alex.morgan@example.com')
      .then((res) => setHasOnboarded(res.has_onboarded))
      .catch(() => setHasOnboarded(false));
  };

  const signOut = async () => {
    sessionStorage.removeItem('creditdna_demo_user');
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignore signOut errors
    }
    setUser(null);
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
        signInDemo,
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

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { syncUser } from '../lib/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  hasLinkedAccount: boolean;
  setHasLinkedAccount: (v: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ isNewUser: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLinkedAccount, setHasLinkedAccount] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const syncResult = await syncUser(
            firebaseUser.uid,
            firebaseUser.displayName || 'User',
            firebaseUser.email || ''
          );
          setHasLinkedAccount(syncResult.has_linked_account);
        } catch {
          // Silently handle — user may not be in DB yet on first load
        }
      } else {
        setHasLinkedAccount(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const result = await syncUser(
      cred.user.uid,
      cred.user.displayName || 'User',
      cred.user.email || ''
    );
    setHasLinkedAccount(result.has_linked_account);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await syncUser(cred.user.uid, name, email);
    setHasLinkedAccount(false);
    return { isNewUser: true };
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setHasLinkedAccount(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, hasLinkedAccount, setHasLinkedAccount, signIn, signUp, signOut }}
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

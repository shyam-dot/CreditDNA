import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  // Safety net: if Firebase takes more than 8 seconds, stop waiting
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, []);

  if (loading && !timedOut) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-[#00D4FF]/30 border-t-[#00D4FF] rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-sans">Connecting to Firebase…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

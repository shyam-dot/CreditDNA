import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, AlertCircle, Cpu, Lock, ArrowLeft } from 'lucide-react';

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const { signIn, signUp, hasLinkedAccount } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password, name);
        navigate('/connect');
      } else {
        await signIn(email, password);
        setTimeout(() => {
          navigate(hasLinkedAccount ? '/dashboard' : '/connect', { replace: true });
        }, 100);
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Something went wrong';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Incorrect email or password.');
      } else if (msg.includes('email-already-in-use')) {
        setError('An account with this email already exists.');
      } else if (msg.includes('weak-password')) {
        setError('Password must be at least 6 characters.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col items-center justify-center px-4 relative selection:bg-[#00D4FF]/30 selection:text-[#00D4FF]">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00D4FF]/10 blur-3xl rounded-full pointer-events-none" />

      {/* Top Bar Back Link */}
      <div className="absolute top-6 left-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          <span>BACK TO LANDING</span>
        </Link>
      </div>

      {/* Brand Logo */}
      <div className="mb-8 flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF] via-[#2DD4BF] to-emerald-400 p-[1px] shadow-[0_0_20px_rgba(0,212,255,0.4)]">
          <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-[#00D4FF]" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-space font-extrabold tracking-tight text-white">
            Credit<span className="text-[#00D4FF]">DNA</span>
          </span>
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Risk Terminal Auth</span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md glass-card p-8 border border-white/10 relative z-10 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-space font-bold text-white mb-1.5">
            {mode === 'login' ? 'Terminal Authentication' : 'Create Risk Account'}
          </h1>
          <p className="text-xs font-mono text-gray-400">
            {mode === 'login'
              ? '// Enter your credentials to access your resilience profile.'
              : '// Register to quantify income stability & shock endurance.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {mode === 'signup' && (
            <div>
              <label className="input-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="Aisha Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="input-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-950/70 border border-rose-500/30 rounded-xl px-4 py-3 animate-in">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            className="btn-primary w-full mt-3 py-3.5 text-xs font-mono font-bold"
            disabled={loading}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-[#0B0F19] border-t-transparent rounded-full animate-spin" />
            ) : mode === 'login' ? 'AUTHENTICATE & ENTER' : 'CREATE TERMINAL ACCOUNT'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center font-mono text-xs">
          <button
            id="auth-mode-toggle"
            type="button"
            onClick={toggle}
            className="text-gray-400 hover:text-[#00D4FF] transition-colors"
          >
            {mode === 'login'
              ? "// New user? Create a profile"
              : '// Existing account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}

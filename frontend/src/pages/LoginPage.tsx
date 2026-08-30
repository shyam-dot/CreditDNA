import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Cpu, ArrowLeft, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';

type Tab = 'login' | 'signup';

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInDemo } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Failed to sign in with Google';
      if (!msg.includes('popup-closed-by-user')) {
        setError(msg);
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError('');
    setLoadingDemo(true);
    try {
      await signInDemo();
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError('Demo login failed. Try again.');
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (tab === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoadingEmail(true);
    try {
      if (tab === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(name.trim(), email, password);
      }
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const raw = (err as { message?: string })?.message || '';
      if (raw.includes('user-not-found') || raw.includes('wrong-password') || raw.includes('invalid-credential')) {
        setError('Invalid email or password.');
      } else if (raw.includes('email-already-in-use')) {
        setError('This email is already registered. Try signing in instead.');
      } else if (raw.includes('weak-password')) {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError(raw || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col items-center justify-center px-4 relative selection:bg-[#00D4FF]/30 selection:text-[#00D4FF] font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00D4FF]/10 blur-3xl rounded-full pointer-events-none" />
      
      <div className="absolute top-6 left-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="mb-8 flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF] via-[#2DD4BF] to-emerald-400 p-[1px] shadow-[0_0_20px_rgba(0,212,255,0.4)]">
          <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-[#00D4FF]" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-white">Credit<span className="text-[#00D4FF]">DNA</span></span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Financial Risk Platform</span>
        </div>
      </div>

      <div className="w-full max-w-md glass-card p-8 border border-white/10 relative z-10 shadow-2xl rounded-2xl">
        <h1 className="text-2xl font-bold text-white mb-1 text-center">Terminal Authentication</h1>
        <p className="text-xs text-gray-400 leading-relaxed text-center mb-6">Access your Financial DNA &amp; Resilience Profile</p>

        <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6 p-1 bg-white/5">
          {(['login', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${tab === t ? 'bg-[#00D4FF] text-[#0B0F19] shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loadingGoogle || loadingEmail || loadingDemo}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 active:scale-[0.98] py-3 px-4 rounded-xl text-xs font-bold shadow-lg transition-all duration-200 mb-3"
        >
          {loadingGoogle ? (
            <span className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* 1-Click Instant Demo Login */}
        <button
          type="button"
          onClick={handleDemoSignIn}
          disabled={loadingGoogle || loadingEmail || loadingDemo}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00D4FF]/15 to-emerald-400/15 border border-[#00D4FF]/30 hover:border-[#00D4FF]/60 text-[#00D4FF] py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 mb-4"
        >
          {loadingDemo ? (
            <span className="w-4 h-4 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles size={14} className="text-[#00D4FF]" />
              <span>Explore Instant Demo Mode</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-gray-500 uppercase font-semibold">or with email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          {tab === 'signup' && (
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/60 transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/60 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min. 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/60 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-950/70 border border-rose-500/30 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loadingGoogle || loadingEmail || loadingDemo}
            className="w-full btn-primary py-3 text-xs font-bold mt-1"
          >
            {loadingEmail ? (
              <span className="w-4 h-4 border-2 border-[#0B0F19] border-t-transparent rounded-full animate-spin inline-block" />
            ) : tab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-5 text-xs text-gray-400 text-center">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setTab(tab === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="text-[#00D4FF] hover:underline font-semibold"
          >
            {tab === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

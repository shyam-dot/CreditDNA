import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ChevronRight, LogIn, Gauge, Zap, UserCheck, Code2 } from 'lucide-react';

export default function TerminalHeader() {
  const [timeStr, setTimeStr] = useState<string>('');
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
        scrolled
          ? 'bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo & Status */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D4FF] via-[#2DD4BF] to-emerald-400 p-[1px] shadow-[0_0_15px_rgba(0,212,255,0.4)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#00D4FF]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-space font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                Credit<span className="text-[#00D4FF]">DNA</span>
              </span>
              <span className="text-[10px] text-gray-400 tracking-wider uppercase font-medium">
                Resilience Engine
              </span>
            </div>
          </Link>

          {/* Vertical Divider */}
          <div className="hidden sm:block h-6 w-[1px] bg-white/10" />

          {/* Operational Badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>System Online</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2 text-xs font-medium">
          <a
            href="#resilience-gauge"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200"
          >
            <Gauge className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>Resilience Matrix</span>
          </a>

          <a
            href="#stress-test"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Stress Simulator</span>
          </a>

          <a
            href="#demo-profiles"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Profiles</span>
          </a>

          <a
            href="#how-it-works"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200"
          >
            <Code2 className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Architecture</span>
          </a>
        </nav>

        {/* Right Section: Time Ticker & CTAs */}
        <div className="flex items-center gap-3">
          {/* Live UTC Ticker */}
          <div className="hidden md:block text-[11px] font-mono text-gray-400 bg-white/5 px-2.5 py-1 rounded border border-white/5">
            {timeStr || '12:00:00 UTC'}
          </div>

          <Link
            to="/login"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>

          <Link
            to="/dashboard"
            className="btn-primary py-2 px-4 text-xs font-semibold tracking-wide flex items-center gap-1.5"
          >
            <span>Launch Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#0B0F19]" />
          </Link>
        </div>
      </div>
    </header>
  );
}

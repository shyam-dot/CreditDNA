import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowRight, ShieldCheck } from 'lucide-react';

export default function TerminalFooter() {
  return (
    <footer className="bg-[#070A10] border-t border-white/10 relative z-10 pt-16 pb-12 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Pre-Footer Banner */}
        <div className="glass-card p-8 md:p-12 border border-[#00D4FF]/30 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-[#111827] via-[#151D2F] to-[#0B0F19]">
          {/* Subtle cyan glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4FF]/10 blur-3xl rounded-full pointer-events-none" />

          <div className="space-y-3 text-center md:text-left relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Production Ready</span>
            </div>
            <h3 className="font-space font-bold text-white text-2xl md:text-3xl tracking-tight">
              Build Your Financial Resilience Profile
            </h3>
            <p className="text-gray-400 text-sm font-sans">
              Connect your account aggregator or try demo profiles with instant explainable intelligence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10">
            <Link to="/dashboard" className="btn-primary">
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4 text-[#0B0F19]" />
            </Link>
          </div>
        </div>

        {/* Clean Footer Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10 text-sm text-gray-400 font-sans">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#2DD4BF] p-[1px]">
              <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
                <Cpu className="w-4 h-4 text-[#00D4FF]" />
              </div>
            </div>
            <div>
              <span className="font-space font-bold text-white text-base">CreditDNA</span>
              <span className="text-gray-400 text-xs ml-2">· Financial Resilience & Risk Intelligence</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400">
            <a href="#resilience-gauge" className="hover:text-[#00D4FF] transition-colors">Resilience Gauge</a>
            <a href="#stress-test" className="hover:text-[#00D4FF] transition-colors">Stress Simulator</a>
            <a href="#demo-profiles" className="hover:text-[#00D4FF] transition-colors">Demo Profiles</a>
            <Link to="/login" className="hover:text-[#00D4FF] transition-colors">Sign In</Link>
            <Link to="/dashboard" className="hover:text-[#00D4FF] transition-colors">Dashboard</Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4 pt-2">
          <div>© {new Date().getFullYear()} CreditDNA. All rights reserved. Powered by Explainable ML.</div>
          <div>Built with precision for financial stability</div>
        </div>
      </div>
    </footer>
  );
}

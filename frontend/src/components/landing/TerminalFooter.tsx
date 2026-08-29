import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Terminal, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export default function TerminalFooter() {
  return (
    <footer className="bg-[#070A10] border-t border-white/10 relative z-10 pt-16 pb-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Pre-Footer Banner */}
        <div className="glass-card p-8 md:p-12 border border-[#00D4FF]/30 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-[#111827] via-[#151D2F] to-[#0B0F19]">
          {/* Subtle cyan glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4FF]/10 blur-3xl rounded-full pointer-events-none" />

          <div className="space-y-3 text-center md:text-left relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>READY FOR DEPLOYMENT</span>
            </div>
            <h3 className="font-space font-bold text-white text-2xl md:text-3xl tracking-tight">
              Start Building Your Financial Resilience Profile Today
            </h3>
            <p className="text-gray-400 text-sm font-sans">
              Connect your account aggregator or try demo profiles with instant SHAP explainability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10">
            <Link to="/dashboard" className="btn-primary">
              <Terminal className="w-4 h-4 text-[#0B0F19]" />
              <span>Launch Terminal</span>
              <ArrowRight className="w-4 h-4 text-[#0B0F19]" />
            </Link>
          </div>
        </div>

        {/* System Specs Bar */}
        <div className="py-4 px-6 rounded-xl bg-white/5 border border-white/5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="text-white font-semibold">CREDIT_DNA_OS</span>
            <span>v1.0.0-RELEASE</span>
            <span>•</span>
            <span className="text-emerald-400">STATUS: 200 OK</span>
          </div>
          <div className="flex items-center gap-4">
            <span>ENGINE: XGBOOST + SHAP</span>
            <span>•</span>
            <span>LATENCY: 12ms</span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6 text-xs font-mono text-gray-400">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00D4FF]" />
              <span className="font-space font-bold text-white text-base">CreditDNA</span>
            </div>
            <p className="font-sans text-gray-400 leading-relaxed text-xs">
              Explainable ML Financial Resilience Profiling & Stress Testing Platform.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-white font-bold mb-3">// ARCHITECTURE</div>
            <div><a href="#resilience-gauge" className="hover:text-[#00D4FF] transition-colors">Resilience Gauge</a></div>
            <div><a href="#stress-test" className="hover:text-[#00D4FF] transition-colors">Stress Simulator</a></div>
            <div><a href="#demo-profiles" className="hover:text-[#00D4FF] transition-colors">Demo Profiles</a></div>
          </div>

          <div className="space-y-2">
            <div className="text-white font-bold mb-3">// TECH STACK</div>
            <div>FastAPI + Firebase Admin</div>
            <div>React 18 + Tailwind CSS</div>
            <div>scikit-learn + XGBoost</div>
            <div>Llama 3.1 LLM Engine</div>
          </div>

          <div className="space-y-2">
            <div className="text-white font-bold mb-3">// TERMINAL ACCESS</div>
            <div><Link to="/login" className="hover:text-[#00D4FF]">Sign In</Link></div>
            <div><Link to="/connect" className="hover:text-[#00D4FF]">Account Aggregator</Link></div>
            <div><Link to="/dashboard" className="hover:text-[#00D4FF]">Dashboard</Link></div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-gray-500 gap-4">
          <div>© {new Date().getFullYear()} CreditDNA. All rights reserved. Powered by Firebase & Explainable ML.</div>
          <div className="flex items-center gap-1">
            <span>Built with precision for financial stability</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

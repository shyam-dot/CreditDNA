import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Sparkles, Building2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AccountProfile {
  id: string;
  name: string;
  bank: string;
  accountNo: string;
  type: string;
  monthlyIncome: string;
  score: number;
  statusLabel: string;
  statusClass: string;
  sustainableLimit: string;
  dimensions: { name: string; score: number }[];
  llmSummary: string;
}

const profiles: AccountProfile[] = [
  {
    id: 'aisha',
    name: 'Aisha Verma',
    bank: 'HDFC Bank',
    accountNo: '••••4821',
    type: 'Salaried Professional',
    monthlyIncome: '₹85,000 / mo',
    score: 86.2,
    statusLabel: 'STRONG RESILIENCE',
    statusClass: 'text-emerald-400 bg-emerald-950/70 border-emerald-500/30',
    sustainableLimit: '₹440,000',
    dimensions: [
      { name: 'Income Stability', score: 100 },
      { name: 'Cash Flow Health', score: 67.1 },
      { name: 'Debt Pressure', score: 64.7 },
      { name: 'Savings Buffer', score: 100 },
      { name: 'Spending Stability', score: 98.8 },
      { name: 'Payment Discipline', score: 100 },
    ],
    llmSummary:
      'Aisha maintains pristine income consistency with zero missed payments over 24 months. Her liquid emergency fund covers 7.2 months of fixed obligations.',
  },
  {
    id: 'rahul',
    name: 'Rahul Nair',
    bank: 'Axis Bank',
    accountNo: '••••3307',
    type: 'Independent Freelancer',
    monthlyIncome: '₹42,000 / mo (Variable)',
    score: 31.5,
    statusLabel: 'HIGH RISK STRAIN',
    statusClass: 'text-rose-400 bg-rose-950/70 border-rose-500/30',
    sustainableLimit: '₹0 (No New Debt)',
    dimensions: [
      { name: 'Income Stability', score: 47.3 },
      { name: 'Cash Flow Health', score: 0.0 },
      { name: 'Debt Pressure', score: 14.3 },
      { name: 'Savings Buffer', score: 13.9 },
      { name: 'Spending Stability', score: 87.8 },
      { name: 'Payment Discipline', score: 60.0 },
    ],
    llmSummary:
      'Rahul experiences high cash-flow volatility with 2 recent late fee penalties. Current DTI ratio exceeds 58%, making additional debt unsustainable without income stabilization.',
  },
];

export default function DemoAccountSwitcher() {
  const [activeProfile, setActiveProfile] = useState<AccountProfile>(profiles[0]);

  return (
    <section id="demo-profiles" className="py-24 px-6 bg-[#0B0F19] relative z-10 border-t border-white/10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-accent/10 border border-[#00D4FF]/30 text-xs font-mono text-[#00D4FF]">
            <UserCheck className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>LIVE DEMO PROFILES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-space font-bold text-white tracking-tight">
            See CreditDNA In Action
          </h2>
          <p className="text-gray-400 font-sans text-base">
            Switch between demo accounts pre-loaded into Firestore to observe how CreditDNA handles contrasting income structures and risk profiles.
          </p>
        </div>

        {/* Switcher Buttons with Framer Motion layoutId pill */}
        <div className="flex justify-center gap-3 bg-white/5 p-1.5 rounded-2xl max-w-md mx-auto border border-white/10 font-mono text-xs">
          {profiles.map((p) => {
            const isActive = activeProfile.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveProfile(p)}
                className={`relative flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeProfileBg"
                    className="absolute inset-0 bg-[#111827] rounded-xl border border-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.25)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#00D4FF]' : 'bg-gray-500'}`} />
                  {p.name} ({p.score})
                </span>
              </button>
            );
          })}
        </div>

        {/* Profile Card Terminal View */}
        <div className="glass-card p-8 border border-white/10 space-y-8 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProfile.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Top Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-space font-extrabold text-xl">
                    {activeProfile.name[0]}
                  </div>
                  <div>
                    <h3 className="font-space font-bold text-white text-xl">{activeProfile.name}</h3>
                    <div className="flex items-center gap-3 text-xs font-mono text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#00D4FF]" />
                        {activeProfile.bank} ({activeProfile.accountNo})
                      </span>
                      <span>•</span>
                      <span>{activeProfile.type}</span>
                    </div>
                  </div>
                </div>

                {/* Score Pill */}
                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <div className="text-xs text-gray-400">RESILIENCE SCORE</div>
                    <div className="text-3xl font-extrabold text-white">{activeProfile.score}</div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold ${activeProfile.statusClass}`}>
                    {activeProfile.statusLabel}
                  </div>
                </div>
              </div>

              {/* DNA Dimension Bar Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeProfile.dimensions.map((dim, i) => (
                  <div key={i} className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-300">{dim.name}</span>
                      <span className="text-[#00D4FF] font-bold">{dim.score}%</span>
                    </div>
                    <div className="dna-bar-track">
                      <motion.div
                        className="dna-bar-fill bg-gradient-to-r from-[#00D4FF] to-[#2DD4BF]"
                        initial={{ width: 0 }}
                        animate={{ width: `${dim.score}%` }}
                        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* LLM Explanation Card */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>LLM EXPLAINABILITY SUMMARY (LLAMA 3.1)</span>
                </div>
                <p className="text-sm text-gray-300 font-sans leading-relaxed">
                  "{activeProfile.llmSummary}"
                </p>
              </div>

              {/* Bottom Action Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 font-mono text-xs">
                <div>
                  <span className="text-gray-400">SUSTAINABLE BORROWING LIMIT: </span>
                  <span className="text-white font-bold text-sm ml-2">{activeProfile.sustainableLimit}</span>
                </div>

                <Link to="/login" className="btn-primary py-2 px-4 text-xs font-mono">
                  <span>EXPLORE FULL PROFILE</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

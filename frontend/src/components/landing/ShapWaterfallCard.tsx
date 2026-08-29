import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, HelpCircle, ArrowUpRight, ArrowDownRight, Layers, CheckCircle2 } from 'lucide-react';
import { NumberTicker } from '../ui/NumberTicker';

interface ShapFactor {
  id: string;
  featureName: string;
  impactValue: number;
  type: 'BASE' | 'POSITIVE' | 'NEGATIVE' | 'FINAL';
  description: string;
  runningTotal: number;
}

const WATERFALL_DATA: ShapFactor[] = [
  {
    id: 'base',
    featureName: 'Model Base Score E[f(x)]',
    impactValue: 50.0,
    type: 'BASE',
    description: 'Average population baseline score before individual account feature attributions.',
    runningTotal: 50.0,
  },
  {
    id: 'income',
    featureName: '1. Income Predictability (Salary Stream)',
    impactValue: 18.4,
    type: 'POSITIVE',
    description: 'Pristine 24-month salaried credit history with zero gaps or negative variances.',
    runningTotal: 68.4,
  },
  {
    id: 'savings',
    featureName: '2. Liquid Emergency Buffer (7.2 Mo)',
    impactValue: 9.8,
    type: 'POSITIVE',
    description: 'High liquid mutual fund & savings reserves covering >7 months of fixed outflows.',
    runningTotal: 78.2,
  },
  {
    id: 'dti',
    featureName: '3. Debt Service Ratio (28.8% DTI)',
    impactValue: -6.1,
    type: 'NEGATIVE',
    description: 'Home loan EMI consumes 28.8% of net monthly income (safe threshold: <35%).',
    runningTotal: 72.1,
  },
  {
    id: 'payment',
    featureName: '4. On-Time Payment Discipline',
    impactValue: 8.0,
    type: 'POSITIVE',
    description: '100% on-time utility bills, credit card statements, and loan obligations.',
    runningTotal: 80.1,
  },
  {
    id: 'spending',
    featureName: '5. Discretionary Spending Volatility',
    impactValue: 6.1,
    type: 'POSITIVE',
    description: 'Low month-over-month variance in dining, travel, and non-essential shopping.',
    runningTotal: 86.2,
  },
  {
    id: 'final',
    featureName: 'Final Evaluated Resilience Score',
    impactValue: 86.2,
    type: 'FINAL',
    description: 'Composite CreditDNA score reflecting strong stability and sustainable borrowing resilience.',
    runningTotal: 86.2,
  },
];

export default function ShapWaterfallCard() {
  const [selectedFactor, setSelectedFactor] = useState<ShapFactor>(WATERFALL_DATA[1]);

  return (
    <section className="py-24 px-6 bg-[#0B0F19] relative z-10 border-t border-white/10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-accent/10 border border-[#00D4FF]/30 text-xs font-mono text-[#00D4FF]">
            <Cpu className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>EXPLAINABLE ML AUDITABILITY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-space font-bold text-white tracking-tight">
            SHAP Waterfall Explainability Matrix
          </h2>
          <p className="text-gray-400 font-sans text-base leading-relaxed">
            Every score prediction is mathematically decomposed into individual feature contributions using Shapley Additive Explanations (SHAP).
          </p>
        </div>

        {/* Grid: Waterfall Left/Top, Feature Inspector Right/Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Waterfall Bar Chart */}
          <div className="lg:col-span-7 glass-card p-6 border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00D4FF]" />
                SHAP CONTRIBUTION WATERFALL
              </span>
              <span className="text-gray-400 text-[10px]">CLICK FACTOR TO INSPECT</span>
            </div>

            {/* Waterfall Items */}
            <div className="space-y-3 font-mono text-xs">
              {WATERFALL_DATA.map((item) => {
                const isSelected = selectedFactor.id === item.id;
                const isPositive = item.impactValue >= 0;

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedFactor(item)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#151D2F] border-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                        : 'bg-white/5 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`font-semibold text-xs ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {item.featureName}
                      </span>
                      <span
                        className={`font-bold ${
                          item.type === 'FINAL'
                            ? 'text-white text-sm'
                            : item.type === 'BASE'
                            ? 'text-gray-400'
                            : isPositive
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {item.type === 'FINAL' || item.type === 'BASE'
                          ? item.impactValue.toFixed(1)
                          : `${isPositive ? '+' : ''}${item.impactValue.toFixed(1)} pts`}
                      </span>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative">
                      <motion.div
                        className={`h-full rounded-full ${
                          item.type === 'FINAL'
                            ? 'bg-gradient-to-r from-[#00D4FF] to-[#2DD4BF]'
                            : item.type === 'BASE'
                            ? 'bg-gray-600'
                            : isPositive
                            ? 'bg-emerald-400'
                            : 'bg-rose-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(10, Math.abs(item.runningTotal)))}%` }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Factor Deep-Dive Card */}
          <div className="lg:col-span-5 glass-card p-6 border border-white/10 space-y-6">
            <div className="flex items-center gap-2 font-mono text-xs text-[#00D4FF] font-bold border-b border-white/10 pb-4">
              <CheckCircle2 className="w-4 h-4 text-[#00D4FF]" />
              <span>FEATURE ATTRIBUTION AUDIT</span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">FEATURE SYMBOL</span>
                <h3 className="text-xl font-space font-bold text-white mt-1">{selectedFactor.featureName}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-gray-400 text-[10px]">SHAP VALUE $\phi_i$</div>
                  <div
                    className={`font-extrabold text-lg mt-0.5 ${
                      selectedFactor.impactValue >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {selectedFactor.impactValue >= 0 ? '+' : ''}
                    {selectedFactor.impactValue.toFixed(1)} pts
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-gray-400 text-[10px]">RUNNING TOTAL</div>
                  <div className="text-white font-extrabold text-lg mt-0.5">
                    {selectedFactor.runningTotal.toFixed(1)} / 100
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs font-mono text-gray-400 font-bold uppercase tracking-wider">
                  // AUDITABLE EXPLANATION
                </div>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  "{selectedFactor.description}"
                </p>
              </div>

              <div className="pt-2 text-[11px] font-mono text-gray-500">
                Formula: f(x) = E[f(x)] + ∑ φ_j(x)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

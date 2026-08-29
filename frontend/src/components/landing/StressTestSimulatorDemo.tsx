import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingDown, ShieldAlert, Cpu, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BorderBeam } from '../ui/BorderBeam';

interface ShockScenario {
  id: string;
  name: string;
  impact: string;
  scoreDrop: number;
  recoveryMonths: number;
  description: string;
  shapFactors: { feature: string; impact: string; isNegative: boolean }[];
  data: { month: string; baseline: number; shocked: number; recovery: number }[];
}

const scenarios: ShockScenario[] = [
  {
    id: 'income_drop',
    name: '30% Income Drop',
    impact: 'High Cash Flow Strain',
    scoreDrop: -24.5,
    recoveryMonths: 4,
    description: 'Simulates a 30% reduction in monthly inflow (e.g., salary cut, loss of gig clients).',
    shapFactors: [
      { feature: 'Income Stability', impact: '-14.2 pts', isNegative: true },
      { feature: 'Cash Flow Health', impact: '-8.1 pts', isNegative: true },
      { feature: 'Savings Buffer', impact: '+2.4 pts', isNegative: false },
    ],
    data: [
      { month: 'M0', baseline: 86, shocked: 86, recovery: 86 },
      { month: 'M1', baseline: 86, shocked: 61, recovery: 61 },
      { month: 'M2', baseline: 87, shocked: 58, recovery: 68 },
      { month: 'M3', baseline: 87, shocked: 59, recovery: 76 },
      { month: 'M4', baseline: 88, shocked: 60, recovery: 83 },
      { month: 'M5', baseline: 88, shocked: 62, recovery: 87 },
    ],
  },
  {
    id: 'medical_emergency',
    name: 'Medical Outflow (₹1.5L)',
    impact: 'Sudden Liquidity Shock',
    scoreDrop: -31.0,
    recoveryMonths: 6,
    description: 'Simulates a single-month emergency expenditure of ₹150,000 draining liquid savings.',
    shapFactors: [
      { feature: 'Savings Buffer', impact: '-21.5 pts', isNegative: true },
      { feature: 'Spending Volatility', impact: '-9.5 pts', isNegative: true },
      { feature: 'Payment Discipline', impact: '0.0 pts', isNegative: false },
    ],
    data: [
      { month: 'M0', baseline: 86, shocked: 86, recovery: 86 },
      { month: 'M1', baseline: 86, shocked: 55, recovery: 55 },
      { month: 'M2', baseline: 87, shocked: 53, recovery: 63 },
      { month: 'M3', baseline: 87, shocked: 56, recovery: 72 },
      { month: 'M4', baseline: 88, shocked: 58, recovery: 79 },
      { month: 'M5', baseline: 88, shocked: 60, recovery: 85 },
    ],
  },
  {
    id: 'rate_spike',
    name: 'Interest Rate Spike (+3%)',
    impact: 'EMI Pressure Surge',
    scoreDrop: -18.2,
    recoveryMonths: 3,
    description: 'Simulates a 300 bps rate increase raising home & auto loan EMIs by ₹12,000/month.',
    shapFactors: [
      { feature: 'Debt Pressure (DTI)', impact: '-12.8 pts', isNegative: true },
      { feature: 'Cash Flow Surplus', impact: '-5.4 pts', isNegative: true },
    ],
    data: [
      { month: 'M0', baseline: 86, shocked: 86, recovery: 86 },
      { month: 'M1', baseline: 86, shocked: 68, recovery: 68 },
      { month: 'M2', baseline: 87, shocked: 67, recovery: 74 },
      { month: 'M3', baseline: 87, shocked: 68, recovery: 81 },
      { month: 'M4', baseline: 88, shocked: 69, recovery: 86 },
      { month: 'M5', baseline: 88, shocked: 70, recovery: 88 },
    ],
  },
];

export default function StressTestSimulatorDemo() {
  const [activeScenario, setActiveScenario] = useState<ShockScenario>(scenarios[0]);

  return (
    <section id="stress-test" className="py-24 px-6 bg-[#0B0F19] relative z-10 border-t border-white/10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-400">
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>AI STRESS TEST ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-space font-bold text-white tracking-tight">
            Financial Shock Simulator
          </h2>
          <p className="text-gray-400 font-sans text-base leading-relaxed">
            Simulate real-world macroeconomic and personal financial shocks before they happen. Watch how the XGBoost ML model evaluates shock severity and projects AI-guided recovery paths.
          </p>
        </div>

        {/* Shock Selection Bar with Framer Motion hover & BorderBeam */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((sc) => {
            const isActive = activeScenario.id === sc.id;
            return (
              <motion.button
                key={sc.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveScenario(sc)}
                className={`glass-card p-5 text-left transition-all duration-200 border relative overflow-hidden ${
                  isActive
                    ? 'border-[#00D4FF] bg-[#111827] shadow-[0_0_20px_rgba(0,212,255,0.2)]'
                    : 'border-white/10 hover:border-white/20 opacity-85'
                }`}
              >
                {isActive && (
                  <BorderBeam size={180} duration={10} colorFrom="#00D4FF" colorTo="#EF4444" />
                )}
                {isActive && (
                  <div className="absolute top-3 right-3 text-[#00D4FF]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                <div className="font-mono text-xs text-rose-400 font-semibold uppercase tracking-wider mb-1">
                  {sc.impact}
                </div>
                <div className="font-space font-bold text-white text-base mb-2">{sc.name}</div>
                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/10">
                  <span className="text-gray-400">SHOCK IMPACT:</span>
                  <span className="text-rose-400 font-bold">{sc.scoreDrop} pts</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Chart & SHAP Breakdown Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Area Chart */}
          <div className="lg:col-span-8 glass-card p-6 border border-white/10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="font-space font-bold text-white text-lg flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-rose-400" />
                  <span>{activeScenario.name} — Trajectory Analysis</span>
                </div>
                <p className="text-xs font-mono text-gray-400 mt-1">{activeScenario.description}</p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#00D4FF]" />
                  <span className="text-gray-300">Baseline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-gray-300">Shocked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-gray-300">AI Plan</span>
                </div>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeScenario.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="shockedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="recoveryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#6B7280" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                  <YAxis domain={[40, 100]} stroke="#6B7280" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontFamily: 'IBM Plex Mono',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="baseline" stroke="#00D4FF" strokeWidth={2.5} fillOpacity={1} fill="url(#baselineGrad)" />
                  <Area type="monotone" dataKey="shocked" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#shockedGrad)" />
                  <Area type="monotone" dataKey="recovery" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#recoveryGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right SHAP Factors Breakdown Card */}
          <div className="lg:col-span-4 glass-card p-6 border border-white/10 space-y-6">
            <div className="flex items-center gap-2 font-space font-bold text-white text-lg border-b border-white/10 pb-4">
              <Cpu className="w-5 h-5 text-[#00D4FF]" />
              <span>SHAP Value Impact</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {activeScenario.shapFactors.map((f, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <span className="text-gray-300 font-medium">{f.feature}</span>
                  <span className={`font-bold ${f.isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {f.impact}
                  </span>
                </div>
              ))}
            </div>

            {/* AI Recovery Recommendation callout */}
            <div className="p-4 rounded-xl bg-cyan-accent/10 border border-[#00D4FF]/30 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-[#00D4FF] font-bold">
                <ArrowUpRight className="w-4 h-4 text-[#00D4FF]" />
                <span>AI RECOVERY REC</span>
              </div>
              <p className="text-xs text-gray-300 font-sans leading-relaxed">
                Reallocate ₹8,500/mo into emergency liquid buffer to restore resilience within {activeScenario.recoveryMonths} months.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gauge, Sliders, ShieldCheck, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { BorderBeam } from '../ui/BorderBeam';
import { NumberTicker } from '../ui/NumberTicker';

interface DimensionState {
  income_stability: number;
  cash_flow_health: number;
  debt_pressure: number;
  savings_resilience: number;
  spending_stability: number;
  payment_discipline: number;
}

export default function ResilienceGaugeDemo() {
  const [dimensions, setDimensions] = useState<DimensionState>({
    income_stability: 85,
    cash_flow_health: 70,
    debt_pressure: 65,
    savings_resilience: 90,
    spending_stability: 80,
    payment_discipline: 100,
  });

  // Calculate overall resilience score (weighted 0-100)
  const calculateScore = (dims: DimensionState) => {
    const raw =
      dims.income_stability * 0.25 +
      dims.cash_flow_health * 0.20 +
      dims.debt_pressure * 0.20 +
      dims.savings_resilience * 0.15 +
      dims.spending_stability * 0.10 +
      dims.payment_discipline * 0.10;
    return Math.round(raw * 10) / 10;
  };

  const score = calculateScore(dimensions);

  // Status Band determination
  const getStatus = (val: number) => {
    if (val >= 75) return { label: 'STRONG / STABLE', color: '#10B981', bg: 'bg-emerald-950/80', border: 'border-emerald-500/40', text: 'text-emerald-400', icon: ShieldCheck };
    if (val >= 45) return { label: 'MODERATE / STRAINED', color: '#F59E0B', bg: 'bg-amber-950/80', border: 'border-amber-500/40', text: 'text-amber-400', icon: AlertTriangle };
    return { label: 'CRITICAL / VULNERABLE', color: '#EF4444', bg: 'bg-rose-950/80', border: 'border-rose-500/40', text: 'text-rose-400', icon: AlertCircle };
  };

  const status = getStatus(score);
  const StatusIcon = status.icon;

  // Calculate sustainable borrowing limit
  const estimatedLimit = Math.round((score / 100) * 550000);

  // SVG Semi-Circle Arch Geometry
  const radius = 115;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // 361.28
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const handleSliderChange = (key: keyof DimensionState, value: number) => {
    setDimensions((prev) => ({ ...prev, [key]: value }));
  };

  const handlePreset = (type: 'salaried' | 'freelance' | 'strained') => {
    if (type === 'salaried') {
      setDimensions({
        income_stability: 100,
        cash_flow_health: 72,
        debt_pressure: 68,
        savings_resilience: 100,
        spending_stability: 95,
        payment_discipline: 100,
      });
    } else if (type === 'freelance') {
      setDimensions({
        income_stability: 52,
        cash_flow_health: 40,
        debt_pressure: 35,
        savings_resilience: 25,
        spending_stability: 85,
        payment_discipline: 60,
      });
    } else {
      setDimensions({
        income_stability: 20,
        cash_flow_health: 15,
        debt_pressure: 10,
        savings_resilience: 10,
        spending_stability: 30,
        payment_discipline: 40,
      });
    }
  };

  return (
    <section id="resilience-gauge" className="py-24 px-6 bg-[#0B0F19] relative z-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-accent/10 border border-[#00D4FF]/30 text-xs font-mono text-[#00D4FF]">
            <Gauge className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>INTERACTIVE RISK MATRIX</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-space font-bold text-white tracking-tight">
            Live Resilience Score Gauge
          </h2>
          <p className="text-gray-400 font-sans text-base leading-relaxed">
            Unlike static credit scores that only look back, CreditDNA dynamic scoring evaluates income stability, shock endurance, and debt pressure in real-time. Adjust the dimensions below to see the impact.
          </p>
        </div>

        {/* Preset Quick Buttons with Motion hover */}
        <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
          <span className="text-gray-400 mr-1">// LOAD PRESET:</span>
          {[
            { id: 'salaried', label: '● Salaried Professional (86.2)', class: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/60' },
            { id: 'freelance', label: '▲ Variable Freelancer (47.5)', class: 'bg-amber-950/40 border-amber-500/30 text-amber-400 hover:bg-amber-900/60' },
            { id: 'strained', label: '✖ High Debt Strain (21.5)', class: 'bg-rose-950/40 border-rose-500/30 text-rose-400 hover:bg-rose-900/60' },
          ].map((preset) => (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePreset(preset.id as 'salaried' | 'freelance' | 'strained')}
              className={`px-3.5 py-1.5 rounded-lg border transition-all duration-200 font-medium ${preset.class}`}
            >
              {preset.label}
            </motion.button>
          ))}
        </div>

        {/* Main Grid: Gauge Left, Sliders Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Radial Score Gauge Card */}
          <div className="lg:col-span-5 glass-card p-8 flex flex-col items-center justify-between text-center space-y-6 relative overflow-hidden border border-white/10">
            <BorderBeam size={220} duration={14} colorFrom={status.color} colorTo="#00D4FF" />

            {/* Ambient Background Glow */}
            <div
              className="absolute -inset-10 opacity-25 blur-3xl rounded-full transition-all duration-500 pointer-events-none"
              style={{ backgroundColor: status.color }}
            />

            <div className="relative z-10 w-full flex flex-col items-center pt-2">
              {/* Perfectly Aligned Semi-Circle Dome SVG Arc */}
              <div className="relative w-[280px] h-[160px] flex items-end justify-center">
                <svg className="w-[280px] h-[160px] overflow-visible">
                  <path
                    d="M 25 140 A 115 115 0 0 1 255 140"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                  />
                  <path
                    d="M 25 140 A 115 115 0 0 1 255 140"
                    fill="none"
                    stroke={status.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700 ease-out"
                    style={{
                      filter: `drop-shadow(0 0 16px ${status.color})`,
                    }}
                  />
                </svg>

                {/* Score Number Display with Animated NumberTicker */}
                <div className="absolute bottom-4 inset-x-0 flex flex-col items-center justify-center">
                  <NumberTicker
                    value={score}
                    decimalPlaces={1}
                    className="text-5xl font-mono font-extrabold text-white tracking-tight leading-none drop-shadow-md"
                  />
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-2">
                    OUT OF 100
                  </span>
                </div>
              </div>

              {/* Status Band Badge */}
              <motion.div
                key={status.label}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl ${status.bg} border ${status.border} ${status.text} font-mono text-xs font-bold tracking-wider shadow-lg`}
              >
                <StatusIcon className="w-4 h-4" />
                <span>{status.label}</span>
              </motion.div>
            </div>

            {/* Sustainable Limit Output */}
            <div className="w-full pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-left font-mono text-xs relative z-10">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                <div className="text-gray-400 text-[10px] uppercase tracking-wider">SUSTAINABLE BORROWING</div>
                <div className="text-white font-bold text-lg tracking-tight">
                  <NumberTicker value={estimatedLimit} prefix="₹" className="text-white font-bold text-lg" />
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                <div className="text-gray-400 text-[10px] uppercase tracking-wider">RECOVERY BUFFER</div>
                <div className="text-[#00D4FF] font-bold text-lg tracking-tight">
                  {Math.round(score * 0.9)} Days
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 6 Interactive Dimension Sliders */}
          <div className="lg:col-span-7 glass-card p-8 flex flex-col justify-between space-y-6 border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 font-space font-bold text-white text-lg">
                <Sliders className="w-5 h-5 text-[#00D4FF]" />
                <span>Financial DNA Dimensions</span>
              </div>
              <button
                onClick={() => handlePreset('salaried')}
                className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Defaults
              </button>
            </div>

            {/* 6 Dimension Sliders */}
            <div className="space-y-4">
              {[
                { key: 'income_stability', label: '1. Income Stability', desc: 'Predictability & frequency of inflows', weight: '25%' },
                { key: 'cash_flow_health', label: '2. Cash Flow Health', desc: 'Net inflow to debt ratio', weight: '20%' },
                { key: 'debt_pressure', label: '3. Debt Pressure', desc: 'EMIs as % of monthly income', weight: '20%' },
                { key: 'savings_resilience', label: '4. Savings Buffer', desc: 'Months of runway in liquid savings', weight: '15%' },
                { key: 'spending_stability', label: '5. Spending Stability', desc: 'Discretionary vs essential outflow volatility', weight: '10%' },
                { key: 'payment_discipline', label: '6. Payment Discipline', desc: 'On-time bill & obligation fulfillment', weight: '10%' },
              ].map((dim) => {
                const val = dimensions[dim.key as keyof DimensionState];
                return (
                  <div key={dim.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-medium">{dim.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-[10px]">W: {dim.weight}</span>
                        <span className="text-[#00D4FF] font-bold w-10 text-right">{val}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => handleSliderChange(dim.key as keyof DimensionState, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

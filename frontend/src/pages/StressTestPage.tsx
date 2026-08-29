import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { ArrowLeft, Zap, Clock, TrendingDown, Cpu, Sparkles } from 'lucide-react';
import { runStressTest, getDashboard } from '../lib/api';
import type { ScenarioType, StressTestResult } from '../lib/types';

interface Scenario {
  id: ScenarioType;
  label: string;
  description: string;
  icon: string;
}

const SCENARIOS: Scenario[] = [
  { id: 'income_drop', label: 'Income Drop', description: 'Salary or revenue reduction', icon: '📉' },
  { id: 'job_loss', label: 'Job Loss', description: 'Complete loss of income', icon: '🚧' },
  { id: 'emergency_expense', label: 'Emergency Expense', description: 'Unplanned large expense', icon: '🏥' },
  { id: 'emi_increase', label: 'EMI Increase', description: 'Rising loan obligations', icon: '📈' },
];

const MAGNITUDE_LABELS: Record<number, string> = {
  0.1: '10%', 0.2: '20%', 0.3: '30%', 0.4: '40%', 0.5: '50%',
  0.6: '60%', 0.7: '70%', 0.8: '80%', 0.9: '90%',
};

function getMagnitudeLabel(scenario: ScenarioType, magnitude: number): string {
  if (scenario === 'job_loss') return 'Complete (100%)';
  return MAGNITUDE_LABELS[Math.round(magnitude * 10) / 10] || `${Math.round(magnitude * 100)}%`;
}

function ScoreChangeBar({ original, perturbed }: { original: number; perturbed: number }) {
  const delta = perturbed - original;
  const isNegative = delta < 0;

  return (
    <div className="flex flex-col gap-2 font-mono">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>BASELINE: {original}</span>
        <span className={`font-bold text-base ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
          {perturbed.toFixed(0)}
          <span className={`text-xs ml-1.5 ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
            ({isNegative ? '' : '+'}{delta.toFixed(0)})
          </span>
        </span>
      </div>

      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
        {/* Original score bar */}
        <div
          className="absolute inset-y-0 left-0 bg-gray-600 rounded-full"
          style={{ width: `${original}%` }}
        />
        {/* Perturbed score bar */}
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${isNegative ? 'bg-rose-500' : 'bg-emerald-400'}`}
          style={{ width: `${perturbed}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <span>0</span>
        <span className="text-gray-300 font-medium">Original Baseline: {original}</span>
        <span>100</span>
      </div>
    </div>
  );
}

// Build a simple time-series projection for the area chart
function buildChartData(originalScore: number, perturbedScore: number, monthsToDistress: number | null) {
  const data = [];
  const months = 12;
  for (let m = 0; m <= months; m++) {
    const score = Math.max(0, originalScore - (originalScore - perturbedScore) * (m / 3));
    data.push({ month: `M${m}`, score: Math.round(Math.max(0, score)) });
    if (monthsToDistress && m >= monthsToDistress) break;
  }
  return data;
}

export default function StressTestPage() {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('income_drop');
  const [magnitude, setMagnitude] = useState(0.3);
  const [result, setResult] = useState<StressTestResult | null>(null);
  const [originalScore, setOriginalScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard().then((d) => setOriginalScore(d.resilience_score.score)).catch(() => {});
  }, []);

  const runTest = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const mag = selectedScenario === 'job_loss' ? 1.0 : magnitude;
      const res = await runStressTest({ scenario: selectedScenario, magnitude: mag });
      setResult(res);
    } catch {
      setError('Simulation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedScenario, magnitude]);

  // Auto-run on scenario/magnitude change (debounced)
  useEffect(() => {
    const t = setTimeout(() => { runTest(); }, 400);
    return () => clearTimeout(t);
  }, [runTest]);

  const chartData = result && originalScore
    ? buildChartData(originalScore, result.perturbed_score, result.months_to_distress)
    : [];

  const isJobLoss = selectedScenario === 'job_loss';

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 selection:bg-[#00D4FF]/30 selection:text-[#00D4FF]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <button
            id="back-to-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="btn-ghost p-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-space font-bold text-white">AI Financial Stress Simulator</h1>
            <p className="text-xs font-mono text-gray-400 mt-0.5">
              Simulate macroeconomic & emergency shocks on your resilience profile
            </p>
          </div>
        </header>

        {/* Scenario selector */}
        <section className="mb-6 space-y-3">
          <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">// CHOOSE SHOCK SCENARIO</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCENARIOS.map((s) => {
              const isSelected = selectedScenario === s.id;
              return (
                <button
                  key={s.id}
                  id={`scenario-${s.id}`}
                  onClick={() => setSelectedScenario(s.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-150 active:scale-[0.98] font-mono ${
                    isSelected
                      ? 'border-[#00D4FF] bg-[#151D2F] text-white shadow-[0_0_20px_rgba(0,212,255,0.2)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20 text-gray-300'
                  }`}
                >
                  <div className="text-xl mb-1">{s.icon}</div>
                  <p className={`text-sm font-bold ${isSelected ? 'text-[#00D4FF]' : 'text-white'}`}>
                    {s.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 font-sans">
                    {s.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Magnitude slider (hidden for job loss) */}
        {!isJobLoss && (
          <section className="glass-card p-6 mb-6 border border-white/10 font-mono text-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-gray-400 uppercase tracking-wider">// SHOCK SEVERITY MAGNITUDE</span>
              <span className="text-sm font-bold text-[#00D4FF]">
                {getMagnitudeLabel(selectedScenario, magnitude)}
              </span>
            </div>
            <input
              id="magnitude-slider"
              type="range"
              min={0.1}
              max={0.9}
              step={0.1}
              value={magnitude}
              onChange={(e) => setMagnitude(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-2">
              <span>10% Low</span>
              <span>50% Moderate</span>
              <span>90% Severe</span>
            </div>
          </section>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] mb-4 animate-in">
            <div className="w-3.5 h-3.5 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
            <span>Executing XGBoost Stress Model...</span>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6 animate-in">
            {/* Score change */}
            <div className="glass-card p-6 border border-white/10">
              <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-4">// RESILIENCE IMPACT</p>
              <ScoreChangeBar original={result.original_score} perturbed={result.perturbed_score} />
            </div>

            {/* Area chart */}
            {chartData.length > 1 && (
              <div className="glass-card p-6 border border-white/10">
                <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-4">// 12-MONTH RESILIENCE TRAJECTORY</p>
                <div className="h-44 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'IBM Plex Mono' }} />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontFamily: 'IBM Plex Mono',
                          fontSize: '12px',
                          color: '#FFF',
                        }}
                        formatter={(v: unknown) => [v, 'Score']}
                      />
                      {result.months_to_distress && (
                        <ReferenceLine
                          x={`M${Math.floor(result.months_to_distress)}`}
                          stroke="#EF4444"
                          strokeDasharray="4 2"
                          label={{ value: 'Distress', fill: '#EF4444', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#00D4FF"
                        fill="#00D4FF"
                        fillOpacity={0.15}
                        strokeWidth={2}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-4">
              {result.months_to_distress !== null ? (
                <div className="glass-card p-5 text-center border border-white/10">
                  <Clock size={18} className="mx-auto mb-1 text-amber-400" />
                  <p className="text-2xl font-mono font-extrabold text-white tabular-nums">
                    {result.months_to_distress.toFixed(0)}
                  </p>
                  <p className="text-xs font-mono text-gray-400 mt-1">MONTHS RUNWAY BUFFER</p>
                </div>
              ) : (
                <div className="glass-card p-5 text-center border border-white/10">
                  <TrendingDown size={18} className="mx-auto mb-1 text-emerald-400" />
                  <p className="text-base font-mono font-bold text-emerald-400 mt-1">STABLE SURPLUS</p>
                  <p className="text-xs font-mono text-gray-400">Positive runway buffer</p>
                </div>
              )}
              <div className="glass-card p-5 text-center border border-white/10 font-mono">
                <Zap size={18} className="mx-auto mb-1 text-[#00D4FF]" />
                <p className={`text-2xl font-extrabold tabular-nums ${result.score_delta < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {result.score_delta > 0 ? '+' : ''}{result.score_delta.toFixed(0)}
                </p>
                <p className="text-xs text-gray-400 mt-1">SCORE DELTA</p>
              </div>
            </div>

            {/* Outcome summary + LLM explanation */}
            <div className="glass-card p-6 border border-white/10 space-y-4 font-sans text-sm">
              <p className="text-gray-300 leading-relaxed">
                {result.outcome_summary}
              </p>
              {result.explanation_text && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-bold">
                    <Sparkles size={14} />
                    <span>LLAMA 3.1 AI RECOVERY PLAN</span>
                  </div>
                  <p className="text-gray-200 leading-relaxed text-xs">
                    "{result.explanation_text}"
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs font-mono text-rose-400 bg-rose-950/70 border border-rose-500/30 rounded-xl px-4 py-3">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

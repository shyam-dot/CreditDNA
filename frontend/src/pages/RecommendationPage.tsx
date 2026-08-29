import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Info, ShieldCheck, CreditCard } from 'lucide-react';
import { getLoanRecommendation, getDashboard } from '../lib/api';
import type { LoanRecommendation } from '../lib/types';

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="py-4 border-b border-white/10 last:border-0 font-mono">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-white tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[#00D4FF] mt-0.5">{sub}</p>}
    </div>
  );
}

const HOW_IT_WORKS = [
  'Analyses 12-month income consistency, expense variance, and existing EMI obligations.',
  'Your resilience score determines the maximum financial buffer required to sustain debt.',
  'Ensures monthly EMI obligations stay within safe thresholds even during macroeconomic shocks.',
  'Generates a sustainable ceiling — designed to prevent debt traps and maintain long-term stability.',
];

export default function RecommendationPage() {
  const navigate = useNavigate();
  const [rec, setRec] = useState<LoanRecommendation | null>(null);
  const [resilienceScore, setResilienceScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLoanRecommendation(), getDashboard()])
      .then(([r, d]) => {
        setRec(r);
        setResilienceScore(d.resilience_score.score);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!rec) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center font-mono text-xs">
        <p className="text-gray-400">No recommendation available.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary mt-4">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 selection:bg-[#00D4FF]/30 selection:text-[#00D4FF]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <button
            id="back-from-rec-btn"
            onClick={() => navigate('/dashboard')}
            className="btn-ghost p-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-space font-bold text-white">Sustainable Borrowing Ceiling</h1>
            <p className="text-xs font-mono text-gray-400 mt-0.5">
              ML-driven debt capacity evaluation
            </p>
          </div>
        </header>

        {/* Hero stat */}
        <section className="glass-card p-8 text-center mb-6 border border-white/10 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D4FF]/10 blur-3xl rounded-full pointer-events-none" />
          <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">
            // RECOMMENDED BORROWING LIMIT
          </p>
          <p className="text-5xl sm:text-6xl font-mono font-extrabold text-white tracking-tight text-glow-cyan">
            ₹{(rec.sustainable_limit / 100000).toFixed(1)}L
          </p>
          <p className="text-xs font-mono text-gray-300 mt-3">
            Based on your Financial Resilience Score of <span className="text-[#00D4FF] font-bold">{resilienceScore?.toFixed(1) ?? '—'} / 100</span>
          </p>
          {rec.explanation_text && (
            <p className="mt-5 text-xs text-gray-300 leading-relaxed max-w-md mx-auto font-sans bg-white/5 p-4 rounded-xl border border-white/5">
              "{rec.explanation_text}"
            </p>
          )}
        </section>

        {/* Key stats */}
        <section className="glass-card p-6 mb-6 border border-white/10 animate-slide-up">
          <Stat
            label="Maximum Safe Monthly EMI"
            value={`₹${rec.max_safe_emi.toLocaleString('en-IN')}`}
            sub="Per month on top of existing obligations"
          />
          <Stat
            label="Recommended Loan Tenure"
            value={`${rec.recommended_tenure_months} Months`}
            sub={`(${rec.recommended_tenure_months / 12} Years tenure window)`}
          />
          <Stat
            label="Assumed Baseline Rate"
            value="12.0% p.a."
            sub="Standard market personal loan rate benchmark"
          />
        </section>

        {/* How we calculated this */}
        <section className="glass-card p-6 border border-white/10 animate-slide-up space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <Info size={16} className="text-[#00D4FF]" />
            <p className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              UNDERWRITING METHODOLOGY
            </p>
          </div>
          <div className="space-y-3 font-sans text-xs">
            {HOW_IT_WORKS.map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-gray-300 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 font-mono text-xs text-gray-400">
            <p className="leading-relaxed">
              <strong className="text-white">Note:</strong> This is a dynamic financial resilience estimate generated by CreditDNA. Final loan sanction is subject to lender approval and bureau verification.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

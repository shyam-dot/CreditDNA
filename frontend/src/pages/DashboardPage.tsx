import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { LogOut, ArrowRight, PlusCircle, Zap, CreditCard, Cpu, TrendingUp, UserCheck, Shield } from 'lucide-react';
import { getDashboard } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { DashboardData, ScoreBand } from '../lib/types';
import OnboardingModal from '../components/dashboard/OnboardingModal';
import AddTransactionModal from '../components/dashboard/AddTransactionModal';

const BAND_STYLES: Record<ScoreBand, { ring: string; text: string; bg: string; label: string; border: string }> = {
  strong: { ring: '#10B981', text: 'text-emerald-400', bg: 'bg-emerald-950/70', border: 'border-emerald-500/40', label: 'STRONG & STABLE' },
  moderate: { ring: '#F59E0B', text: 'text-amber-400', bg: 'bg-amber-950/70', border: 'border-amber-500/40', label: 'MODERATE / VULNERABLE' },
  weak: { ring: '#EF4444', text: 'text-rose-400', bg: 'bg-rose-950/70', border: 'border-rose-500/40', label: 'CRITICAL / HIGH RISK' },
};

// Circular score gauge
function ScoreGauge({ score, band }: { score: number; band: ScoreBand }) {
  const styles = BAND_STYLES[band] || BAND_STYLES['moderate'];
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={styles.ring}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 10px ${styles.ring})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold text-white leading-none font-mono tabular-nums">
            {score}
          </span>
          <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-sans font-semibold">OUT OF 100</span>
        </div>
      </div>
      <span className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border ${styles.text} ${styles.bg} ${styles.border}`}>
        {styles.label}
      </span>
    </div>
  );
}

// DNA dimension bar row
function DnaBar({
  label,
  score,
  explanation,
}: {
  label: string;
  score: number;
  explanation: string | null;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="w-full text-left cursor-pointer group"
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className="text-gray-300 font-medium group-hover:text-[#00D4FF] transition-colors">
          {label}
        </span>
        <span className="font-bold text-[#00D4FF] font-mono tabular-nums">{score}%</span>
      </div>
      <div className="dna-bar-track bg-gray-800">
        <div
          className="dna-bar-fill bg-gradient-to-r from-[#00D4FF] to-[#2DD4BF]"
          style={{ width: `${score}%` }}
        />
      </div>
      {expanded && explanation && (
        <p className="mt-2 text-xs text-gray-400 italic font-sans bg-white/5 p-2.5 rounded-lg border border-white/5 animate-in">
          "{explanation}"
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const dash = await getDashboard();
      setData(dash);
    } catch {
      setError('Could not load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center gap-4 px-4 text-xs font-sans">
        <p className="text-rose-400 font-semibold">{error || 'No data available'}</p>
        <button onClick={loadDashboard} className="btn-secondary">Retry Connection</button>
      </div>
    );
  }

  // First-time onboarding trigger
  if (!data.has_onboarded || !data.resilience_score || !data.dna || !data.loan_recommendation) {
    return (
      <div className="min-h-screen bg-[#0B0F19]">
        <OnboardingModal onSuccess={(updated) => setData(updated)} />
      </div>
    );
  }

  const { resilience_score, dna, loan_recommendation, score_history } = data;

  const latestHistoryPoint = score_history && score_history.length > 0
    ? score_history[score_history.length - 1]
    : null;

  const radarData = [
    { subject: 'Income\nStability', A: dna.income_stability.score },
    { subject: 'Cash-Flow\nHealth', A: dna.cash_flow_health.score },
    { subject: 'Debt\nPressure', A: dna.debt_pressure.score },
    { subject: 'Savings\nResilience', A: dna.savings_resilience.score },
    { subject: 'Spending\nStability', A: dna.spending_stability.score },
    { subject: 'Payment\nDiscipline', A: dna.payment_discipline.score },
  ];

  const dnaRows = [
    { key: 'income_stability', dim: dna.income_stability },
    { key: 'cash_flow_health', dim: dna.cash_flow_health },
    { key: 'debt_pressure', dim: dna.debt_pressure },
    { key: 'savings_resilience', dim: dna.savings_resilience },
    { key: 'spending_stability', dim: dna.spending_stability },
    { key: 'payment_discipline', dim: dna.payment_discipline },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-sans selection:bg-[#00D4FF]/30 selection:text-[#00D4FF]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* ── Top Bar ───────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#2DD4BF] p-[1px]">
              <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
                <Cpu className="w-4 h-4 text-[#00D4FF]" />
              </div>
            </div>
            <span className="font-space font-extrabold text-white text-base tracking-tight">
              Credit<span className="text-[#00D4FF]">DNA</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              id="simulate-month-btn"
              onClick={() => setShowAddModal(true)}
              className="btn-primary py-2 px-3.5 text-xs font-semibold flex items-center gap-2"
            >
              <PlusCircle size={15} />
              <span>Simulate New Month</span>
            </button>

            <button
              id="sign-out-btn"
              onClick={handleSignOut}
              className="btn-ghost text-xs text-gray-400 hover:text-white"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* ── User Header Profile Info ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 glass-card p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center text-[#00D4FF]">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Active Profile</p>
              <p className="font-bold text-white text-sm mt-0.5">{data.user_name || user?.displayName || 'User'}</p>
              <p className="text-xs text-gray-400">{data.user_email || user?.email}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-semibold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Explainable ML Model Active</span>
          </div>
        </div>

        {/* ── Resilience Score Gauge ────────────────────────────── */}
        <section className="glass-card p-8 text-center mb-6 border border-white/10 animate-fade-in relative overflow-hidden">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">
            Financial Resilience Score
          </p>
          <ScoreGauge
            score={Math.round(resilience_score.score)}
            band={resilience_score.band}
          />
          {resilience_score.explanation_text && (
            <p className="mt-6 text-sm text-gray-300 max-w-md mx-auto leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
              "{resilience_score.explanation_text}"
            </p>
          )}
        </section>

        {/* ── Score Trend Line Chart ───────────────────────────── */}
        {score_history && score_history.length > 0 && (
          <section className="glass-card p-6 mb-6 border border-white/10 animate-slide-up">
            <div className="flex items-center justify-between mb-4 text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#00D4FF]" />
                <span className="font-bold text-white tracking-wide uppercase">
                  Resilience Score Over Time
                </span>
              </div>
              <span className="text-gray-400 text-xs font-medium">
                {score_history.length} {score_history.length === 1 ? 'Snapshot' : 'Historical Snapshots'}
              </span>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={score_history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#9CA3AF"
                    fontSize={10}
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#9CA3AF"
                    fontSize={10}
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0F19',
                      borderColor: 'rgba(0, 212, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#00D4FF"
                    strokeWidth={3}
                    dot={{ fill: '#00D4FF', r: 4 }}
                    activeDot={{ r: 6, fill: '#2DD4BF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* ── Sustainable Credit Limit ──────────────────────────── */}
        <section className="glass-card p-6 mb-6 border border-white/10 animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <CreditCard size={15} className="text-[#00D4FF]" />
                <span>Sustainable Borrowing Ceiling</span>
              </div>
              <p className="text-4xl font-extrabold text-white tracking-tight font-mono">
                ₹{(loan_recommendation.sustainable_limit / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max Safe EMI: <span className="text-[#00D4FF] font-bold font-mono">₹{loan_recommendation.max_safe_emi.toLocaleString('en-IN')}/mo</span> · {loan_recommendation.recommended_tenure_months} Months Tenure
              </p>
            </div>
            <button
              id="view-loan-detail-btn"
              onClick={() => navigate('/recommendation')}
              className="btn-secondary text-xs py-2 px-3.5 font-semibold"
            >
              <span>Details</span>
              <ArrowRight size={13} />
            </button>
          </div>
          {loan_recommendation.explanation_text && (
            <p className="mt-4 text-xs text-gray-400 leading-relaxed pt-3 border-t border-white/10">
              {loan_recommendation.explanation_text}
            </p>
          )}
        </section>

        {/* ── Financial DNA ─────────────────────────────────────── */}
        <section className="glass-card p-6 mb-6 border border-white/10 animate-slide-up space-y-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Financial DNA Dimensions
          </p>

          {/* Radar chart */}
          <div className="h-56 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#9CA3AF', fontSize: 10, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                />
                <Radar
                  name="DNA"
                  dataKey="A"
                  stroke="#00D4FF"
                  fill="#00D4FF"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Dimension bars */}
          <div className="space-y-4 pt-2">
            {dnaRows.map(({ key, dim }) => (
              <div key={key}>
                <DnaBar
                  label={dim.label}
                  score={dim.score}
                  explanation={dim.explanation}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Stress Test CTA ───────────────────────────────────── */}
        <button
          id="open-stress-test-btn"
          onClick={() => navigate('/stress-test')}
          className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-[#111827] via-[#151D2F] to-[#111827] border border-[#00D4FF]/30 text-white rounded-2xl
                     hover:border-[#00D4FF] hover:shadow-[0_0_25px_rgba(0,212,255,0.25)] active:scale-[0.99] transition-all duration-200 group animate-slide-up"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF]">
              <Zap size={20} className="animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white group-hover:text-[#00D4FF] transition-colors">Launch Financial Stress Test Simulator</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Simulate income cuts, interest rate spikes, or emergency expenses
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[#00D4FF] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Add New Month Simulation Modal */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(updated) => setData(updated)}
          latestIncome={latestHistoryPoint?.monthly_income || 85000}
          latestSavings={latestHistoryPoint?.savings_balance || 180000}
        />
      )}
    </div>
  );
}

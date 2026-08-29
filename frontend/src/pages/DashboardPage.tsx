import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer
} from 'recharts';
import { LogOut, ArrowRight, RefreshCw, Zap, CreditCard, Cpu, ShieldCheck, AlertTriangle, AlertCircle, Building2 } from 'lucide-react';
import { getDashboard, getDemoAccounts, linkAccount } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { DashboardData, DemoAccount, ScoreBand } from '../lib/types';

const BAND_STYLES: Record<ScoreBand, { ring: string; text: string; bg: string; label: string; border: string }> = {
  strong: { ring: '#10B981', text: 'text-emerald-400', bg: 'bg-emerald-950/70', border: 'border-emerald-500/40', label: 'STRONG / STABLE' },
  moderate: { ring: '#F59E0B', text: 'text-amber-400', bg: 'bg-amber-950/70', border: 'border-amber-500/40', label: 'MODERATE / STRAINED' },
  weak: { ring: '#EF4444', text: 'text-rose-400', bg: 'bg-rose-950/70', border: 'border-rose-500/40', label: 'CRITICAL / STRAINED' },
};

// Circular score gauge
function ScoreGauge({ score, band }: { score: number; band: ScoreBand }) {
  const styles = BAND_STYLES[band];
  const circumference = 2 * Math.PI * 54; // radius = 54
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background Track */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="10" />
          {/* Score arc */}
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
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
          <span className="text-5xl font-extrabold text-white leading-none tabular-nums">
            {score}
          </span>
          <span className="text-xs text-gray-400 mt-1 uppercase tracking-widest text-[10px]">OUT OF 100</span>
        </div>
      </div>
      {/* Band badge */}
      <span className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider border ${styles.text} ${styles.bg} ${styles.border}`}>
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
  onClick,
}: {
  label: string;
  score: number;
  explanation: string | null;
  onClick: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      className="w-full text-left group"
      onClick={() => { setExpanded((e) => !e); onClick(); }}
    >
      <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
        <span className="text-gray-300 group-hover:text-[#00D4FF] transition-colors">
          {label}
        </span>
        <span className="font-bold text-[#00D4FF] tabular-nums">{score}%</span>
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
    </button>
  );
}

// Account switcher popover
function AccountSwitcher({
  currentId,
  accounts,
  onSwitch,
}: {
  currentId: string;
  accounts: DemoAccount[];
  onSwitch: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        id="switch-account-btn"
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-mono text-gray-400 hover:text-[#00D4FF] flex items-center gap-1.5 transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
      >
        <RefreshCw size={12} />
        <span>SWITCH ACCOUNT</span>
      </button>
      {open && (
        <div className="absolute top-9 right-0 glass-panel border border-white/15 rounded-xl shadow-2xl py-1 z-20 min-w-[220px] animate-in">
          {accounts.filter((a) => a.id !== currentId).map((acc) => (
            <button
              key={acc.id}
              id={`switch-to-account-${acc.id}`}
              onClick={() => { onSwitch(acc.id); setOpen(false); }}
              className="w-full text-left px-4 py-3 font-mono text-xs hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
            >
              <p className="font-bold text-white">{acc.holder_name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{acc.bank_name} ••••{acc.account_suffix}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [allAccounts, setAllAccounts] = useState<DemoAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dash, accounts] = await Promise.all([getDashboard(), getDemoAccounts()]);
      setData(dash);
      setAllAccounts(accounts);
    } catch {
      setError('Could not load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleSwitchAccount = async (id: string) => {
    await linkAccount(id);
    loadDashboard();
  };

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
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center gap-4 px-4 font-mono text-xs">
        <p className="text-rose-400">{error || 'No data available'}</p>
        <button onClick={loadDashboard} className="btn-secondary">Retry Terminal Connection</button>
      </div>
    );
  }

  const { connected_account, resilience_score, dna, loan_recommendation } = data;

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
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 selection:bg-[#00D4FF]/30 selection:text-[#00D4FF]">
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

          <button
            id="sign-out-btn"
            onClick={handleSignOut}
            className="btn-ghost text-xs font-mono text-gray-400 hover:text-white"
          >
            <LogOut size={15} />
            <span>SIGN OUT</span>
          </button>
        </header>

        {/* ── Connected account indicator ───────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 glass-card p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <Building2 size={18} className="text-[#00D4FF]" />
            </div>
            <div className="font-mono text-xs">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">CONNECTED STREAM</p>
              <p className="font-bold text-white mt-0.5">
                {connected_account.holder_name} · {connected_account.bank_name} ••••{connected_account.account_suffix}
              </p>
            </div>
          </div>
          <AccountSwitcher
            currentId={connected_account.demo_account_id}
            accounts={allAccounts}
            onSwitch={handleSwitchAccount}
          />
        </div>

        {/* ── Resilience Score ──────────────────────────────────── */}
        <section className="glass-card p-8 text-center mb-6 border border-white/10 animate-fade-in relative overflow-hidden">
          <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-6">
            // FINANCIAL RESILIENCE SCORE
          </p>
          <ScoreGauge
            score={Math.round(resilience_score.score)}
            band={resilience_score.band}
          />
          {resilience_score.explanation_text && (
            <p className="mt-6 text-sm text-gray-300 max-w-md mx-auto leading-relaxed font-sans bg-white/5 p-4 rounded-xl border border-white/5">
              "{resilience_score.explanation_text}"
            </p>
          )}
        </section>

        {/* ── Sustainable Credit Limit ──────────────────────────── */}
        <section className="glass-card p-6 mb-6 border border-white/10 animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
                <CreditCard size={14} className="text-[#00D4FF]" />
                <span className="font-semibold text-gray-400 uppercase tracking-wider">
                  SUSTAINABLE BORROWING CEILING
                </span>
              </div>
              <p className="text-4xl font-mono font-extrabold text-white tracking-tight">
                ₹{(loan_recommendation.sustainable_limit / 100000).toFixed(1)}L
              </p>
              <p className="text-xs font-mono text-gray-400 mt-1">
                Max Safe EMI: <span className="text-[#00D4FF] font-bold">₹{loan_recommendation.max_safe_emi.toLocaleString('en-IN')}/mo</span> · {loan_recommendation.recommended_tenure_months} Months Tenure
              </p>
            </div>
            <button
              id="view-loan-detail-btn"
              onClick={() => navigate('/recommendation')}
              className="btn-secondary text-xs font-mono py-2 px-3"
            >
              <span>DETAILS</span>
              <ArrowRight size={13} />
            </button>
          </div>
          {loan_recommendation.explanation_text && (
            <p className="mt-4 text-xs font-sans text-gray-400 leading-relaxed pt-3 border-t border-white/10">
              {loan_recommendation.explanation_text}
            </p>
          )}
        </section>

        {/* ── Financial DNA ─────────────────────────────────────── */}
        <section className="glass-card p-6 mb-6 border border-white/10 animate-slide-up space-y-6">
          <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
            // FINANCIAL DNA DIMENSIONS
          </p>

          {/* Radar chart */}
          <div className="h-56 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#9CA3AF', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
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
                  onClick={() => {}}
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
            <div className="text-left font-mono">
              <p className="text-sm font-bold text-white group-hover:text-[#00D4FF] transition-colors">Launch AI Financial Stress Test</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Simulate income cuts, interest rate spikes, or emergency expenses
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[#00D4FF] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

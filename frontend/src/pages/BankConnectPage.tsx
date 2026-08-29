import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, CheckCircle2, ChevronRight, AlertCircle, Building2, ArrowLeft } from 'lucide-react';
import { getDemoAccounts, linkAccount } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { DemoAccount } from '../lib/types';

const BANK_ICONS: Record<string, string> = {
  'HDFC Bank': '🏦',
  'Axis Bank': '🏦',
};

const PERMISSIONS = [
  'Account balance streams',
  'Transaction history (12 months)',
  'Loan and EMI obligations',
  'Income & recurring expense patterns',
];

export default function BankConnectPage() {
  const { setHasLinkedAccount } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'picker' | 'consent'>('picker');

  useEffect(() => {
    getDemoAccounts()
      .then(setAccounts)
      .catch(() => setError('Could not load accounts'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    setStep('consent');
  };

  const handleConnect = async () => {
    if (!selected) return;
    setLinking(true);
    setError('');
    try {
      await linkAccount(selected);
      setHasLinkedAccount(true);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLinking(false);
    }
  };

  const selectedAccount = accounts.find((a) => a.id === selected);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col items-center justify-center px-4 relative selection:bg-[#00D4FF]/30 selection:text-[#00D4FF]">
      {/* Top Bar Back Link */}
      <div className="absolute top-6 left-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          <span>BACK TO LANDING</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/5 border border-white/10 rounded-2xl text-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.2)]">
            <Building2 size={28} />
          </div>
          <h1 className="text-2xl font-space font-bold text-white tracking-tight">Account Aggregator Sync</h1>
          <p className="text-xs font-mono text-gray-400 max-w-xs mx-auto leading-relaxed">
            Link your banking stream to compute real-time Financial Resilience Scores.
          </p>
          {/* Demo mode badge */}
          <div className="inline-block px-3 py-1 bg-amber-950/60 border border-amber-500/30 rounded-full text-xs text-amber-400 font-mono">
            ● Demo Sandbox Sync
          </div>
        </div>

        {step === 'picker' && (
          <div className="glass-card p-6 border border-white/10 space-y-4 animate-in">
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              // SELECT AN ACCOUNT TO LINK
            </p>

            {loading ? (
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    id={`select-account-${acc.id}`}
                    onClick={() => handleSelect(acc.id)}
                    className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl
                               hover:border-[#00D4FF] hover:bg-white/10 active:scale-[0.99]
                               transition-all duration-150 text-left group"
                  >
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl shrink-0">
                      {BANK_ICONS[acc.bank_name] || '🏦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-[#00D4FF] transition-colors">
                        {acc.bank_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {acc.holder_name} · ••••{acc.account_suffix}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-500 group-hover:text-[#00D4FF] shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'consent' && selectedAccount && (
          <div className="glass-card p-6 border border-white/10 space-y-6 animate-in">
            {/* Selected account recap */}
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl shrink-0">
                {BANK_ICONS[selectedAccount.bank_name] || '🏦'}
              </div>
              <div className="font-mono text-xs">
                <p className="text-sm font-bold text-white">{selectedAccount.bank_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedAccount.holder_name} · ••••{selectedAccount.account_suffix}
                </p>
              </div>
            </div>

            {/* Permissions summary */}
            <div className="space-y-3 font-mono text-xs">
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                // CREDITDNA ACCESS PERMISSIONS
              </p>
              <div className="space-y-2">
                {PERMISSIONS.map((perm) => (
                  <div key={perm} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 pt-2 border-t border-white/10">
                Read-only consent. Non-custodial transaction sync.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/70 border border-rose-500/30 rounded-xl px-4 py-3">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <button
                id="connect-securely-btn"
                onClick={handleConnect}
                disabled={linking}
                className="btn-primary w-full py-3 text-xs font-mono font-bold"
              >
                {linking ? (
                  <span className="w-4 h-4 border-2 border-[#0B0F19] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield size={15} />
                    <span>CONNECT SECURELY</span>
                  </>
                )}
              </button>

              <button
                id="back-to-picker-btn"
                onClick={() => setStep('picker')}
                className="btn-ghost w-full text-xs font-mono text-gray-400 hover:text-white"
              >
                Choose a different account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

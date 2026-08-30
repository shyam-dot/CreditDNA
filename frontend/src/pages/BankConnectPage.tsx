import { useNavigate, Link } from 'react-router-dom';
import { Shield, CheckCircle2, Building2, ArrowLeft } from 'lucide-react';

const PERMISSIONS = [
  'Account balance streams',
  'Transaction history (12 months)',
  'Loan and EMI obligations',
  'Income & recurring expense patterns',
];

export default function BankConnectPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col items-center justify-center px-4 relative selection:bg-[#00D4FF]/30 selection:text-[#00D4FF] font-sans">
      {/* Top Bar Back Link */}
      <div className="absolute top-6 left-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/5 border border-white/10 rounded-2xl text-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.2)]">
            <Building2 size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Account Aggregator Sync</h1>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            Your financial data is securely managed through your profile. Use the dashboard to add or update your financial snapshot.
          </p>
          {/* Status badge */}
          <div className="inline-block px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-full text-xs text-emerald-400 font-semibold">
            ● Secure Sync Active
          </div>
        </div>

        <div className="glass-card p-6 border border-white/10 space-y-6">
          {/* Permissions summary */}
          <div className="space-y-3 text-xs">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Access Permissions
            </p>
            <div className="space-y-2">
              {PERMISSIONS.map((perm) => (
                <div key={perm} className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 pt-2 border-t border-white/10">
              Read-only consent. Non-custodial transaction synchronization.
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard', { replace: true })}
            className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Shield size={15} />
            <span>Go to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}

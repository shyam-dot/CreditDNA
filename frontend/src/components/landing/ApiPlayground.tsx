import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Copy, Check, Play, Code2, Sparkles, Server } from 'lucide-react';
import { BorderBeam } from '../ui/BorderBeam';

interface CodeTab {
  id: string;
  label: string;
  lang: string;
  code: string;
  response: string;
}

const TABS: CodeTab[] = [
  {
    id: 'python',
    label: 'Python SDK',
    lang: 'python',
    code: `import creditdna

client = creditdna.Client(api_key="cdna_live_9f82a1")

# Fetch real-time resilience profile & SHAP breakdown
profile = client.resilience.evaluate(
    account_id="acc_hdfc_4821",
    include_shap=True
)

print(f"Resilience Score: {profile.score}")
print(f"Sustainable Debt Ceiling: ₹{profile.sustainable_limit:,.2f}")`,
    response: `{
  "status": 200,
  "resilience_score": {
    "score": 86.2,
    "band": "strong",
    "shap_attribution": {
      "income_stability": +18.4,
      "debt_pressure": +12.1,
      "savings_buffer": +9.8
    }
  },
  "loan_recommendation": {
    "sustainable_limit": 440000,
    "max_safe_emi": 16500,
    "recommended_tenure_months": 36
  }
}`,
  },
  {
    id: 'curl',
    label: 'cURL / REST',
    lang: 'bash',
    code: `curl -X POST "http://localhost:8000/api/stress-test" \\
  -H "Authorization: Bearer cdna_live_9f82a1" \\
  -H "Content-Type: application/json" \\
  -d '{
    "account_id": "acc_hdfc_4821",
    "scenario": "income_drop",
    "magnitude": 0.3
  }'`,
    response: `{
  "status": 200,
  "original_score": 86.2,
  "perturbed_score": 61.7,
  "score_delta": -24.5,
  "months_to_distress": 4.2,
  "outcome_summary": "Cash flow buffer retains positive liquidity for 4.2 months under 30% income drop."
}`,
  },
  {
    id: 'aa_payload',
    label: 'AA Consent Spec',
    lang: 'json',
    code: `{
  "aa_consent_id": "AA_SAHAMATI_994821",
  "data_range_months": 12,
  "fidelity": "TRANSACTION_LEVEL",
  "fi_types": ["DEPOSIT", "TERM_DEPOSIT", "RECURRING_DEPOSIT"],
  "signature_sha256": "8f32a0d...491a"
}`,
    response: `{
  "status": 200,
  "consent_state": "ACTIVE",
  "synced_transactions_count": 1428,
  "last_synced_at": "2026-08-29T18:15:00Z"
}`,
  },
];

export default function ApiPlayground() {
  const [activeTab, setActiveTab] = useState<CodeTab>(TABS[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [showResponse, setShowResponse] = useState<boolean>(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setIsExecuting(true);
    setShowResponse(false);
    setTimeout(() => {
      setIsExecuting(false);
      setShowResponse(true);
    }, 600);
  };

  return (
    <section className="py-24 px-6 bg-[#0B0F19] relative z-10 border-t border-white/10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-accent/10 border border-[#00D4FF]/30 text-xs font-mono text-[#00D4FF]">
            <Code2 className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>DEVELOPER INTERFACE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-space font-bold text-white tracking-tight">
            Developer API & CLI Terminal
          </h2>
          <p className="text-gray-400 font-sans text-base leading-relaxed">
            Integrate CreditDNA scoring into loan origination flows, risk underwriting pipelines, or wealth management apps with sub-150ms latency.
          </p>
        </div>

        {/* Code Terminal Mockup Card */}
        <div className="glass-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative bg-[#070A10]">
          <BorderBeam size={250} duration={12} delay={0} colorFrom="#00D4FF" colorTo="#2DD4BF" />

          {/* Terminal Window Top Bar */}
          <div className="px-6 py-4 bg-[#0B0F19] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            {/* Window Controls + Tabs */}
            <div className="flex items-center gap-6">
              {/* macOS window dots */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>

              {/* Tab Pills */}
              <div className="flex items-center gap-1 font-mono text-xs bg-white/5 p-1 rounded-xl border border-white/5">
                {TABS.map((tab) => {
                  const isActive = activeTab.id === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab)}
                      className={`relative px-3 py-1.5 rounded-lg transition-colors font-medium ${
                        isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabBg"
                          className="absolute inset-0 bg-white/15 rounded-lg border border-white/10"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>

              <button
                onClick={handleRun}
                disabled={isExecuting}
                className="btn-primary py-1.5 px-3.5 text-xs font-mono font-bold flex items-center gap-1.5"
              >
                {isExecuting ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#0B0F19] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-[#0B0F19]" />
                )}
                <span>TEST ENDPOINT</span>
              </button>
            </div>
          </div>

          {/* Terminal Body: Code Left/Top, Output Right/Bottom */}
          <div className="grid grid-cols-1 lg:grid-cols-12 font-mono text-xs divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {/* Request Code Panel */}
            <div className="lg:col-span-7 p-6 overflow-x-auto bg-[#070A10] space-y-3">
              <div className="flex items-center justify-between text-gray-500 text-[11px] pb-2 border-b border-white/5">
                <span>// API REQUEST payload</span>
                <span>{activeTab.lang.toUpperCase()}</span>
              </div>
              <pre className="text-gray-200 leading-relaxed overflow-x-auto">
                <code>{activeTab.code}</code>
              </pre>
            </div>

            {/* Response Terminal Panel */}
            <div className="lg:col-span-5 p-6 bg-[#0B0F19] space-y-3 relative">
              <div className="flex items-center justify-between text-gray-500 text-[11px] pb-2 border-b border-white/5">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Server className="w-3 h-3 text-emerald-400" />
                  <span>RESPONSE STREAM (200 OK)</span>
                </span>
                <span className="text-gray-500">12ms</span>
              </div>

              <AnimatePresence mode="wait">
                {isExecuting ? (
                  <motion.div
                    key="executing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-[#00D4FF]"
                  >
                    <div className="w-5 h-5 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Connecting to API Gateway...</span>
                  </motion.div>
                ) : showResponse ? (
                  <motion.pre
                    key="response"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-emerald-400 leading-relaxed overflow-x-auto text-[11px]"
                  >
                    <code>{activeTab.response}</code>
                  </motion.pre>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

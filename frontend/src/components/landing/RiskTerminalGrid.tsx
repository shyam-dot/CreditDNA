import React from 'react';
import { Terminal, Shield, Lock, Cpu, Eye, Activity, LineChart, CheckCircle } from 'lucide-react';

export default function RiskTerminalGrid() {
  const features = [
    {
      icon: Eye,
      title: 'SHAP Explainability Matrix',
      desc: 'No black-box decisions. Every resilience score includes granular SHAP feature attributions showing exactly which factors boosted or penalized the rating.',
      tag: 'TRANSPARENT ML',
    },
    {
      icon: Activity,
      title: 'Real-Time Anomaly Detection',
      desc: 'Detects unusual spending spikes, sudden cash flow drops, or recurring subscription leaks before they compromise debt-servicing capacity.',
      tag: 'EARLY WARNING',
    },
    {
      icon: LineChart,
      title: 'Dynamic Debt Capacity (DDC)',
      desc: 'Replaces fixed multiplier limits with dynamic cash-flow stress testing to compute a sustainable borrowing ceiling.',
      tag: 'PRUDENT LENDING',
    },
    {
      icon: Lock,
      title: 'Bank-Grade Data Privacy',
      desc: 'End-to-end encrypted storage via Google Cloud Firestore with granular Firebase Auth security rules and non-custodial credentials.',
      tag: 'ISO 27001 / SOC 2',
    },
  ];

  return (
    <section className="py-24 px-6 bg-[#0B0F19] relative z-10 border-t border-white/10">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-accent/10 border border-[#00D4FF]/30 text-xs font-mono text-[#00D4FF]">
            <Terminal className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>RISK TERMINAL FEATURES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-space font-bold text-white tracking-tight">
            Built for Rigorous Financial Assessment
          </h2>
          <p className="text-gray-400 font-sans text-base">
            Designed like high-frequency quantitative risk terminals to give lenders, advisors, and individuals complete transparency into credit health.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-card p-8 space-y-5 border border-white/10 relative overflow-hidden group hover:border-[#00D4FF]/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#00D4FF] group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono text-cyan-teal bg-cyan-teal/10 px-2.5 py-1 rounded border border-cyan-teal/20">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="font-space font-bold text-white text-xl">{feat.title}</h3>
                <p className="text-sm text-gray-300 font-sans leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

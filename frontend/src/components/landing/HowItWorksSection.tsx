import React from 'react';
import { Database, Cpu, ShieldCheck, ArrowRight, FileCheck, Code2, LineChart } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Consent-Based Data Ingestion',
      subtitle: 'Account Aggregator & Bank Sync',
      icon: Database,
      accent: 'border-l-[#00D4FF] text-[#00D4FF]',
      desc: 'Securely ingests up to 12 months of bank transactions via official Account Aggregator consent flows or encrypted bank statements.',
      specs: ['256-bit AES Encryption', 'AA Sandbox Compliant', 'Zero Manual Data Entry'],
    },
    {
      num: '02',
      title: 'Explainable ML Risk Engine',
      subtitle: 'XGBoost · Random Forest · SHAP',
      icon: Cpu,
      accent: 'border-l-[#2DD4BF] text-[#2DD4BF]',
      desc: 'Evaluates cash flow volatility, DTI ratios, and discretionary spending variance to generate a multi-dimensional Resilience Profile.',
      specs: ['SHAP Factor Attribution', 'Real-Time Anomaly Flagging', 'Sub-150ms Execution'],
    },
    {
      num: '03',
      title: 'Stress Test & LLM Report',
      subtitle: 'Llama 3.1 Natural Language Insights',
      icon: ShieldCheck,
      accent: 'border-l-[#F59E0B] text-[#F59E0B]',
      desc: 'Simulates macroeconomic shocks and calculates the exact sustainable borrowing limit to prevent debt traps.',
      specs: ['Shock Recovery Timeline', 'Sustainable Debt Ceiling', 'Actionable Mitigation Plan'],
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-[#0B0F19] relative z-10 border-t border-white/10">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-accent/10 border border-[#00D4FF]/30 text-xs font-mono text-[#00D4FF]">
            <Code2 className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>SYSTEM ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-space font-bold text-white tracking-tight">
            How CreditDNA Works
          </h2>
          <p className="text-gray-400 font-sans text-base">
            From raw transaction streams to audit-ready financial resilience intelligence in three automated steps.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`glass-card p-8 space-y-6 border-l-4 ${step.accent} relative group hover:-translate-y-1 transition-all duration-300`}
              >
                {/* Step Number Tag */}
                <div className="flex items-center justify-between font-mono">
                  <span className="text-3xl font-extrabold text-white/20 group-hover:text-white/40 transition-colors">
                    {step.num}
                  </span>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <h3 className="font-space font-bold text-white text-xl">{step.title}</h3>
                  <div className="text-xs font-mono text-gray-400">{step.subtitle}</div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-300 font-sans leading-relaxed">{step.desc}</p>

                {/* Bullet Tech Specs */}
                <div className="pt-4 border-t border-white/10 space-y-2 font-mono text-xs text-gray-400">
                  {step.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <FileCheck className="w-3.5 h-3.5 text-[#00D4FF]" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

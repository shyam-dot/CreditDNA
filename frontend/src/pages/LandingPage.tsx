import React from 'react';
import TerminalHeader from '../components/landing/TerminalHeader';
import HeroCanvas from '../components/landing/HeroCanvas';
import ResilienceGaugeDemo from '../components/landing/ResilienceGaugeDemo';
import TransactionStreamInspector from '../components/landing/TransactionStreamInspector';
import StressTestSimulatorDemo from '../components/landing/StressTestSimulatorDemo';
import ShapWaterfallCard from '../components/landing/ShapWaterfallCard';
import DemoAccountSwitcher from '../components/landing/DemoAccountSwitcher';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import RiskTerminalGrid from '../components/landing/RiskTerminalGrid';
import TerminalFooter from '../components/landing/TerminalFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-sans selection:bg-[#00D4FF]/30 selection:text-[#00D4FF]">
      {/* Sticky Command Terminal Navbar */}
      <TerminalHeader />

      {/* 1. Scroll-Animated Hero Section (Chaos -> Stability -> Intelligence) */}
      <HeroCanvas />

      {/* 2. Interactive Resilience Score Gauge */}
      <ResilienceGaugeDemo />

      {/* 3. Live Bank Transaction Telemetry Inspector */}
      <TransactionStreamInspector />

      {/* 4. AI Stress Test Simulator */}
      <StressTestSimulatorDemo />

      {/* 5. SHAP Waterfall Model Explainability */}
      <ShapWaterfallCard />

      {/* 6. Live Demo Account Switcher (Aisha Verma & Rahul Nair) */}
      <DemoAccountSwitcher />

      {/* 7. How It Works (System Architecture) */}
      <HowItWorksSection />

      {/* 8. Risk Feature Grid */}
      <RiskTerminalGrid />

      {/* 9. Clean Modern Footer */}
      <TerminalFooter />
    </div>
  );
}

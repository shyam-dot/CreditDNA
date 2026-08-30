import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { createFinancialEntry } from '../../lib/api';
import type { DashboardData } from '../../lib/types';

interface Props {
  onSuccess: (data: DashboardData) => void;
}

export default function OnboardingModal({ onSuccess }: Props) {
  const [monthlyIncome, setMonthlyIncome] = useState<string>('85000');
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>('35000');
  const [emiAmount, setEmiAmount] = useState<string>('12000');
  const [savingsBalance, setSavingsBalance] = useState<string>('180000');
  const [incomeType, setIncomeType] = useState<string>('salaried');
  const [tenureMonths, setTenureMonths] = useState<string>('24');
  const [missedPayments, setMissedPayments] = useState<string>('0');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const numIncome = parseFloat(monthlyIncome) || 0;
  const numExpenses = parseFloat(monthlyExpenses) || 0;
  const numEmi = parseFloat(emiAmount) || 0;
  const numSavings = parseFloat(savingsBalance) || 0;

  const handleCleanNumberInput = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.length > 1 && val.startsWith('0') && !val.startsWith('0.')) {
      val = val.replace(/^0+/, '');
    }
    setter(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await createFinancialEntry({
        monthly_income: numIncome,
        monthly_expenses_total: numExpenses,
        emi_amount: numEmi,
        savings_balance: numSavings,
        income_type: incomeType,
        employment_tenure_months: parseInt(tenureMonths, 10) || 0,
        missed_payments_last_year: parseInt(missedPayments, 10) || 0,
        note: 'Initial Financial Baseline',
      });
      onSuccess(res);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Failed to save financial data';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="w-full max-w-lg glass-panel p-8 border border-[#00D4FF]/30 rounded-2xl shadow-[0_0_50px_rgba(0,212,255,0.2)] animate-in">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00D4FF] mb-2">
          <Sparkles size={14} className="animate-pulse" />
          <span>Initial Profile Setup</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Set Up Your Financial Profile
        </h2>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          Enter your starting income, expenses, and savings to calculate your baseline Resilience Score.
        </p>

        {error && (
          <div className="mb-4 text-xs text-rose-400 bg-rose-950/70 border border-rose-500/30 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label" htmlFor="income">Monthly Income (₹)</label>
              <input
                id="income"
                type="number"
                min="0"
                className="input-field font-mono"
                value={monthlyIncome}
                onChange={handleCleanNumberInput(setMonthlyIncome)}
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="expenses">Monthly Expenses (₹)</label>
              <input
                id="expenses"
                type="number"
                min="0"
                className="input-field font-mono"
                value={monthlyExpenses}
                onChange={handleCleanNumberInput(setMonthlyExpenses)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label" htmlFor="emi">Total Monthly EMI (₹)</label>
              <input
                id="emi"
                type="number"
                min="0"
                className="input-field font-mono"
                value={emiAmount}
                onChange={handleCleanNumberInput(setEmiAmount)}
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="savings">Savings / Reserves (₹)</label>
              <input
                id="savings"
                type="number"
                min="0"
                className="input-field font-mono"
                value={savingsBalance}
                onChange={handleCleanNumberInput(setSavingsBalance)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="input-label" htmlFor="income_type">Income Type</label>
              <select
                id="income_type"
                className="input-field bg-[#0B0F19]"
                value={incomeType}
                onChange={(e) => setIncomeType(e.target.value)}
              >
                <option value="salaried">Salaried</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="input-label" htmlFor="tenure">Tenure (Months)</label>
              <input
                id="tenure"
                type="number"
                min="0"
                className="input-field font-mono"
                value={tenureMonths}
                onChange={handleCleanNumberInput(setTenureMonths)}
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="missed">Missed (Last Yr)</label>
              <input
                id="missed"
                type="number"
                min="0"
                max="12"
                className="input-field font-mono"
                value={missedPayments}
                onChange={handleCleanNumberInput(setMissedPayments)}
                required
              />
            </div>
          </div>

          <button
            id="onboarding-submit-btn"
            type="submit"
            disabled={submitting}
            className="btn-primary w-full mt-4 py-3.5 flex items-center justify-center gap-2 font-bold text-sm"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-[#0B0F19] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Calculate Financial Resilience</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { PlusCircle, X, ArrowRight } from 'lucide-react';
import { createFinancialEntry } from '../../lib/api';
import type { DashboardData } from '../../lib/types';

interface Props {
  onClose: () => void;
  onSuccess: (data: DashboardData) => void;
  latestIncome?: number;
  latestExpenses?: number;
  latestEmi?: number;
  latestSavings?: number;
}

export default function AddTransactionModal({
  onClose,
  onSuccess,
  latestIncome = 85000,
  latestExpenses = 35000,
  latestEmi = 12000,
  latestSavings = 180000,
}: Props) {
  const [monthlyIncome, setMonthlyIncome] = useState<string>(String(latestIncome));
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>(String(latestExpenses));
  const [emiAmount, setEmiAmount] = useState<string>(String(latestEmi));
  const [savingsBalance, setSavingsBalance] = useState<string>(String(latestSavings));
  const [incomeType, setIncomeType] = useState<string>('salaried');
  const [tenureMonths, setTenureMonths] = useState<string>('25');
  const [missedPayments, setMissedPayments] = useState<string>('0');
  const [note, setNote] = useState<string>('Month Snapshot Simulation');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const numIncome = parseFloat(monthlyIncome) || 0;
  const numExpenses = parseFloat(monthlyExpenses) || 0;
  const numEmi = parseFloat(emiAmount) || 0;
  const numSavings = parseFloat(savingsBalance) || 0;

  // Live calculation preview
  const totalOutflow = numExpenses + numEmi;
  const monthlySurplus = numIncome - totalOutflow;
  const savingsMonths = totalOutflow > 0 ? numSavings / totalOutflow : 0;
  const foir = numIncome > 0 ? (numEmi / numIncome) * 100 : 0;

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
        note,
      });
      onSuccess(res);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Failed to submit financial entry';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg glass-panel p-6 sm:p-8 border border-[#00D4FF]/30 rounded-2xl shadow-2xl relative animate-in font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#00D4FF] mb-1">
          <PlusCircle size={15} />
          <span>SIMULATE NEW MONTH / UPDATE METRICS</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          New Financial Simulation
        </h2>
        <p className="text-xs text-gray-400 mb-5 leading-relaxed">
          Update your monthly figures or test how adjusting your savings, income, or EMIs impacts your Resilience Score.
        </p>

        {error && (
          <div className="mb-4 text-xs text-rose-400 bg-rose-950/70 border border-rose-500/30 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="input-label" htmlFor="entry-note">Simulation Label</label>
            <input
              id="entry-note"
              type="text"
              className="input-field"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Month 2 Snapshot / Low Savings Test"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label" htmlFor="entry-income">Monthly Income (₹)</label>
              <input
                id="entry-income"
                type="number"
                min="0"
                className="input-field font-mono"
                value={monthlyIncome}
                onChange={handleCleanNumberInput(setMonthlyIncome)}
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="entry-expenses">Monthly Expenses (₹)</label>
              <input
                id="entry-expenses"
                type="number"
                min="0"
                className="input-field font-mono"
                value={monthlyExpenses}
                onChange={handleCleanNumberInput(setMonthlyExpenses)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label" htmlFor="entry-emi">Total EMI (₹)</label>
              <input
                id="entry-emi"
                type="number"
                min="0"
                className="input-field font-mono"
                value={emiAmount}
                onChange={handleCleanNumberInput(setEmiAmount)}
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="entry-savings">Savings / Reserves (₹)</label>
              <input
                id="entry-savings"
                type="number"
                min="0"
                className="input-field font-mono"
                value={savingsBalance}
                onChange={handleCleanNumberInput(setSavingsBalance)}
                required
              />
            </div>
          </div>

          {/* Live Calculated Metric Breakdown */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
              <span>Simulation Metrics Preview</span>
              <span className={savingsMonths < 1.0 ? 'text-rose-400' : savingsMonths < 3.0 ? 'text-amber-400' : 'text-emerald-400'}>
                {savingsMonths < 1.0 ? 'Critical Buffer' : savingsMonths < 3.0 ? 'Moderate Buffer' : 'Strong Buffer'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[10px] text-gray-400 block font-sans">Monthly Surplus</span>
                <span className={`text-xs font-bold ${monthlySurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{monthlySurplus.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[10px] text-gray-400 block font-sans">Savings Runway</span>
                <span className={`text-xs font-bold ${savingsMonths < 1.0 ? 'text-rose-400' : savingsMonths < 3.0 ? 'text-amber-400' : 'text-[#00D4FF]'}`}>
                  {savingsMonths.toFixed(1)} mo
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[10px] text-gray-400 block font-sans">Debt Ratio (FOIR)</span>
                <span className={`text-xs font-bold ${foir > 40 ? 'text-rose-400' : 'text-gray-200'}`}>
                  {foir.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="input-label" htmlFor="entry-type">Income Type</label>
              <select
                id="entry-type"
                className="input-field bg-[#0B0F19]"
                value={incomeType}
                onChange={(e) => setIncomeType(e.target.value)}
              >
                <option value="salaried">Salaried</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="input-label" htmlFor="entry-tenure">Tenure (Months)</label>
              <input
                id="entry-tenure"
                type="number"
                min="0"
                className="input-field font-mono"
                value={tenureMonths}
                onChange={handleCleanNumberInput(setTenureMonths)}
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="entry-missed">Missed (Last Yr)</label>
              <input
                id="entry-missed"
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

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost py-2.5 px-4 text-xs"
            >
              Cancel
            </button>
            <button
              id="submit-new-entry-btn"
              type="submit"
              disabled={submitting}
              className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-[#0B0F19] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Recalculate Resilience</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Search, ArrowUpRight, ArrowDownRight, Tag, ShieldCheck, Filter } from 'lucide-react';

interface TransactionItem {
  id: string;
  date: string;
  description: string;
  category: 'INFLOW' | 'EMI' | 'SAVINGS' | 'DISCRETIONARY' | 'UTILITY';
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  shapContribution: string;
  isPositiveShap: boolean;
  bankRef: string;
}

const TRANSACTIONS: TransactionItem[] = [
  {
    id: 'tx_01',
    date: '2026-08-01',
    description: 'TCS LTD - MONTHLY SALARY CREDIT',
    category: 'INFLOW',
    amount: 85000,
    type: 'CREDIT',
    shapContribution: '+22.4 pts',
    isPositiveShap: true,
    bankRef: 'HDFC_NEFT_99201',
  },
  {
    id: 'tx_02',
    date: '2026-08-03',
    description: 'HDFC HOME LOAN EMI - AUTO DEBIT',
    category: 'EMI',
    amount: 24500,
    type: 'DEBIT',
    shapContribution: '-12.1 pts',
    isPositiveShap: false,
    bankRef: 'HDFC_ACH_44812',
  },
  {
    id: 'tx_03',
    date: '2026-08-05',
    description: 'ZERODHA SIP - NIFTY 50 INDEX FUND',
    category: 'SAVINGS',
    amount: 15000,
    type: 'DEBIT',
    shapContribution: '+8.2 pts',
    isPositiveShap: true,
    bankRef: 'BSE_UPI_88201',
  },
  {
    id: 'tx_04',
    date: '2026-08-08',
    description: 'AIRTEL FIBER BROADBAND BILL',
    category: 'UTILITY',
    amount: 1059,
    type: 'DEBIT',
    shapContribution: '+1.5 pts',
    isPositiveShap: true,
    bankRef: 'BBPS_UPI_11920',
  },
  {
    id: 'tx_05',
    date: '2026-08-12',
    description: 'ZOMATO - GOURMET DINING OUTFLOW',
    category: 'DISCRETIONARY',
    amount: 1840,
    type: 'DEBIT',
    shapContribution: '-0.8 pts',
    isPositiveShap: false,
    bankRef: 'UPI_ZOM_7721',
  },
  {
    id: 'tx_06',
    date: '2026-08-15',
    description: 'AMAZON PAY - ELECTRONICS & DISCRETIONARY',
    category: 'DISCRETIONARY',
    amount: 4200,
    type: 'DEBIT',
    shapContribution: '-1.4 pts',
    isPositiveShap: false,
    bankRef: 'AMZ_PAY_3321',
  },
];

export default function TransactionStreamInspector() {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTx = TRANSACTIONS.filter((tx) => {
    const matchesFilter =
      filter === 'ALL'
        ? true
        : filter === 'INFLOW'
        ? tx.type === 'CREDIT'
        : filter === 'EMI'
        ? tx.category === 'EMI'
        : filter === 'DISCRETIONARY'
        ? tx.category === 'DISCRETIONARY'
        : true;

    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.bankRef.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <section className="py-24 px-6 bg-[#0B0F19] relative z-10 border-t border-white/10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-accent/10 border border-[#00D4FF]/30 text-xs font-mono text-[#00D4FF]">
            <Database className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>ACCOUNT AGGREGATOR DATA TELEMETRY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-space font-bold text-white tracking-tight">
            Live Bank Transaction Inspector
          </h2>
          <p className="text-gray-400 font-sans text-base leading-relaxed">
            Every transaction stream ingested via Account Aggregator consent is categorized in real-time and evaluated by the SHAP feature engine.
          </p>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="glass-card p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'All Inflows & Outflows' },
              { id: 'INFLOW', label: 'Inflows Only' },
              { id: 'EMI', label: 'EMIs & Fixed' },
              { id: 'DISCRETIONARY', label: 'Discretionary' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                  filter === f.id
                    ? 'bg-[#00D4FF]/15 text-[#00D4FF] border-[#00D4FF]/40 font-bold'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search description or bank ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111827] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00D4FF]"
            />
          </div>
        </div>

        {/* Transaction Telemetry Table Container */}
        <div className="glass-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#070A10] border-b border-white/10 text-gray-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">Date & Ref</th>
                  <th className="py-4 px-6">Transaction Description</th>
                  <th className="py-4 px-6">Category Tag</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6 text-right">SHAP Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                <AnimatePresence>
                  {filteredTx.map((tx) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-bold text-white">{tx.date}</div>
                        <div className="text-[10px] text-gray-500">{tx.bankRef}</div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-white">
                        {tx.description}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                            tx.category === 'INFLOW'
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-500/30'
                              : tx.category === 'EMI'
                              ? 'bg-amber-950/70 text-amber-400 border-amber-500/30'
                              : tx.category === 'SAVINGS'
                              ? 'bg-cyan-950/70 text-[#00D4FF] border-cyan-800/50'
                              : 'bg-white/5 text-gray-400 border-white/10'
                          }`}
                        >
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap font-bold">
                        <span className={tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-gray-200'}>
                          {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            tx.isPositiveShap
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {tx.shapContribution}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Table Footer Telemetry Status */}
          <div className="p-4 bg-[#070A10] border-t border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00D4FF]" />
              <span>Verified 1,428 transactions from Account Aggregator feed</span>
            </div>
            <div>
              <span>Latency: <strong className="text-white">12ms</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

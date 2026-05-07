"use client";
import { useMemo } from 'react';
import { useFinance } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const { transactions } = useFinance();
  const router = useRouter();

  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const stats = useMemo(() => {
    let income = 0, expense = 0;
    const categories: Record<string, number> = {};
    transactions.forEach(tx => {
      if (new Date(tx.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) === currentMonthName) {
        if (tx.type === 'Income') income += tx.amount;
        if (tx.type === 'Expense') { expense += tx.amount; categories[tx.category] = (categories[tx.category] || 0) + tx.amount; }
      }
    });
    return {
      income, expense, balance: income - expense,
      categories: Object.entries(categories).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount),
    };
  }, [transactions, currentMonthName]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-28">
      <header className="px-5 pt-6 pb-4">
        <div className="flex justify-between items-center mb-5">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#888888]">
            <span className="material-symbols-outlined !text-lg">arrow_back</span>
          </button>
          <h1 className="text-white font-bold text-base">Analytics</h1>
          <div className="w-9 h-9 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#888888]">
            <span className="material-symbols-outlined !text-lg">calendar_month</span>
          </div>
        </div>

        {/* Summary card */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1">{currentMonthName}</p>
          <p className={`text-3xl font-bold tabular-nums mb-4 ${stats.balance >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {stats.balance >= 0 ? '+' : '−'}${Math.abs(stats.balance).toLocaleString()}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1E1E1E] rounded-xl p-3">
              <p className="text-[10px] text-[#888888] font-semibold uppercase mb-0.5">Income</p>
              <p className="text-[#16A34A] font-bold tabular-nums">+${stats.income.toLocaleString()}</p>
            </div>
            <div className="bg-[#1E1E1E] rounded-xl p-3">
              <p className="text-[10px] text-[#888888] font-semibold uppercase mb-0.5">Spent</p>
              <p className="text-[#DC2626] font-bold tabular-nums">-${stats.expense.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Breakdown */}
      <section className="px-5">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-3">Expense Breakdown</p>
        {stats.categories.length === 0 ? (
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-10 text-center">
            <span className="material-symbols-outlined !text-4xl text-[#888888] mb-2 block">analytics</span>
            <p className="text-[#888888] text-sm">No expenses this month</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.categories.map((cat, idx) => {
              const pct = stats.expense > 0 ? (cat.amount / stats.expense) * 100 : 0;
              return (
                <div key={cat.name} className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1E1E1E] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#888888] !text-base">category</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{cat.name}</p>
                        <p className="text-[#888888] text-[10px]">{Math.round(pct)}% of spending</p>
                      </div>
                    </div>
                    <p className="text-white font-bold tabular-nums text-sm">-${cat.amount.toLocaleString()}</p>
                  </div>
                  <div className="h-1 w-full bg-[#2A2A2A] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${idx === 0 ? 'bg-[#2563EB]' : 'bg-[#888888]'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* AI Insight */}
      {stats.categories.length > 0 && (
        <div className="px-5 mt-4">
          <div className="bg-[#141414] border border-[#2563EB]/20 rounded-2xl p-4 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#2563EB] !text-base">auto_awesome</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#2563EB] uppercase mb-1">Neural Insight</p>
              <p className="text-[#888888] text-xs leading-relaxed">
                Your top expense is <span className="text-white font-semibold">{stats.categories[0]?.name}</span> at ${stats.categories[0]?.amount.toLocaleString()} this month.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

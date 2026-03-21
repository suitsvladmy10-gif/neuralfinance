"use client";
import { useMemo } from 'react';
import { useFinance } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const { transactions } = useFinance();
  const router = useRouter();

  // Current month processing
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const categories: Record<string, number> = {};

    transactions.forEach(tx => {
      // Simple filter for current month for the summary
      const txMonth = new Date(tx.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (txMonth === currentMonthName) {
        if (tx.type === 'Income') income += tx.amount;
        if (tx.type === 'Expense') {
          expense += tx.amount;
          categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
        }
      }
    });

    const sortedCategories = Object.entries(categories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    return { income, expense, balance: income - expense, categories: sortedCategories };
  }, [transactions, currentMonthName]);

  return (
    <div className="pb-32 px-4 h-full overflow-y-auto bg-[#111318]">
      {/* Header Aligned with design */}
      <header className="flex flex-col gap-6 mb-8 px-2 mt-4">
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#cbc3d7]">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-[#e2e2e9] font-extrabold text-lg uppercase tracking-tighter font-headline">Monthly Analytics</h1>
          <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#d0bcff]">
            <span className="material-symbols-outlined">calendar_month</span>
          </button>
        </div>

        {/* Monthly Summary Card */}
        <div className="glass-card rounded-3xl p-6 border-[#4cd7f6]/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4cd7f6]/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
          <p className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] mb-1">{currentMonthName}</p>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tighter">${stats.balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}</h2>
              <p className="text-[10px] font-bold text-[#4cd7f6] uppercase tracking-widest mt-1">Net Cash Flow</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-[#4cd7f6]">
                <span className="material-symbols-outlined !text-sm">trending_up</span>
                <span className="text-xs font-bold">${stats.income.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-[#ffb4ab]">
                <span className="material-symbols-outlined !text-sm">trending_down</span>
                <span className="text-xs font-bold">${stats.expense.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Breakdown Section */}
      <section className="space-y-6 px-2">
        <div className="flex justify-between items-center ml-2">
          <h3 className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em]">Expense Breakdown</h3>
          <span className="text-[10px] font-bold text-[#4cd7f6] uppercase tracking-widest">Top Categories</span>
        </div>

        <div className="space-y-3">
          {stats.categories.length === 0 ? (
            <div className="py-20 text-center opacity-30">
              <span className="material-symbols-outlined !text-6xl mb-4">analytics</span>
              <p className="text-sm font-medium">No expenses recorded this month</p>
            </div>
          ) : (
            stats.categories.map((cat, idx) => {
              const percentage = (cat.amount / stats.expense) * 100;
              return (
                <div key={cat.name} className="glass-card p-5 rounded-2xl border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${idx === 0 ? 'text-[#4cd7f6]' : 'text-[#cbc3d7]'}`}>
                        <span className="material-symbols-outlined !text-xl">category</span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">{cat.name}</h4>
                        <p className="text-[10px] font-bold text-[#cbc3d7] opacity-50 uppercase tracking-tighter">{Math.round(percentage)}% of total</p>
                      </div>
                    </div>
                    <p className="text-white font-extrabold text-base tracking-tight">${cat.amount.toLocaleString()}</p>
                  </div>
                  
                  {/* Progress bar for category */}
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-full rounded-full ${idx === 0 ? 'bg-[#4cd7f6]' : 'bg-[#d0bcff]'}`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* AI Insights Placeholder */}
      <section className="mt-10 px-2">
        <div className="glass-card p-6 rounded-3xl border-[#d0bcff]/20 bg-gradient-to-br from-[#d0bcff]/5 to-transparent relative overflow-hidden">
           <div className="flex items-center gap-2 mb-3">
             <span className="material-symbols-outlined text-[#d0bcff] !text-lg">auto_awesome</span>
             <h3 className="text-[10px] font-bold text-[#d0bcff] uppercase tracking-[0.2em]">Neural Insight</h3>
           </div>
           <p className="text-xs text-[#cbc3d7] leading-relaxed font-medium">
             Your spending on <span className="text-white font-bold">{stats.categories[0]?.name || 'categories'}</span> is 12% higher than last month. Consider setting a budget to stay on track with your goals.
           </p>
        </div>
      </section>
    </div>
  );
}

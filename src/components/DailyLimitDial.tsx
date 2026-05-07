"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '@/lib/store';

export function DailyLimitDial({ remaining, total, totalBalance }: { remaining: number; total: number; totalBalance?: number }) {
  const { budget, accounts, updateBudget } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState(budget.mode);
  const [manualValue, setManualValue] = useState(budget.dailyLimit.toString());
  const [savingsGoal, setSavingsGoal] = useState(budget.savingsGoal.toString());

  const spent = total - remaining;
  const pct = total > 0 ? Math.min(100, Math.max(0, (spent / total) * 100)) : 0;
  const isOverBudget = remaining < 0;

  const handleSaveBudget = () => {
    if (mode === 'manual') {
      updateBudget({ dailyLimit: parseFloat(manualValue) || 0, mode: 'manual' });
    } else {
      const totalAssets = accounts.reduce((acc, a) => acc + (a.type !== 'Credit' ? a.balance : 0), 0);
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const daysLeft = (daysInMonth - new Date().getDate()) + 1;
      const goal = parseFloat(savingsGoal) || 0;
      updateBudget({ dailyLimit: Math.max(0, (totalAssets - goal) / daysLeft), savingsGoal: goal, mode: 'auto' });
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="w-full px-4">
        {/* Balance Hero */}
        <div className="mb-6">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-widest mb-1">Total Balance</p>
          <p className="text-4xl font-bold text-white tabular-nums tracking-tight">
            ${(totalBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Daily Budget Card */}
        <div className="card p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[#888888] text-[10px] font-semibold uppercase tracking-widest mb-0.5">Daily Budget</p>
              <p className={`text-2xl font-bold tabular-nums ${isOverBudget ? 'text-[#DC2626]' : 'text-white'}`}>
                ${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                <span className="text-sm font-normal text-[#888888] ml-1">{isOverBudget ? 'over' : 'left'}</span>
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center text-[#888888] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined !text-base">settings</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-[#2A2A2A] rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${isOverBudget ? 'bg-[#DC2626]' : pct > 80 ? 'bg-[#D97706]' : 'bg-[#2563EB]'}`}
            />
          </div>

          <div className="flex justify-between">
            <span className="text-[10px] text-[#888888] tabular-nums">${spent.toLocaleString()} spent</span>
            <span className="text-[10px] text-[#888888] tabular-nums">${total.toLocaleString()} limit</span>
          </div>
        </div>
      </div>

      {/* Budget Settings Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-t-2xl p-6 shadow-2xl"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white font-bold text-lg">Budget Settings</h2>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg bg-[#1E1E1E] flex items-center justify-center text-[#888888]">
                  <span className="material-symbols-outlined !text-base">close</span>
                </button>
              </div>

              <div className="flex p-1 bg-[#1E1E1E] rounded-xl mb-6 border border-[#2A2A2A]">
                <button onClick={() => setMode('manual')} className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${mode === 'manual' ? 'bg-[#2563EB] text-white' : 'text-[#888888]'}`}>Manual</button>
                <button onClick={() => setMode('auto')} className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${mode === 'auto' ? 'bg-[#2563EB] text-white' : 'text-[#888888]'}`}>Auto (AI)</button>
              </div>

              <div className="space-y-4">
                {mode === 'manual' ? (
                  <div>
                    <label className="section-label block mb-2">Daily Limit ($)</label>
                    <input type="number" value={manualValue} onChange={e => setManualValue(e.target.value)}
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 text-2xl font-bold text-white outline-none focus:border-[#2563EB] transition-all tabular-nums" />
                  </div>
                ) : (
                  <div>
                    <label className="section-label block mb-2">Monthly Savings Goal ($)</label>
                    <input type="number" value={savingsGoal} onChange={e => setSavingsGoal(e.target.value)}
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 text-2xl font-bold text-white outline-none focus:border-[#2563EB] transition-all tabular-nums" />
                  </div>
                )}
                <button onClick={handleSaveBudget} className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-bold text-sm active:opacity-80 transition-opacity">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

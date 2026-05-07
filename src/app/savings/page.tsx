"use client";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '@/lib/store';
import { useRouter } from 'next/navigation';

const GOAL_COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#0891B2'];
const GOAL_ICONS = ['savings', 'home', 'electric_car', 'beach_access', 'school', 'laptop_mac', 'favorite', 'flight'];

export default function SavingsPage() {
  const { accounts, addAccount } = useFinance();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', target: '', initial: '' });

  const savingsAccounts = useMemo(() => accounts.filter(acc => acc.type === 'Savings'), [accounts]);
  const totalSavings = useMemo(() => savingsAccounts.reduce((acc, curr) => acc + curr.balance, 0), [savingsAccounts]);

  const handleAddGoal = async () => {
    if (!formData.name) return;
    await addAccount({ name: formData.name, type: 'Savings', balance: parseFloat(formData.initial) || 0, creditLimit: parseFloat(formData.target) || 0 });
    setFormData({ name: '', target: '', initial: '' });
    setIsModalOpen(false);
  };

  const INPUT_CLS = "w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 text-white outline-none focus:border-[#2563EB] transition-all";

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-28">
      <header className="px-5 pt-6 pb-4">
        <div className="flex justify-between items-center mb-5">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#888888]">
            <span className="material-symbols-outlined !text-lg">arrow_back</span>
          </button>
          <h1 className="text-white font-bold text-base">Savings</h1>
          <button onClick={() => setIsModalOpen(true)} className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white">
            <span className="material-symbols-outlined !text-lg">add</span>
          </button>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1">Total Stashed</p>
          <p className="text-3xl font-bold text-white tabular-nums">${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
          {savingsAccounts.length > 0 && <p className="text-[#888888] text-xs mt-1">{savingsAccounts.length} active {savingsAccounts.length === 1 ? 'goal' : 'goals'}</p>}
        </div>
      </header>

      <div className="px-5 space-y-5">
        {/* Goals Grid */}
        <section>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-3">Active Goals</p>
          <div className="grid grid-cols-2 gap-3">
            {savingsAccounts.map((goal, idx) => {
              const target = goal.creditLimit || 0;
              const pct = target > 0 ? Math.min((goal.balance / target) * 100, 100) : 0;
              const color = GOAL_COLORS[idx % GOAL_COLORS.length];
              const icon = GOAL_ICONS[idx % GOAL_ICONS.length];
              return (
                <div key={goal.id} className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: color + '20' }}>
                    <span className="material-symbols-outlined !text-base" style={{ color }}>{icon}</span>
                  </div>
                  <p className="text-white font-semibold text-xs mb-0.5 truncate">{goal.name}</p>
                  <p className="text-white font-bold text-lg tabular-nums mb-3">${goal.balance.toLocaleString()}</p>
                  <div className="h-1 w-full bg-[#2A2A2A] rounded-full overflow-hidden mb-1">
                    <motion.div initial={{ width: 0 }} animate={{ width: target > 0 ? `${pct}%` : '0%' }}
                      className="h-full rounded-full" style={{ backgroundColor: color }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] text-[#888888]">{target > 0 ? Math.round(pct) + '%' : '—'}</span>
                    <span className="text-[9px] text-[#888888]">{target > 0 ? '$' + target.toLocaleString() : 'No target'}</span>
                  </div>
                </div>
              );
            })}

            <button onClick={() => setIsModalOpen(true)} className="border border-dashed border-[#2A2A2A] rounded-2xl flex flex-col items-center justify-center p-4 min-h-[140px] hover:border-[#2563EB]/50 active:opacity-70 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#1E1E1E] flex items-center justify-center text-[#888888] mb-2">
                <span className="material-symbols-outlined !text-base">add</span>
              </div>
              <span className="text-[10px] font-semibold text-[#888888] uppercase">New Goal</span>
            </button>
          </div>
        </section>

        {/* Accounts list */}
        {savingsAccounts.length > 0 && (
          <section>
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-3">Savings Accounts</p>
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden">
              {savingsAccounts.map((acc, idx) => (
                <div key={acc.id} className={`px-4 py-3.5 flex justify-between items-center ${idx < savingsAccounts.length - 1 ? 'border-b border-[#2A2A2A]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
                      <span className="material-symbols-outlined !text-base">savings</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{acc.name}</p>
                      <p className="text-[#888888] text-[10px]">{acc.creditLimit ? `Target: $${acc.creditLimit.toLocaleString()}` : 'Savings'}</p>
                    </div>
                  </div>
                  <p className="text-white font-bold tabular-nums">${acc.balance.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-[#2563EB] shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center justify-center text-white z-50 active:scale-90 transition-transform">
        <span className="material-symbols-outlined !text-2xl">savings</span>
      </button>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}>
            <motion.div className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-t-2xl p-6 shadow-2xl"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white font-bold text-lg">New Savings Goal</h2>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg bg-[#1E1E1E] flex items-center justify-center text-[#888888]">
                  <span className="material-symbols-outlined !text-base">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Goal Name</p>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tesla, Vacation..." className={INPUT_CLS + " text-sm font-medium"} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Target Amount ($)</p>
                  <input type="number" value={formData.target} onChange={e => setFormData({ ...formData, target: e.target.value })}
                    placeholder="0" className={INPUT_CLS + " text-2xl font-bold tabular-nums text-[#2563EB]"} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Initial Deposit ($)</p>
                  <input type="number" value={formData.initial} onChange={e => setFormData({ ...formData, initial: e.target.value })}
                    placeholder="0" className={INPUT_CLS + " text-xl font-bold tabular-nums"} />
                </div>
                <button onClick={handleAddGoal} disabled={!formData.name}
                  className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-bold text-sm mt-2 active:opacity-80 disabled:opacity-30">
                  Create Goal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

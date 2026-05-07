"use client";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '@/lib/store';
import { useRouter } from 'next/navigation';

const GOAL_COLORS = ['#d0bcff', '#4cd7f6', '#c3c0ff', '#ffb4ab', '#facc15', '#86efac'];
const GOAL_ICONS = ['savings', 'home', 'electric_car', 'beach_access', 'school', 'laptop_mac', 'favorite', 'flight'];

export default function SavingsPage() {
  const { accounts, addAccount } = useFinance();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', target: '', initial: '' });

  const savingsAccounts = useMemo(() =>
    accounts.filter(acc => acc.type === 'Savings')
  , [accounts]);

  const totalSavings = useMemo(() =>
    savingsAccounts.reduce((acc, curr) => acc + curr.balance, 0)
  , [savingsAccounts]);

  const handleAddGoal = async () => {
    if (!formData.name) return;
    await addAccount({
      name: formData.name,
      type: 'Savings',
      balance: parseFloat(formData.initial) || 0,
      creditLimit: parseFloat(formData.target) || 0,
    });
    setFormData({ name: '', target: '', initial: '' });
    setIsModalOpen(false);
  };

  const openModal = () => {
    setFormData({ name: '', target: '', initial: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="pb-32 pt-12 px-4 h-full overflow-y-auto bg-[#111318]">
      <header className="flex flex-col gap-6 mb-8 px-2 mt-4">
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#cbc3d7]">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-[#e2e2e9] font-extrabold text-lg uppercase tracking-tighter font-headline">Savings</h1>
          <button onClick={openModal} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#d0bcff]">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        <div className="glass-card rounded-3xl p-6 border-[#d0bcff]/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4cd7f6]/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
          <p className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] mb-1">Total Savings Stashed</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tighter">
              ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </h2>
            {savingsAccounts.length > 0 && (
              <span className="text-[10px] font-bold text-[#4cd7f6] uppercase tracking-widest">{savingsAccounts.length} goals</span>
            )}
          </div>
        </div>
      </header>

      <section className="px-2 mb-10">
        <h3 className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] mb-6 ml-2">Active Goals</h3>
        <div className="grid grid-cols-2 gap-4">
          {savingsAccounts.map((goal, idx) => {
            const target = goal.creditLimit || 0;
            const pct = target > 0 ? Math.min((goal.balance / target) * 100, 100) : 0;
            const color = GOAL_COLORS[idx % GOAL_COLORS.length];
            const icon = GOAL_ICONS[idx % GOAL_ICONS.length];
            return (
              <div key={goal.id} className="glass-card p-5 rounded-3xl border-white/5 relative overflow-hidden group active:scale-95 transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 opacity-10 blur-2xl rounded-full -mr-8 -mt-8" style={{ backgroundColor: color }} />
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined !text-xl" style={{ color }}>{icon}</span>
                </div>
                <h4 className="text-white font-bold text-xs mb-1 truncate">{goal.name}</h4>
                <p className="text-lg font-extrabold text-white tracking-tighter mb-4">${goal.balance.toLocaleString()}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-[#cbc3d7]/50">
                    <span>{target > 0 ? Math.round(pct) + '%' : '—'}</span>
                    <span>{target > 0 ? '$' + (target >= 1000 ? (target / 1000).toFixed(0) + 'k' : target) : 'No Target'}</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: target > 0 ? `${pct}%` : '0%' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={openModal}
            className="border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-5 group hover:border-[#d0bcff]/20 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#cbc3d7] group-hover:text-[#d0bcff] transition-colors mb-2">
              <span className="material-symbols-outlined">add</span>
            </div>
            <span className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-wider">New Goal</span>
          </button>
        </div>
      </section>

      {savingsAccounts.length > 0 && (
        <section className="px-2 space-y-4">
          <h3 className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-2">Savings Accounts</h3>
          <div className="space-y-3">
            {savingsAccounts.map((acc) => (
              <div key={acc.id} className="glass-card p-5 rounded-2xl border-white/5 flex justify-between items-center group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1a1b21] border border-white/5 flex items-center justify-center text-[#4cd7f6] shadow-inner group-hover:text-[#d0bcff] transition-colors">
                    <span className="material-symbols-outlined !text-2xl">account_balance</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">{acc.name}</h3>
                    <p className="text-[10px] font-bold text-[#cbc3d7] opacity-50 uppercase tracking-tighter">
                      {acc.creditLimit ? `Target: $${acc.creditLimit.toLocaleString()}` : 'Savings'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-extrabold text-base tracking-tight">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
                  <span className="text-[8px] font-bold text-[#4cd7f6] uppercase tracking-widest bg-[#4cd7f6]/10 px-1.5 py-0.5 rounded">Active</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <button
        onClick={openModal}
        className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#d0bcff] to-[#4cd7f6] shadow-[0_10px_30px_rgba(208,188,255,0.4)] flex items-center justify-center text-[#23005c] z-50 active:scale-90 transition-all hover:brightness-110"
      >
        <span className="material-symbols-outlined !text-[28px]">savings</span>
      </button>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-sm glass-card rounded-[40px] p-8 shadow-2xl border-t-2 border-[#4cd7f6]/20"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-white font-headline font-extrabold text-xl uppercase tracking-tighter">New Goal</h2>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#cbc3d7]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Goal Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tesla, Vacation, Home Reno..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-[#4cd7f6]/50 transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Target Amount ($)</label>
                  <input
                    type="number"
                    value={formData.target}
                    onChange={e => setFormData({ ...formData, target: e.target.value })}
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl font-extrabold text-[#4cd7f6] outline-none focus:border-[#4cd7f6]/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Initial Deposit ($)</label>
                  <input
                    type="number"
                    value={formData.initial}
                    onChange={e => setFormData({ ...formData, initial: e.target.value })}
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl font-bold text-white outline-none focus:border-[#4cd7f6]/50 transition-all"
                  />
                </div>

                <button
                  onClick={handleAddGoal}
                  disabled={!formData.name}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-[#23005c] font-headline font-extrabold uppercase tracking-widest active:scale-95 transition-all shadow-lg disabled:opacity-30 mt-2"
                >
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

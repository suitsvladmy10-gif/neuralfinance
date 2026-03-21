"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Save, X } from 'lucide-react';
import { useState } from 'react';
import { useFinance } from '@/lib/store';

export function DailyLimitDial({ remaining, total, totalBalance }: { remaining: number; total: number; totalBalance?: number }) {
  const { budget, accounts, updateBudget } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState(budget.mode);
  const [manualValue, setManualValue] = useState(budget.dailyLimit.toString());
  const [savingsGoal, setSavingsGoal] = useState(budget.savingsGoal.toString());

  const percentage = total > 0 ? (remaining / total) * 100 : 0;
  
  let strokeClass = 'text-[#4cd7f6]';
  
  if (percentage < 30) strokeClass = 'text-[#facc15]';
  if (percentage < 10) strokeClass = 'text-[#ffb4ab]';

  const radius = 110; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = total > 0 ? circumference - (Math.max(0, percentage) / 100) * circumference : circumference;

  const handleSaveBudget = () => {
    if (mode === 'manual') {
      updateBudget({ dailyLimit: parseFloat(manualValue) || 0, mode: 'manual' });
    } else {
      const totalAssets = accounts.reduce((acc, a) => acc + (a.type !== 'Credit' ? a.balance : 0), 0);
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const todayDate = new Date().getDate();
      const daysLeft = (daysInMonth - todayDate) + 1;
      const goal = parseFloat(savingsGoal) || 0;
      const safeLimit = Math.max(0, (totalAssets - goal) / daysLeft);
      updateBudget({ dailyLimit: safeLimit, savingsGoal: goal, mode: 'auto' });
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Background Mesh Glow - Aligned with SVG radial gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[260px] h-[260px] bg-[#d0bcff]/5 blur-[60px] rounded-full pointer-events-none"></div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute top-2 right-2 z-20 p-2 glass-card rounded-full text-[#d0bcff] hover:scale-110 transition-transform shadow-lg"
        >
          <Settings2 className="w-4 h-4" />
        </button>

        <svg className="absolute inset-0 w-full h-full transform -rotate-90 dial-shadow">
          <circle cx="128" cy="128" r={radius} className="text-[#282a2f]" stroke="currentColor" strokeWidth="12" fill="none" />
          <motion.circle
            cx="128" cy="128" r={radius}
            className={strokeClass}
            stroke="currentColor"
            strokeWidth="12" fill="none" strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-[#cbc3d7] font-headline text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Total Balance</span>
          <motion.h2 className="text-3xl font-headline font-extrabold text-[#e2e2e9] tracking-tighter truncate w-full px-2">
            ${(totalBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.h2>
          <div className="mt-4 text-center">
            <p className="text-[#cbc3d7] font-headline text-[10px] font-bold uppercase tracking-widest opacity-60">
              Left: <span className="text-[#4cd7f6] font-extrabold tracking-normal">${remaining.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              className="w-full max-w-sm glass-card rounded-3xl p-6 shadow-2xl" 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-headline font-bold text-white">Budget Setup</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#282a2f] rounded-full transition-colors text-[#cbc3d7]"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex p-1 bg-[#282a2f] rounded-xl mb-6">
                <button onClick={() => setMode('manual')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'manual' ? 'bg-[#111318] text-white shadow-sm' : 'text-[#cbc3d7]'}`}>Manual</button>
                <button onClick={() => setMode('auto')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'auto' ? 'bg-[#111318] text-[#4cd7f6] shadow-sm' : 'text-[#cbc3d7]'}`}>Auto (AI)</button>
              </div>

              <div className="space-y-4">
                {mode === 'manual' ? (
                  <div>
                    <label className="text-xs font-bold text-[#cbc3d7] mb-2 block uppercase tracking-wider">Daily Limit ($)</label>
                    <input type="number" value={manualValue} onChange={e => setManualValue(e.target.value)} className="w-full bg-[#111318] border border-white/10 rounded-xl p-4 outline-none text-2xl font-bold text-white focus:border-[#4cd7f6] transition-all" />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-[#cbc3d7] mb-2 block uppercase tracking-wider">Monthly Savings Goal ($)</label>
                    <input type="number" value={savingsGoal} onChange={e => setSavingsGoal(e.target.value)} className="w-full bg-[#111318] border border-white/10 rounded-xl p-4 outline-none text-2xl font-bold text-[#4cd7f6] focus:border-[#4cd7f6] transition-all" />
                  </div>
                )}
                <button onClick={handleSaveBudget} className="w-full bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-[#23005c] py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 active:scale-95 shadow-lg">
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

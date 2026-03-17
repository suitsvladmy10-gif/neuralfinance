"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Calculator, Save, X } from 'lucide-react';
import { useState } from 'react';
import { useFinance } from '@/lib/store';

export function DailyLimitDial({ remaining, total }: { remaining: number; total: number }) {
  const { budget, accounts, updateBudget } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState(budget.mode);
  const [manualValue, setManualValue] = useState(budget.dailyLimit.toString());
  const [savingsGoal, setSavingsGoal] = useState(budget.savingsGoal.toString());

  const percentage = total > 0 ? (remaining / total) * 100 : 0;
  
  let colorClass = 'text-success glow-success';
  let strokeClass = 'stroke-success';
  if (percentage < 30) { colorClass = 'text-warning'; strokeClass = 'stroke-warning'; }
  if (percentage < 10) { colorClass = 'text-danger glow-danger'; strokeClass = 'stroke-danger'; }

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = total > 0 ? circumference - (percentage / 100) * circumference : circumference;

  const handleSaveBudget = () => {
    if (mode === 'manual') {
      updateBudget({ dailyLimit: parseFloat(manualValue) || 0, mode: 'manual' });
    } else {
      // Auto Calculation Logic
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
      <div className="relative w-72 h-72 mx-auto flex items-center justify-center mb-8 mt-4">
        <svg className="absolute inset-0 w-full h-full -rotate-90 transform">
          <circle cx="144" cy="144" r={radius} className="stroke-[#2E323E]" strokeWidth="12" fill="none" />
          <motion.circle
            cx="144" cy="144" r={radius}
            className={`${strokeClass} drop-shadow-[0_0_15px_rgba(var(--tw-stroke-color),0.5)]`}
            strokeWidth="12" fill="none" strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        
        <div className="text-center z-10 flex flex-col items-center justify-center relative">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="absolute -top-12 -right-4 p-2 bg-[#1A1C23] border border-[#2E323E] rounded-full text-primary hover:scale-110 transition-transform"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <p className="text-sm text-gray-400 font-medium mb-1 tracking-wider uppercase">Остаток на сегодня</p>
          <motion.h1 
            className={`text-5xl font-bold tracking-tight ${colorClass} transition-colors duration-500`}
          >
            {remaining.toLocaleString('ru-RU')} ₽
          </motion.h1>
          <p className="text-xs text-gray-500 mt-2">лимит: {total.toLocaleString('ru-RU')} ₽</p>
        </div>
      </div>

      {/* Budget Configuration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-sm bg-[#1A1C23] border border-[#2E323E] rounded-3xl p-6 shadow-2xl" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Настройка бюджета</h2>
                <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-500" /></button>
              </div>

              <div className="flex p-1 bg-[#2E323E] rounded-xl mb-6">
                <button onClick={() => setMode('manual')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'manual' ? 'bg-[#1A1C23] text-white' : 'text-gray-500'}`}>Вручную</button>
                <button onClick={() => setMode('auto')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'auto' ? 'bg-[#1A1C23] text-white' : 'text-gray-500'}`}>Авто (AI)</button>
              </div>

              <div className="space-y-4">
                {mode === 'manual' ? (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Лимит в день (₽)</label>
                    <input type="number" value={manualValue} onChange={e => setManualValue(e.target.value)} className="w-full bg-[#2E323E] border border-[#2E323E] rounded-xl p-3 outline-none text-2xl font-bold" />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Сколько сэкономить в этом месяце? (₽)</label>
                    <input type="number" value={savingsGoal} onChange={e => setSavingsGoal(e.target.value)} className="w-full bg-[#2E323E] border border-[#2E323E] rounded-xl p-3 outline-none text-2xl font-bold text-success" />
                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">Система проанализирует все ваши дебетовые счета и распределит остаток (за вычетом цели) на дни до конца месяца.</p>
                  </div>
                )}

                <button onClick={handleSaveBudget} className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-4">
                  <Save className="w-5 h-5" />
                  Применить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

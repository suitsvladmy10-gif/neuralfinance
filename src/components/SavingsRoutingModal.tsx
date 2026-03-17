"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, PiggyBank, Target, ArrowRight, Check, Info } from 'lucide-react';
import { useFinance } from '@/lib/store';
import { Account } from '@/types/finance';

interface SavingsRoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  savingsData: { amount: number, title?: string } | null;
  onConfirm: (targetAccountId: string, fromAccountId: string) => void;
  onAddNewGoal: () => void;
}

export function SavingsRoutingModal({ isOpen, onClose, savingsData, onConfirm, onAddNewGoal }: SavingsRoutingModalProps) {
  const { accounts } = useFinance();
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [selectedSourceId, setSelectedSelectedSourceId] = useState<string>('');

  const goals = accounts.filter(a => a.type === 'Savings');
  const sourceAccounts = accounts.filter(a => a.type !== 'Savings');

  if (!savingsData) return null;

  const handleConfirm = () => {
    if (selectedTargetId && selectedSourceId) {
      onConfirm(selectedTargetId, selectedSourceId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/90 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="w-full max-w-md bg-[#1A1C23] border border-primary/20 rounded-t-[40px] p-8 shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <PiggyBank className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">В копилку</h2>
                  <p className="text-primary font-bold text-lg">{savingsData.amount.toLocaleString()} ₽</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-[#2E323E] rounded-full text-gray-400"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-6">
              {/* Source Account Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Откуда переводим?</label>
                <div className="flex gap-2 overflow-x-auto pb-2 pr-2 custom-scrollbar">
                  {sourceAccounts.map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => setSelectedSelectedSourceId(acc.id)}
                      className={`flex-shrink-0 p-4 rounded-2xl border transition-all ${selectedSourceId === acc.id ? 'bg-primary/10 border-primary' : 'bg-[#2E323E]/30 border-[#2E323E]'}`}
                    >
                      <p className="text-xs font-bold text-white mb-1">{acc.name}</p>
                      <p className="text-[10px] text-gray-500">{acc.balance.toLocaleString()} ₽</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Goal Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">На какую цель?</label>
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {goals.length === 0 ? (
                    <div className="p-6 border border-dashed border-[#2E323E] rounded-2xl text-center opacity-50">
                      <p className="text-xs text-gray-400">У вас пока нет созданных целей</p>
                    </div>
                  ) : (
                    goals.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => setSelectedTargetId(goal.id)}
                        className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${selectedTargetId === goal.id ? 'bg-primary/10 border-primary' : 'bg-[#2E323E]/30 border-[#2E323E]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-primary" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-white">{goal.name}</p>
                            <p className="text-[10px] text-gray-500">Уже накоплено: {goal.balance.toLocaleString()} ₽</p>
                          </div>
                        </div>
                        {selectedTargetId === goal.id && <Check className="w-5 h-5 text-primary" />}
                      </button>
                    ))
                  )}
                  
                  <button 
                    onClick={onAddNewGoal}
                    className="w-full p-4 rounded-2xl border border-dashed border-primary/30 text-primary flex items-center gap-3 hover:bg-primary/5 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm font-bold">Создать новую цель</span>
                  </button>
                </div>
              </div>

              <div className="bg-primary/5 rounded-2xl p-4 flex items-start gap-3 border border-primary/10">
                <Info className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Деньги будут списаны со счета <span className="text-white font-bold">{accounts.find(a => a.id === selectedSourceId)?.name || '...'}</span> и зачислены в копилку.
                </p>
              </div>

              <button 
                onClick={handleConfirm}
                disabled={!selectedTargetId || !selectedSourceId}
                className="w-full bg-primary disabled:opacity-50 text-white py-5 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Отправить в копилку
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

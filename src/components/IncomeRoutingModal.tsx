"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ArrowRightLeft, CreditCard, Wallet, TrendingUp, Check } from 'lucide-react';
import { useFinance } from '@/lib/store';
import { Account } from '@/types/finance';

interface IncomeRoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomeData: { amount: number, category: string, title?: string } | null;
  onConfirm: (accountId: string, isTransfer: boolean) => void;
  onAddNewAccount: () => void;
}

export function IncomeRoutingModal({ isOpen, onClose, incomeData, onConfirm, onAddNewAccount }: IncomeRoutingModalProps) {
  const { accounts } = useFinance();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isTransfer, setIsTransfer] = useState(false);

  if (!incomeData) return null;

  const handleConfirm = () => {
    if (selectedAccountId || isTransfer) {
      onConfirm(selectedAccountId, isTransfer);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/90 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="w-full max-w-md bg-[#1A1C23] border border-[#2E323E] rounded-t-[40px] p-8 shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Куда зачислить?</h2>
                <p className="text-success font-bold text-lg">+{incomeData.amount.toLocaleString()} ₽</p>
              </div>
              <button onClick={onClose} className="p-2 bg-[#2E323E] rounded-full text-gray-400"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-6">
              {/* Transfer Toggle */}
              <button 
                onClick={() => setIsTransfer(!isTransfer)}
                className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${isTransfer ? 'bg-primary/10 border-primary' : 'bg-[#2E323E]/50 border-transparent opacity-60'}`}
              >
                <div className="flex items-center gap-3">
                  <ArrowRightLeft className={`w-5 h-5 ${isTransfer ? 'text-primary' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Это внутренний перевод</p>
                    <p className="text-[10px] text-gray-500">Не учитывать как чистый доход</p>
                  </div>
                </div>
                {isTransfer && <Check className="w-5 h-5 text-primary" />}
              </button>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Выберите счет для зачисления</label>
                <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => { setSelectedAccountId(acc.id); setIsTransfer(false); }}
                      className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${selectedAccountId === acc.id && !isTransfer ? 'bg-primary/10 border-primary' : 'bg-[#2E323E]/30 border-[#2E323E]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2E323E] flex items-center justify-center">
                          {acc.type === 'Debit' ? <CreditCard className="w-5 h-5 text-blue-400" /> : <Wallet className="w-5 h-5 text-amber-400" />}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white">{acc.name}</p>
                          <p className="text-[10px] text-gray-500">{acc.balance.toLocaleString()} ₽</p>
                        </div>
                      </div>
                      {selectedAccountId === acc.id && !isTransfer && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                    </button>
                  ))}
                  
                  <button 
                    onClick={onAddNewAccount}
                    className="w-full p-4 rounded-2xl border border-dashed border-[#2E323E] text-gray-500 flex items-center gap-3 hover:border-primary/50 hover:text-primary transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#2E323E]/30 flex items-center justify-center"><Plus className="w-5 h-5" /></div>
                    <span className="text-sm font-bold">Создать новый счет</span>
                  </button>
                </div>
              </div>

              <button 
                onClick={handleConfirm}
                disabled={!selectedAccountId && !isTransfer}
                className="w-full bg-primary disabled:opacity-50 text-white py-5 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                Подтвердить зачисление
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

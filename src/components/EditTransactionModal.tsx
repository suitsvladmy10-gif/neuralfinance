"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Check, CreditCard, Tag, Landmark } from 'lucide-react';
import { useFinance, Transaction, Account } from '@/lib/store';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function EditTransactionModal({ isOpen, onClose, transaction }: EditTransactionModalProps) {
  const { accounts, updateTransaction, deleteTransaction } = useFinance();
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setTitle(transaction.title);
      setCategory(transaction.category);
      setAccountId(transaction.accountId || '');
    }
  }, [transaction]);

  const handleSave = async () => {
    if (transaction) {
      await updateTransaction(transaction.id, {
        amount: parseFloat(amount),
        title,
        category,
        accountId: accountId || undefined
      });
      onClose();
    }
  };

  const handleDelete = async () => {
    if (transaction && confirm('Удалить эту операцию?')) {
      await deleteTransaction(transaction.id);
      onClose();
    }
  };

  if (!transaction) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="w-full max-w-sm bg-[#1A1C23] border border-[#2E323E] rounded-3xl p-6 shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Изменить операцию</h2>
              <button onClick={onClose} className="p-2 hover:bg-[#2E323E] rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 mb-1 block">Сумма (₽)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-[#2E323E] border border-[#2E323E] rounded-2xl p-4 outline-none focus:border-primary text-2xl font-bold text-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 mb-1 block">Описание</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-4 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-[#2E323E] border border-[#2E323E] rounded-2xl p-4 pl-11 outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 mb-1 block">Категория</label>
                  <input 
                    type="text" 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#2E323E] border border-[#2E323E] rounded-2xl p-3 outline-none focus:border-primary text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 mb-1 block">Счет</label>
                  <select 
                    value={accountId} 
                    onChange={e => setAccountId(e.target.value)}
                    className="w-full bg-[#2E323E] border border-[#2E323E] rounded-2xl p-3 outline-none focus:border-primary text-xs appearance-none"
                  >
                    <option value="">Не выбран</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleDelete}
                  className="flex-1 bg-danger/10 text-danger border border-danger/20 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                  Удалить
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  <Check className="w-5 h-5" />
                  Сохранить
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useFinance, Transaction } from '@/lib/store';

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
    if (transaction) {
      await deleteTransaction(transaction.id);
      onClose();
    }
  };

  if (!transaction) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="w-full max-w-sm glass-card rounded-[40px] p-8 shadow-2xl relative overflow-hidden border-t-2 border-[#ffb4ab]/20"
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-white font-headline font-extrabold text-xl uppercase tracking-tighter">Edit Activity</h2>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#cbc3d7]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Amount ($)</label>
                <input 
                  type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl font-extrabold text-white outline-none focus:border-[#4cd7f6]/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Title</label>
                <input 
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-[#4cd7f6]/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Category</label>
                  <input 
                    type="text" value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Account</label>
                  <select 
                    value={accountId} onChange={e => setAccountId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none appearance-none"
                  >
                    <option value="">Default</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={handleDelete} className="flex-1 h-16 rounded-3xl bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20 font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all">Delete</button>
                <button onClick={handleSave} className="flex-[2] h-16 rounded-3xl bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-[#23005c] font-headline font-extrabold uppercase tracking-widest active:scale-95 transition-all shadow-lg">Save</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

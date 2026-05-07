"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance, Transaction } from '@/lib/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function EditTransactionModal({ isOpen, onClose, transaction }: Props) {
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
      await updateTransaction(transaction.id, { amount: parseFloat(amount), title, category, accountId: accountId || undefined });
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

  const isExpense = transaction.type === 'Expense';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-t-2xl p-6 shadow-2xl"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-white font-bold text-lg">Edit Transaction</h2>
                <p className={`text-sm font-semibold ${isExpense ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                  {isExpense ? '−' : '+'}${transaction.amount.toLocaleString()}
                </p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#1E1E1E] flex items-center justify-center text-[#888888]">
                <span className="material-symbols-outlined !text-base">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="section-label block mb-1.5">Amount ($)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 text-2xl font-bold text-white outline-none focus:border-[#2563EB] transition-all tabular-nums" />
              </div>

              <div>
                <label className="section-label block mb-1.5">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 text-sm font-medium text-white outline-none focus:border-[#2563EB] transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label block mb-1.5">Category</label>
                  <input type="text" value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-3 text-sm text-white outline-none focus:border-[#2563EB] transition-all" />
                </div>
                <div>
                  <label className="section-label block mb-1.5">Account</label>
                  <select value={accountId} onChange={e => setAccountId(e.target.value)}
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-3 text-sm text-white outline-none appearance-none">
                    <option value="">Default</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleDelete}
                  className="flex-1 py-4 rounded-xl bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 font-semibold text-sm active:opacity-70 transition-opacity">
                  Delete
                </button>
                <button onClick={handleSave}
                  className="flex-[2] py-4 rounded-xl bg-[#2563EB] text-white font-bold text-sm active:opacity-80 transition-opacity">
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

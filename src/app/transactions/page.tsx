"use client";
import { useState } from 'react';
import { ArrowLeft, Clock, Trash2, Edit2, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useFinance, Transaction } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionsPage() {
  const { transactions, deleteTransaction, updateTransaction } = useFinance();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editAmount, setEditAmount] = useState('');
  const [editTitle, setEditTitle] = useState('');

  const totalSpent = transactions
    .filter(tx => tx.type === 'Expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const openEdit = (tx: Transaction) => {
    setSelectedTx(tx);
    setEditAmount(tx.amount.toString());
    setEditTitle(tx.title);
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    if (selectedTx) {
      updateTransaction(selectedTx.id, {
        amount: parseFloat(editAmount),
        title: editTitle
      });
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = () => {
    if (selectedTx) {
      if (confirm('Вы уверены, что хотите удалить эту операцию?')) {
        deleteTransaction(selectedTx.id);
        setIsEditModalOpen(false);
      }
    }
  };

  return (
    <div className="pb-24 pt-24 px-4 h-full overflow-y-auto">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 bg-[#1A1C23] border border-[#2E323E] rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">История операций</h1>
      </header>

      {/* Stats Summary */}
      <div className="bg-[#1A1C23] border border-[#2E323E] rounded-3xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-danger/10 rounded-full blur-3xl" />
        <p className="text-gray-400 text-sm mb-1">Всего потрачено</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-bold">{totalSpent.toLocaleString('ru-RU')} ₽</h2>
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
          <Clock className="w-12 h-12 mb-4" />
          <h3 className="font-medium text-lg">Список пуст</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map(tx => (
            <button 
              key={tx.id} 
              onClick={() => openEdit(tx)}
              className="w-full bg-[#1A1C23] border border-[#2E323E] rounded-2xl p-4 flex justify-between items-center hover:border-primary/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{tx.icon}</div>
                <div>
                  <h4 className="font-medium text-sm">{tx.title}</h4>
                  <p className="text-xs text-gray-500">{tx.category} • {tx.time}</p>
                </div>
              </div>
              <div className={`font-bold ${tx.type === 'Expense' ? 'text-white' : (tx.type === 'Income' ? 'text-success' : 'text-primary')}`}>
                {tx.type === 'Expense' ? '-' : (tx.type === 'Income' ? '+' : '')}{tx.amount.toLocaleString('ru-RU')} ₽
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedTx && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="w-full max-w-sm bg-[#1A1C23] border border-[#2E323E] rounded-3xl p-6 shadow-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Изменить операцию</h2>
                <button onClick={() => setIsEditModalOpen(false)}><X className="w-6 h-6 text-gray-500" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Название / Описание</label>
                  <input 
                    type="text" 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full bg-[#2E323E] border border-[#2E323E] rounded-xl p-3 outline-none focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Сумма (₽)</label>
                  <input 
                    type="number" 
                    value={editAmount} 
                    onChange={e => setEditAmount(e.target.value)}
                    className="w-full bg-[#2E323E] border border-[#2E323E] rounded-xl p-3 outline-none focus:border-primary text-xl font-bold"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleDelete}
                    className="flex-1 bg-danger/10 text-danger border border-danger/20 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-danger/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    Удалить
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
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
    </div>
  );
}

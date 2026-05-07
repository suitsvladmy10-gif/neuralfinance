"use client";
import { useState, useMemo } from 'react';
import { useFinance, Transaction } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { EditTransactionModal } from '@/components/EditTransactionModal';

export default function TransactionsPage() {
  const { transactions } = useFinance();
  const router = useRouter();
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach(tx => {
      const date = new Date(tx.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });
    return Object.entries(groups);
  }, [transactions]);

  const openEdit = (tx: Transaction) => { setEditingTx(tx); setIsEditOpen(true); };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-28">
      <header className="px-5 pt-6 pb-4">
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#888888]">
            <span className="material-symbols-outlined !text-lg">arrow_back</span>
          </button>
          <h1 className="text-white font-bold text-base">Activity History</h1>
          <div className="w-9 h-9" />
        </div>
      </header>

      <div className="px-5 space-y-6">
        {transactions.length === 0 ? (
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-12 text-center mt-4">
            <span className="material-symbols-outlined !text-5xl text-[#888888] mb-3 block">history</span>
            <p className="text-[#888888] text-sm font-medium">No activity yet</p>
          </div>
        ) : (
          groupedTransactions.map(([date, items]) => (
            <div key={date}>
              <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-2 ml-1">{date}</p>
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden">
                {items.map((tx, idx) => (
                  <button key={tx.id} onClick={() => openEdit(tx)}
                    className={`w-full px-4 py-3.5 flex justify-between items-center active:bg-[#1E1E1E] transition-colors text-left ${idx < items.length - 1 ? 'border-b border-[#2A2A2A]' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === 'Expense' ? 'bg-[#DC2626]/10' : 'bg-[#16A34A]/10'}`}>
                        <span className={`material-symbols-outlined !text-base ${tx.type === 'Expense' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                          {tx.type === 'Expense' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{tx.title}</p>
                        <p className="text-[#888888] text-[10px]">{tx.category} · {tx.time}</p>
                      </div>
                    </div>
                    <p className={`font-bold text-sm tabular-nums ${tx.type === 'Expense' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                      {tx.type === 'Expense' ? '−' : '+'}${tx.amount.toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <EditTransactionModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} transaction={editingTx} />
    </div>
  );
}

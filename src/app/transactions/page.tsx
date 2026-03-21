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

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsEditOpen(true);
  };

  return (
    <div className="pb-32 px-4 h-full overflow-y-auto bg-[#111318]">
      <header className="flex flex-col gap-6 mb-8 px-2 mt-4">
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#cbc3d7]">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-[#e2e2e9] font-extrabold text-lg uppercase tracking-tighter font-headline">Activity History</h1>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>
      </header>

      <div className="space-y-8 px-2">
        {transactions.length === 0 ? (
          <div className="py-20 text-center opacity-30">
            <span className="material-symbols-outlined !text-6xl mb-4">history</span>
            <p className="text-sm font-medium">No activity yet</p>
          </div>
        ) : (
          groupedTransactions.map(([date, items]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-2 opacity-50">{date}</h3>
              <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">
                {items.map((tx) => (
                  <button 
                    key={tx.id} 
                    onClick={() => openEdit(tx)}
                    className="w-full p-5 flex justify-between items-center active:bg-white/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 ${tx.type === 'Expense' ? 'bg-[#ffb4ab]/5 text-[#ffb4ab]' : 'bg-[#4cd7f6]/5 text-[#4cd7f6]'}`}>
                        <span className="material-symbols-outlined !text-xl">{tx.type === 'Expense' ? 'payments' : 'add_card'}</span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{tx.title}</p>
                        <p className="text-[10px] text-[#cbc3d7] uppercase font-bold tracking-tighter opacity-60">{tx.category} • {tx.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-extrabold text-base tracking-tight ${tx.type === 'Expense' ? 'text-[#ffb4ab]' : 'text-[#4cd7f6]'}`}>
                        {tx.type === 'Expense' ? '-' : '+'}${tx.amount.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <EditTransactionModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        transaction={editingTx} 
      />
    </div>
  );
}

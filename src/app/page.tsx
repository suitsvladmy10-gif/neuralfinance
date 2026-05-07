"use client";
import { useState, useMemo } from 'react';
import { DailyLimitDial } from '@/components/DailyLimitDial';
import { MagicInputModal } from '@/components/MagicInputModal';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import Link from 'next/link';
import { useFinance } from '@/lib/store';
import { Transaction, MagicAddData } from '@/types/finance';

export default function Dashboard() {
  const { accounts, transactions, budget, reminders, addTransaction } = useFinance();

  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const todayDate = new Date();
  const todayDay = todayDate.getDate();
  const currentMonth = todayDate.toISOString().substring(0, 7);

  const dueToday = useMemo(() =>
    reminders.filter(r => r.dayOfMonth === todayDay && r.lastConfirmedDate !== currentMonth)
  , [reminders, todayDay, currentMonth]);

  const totalBalance = useMemo(() =>
    accounts.reduce((acc, curr) => acc + (curr.type === 'PersonalDebt' ? -curr.balance : curr.balance), 0)
  , [accounts]);

  const todayStr = todayDate.toDateString();
  const totalExpensesToday = useMemo(() =>
    transactions
      .filter(tx => tx.type === 'Expense' && new Date(tx.date).toDateString() === todayStr)
      .reduce((acc, curr) => acc + curr.amount, 0)
  , [transactions, todayStr]);

  const dailyBudget = budget.dailyLimit;
  const remainingBudget = dailyBudget - totalExpensesToday;

  // Monthly income/expense for stats
  const monthlyStats = useMemo(() => {
    let income = 0, expense = 0;
    transactions.forEach(tx => {
      const m = new Date(tx.date).toISOString().substring(0, 7);
      if (m === currentMonth) {
        if (tx.type === 'Income') income += tx.amount;
        if (tx.type === 'Expense') expense += tx.amount;
      }
    });
    return { income, expense };
  }, [transactions, currentMonth]);

  const handleMagicAdd = (data: MagicAddData) => {
    addTransaction({
      title: data.title || data.category,
      category: data.category,
      amount: data.amount,
      type: data.type as 'Expense' | 'Income',
      icon: 'auto_awesome',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    });
    setIsMagicModalOpen(false);
  };

  const openEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-28">
      {/* Header */}
      <header className="flex justify-between items-center px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
            <span className="text-white text-[10px] font-black">NF</span>
          </div>
          <span className="text-white font-bold text-sm tracking-wide">Neural Finance</span>
        </div>
        <Link href="/reminders" className="relative w-9 h-9 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#888888]">
          <span className="material-symbols-outlined !text-lg">notifications</span>
          {dueToday.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full" />
          )}
        </Link>
      </header>

      {/* Balance + Daily Budget */}
      <DailyLimitDial remaining={remainingBudget} total={dailyBudget} totalBalance={totalBalance} />

      {/* Monthly Stats Row */}
      <div className="grid grid-cols-2 gap-3 px-5 mt-5">
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1">Income</p>
          <p className="text-lg font-bold text-[#16A34A] tabular-nums">+${monthlyStats.income.toLocaleString()}</p>
          <p className="text-[9px] text-[#888888] mt-0.5">This month</p>
        </div>
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1">Expenses</p>
          <p className="text-lg font-bold text-[#DC2626] tabular-nums">-${monthlyStats.expense.toLocaleString()}</p>
          <p className="text-[9px] text-[#888888] mt-0.5">This month</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 px-5 mt-3">
        <Link href="/savings" className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 flex items-center gap-3 active:opacity-70 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#2563EB] !text-lg">savings</span>
          </div>
          <div>
            <p className="text-white font-semibold text-xs">Savings</p>
            <p className="text-[#888888] text-[10px]">Goals & vaults</p>
          </div>
        </Link>
        <Link href="/reminders" className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 flex items-center gap-3 active:opacity-70 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-[#D97706]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#D97706] !text-lg">event_repeat</span>
          </div>
          <div>
            <p className="text-white font-semibold text-xs">Planning</p>
            <p className="text-[#888888] text-[10px]">Bills & subs</p>
          </div>
        </Link>
      </div>

      {/* Accounts */}
      <section className="px-5 mt-6">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">Accounts</p>
          <Link href="/accounts" className="text-[#2563EB] text-xs font-semibold">View all</Link>
        </div>
        <div className="space-y-2">
          {accounts.length === 0 ? (
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5 text-center">
              <p className="text-[#888888] text-sm">No accounts yet</p>
              <Link href="/accounts" className="text-[#2563EB] text-xs font-semibold mt-1 block">Add account</Link>
            </div>
          ) : (
            accounts.slice(0, 2).map((acc) => (
              <div key={acc.id} className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center text-[#888888]">
                    <span className="material-symbols-outlined !text-base">
                      {acc.type === 'Debit' ? 'account_balance' : acc.type === 'Crypto' ? 'token' : acc.type === 'Savings' ? 'savings' : 'wallet'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{acc.name}</p>
                    <p className="text-[#888888] text-[10px] uppercase font-medium">{acc.type}</p>
                  </div>
                </div>
                <p className="text-white font-bold tabular-nums">${acc.balance.toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Activity */}
      <section className="px-5 mt-6">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">Recent Activity</p>
          <Link href="/transactions" className="text-[#2563EB] text-xs font-semibold">History</Link>
        </div>
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-5 text-center">
              <p className="text-[#888888] text-sm">No transactions yet</p>
            </div>
          ) : (
            transactions.slice(0, 4).map((tx, idx) => (
              <button
                key={tx.id}
                onClick={() => openEdit(tx)}
                className={`w-full px-4 py-3.5 flex justify-between items-center active:bg-[#1E1E1E] transition-colors text-left ${idx < Math.min(transactions.length, 4) - 1 ? 'border-b border-[#2A2A2A]' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tx.type === 'Expense' ? 'bg-[#DC2626]/10' : 'bg-[#16A34A]/10'}`}>
                    <span className={`material-symbols-outlined !text-sm ${tx.type === 'Expense' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
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
            ))
          )}
        </div>
      </section>

      {/* FAB */}
      <button
        onClick={() => setIsMagicModalOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-[#2563EB] shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center justify-center text-white z-50 active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined !text-2xl">add</span>
      </button>

      <MagicInputModal isOpen={isMagicModalOpen} onClose={() => setIsMagicModalOpen(false)} onAdd={handleMagicAdd} />
      <EditTransactionModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} transaction={editingTransaction} />
    </div>
  );
}

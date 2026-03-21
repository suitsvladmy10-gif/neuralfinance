"use client";
import { useState, useMemo } from 'react';
import { DailyLimitDial } from '@/components/DailyLimitDial';
import { MagicInputModal } from '@/components/MagicInputModal';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { IncomeRoutingModal } from '@/components/IncomeRoutingModal';
import { SavingsRoutingModal } from '@/components/SavingsRoutingModal';
import Link from 'next/link';
import { useFinance } from '@/lib/store';
import { Transaction } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { accounts, transactions, budget, reminders, addTransaction, transferMoney } = useFinance();
  const router = useRouter();
  
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isIncomeRoutingOpen, setIsIncomeRoutingOpen] = useState(false);
  const [isSavingsRoutingOpen, setIsSavingsRoutingOpen] = useState(false);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [pendingIncome, setPendingIncome] = useState<{ amount: number, category: string, title?: string } | null>(null);
  const [pendingSavings, setPendingSavings] = useState<{ amount: number, title?: string } | null>(null);
  
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

  const handleMagicAdd = (data: any) => {
    const isSavings = ['копилка', 'цель', 'отложил'].some(k => data.category.toLowerCase().includes(k));
    if (data.type === 'Income') { setPendingIncome(data); setIsIncomeRoutingOpen(true); }
    else if (isSavings) { setPendingSavings(data); setIsSavingsRoutingOpen(true); }
    else { addTransaction({ title: data.title || data.category, category: data.category, amount: data.amount, type: data.type, icon: '💸' }); }
    setIsMagicModalOpen(false);
  };

  const openEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsEditModalOpen(true);
  };

  return (
    <div className="pb-32 pt-12 px-4 h-full overflow-y-auto bg-[#111318]">
      {/* Header - Pushed down for TMA UI */}
      <header className="flex justify-between items-center mb-10 px-2 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#282a2f] border border-white/5 flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#d0bcff]">NF</span>
          </div>
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] font-extrabold tracking-tighter text-lg uppercase font-headline">NEURAL FINANCE</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/reminders" className="relative w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#cbc3d7]">
            <span className="material-symbols-outlined !text-[22px]">notifications</span>
            {dueToday.length > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#ffb4ab] rounded-full border border-[#111318]" />}
          </Link>
        </div>
      </header>

      {/* Daily Limit Centerpiece */}
      <section className="flex flex-col items-center justify-center mb-10 relative">
        <div className="text-[#d0bcff] font-bold text-xs tracking-[0.2em] mb-6 uppercase">Daily Limit</div>
        <DailyLimitDial remaining={remainingBudget} total={dailyBudget} totalBalance={totalBalance} />
        
        {/* New Daily Status Badge */}
        <div className="mt-8 glass-card rounded-2xl p-4 w-full flex justify-between items-center max-w-[280px] border-[#4cd7f6]/10">
          <div className="text-center flex-1">
            <p className="text-[9px] text-[#cbc3d7] uppercase tracking-widest mb-1">Spent Today</p>
            <p className="text-sm font-bold text-[#ffb4ab]">${totalExpensesToday.toLocaleString('en-US')}</p>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2"></div>
          <div className="text-center flex-1">
            <p className="text-[9px] text-[#cbc3d7] uppercase tracking-widest mb-1">Left to Spend</p>
            <p className="text-sm font-bold text-[#4cd7f6]">${Math.max(0, remainingBudget).toLocaleString('en-US')}</p>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <div className="space-y-8 px-2">
        {/* Accounts Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-headline text-base font-bold text-white uppercase tracking-wider">Accounts</h3>
            <Link href="/accounts" className="text-[#d0bcff] text-[10px] font-bold uppercase tracking-widest">View All</Link>
          </div>
          <div className="space-y-3">
            {accounts.slice(0, 2).map((acc) => (
              <div key={acc.id} className="glass-card p-5 rounded-xl flex justify-between items-center group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1a1b21] flex items-center justify-center text-[#d0bcff] border border-white/5 shadow-inner">
                    <span className="material-symbols-outlined">{acc.type === 'Debit' ? 'account_balance' : 'token'}</span>
                  </div>
                  <div>
                    <p className="text-[#e2e2e9] font-bold text-sm">{acc.name}</p>
                    <p className="text-[#cbc3d7] text-[10px] uppercase tracking-tight opacity-60">{acc.bankName || acc.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-base tracking-tight">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[#4cd7f6] text-[9px] font-bold uppercase tracking-widest">Liquid</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Transactions Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-headline text-base font-bold text-white uppercase tracking-wider">Recent Activity</h3>
            <Link href="/transactions" className="text-[#d0bcff] text-[10px] font-bold uppercase tracking-widest">History</Link>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
            <div className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-[#cbc3d7] text-sm opacity-50 font-medium">No recent operations</div>
              ) : (
                transactions.slice(0, 4).map((tx) => (
                  <button key={tx.id} onClick={() => openEdit(tx)} className="w-full p-4 flex justify-between items-center active:bg-white/5 transition-colors text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#1a1b21] flex items-center justify-center border border-white/5 shadow-inner">
                        <span className="material-symbols-outlined text-[#4cd7f6] !text-[20px]">
                          {tx.category.toLowerCase().includes('shop') ? 'shopping_bag' : 
                           tx.category.toLowerCase().includes('food') ? 'restaurant' : 
                           'payments'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#e2e2e9]">{tx.title}</p>
                        <p className="text-[10px] text-[#cbc3d7] uppercase tracking-tighter">{tx.category} • {tx.time}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold tracking-tight ${tx.type === 'Expense' ? 'text-[#ffb4ab]' : 'text-[#4cd7f6]'}`}>
                      {tx.type === 'Expense' ? '-' : '+'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* FAB: Plus Button - Changed from Magic to Plus Circle */}
      <button 
        onClick={() => setIsMagicModalOpen(true)}
        className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#d0bcff] to-[#4cd7f6] shadow-[0_10px_30px_rgba(208,188,255,0.4)] flex items-center justify-center text-[#23005c] z-50 active:scale-90 transition-all hover:brightness-110"
      >
        <span className="material-symbols-outlined !text-[32px]">add</span>
      </button>

      {/* Modals */}
      <MagicInputModal isOpen={isMagicModalOpen} onClose={() => setIsMagicModalOpen(false)} onAdd={handleMagicAdd} />
      <EditTransactionModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} transaction={editingTransaction} />
    </div>
  );
}

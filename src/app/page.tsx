"use client";
import { useState, useMemo } from 'react';
import { DailyLimitDial } from '@/components/DailyLimitDial';
import { MagicInputModal } from '@/components/MagicInputModal';
import { RolloverModal } from '@/components/RolloverModal';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { IncomeRoutingModal } from '@/components/IncomeRoutingModal';
import { SavingsRoutingModal } from '@/components/SavingsRoutingModal';
import { Sparkles, Wallet, TrendingDown, ChevronRight, MoonStar, PlusCircle, Bell, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useFinance } from '@/lib/store';
import { Transaction } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { accounts, transactions, budget, reminders, addTransaction, transferMoney } = useFinance();
  const router = useRouter();
  
  // Modals state
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [isRolloverOpen, setIsRolloverOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isIncomeRoutingOpen, setIsIncomeRoutingOpen] = useState(false);
  const [isSavingsRoutingOpen, setIsSavingsRoutingOpen] = useState(false);
  
  // Data state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [pendingIncome, setPendingIncome] = useState<{ amount: number, category: string, title?: string } | null>(null);
  const [pendingSavings, setPendingSavings] = useState<{ amount: number, title?: string } | null>(null);
  
  const todayDate = new Date();
  const todayDay = todayDate.getDate();
  const currentMonth = todayDate.toISOString().substring(0, 7);

  const dueToday = useMemo(() => 
    reminders.filter(r => r.dayOfMonth === todayDay && r.lastConfirmedDate !== currentMonth)
  , [reminders, todayDay, currentMonth]);
  
  const spendingPower = useMemo(() => 
    accounts
      .filter(a => a.type === 'Debit' || a.type === 'Cash' || a.type === 'Credit')
      .reduce((acc, curr) => acc + curr.balance, 0)
  , [accounts]);
  
  const todayStr = todayDate.toDateString();
  const totalExpensesToday = useMemo(() => 
    transactions
      .filter(tx => tx.type === 'Expense' && new Date(tx.date).toDateString() === todayStr)
      .reduce((acc, curr) => acc + curr.amount, 0)
  , [transactions, todayStr]);

  const dailyBudget = budget.dailyLimit; 
  const remainingBudget = dailyBudget - totalExpensesToday;

  const handleMagicAdd = (data: { amount: number, category: string, accountName: string, type: 'Expense' | 'Income', title?: string }) => {
    const isSavings = ['копилка', 'цель', 'отложил', 'накопления'].some(k => 
      data.category.toLowerCase().includes(k) || (data.title || '').toLowerCase().includes(k)
    );

    if (data.type === 'Income') {
      setPendingIncome(data);
      setIsIncomeRoutingOpen(true);
      setIsMagicModalOpen(false);
    } else if (isSavings) {
      setPendingSavings({ amount: data.amount, title: data.title });
      setIsSavingsRoutingOpen(true);
      setIsMagicModalOpen(false);
    } else {
      addTransaction({
        title: data.category,
        category: data.category,
        amount: data.amount,
        type: data.type,
        icon: '💸'
      });
      setIsMagicModalOpen(false);
    }
  };

  const handleIncomeConfirm = (accountId: string, isTransfer: boolean) => {
    if (pendingIncome) {
      addTransaction({
        title: isTransfer ? `Перевод (доход)` : pendingIncome.category,
        category: isTransfer ? 'Перевод' : pendingIncome.category,
        amount: pendingIncome.amount,
        type: isTransfer ? 'Transfer' : 'Income',
        icon: isTransfer ? '🔄' : '💰',
        accountId: accountId
      });
      setIsIncomeRoutingOpen(false);
      setPendingIncome(null);
    }
  };

  const handleSavingsConfirm = async (targetAccountId: string, fromAccountId: string) => {
    if (pendingSavings) {
      await transferMoney(fromAccountId, targetAccountId, pendingSavings.amount);
      setIsSavingsRoutingOpen(false);
      setPendingSavings(null);
    }
  };

  const openEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsEditModalOpen(true);
  };

  return (
    <div className="pb-32 pt-6 px-4 h-full overflow-y-auto">
      <header className="flex justify-between items-center mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#282a2f] border border-white/5 flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#d0bcff]">NF</span>
          </div>
          <h1 className="text-gradient font-extrabold tracking-tighter text-lg uppercase">NEURAL FINANCE</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/reminders" className="relative w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#cbc3d7]">
            <span className="material-symbols-outlined !text-[22px]">notifications</span>
            {dueToday.length > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#ffb4ab] rounded-full border border-[#111318]" />}
          </Link>
        </div>
      </header>

      <AnimatePresence>
        {dueToday.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-8 px-2">
            <div className="glass-card border-[#d0bcff]/20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#d0bcff]">event_repeat</span>
                <div>
                  <h4 className="text-[10px] font-bold text-[#d0bcff] uppercase tracking-wider">Due Today</h4>
                  <p className="text-sm font-medium text-white">{dueToday[0].title}</p>
                </div>
              </div>
              <Link href="/reminders" className="bg-[#d0bcff] text-[#23005c] text-[10px] font-bold px-3 py-2 rounded-lg uppercase">PAY</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="flex flex-col items-center justify-center mb-12">
        <DailyLimitDial remaining={remainingBudget} total={dailyBudget} totalBalance={spendingPower} />
        <div className="mt-4 px-3 py-1 rounded-full bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <span className="text-[10px] font-bold text-[#4cd7f6] uppercase tracking-widest">Neural Optimized</span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 mb-8 px-2">
        {/* Accounts Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-headline text-lg font-bold text-white">Accounts</h3>
            <Link href="/accounts" className="text-[#d0bcff] text-xs font-semibold uppercase tracking-wider">View All</Link>
          </div>
          <div className="space-y-3">
            {accounts.slice(0, 2).map((acc) => (
              <div key={acc.id} className="glass-card p-5 rounded-xl flex justify-between items-center group cursor-pointer active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#33353a] flex items-center justify-center text-[#d0bcff] border border-white/5">
                    <span className="material-symbols-outlined">{acc.type === 'Debit' ? 'account_balance' : 'token'}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{acc.name}</p>
                    <p className="text-[#cbc3d7] text-xs opacity-70">{acc.bankName || acc.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[#4cd7f6] text-[10px] font-bold uppercase tracking-tighter">Liquid</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Transactions Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-headline text-lg font-bold text-white">Recent Activity</h3>
            <Link href="/transactions" className="text-[#d0bcff] text-xs font-semibold uppercase tracking-wider">History</Link>
          </div>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-[#cbc3d7] text-sm opacity-50">No operations yet.</div>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <button key={tx.id} onClick={() => openEdit(tx)} className="w-full p-4 flex justify-between items-center active:bg-white/5 transition-colors text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#1a1b21] flex items-center justify-center border border-white/5">
                        <span className="material-symbols-outlined text-[#4cd7f6] !text-[20px]">
                          {tx.category.toLowerCase().includes('shop') ? 'shopping_bag' : 
                           tx.category.toLowerCase().includes('food') ? 'restaurant' : 
                           tx.type === 'Income' ? 'payments' : 'receipt_long'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{tx.title}</p>
                        <p className="text-[10px] text-[#cbc3d7]">{tx.category} • {tx.time}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold ${tx.type === 'Expense' ? 'text-[#ffb4ab]' : 'text-[#4cd7f6]'}`}>
                      {tx.type === 'Expense' ? '-' : '+'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* FAB: Magic Input */}
      <button 
        onClick={() => setIsMagicModalOpen(true)}
        className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#d0bcff] to-[#4cd7f6] shadow-[0_10px_30px_rgba(208,188,255,0.4)] flex items-center justify-center text-[#23005c] z-50 active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined !text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
      </button>
      <RolloverModal isOpen={isRolloverOpen} onClose={() => setIsRolloverOpen(false)} surplus={remainingBudget} />
      <EditTransactionModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        transaction={editingTransaction} 
      />
      <IncomeRoutingModal 
        isOpen={isIncomeRoutingOpen} 
        onClose={() => { setIsIncomeRoutingOpen(false); setPendingIncome(null); }}
        incomeData={pendingIncome}
        onConfirm={handleIncomeConfirm}
        onAddNewAccount={() => router.push('/accounts')}
      />
      <SavingsRoutingModal
        isOpen={isSavingsRoutingOpen}
        onClose={() => { setIsSavingsRoutingOpen(false); setPendingSavings(null); }}
        savingsData={pendingSavings}
        onConfirm={handleSavingsConfirm}
        onAddNewGoal={() => router.push('/accounts')}
      />
    </div>
  );
}

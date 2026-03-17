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
    <div className="pb-24 pt-24 px-4 h-full overflow-y-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-gray-400 text-sm font-medium">Мои финансы</h2>
          <h1 className="text-xl font-bold">Neural Finance</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/reminders" className="relative w-10 h-10 rounded-full bg-[#1A1C23] border border-[#2E323E] flex items-center justify-center hover:text-primary transition-colors">
            <Bell className="w-4 h-4" />
            {dueToday.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-danger rounded-full border-2 border-[#0F1014] animate-pulse" />}
          </Link>
          <button onClick={() => setIsRolloverOpen(true)} className="w-10 h-10 rounded-full bg-[#1A1C23] border border-[#2E323E] flex items-center justify-center hover:text-primary transition-colors">
            <MoonStar className="w-4 h-4" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {dueToday.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg text-primary"><Calendar className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Платёж сегодня</h4>
                  <p className="text-sm font-medium">{dueToday[0].title} — {dueToday[0].amount.toLocaleString()} ₽</p>
                </div>
              </div>
              <Link href="/reminders" className="bg-primary text-white text-[10px] font-bold px-3 py-2 rounded-lg">ОПЛАТИТЬ</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DailyLimitDial remaining={remainingBudget} total={dailyBudget} />

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/accounts" className="bg-[#1A1C23] border border-[#2E323E] rounded-2xl p-4 hover:border-primary/50 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg"><Wallet className="w-5 h-5 text-primary" /></div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary transition-transform group-hover:translate-x-1" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Свободно для трат</p>
          <h3 className="text-xl font-bold">{spendingPower.toLocaleString('ru-RU')} ₽</h3>
        </Link>

        <Link href="/transactions" className="bg-[#1A1C23] border border-[#2E323E] rounded-2xl p-4 hover:border-danger/50 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-danger/10 rounded-lg"><TrendingDown className="w-5 h-5 text-danger" /></div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-danger transition-transform group-hover:translate-x-1" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Траты сегодня</p>
          <h3 className="text-xl font-bold">{totalExpensesToday.toLocaleString('ru-RU')} ₽</h3>
        </Link>
      </div>

      <div className="flex justify-center mb-10">
        <button onClick={() => setIsMagicModalOpen(true)} className="relative group bg-primary p-4 rounded-2xl w-full flex justify-center items-center gap-3 shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
          <span className="font-bold text-lg text-white">Новая запись</span>
        </button>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Последние операции</h3>
          {transactions.length > 0 && <Link href="/transactions" className="text-xs text-primary">История</Link>}
        </div>
        
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
            <PlusCircle className="w-12 h-12 mb-3" />
            <p className="text-sm">Пока нет операций.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => (
              <button 
                key={tx.id} 
                onClick={() => openEdit(tx)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#1A1C23] border border-[#2E323E] hover:border-primary/30 transition-all active:scale-[0.98] text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2E323E]/50 flex items-center justify-center text-xl">
                    {tx.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">{tx.title}</p>
                    <p className="text-xs text-gray-500">{tx.category} • {tx.time}</p>
                  </div>
                </div>
                <div className={`font-bold ${tx.type === 'Expense' ? 'text-white' : 'text-success'}`}>
                  {tx.type === 'Expense' ? '-' : '+'}{tx.amount.toLocaleString('ru-RU')} ₽
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <MagicInputModal isOpen={isMagicModalOpen} onClose={() => setIsMagicModalOpen(false)} onAdd={handleMagicAdd} />
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

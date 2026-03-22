"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { FinanceService } from '@/services/financeService';
import { Account, Transaction, Reminder, BudgetConfig, UserProfile, AccountType } from '@/types/finance';

interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  reminders: Reminder[];
  budget: BudgetConfig;
  loading: boolean;
  user: UserProfile | null;
  addTransaction: (tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  addAccount: (acc: Partial<Account>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  updateAccountBalance: (id: string, amount: number) => Promise<void>;
  transferMoney: (fromId: string, toId: string, amount: number) => Promise<void>;
  updateBudget: (updates: Partial<BudgetConfig>) => void;
  addReminder: (rem: Partial<Reminder>) => Promise<void>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
  confirmReminder: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const getUuidFromTg = (tgId: number | string) => {
  const str = String(tgId);
  const padded = str.padStart(12, '0');
  return `00000000-0000-0000-0000-${padded}`;
};

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [budget, setBudget] = useState<BudgetConfig>({ dailyLimit: 0, savingsGoal: 0, mode: 'manual' });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Инициализация при входе
  useEffect(() => {
    async function initAuthAndSync() {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sync Timeout')), 5000)
      );

      try {
        setLoading(true);
        
        // 1. Определение пользователя
        const tg = (window as any).Telegram?.WebApp;
        const tgUser = tg?.initDataUnsafe?.user;
        
        // Оборачиваем критические вызовы в Promise.race для предотвращения зависания
        const { data: { user: sbUser } } = await (Promise.race([
          supabase.auth.getUser(),
          timeoutPromise
        ]) as any);
        
        let currentUser: UserProfile | null = null;
        if (sbUser) {
          currentUser = { id: sbUser.id, db_uuid: sbUser.id, source: 'supabase' };
        } else if (tgUser) {
          currentUser = { 
            id: `tg_${tgUser.id}`, 
            db_uuid: getUuidFromTg(tgUser.id), 
            source: 'telegram', 
            name: tgUser.first_name 
          };
          // Фоновая регистрация TG пользователя
          supabase.from('users').upsert({ id: currentUser.db_uuid, name: currentUser.name || 'TG User' }).then();
        }

        setUser(currentUser);

        // 2. Мгновенная загрузка из кэша (Offline-first)
        const prefix = currentUser ? `${currentUser.id}_` : 'nf_';
        const cachedAccs = localStorage.getItem(`${prefix}accounts`);
        const cachedTxs = localStorage.getItem(`${prefix}transactions`);
        const cachedReminders = localStorage.getItem(`${prefix}reminders`);
        const cachedBudget = localStorage.getItem(`${prefix}budget`);

        if (cachedAccs) setAccounts(JSON.parse(cachedAccs));
        if (cachedTxs) setTransactions(JSON.parse(cachedTxs).map((t: any) => ({ ...t, date: new Date(t.date) })));
        if (cachedReminders) setReminders(JSON.parse(cachedReminders));
        if (cachedBudget) setBudget(JSON.parse(cachedBudget));

        // 3. Фоновая синхронизация с облаком (Cloud Sync)
        if (currentUser) {
          try {
            const [accs, txs, rems] = await (Promise.race([
              Promise.all([
                FinanceService.getAccounts(currentUser.db_uuid),
                FinanceService.getTransactions(currentUser.db_uuid),
                FinanceService.getReminders(currentUser.db_uuid)
              ]),
              timeoutPromise
            ]) as any);
            
            if (accs.length > 0) setAccounts(accs);
            if (txs.length > 0) setTransactions(txs);
            if (rems.length > 0) setReminders(rems);
            
            localStorage.setItem(`${prefix}accounts`, JSON.stringify(accs));
            localStorage.setItem(`${prefix}transactions`, JSON.stringify(txs));
            localStorage.setItem(`${prefix}reminders`, JSON.stringify(rems));
          } catch (e) {
            console.warn("Cloud sync timed out or failed, using offline data", e);
          }
        }
      } catch (e) {
        console.error("Initialization error, falling back to basic offline mode", e);
      } finally {
        setLoading(false);
      }
    }
    initAuthAndSync();
  }, []);

  // Авто-сохранение в кэш при любых изменениях
  useEffect(() => {
    if (!loading) {
      const prefix = user ? `${user.id}_` : 'nf_';
      localStorage.setItem(`${prefix}accounts`, JSON.stringify(accounts));
      localStorage.setItem(`${prefix}transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${prefix}reminders`, JSON.stringify(reminders));
      localStorage.setItem(`${prefix}budget`, JSON.stringify(budget));
    }
  }, [accounts, transactions, reminders, budget, loading, user]);

  const addTransaction = async (txData: Partial<Transaction>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newTx = { ...txData, id: tempId, date: new Date() } as Transaction;
    
    setTransactions(prev => [newTx, ...prev]);
    
    if (newTx.accountId) {
      const diff = newTx.type === 'Expense' ? -newTx.amount : newTx.amount;
      const targetAcc = accounts.find(a => a.id === newTx.accountId);
      if (targetAcc) {
        const newBalance = targetAcc.balance + diff;
        setAccounts(prev => prev.map(a => a.id === newTx.accountId ? { ...a, balance: newBalance } : a));
        
        if (user) {
          await Promise.all([
            FinanceService.createTransaction(user.db_uuid, newTx),
            FinanceService.updateAccountBalance(newTx.accountId, newBalance)
          ]);
        }
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    // 1. Удаляем локально мгновенно для отзывчивости
    setTransactions(prev => prev.filter(t => t.id !== id));

    // 2. Если есть привязка к счету, откатываем баланс
    if (tx.accountId) {
      const reverse = tx.type === 'Expense' ? tx.amount : -tx.amount;
      const targetAcc = accounts.find(a => a.id === tx.accountId);
      if (targetAcc) {
        const newBalance = targetAcc.balance + reverse;
        setAccounts(prev => prev.map(a => a.id === tx.accountId ? { ...a, balance: newBalance } : a));
        
        // 3. Удаляем из БД если это не временный ID (временные ID обычно короткие или не UUID)
        const isPersistent = id.includes('-') || id.length > 15;
        if (user && isPersistent) {
          try {
            await Promise.all([
              FinanceService.deleteTransaction(id),
              FinanceService.updateAccountBalance(tx.accountId, newBalance)
            ]);
          } catch (e) {
            console.error("Failed to delete from DB, transaction might reappear", e);
          }
        }
      }
    }
  };

  const addAccount = async (accData: Partial<Account>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newAcc = { ...accData, id: tempId } as Account;
    setAccounts(prev => [...prev, newAcc]);
    if (user) {
      const { data } = await FinanceService.createAccount(user.db_uuid, accData);
      if (data?.[0]) setAccounts(prev => prev.map(a => a.id === tempId ? { ...a, id: data[0].id } : a));
    }
  };

  const updateAccountBalance = async (id: string, amount: number) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    const newBalance = acc.balance + amount;
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, balance: newBalance } : a));
    if (user && id.length > 20) {
      await FinanceService.updateAccountBalance(id, newBalance);
    }
  };

  const addReminder = async (rem: Partial<Reminder>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    setReminders(prev => [...prev, { ...rem, id: tempId } as Reminder]);
    if (user) {
      await FinanceService.createReminder(user.db_uuid, rem);
    }
  };

  const confirmReminder = async (id: string) => {
    const rem = reminders.find(r => r.id === id);
    if (rem) {
      await addTransaction({ 
        title: rem.title, 
        amount: rem.amount, 
        type: 'Expense', 
        accountId: rem.accountId, 
        category: rem.category, 
        icon: rem.icon 
      });
      const currentMonth = new Date().toISOString().substring(0, 7);
      setReminders(prev => prev.map(r => r.id === id ? { ...r, lastConfirmedDate: currentMonth } : r));
      
      if (user && id.length > 20) {
        await FinanceService.updateReminderStatus(id, currentMonth);
      }
    }
  };

  // Остальные методы-заглушки для совместимости
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const updateAccount = async (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...updates } : acc));
  };
  const deleteAccount = async (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
    if (user && id.length > 20) await supabase.from('accounts').delete().eq('id', id);
  };
  const transferMoney = async (fromId: string, toId: string, amount: number) => {
    await updateAccountBalance(fromId, -amount);
    await updateAccountBalance(toId, amount);
    await addTransaction({ title: 'Перевод', category: 'Перевод', amount, type: 'Transfer', icon: '🔄' });
  };
  const updateBudget = (updates: Partial<BudgetConfig>) => {
    setBudget(prev => ({ ...prev, ...updates }));
  };
  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };
  const deleteReminder = async (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  return (
    <FinanceContext.Provider value={{ 
      accounts, transactions, reminders, budget, loading, user,
      addTransaction, deleteTransaction, updateTransaction, addAccount, updateAccount, deleteAccount, updateAccountBalance,
      transferMoney, updateBudget, addReminder, updateReminder, confirmReminder, deleteReminder
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};
export type { Account, Transaction, Reminder, BudgetConfig, UserProfile, AccountType };

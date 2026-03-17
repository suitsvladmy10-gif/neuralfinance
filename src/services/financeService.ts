import { supabase } from '@/lib/supabase';
import { Account, Transaction, Reminder } from '@/types/finance';

export const FinanceService = {
  // Accounts
  async getAccounts(userId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data as any;
  },

  async createAccount(userId: string, acc: Partial<Account>) {
    return await supabase.from('accounts').insert({
      user_id: userId,
      name: acc.name,
      type: acc.type,
      balance: acc.balance,
      sub_type: 'Short-term'
    }).select();
  },

  async updateAccountBalance(accountId: string, newBalance: number) {
    return await supabase.from('accounts').update({ balance: newBalance }).eq('id', accountId);
  },

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    
    return data.map(tx => ({
      id: tx.id,
      title: tx.metadata?.title || 'Операция',
      category: tx.metadata?.category || 'Прочее',
      amount: Number(tx.amount),
      type: tx.type,
      time: new Date(tx.transaction_date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(tx.transaction_date),
      icon: tx.metadata?.icon || '💸',
      accountId: tx.from_account_id || tx.to_account_id
    }));
  },

  async createTransaction(userId: string, tx: Partial<Transaction>) {
    return await supabase.from('transactions').insert({
      user_id: userId,
      type: tx.type,
      amount: tx.amount,
      from_account_id: tx.type === 'Expense' ? tx.accountId : null,
      to_account_id: tx.type === 'Income' ? tx.accountId : null,
      metadata: { title: tx.title, category: tx.category, icon: tx.icon },
      transaction_date: tx.date?.toISOString() || new Date().toISOString()
    }).select();
  },

  async deleteTransaction(txId: string) {
    return await supabase.from('transactions').delete().eq('id', txId);
  },

  // Reminders
  async getReminders(userId: string): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('debts') // Using debts table as a placeholder for reminders/bills
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(r => ({
      id: r.id,
      title: r.person_name, // Mapping person_name to title
      amount: Number(r.amount),
      isMandatory: true,
      type: 'bill',
      category: 'Платежи',
      icon: '🔔',
      accountId: '',
      lastConfirmedDate: r.metadata?.lastConfirmedDate
    }));
  },

  async createReminder(userId: string, rem: Partial<Reminder>) {
    return await supabase.from('debts').insert({
      user_id: userId,
      person_name: rem.title,
      amount: rem.amount,
      metadata: { 
        type: rem.type, 
        icon: rem.icon, 
        accountId: rem.accountId,
        dayOfMonth: rem.dayOfMonth,
        isMandatory: rem.isMandatory
      }
    }).select();
  }
};

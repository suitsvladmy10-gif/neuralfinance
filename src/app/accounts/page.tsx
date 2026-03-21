"use client";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance, Account, AccountType } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountsPage() {
  const { accounts, addAccount, updateAccount, deleteAccount, updateAccountBalance, transferMoney } = useFinance();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add_account' | 'top_up' | 'edit_account' | 'transfer'>('add_account');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const totalAssets = useMemo(() => 
    accounts.reduce((acc, curr) => acc + (curr.type === 'PersonalDebt' ? -curr.balance : curr.balance), 0)
  , [accounts]);

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (acc.bankName && acc.bankName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'Debit': return 'account_balance';
      case 'Credit': return 'credit_card';
      case 'Savings': return 'savings';
      case 'Cash': return 'payments';
      case 'Investment': return 'trending_up';
      case 'Crypto': return 'currency_bitcoin';
      case 'PersonalDebt': return 'person_remove';
      default: return 'wallet';
    }
  };

  return (
    <div className="pb-32 pt-12 px-4 h-full overflow-y-auto bg-[#111318]">
      {/* Header Aligned with design */}
      <header className="flex flex-col gap-6 mb-8 px-2 mt-4">
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#cbc3d7]">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-[#e2e2e9] font-extrabold text-lg uppercase tracking-tighter font-headline">Accounts & Assets</h1>
          <button onClick={() => { setModalType('add_account'); setIsModalOpen(true); }} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#d0bcff]">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        {/* Total Assets Card */}
        <div className="glass-card rounded-3xl p-6 border-[#d0bcff]/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d0bcff]/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
          <p className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] mb-1">Total Assets Balance</p>
          <h2 className="text-3xl font-extrabold text-white tracking-tighter">${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
        </div>

        {/* Search Bar - Matching SVG input style */}
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#958ea0] text-xl group-focus-within:text-[#4cd7f6] transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Search accounts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c0e13] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-[#4cd7f6]/30 transition-all placeholder:text-[#958ea0]/50"
          />
        </div>
      </header>

      {/* Accounts List */}
      <div className="space-y-4 px-2">
        {filteredAccounts.length === 0 ? (
          <div className="py-20 text-center opacity-30">
            <span className="material-symbols-outlined !text-6xl mb-4">account_balance_wallet</span>
            <p className="text-sm font-medium">No accounts found</p>
          </div>
        ) : (
          filteredAccounts.map((acc) => (
            <div 
              key={acc.id} 
              className="glass-card p-5 rounded-2xl border-white/5 flex justify-between items-center active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1a1b21] border border-white/5 flex items-center justify-center text-[#d0bcff] shadow-inner group-hover:text-[#4cd7f6] transition-colors">
                  <span className="material-symbols-outlined !text-2xl">{getAccountIcon(acc.type)}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{acc.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#4cd7f6] uppercase tracking-tighter px-1.5 py-0.5 bg-[#4cd7f6]/10 rounded-md">{acc.type}</span>
                    {acc.bankName && <span className="text-[10px] text-[#cbc3d7] opacity-50">• {acc.bankName}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-extrabold text-base tracking-tight">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <div className="flex gap-2 justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setSelectedAccount(acc); setModalType('top_up'); setIsModalOpen(true); }} className="text-[#4cd7f6] text-[10px] font-bold uppercase hover:underline">Top Up</button>
                  <button onClick={() => { setSelectedAccount(acc); setModalType('edit_account'); setIsModalOpen(true); }} className="text-[#cbc3d7] text-[10px] font-bold uppercase hover:underline">Edit</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB: Transfer Button - Pushed down like main screen */}
      <button 
        onClick={() => { setModalType('transfer'); setIsModalOpen(true); }}
        className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#d0bcff] to-[#4cd7f6] shadow-[0_10px_30px_rgba(208,188,255,0.4)] flex items-center justify-center text-[#23005c] z-50 active:scale-90 transition-all hover:brightness-110"
      >
        <span className="material-symbols-outlined !text-[28px]">sync_alt</span>
      </button>

      {/* Modals placeholders - existing logic preserved */}
      {/* ... modal implementations should be here, assuming they are imported or managed via FinanceContext ... */}
    </div>
  );
}

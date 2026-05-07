"use client";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance, Account, AccountType } from '@/lib/store';
import { useRouter } from 'next/navigation';

const ACCOUNT_ICONS: Record<string, string> = {
  Debit: 'account_balance', Credit: 'credit_card', Savings: 'savings',
  Cash: 'payments', Investment: 'trending_up', Crypto: 'currency_bitcoin', PersonalDebt: 'person_remove',
};

export default function AccountsPage() {
  const { accounts, addAccount, updateAccount, deleteAccount, updateAccountBalance, transferMoney } = useFinance();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add_account' | 'top_up' | 'edit_account' | 'transfer'>('add_account');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({ name: '', balance: 0, type: 'Debit' as AccountType, bankName: '' });
  const [transferData, setTransferData] = useState({ fromId: '', toId: '', amount: 0 });

  const totalAssets = useMemo(() =>
    accounts.reduce((acc, curr) => acc + (curr.type === 'PersonalDebt' ? -curr.balance : curr.balance), 0)
  , [accounts]);

  const filteredAccounts = accounts.filter(acc =>
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (acc.bankName && acc.bankName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAction = async () => {
    if (modalType === 'add_account') await addAccount(formData);
    else if (modalType === 'top_up' && selectedAccount) await updateAccountBalance(selectedAccount.id, formData.balance);
    else if (modalType === 'transfer') await transferMoney(transferData.fromId, transferData.toId, transferData.amount);
    else if (modalType === 'edit_account' && selectedAccount) await updateAccount(selectedAccount.id, formData);
    setIsModalOpen(false);
    setFormData({ name: '', balance: 0, type: 'Debit', bankName: '' });
    setTransferData({ fromId: '', toId: '', amount: 0 });
    setSelectedAccount(null);
  };

  const INPUT_CLS = "w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 text-white text-sm font-medium outline-none focus:border-[#2563EB] transition-all";
  const SELECT_CLS = "w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 text-white text-sm outline-none appearance-none";

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-28">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <div className="flex justify-between items-center mb-5">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#888888]">
            <span className="material-symbols-outlined !text-lg">arrow_back</span>
          </button>
          <h1 className="text-white font-bold text-base">Accounts</h1>
          <button onClick={() => { setModalType('add_account'); setIsModalOpen(true); }} className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white">
            <span className="material-symbols-outlined !text-lg">add</span>
          </button>
        </div>

        {/* Total balance card */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5 mb-4">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1">Total Net Worth</p>
          <p className="text-3xl font-bold text-white tabular-nums">${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#888888] !text-lg">search</span>
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#2563EB] transition-all placeholder:text-[#888888]/50"
          />
        </div>
      </header>

      {/* Accounts list */}
      <div className="px-5 space-y-2">
        {filteredAccounts.map((acc) => (
          <div key={acc.id} className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center text-[#888888]">
                <span className="material-symbols-outlined !text-lg">{ACCOUNT_ICONS[acc.type] || 'wallet'}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{acc.name}</p>
                <p className="text-[#888888] text-[10px] uppercase font-medium">{acc.type}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold tabular-nums">${acc.balance.toLocaleString()}</p>
              <div className="flex gap-2 justify-end mt-1">
                <button onClick={() => { setSelectedAccount(acc); setModalType('top_up'); setIsModalOpen(true); }} className="text-[#2563EB] text-[10px] font-semibold uppercase">Top up</button>
                <button onClick={() => { setSelectedAccount(acc); setModalType('edit_account'); setIsModalOpen(true); }} className="text-[#888888] text-[10px] font-semibold uppercase">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transfer FAB */}
      <button
        onClick={() => { setModalType('transfer'); setIsModalOpen(true); }}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-[#2563EB] shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center justify-center text-white z-50 active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined !text-xl">swap_horiz</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-t-2xl p-6 shadow-2xl"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white font-bold text-lg">
                  {modalType === 'add_account' ? 'Add Account' : modalType === 'top_up' ? 'Top Up' : modalType === 'transfer' ? 'Transfer' : 'Edit Account'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg bg-[#1E1E1E] flex items-center justify-center text-[#888888]">
                  <span className="material-symbols-outlined !text-base">close</span>
                </button>
              </div>

              <div className="space-y-3">
                {modalType === 'transfer' ? (
                  <>
                    <select value={transferData.fromId} onChange={e => setTransferData({ ...transferData, fromId: e.target.value })} className={SELECT_CLS}>
                      <option value="">From account</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (${a.balance})</option>)}
                    </select>
                    <select value={transferData.toId} onChange={e => setTransferData({ ...transferData, toId: e.target.value })} className={SELECT_CLS}>
                      <option value="">To account</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <input type="number" placeholder="Amount" value={transferData.amount || ''} onChange={e => setTransferData({ ...transferData, amount: Number(e.target.value) })} className={INPUT_CLS} />
                  </>
                ) : (
                  <>
                    <input type="text" placeholder="Account name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={INPUT_CLS} />
                    <input type="number" placeholder="Balance / Amount" value={formData.balance || ''} onChange={e => setFormData({ ...formData, balance: Number(e.target.value) })} className={INPUT_CLS} />
                    {modalType === 'add_account' && (
                      <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as AccountType })} className={SELECT_CLS}>
                        <option value="Debit">Debit</option>
                        <option value="Credit">Credit</option>
                        <option value="Savings">Savings</option>
                        <option value="Investment">Investment</option>
                        <option value="Cash">Cash</option>
                        <option value="Crypto">Crypto</option>
                      </select>
                    )}
                  </>
                )}
                <button onClick={handleAction} className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-bold text-sm mt-2 active:opacity-80 transition-opacity">
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

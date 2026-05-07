"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '@/lib/store';
import { useRouter } from 'next/navigation';

type Tab = 'transfer' | 'lend' | 'borrow';

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${active ? 'bg-[#2563EB] text-white' : 'text-[#888888]'}`}>
      <span className="material-symbols-outlined !text-base">{icon}</span>
      {label}
    </button>
  );
}

export default function TransfersPage() {
  const { accounts, transferMoney } = useFinance();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('transfer');
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');

  const handleTransfer = async () => {
    const sum = parseFloat(amount);
    if (fromId && toId && sum > 0 && fromId !== toId) {
      await transferMoney(fromId, toId, sum);
      setAmount('');
      router.push('/');
    }
  };

  const SELECT_CLS = "w-full bg-transparent text-white outline-none font-bold text-lg appearance-none";

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-28">
      <header className="px-5 pt-6 pb-4">
        <div className="flex justify-between items-center mb-5">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#888888]">
            <span className="material-symbols-outlined !text-lg">arrow_back</span>
          </button>
          <h1 className="text-white font-bold text-base">Transfers</h1>
          <div className="w-9 h-9" />
        </div>

        <div className="flex p-1 bg-[#141414] border border-[#2A2A2A] rounded-xl">
          <TabButton active={activeTab === 'transfer'} onClick={() => setActiveTab('transfer')} icon="swap_horiz" label="Transfer" />
          <TabButton active={activeTab === 'lend'} onClick={() => setActiveTab('lend')} icon="volunteer_activism" label="Lend" />
          <TabButton active={activeTab === 'borrow'} onClick={() => setActiveTab('borrow')} icon="handshake" label="Borrow" />
        </div>
      </header>

      <div className="px-5">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {activeTab === 'transfer' ? (
              <div className="space-y-3">
                {/* From */}
                <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5">
                  <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-3">From</p>
                  <select value={fromId} onChange={e => setFromId(e.target.value)} className={SELECT_CLS}>
                    <option value="">Select account</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} · ${acc.balance.toLocaleString()}</option>)}
                  </select>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center shadow-[0_2px_12px_rgba(37,99,235,0.4)]">
                    <span className="material-symbols-outlined text-white !text-lg">arrow_downward</span>
                  </div>
                </div>

                {/* To */}
                <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5">
                  <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-3">To</p>
                  <select value={toId} onChange={e => setToId(e.target.value)} className={SELECT_CLS}>
                    <option value="">Select account</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </div>

                {/* Amount */}
                <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5">
                  <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-3">Amount</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#888888]">$</span>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent text-4xl font-bold text-white outline-none tabular-nums" />
                  </div>
                </div>

                <button onClick={handleTransfer} disabled={!fromId || !toId || !amount || fromId === toId}
                  className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-bold text-sm mt-2 active:opacity-80 disabled:opacity-30 shadow-[0_4px_20px_rgba(37,99,235,0.3)]">
                  Execute Transfer
                </button>
              </div>
            ) : (
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-12 text-center mt-2">
                <span className="material-symbols-outlined !text-5xl text-[#888888] mb-3 block">construction</span>
                <p className="text-[#888888] text-sm font-medium">Coming soon</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

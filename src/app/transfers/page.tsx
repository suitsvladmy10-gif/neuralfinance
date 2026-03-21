"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function TransfersPage() {
  const { accounts, transferMoney } = useFinance();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'transfer' | 'lend' | 'borrow'>('transfer');

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

  return (
    <div className="pb-32 px-4 h-full overflow-y-auto bg-[#111318]">
      <header className="flex flex-col gap-6 mb-8 px-2 mt-4">
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#cbc3d7]">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-[#e2e2e9] font-extrabold text-lg uppercase tracking-tighter font-headline">Intelligence Magic</h1>
          <div className="w-10 h-10" />
        </div>

        <div className="flex p-1 bg-[#282a2f]/50 rounded-2xl border border-white/5">
          <TabButton active={activeTab === 'transfer'} onClick={() => setActiveTab('transfer')} icon="sync_alt" label="Transfer" />
          <TabButton active={activeTab === 'lend'} onClick={() => setActiveTab('lend')} icon="volunteer_activism" label="Lend" />
          <TabButton active={activeTab === 'borrow'} onClick={() => setActiveTab('borrow')} icon="handshake" label="Borrow" />
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab} 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="px-2"
        >
          {activeTab === 'transfer' ? (
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-[32px] border-white/5 relative">
                <p className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] mb-4">From Account</p>
                <select 
                  value={fromId} 
                  onChange={e => setFromId(e.target.value)}
                  className="w-full bg-transparent text-white outline-none font-extrabold text-xl appearance-none"
                >
                  <option value="">Select source</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance.toLocaleString()})</option>
                  ))}
                </select>
                
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 w-10 h-10 rounded-full bg-[#d0bcff] text-[#23005c] flex items-center justify-center z-10 border-4 border-[#111318]">
                  <span className="material-symbols-outlined !text-xl">south</span>
                </div>
              </div>

              <div className="glass-card p-6 rounded-[32px] border-white/5 mt-4">
                <p className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] mb-4">To Account</p>
                <select 
                  value={toId} 
                  onChange={e => setToId(e.target.value)}
                  className="w-full bg-transparent text-white outline-none font-extrabold text-xl appearance-none"
                >
                  <option value="">Select destination</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div className="glass-card p-6 rounded-[32px] border-[#4cd7f6]/20 mt-4 bg-[#4cd7f6]/5">
                <p className="text-[10px] font-bold text-[#4cd7f6] uppercase tracking-[0.2em] mb-4">Magic Amount</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#4cd7f6] opacity-50">$</span>
                  <input 
                    type="number" value={amount} onChange={e => setAmount(e.target.value)} 
                    placeholder="0.00" 
                    className="w-full bg-transparent text-4xl text-white outline-none font-extrabold tracking-tighter" 
                  />
                </div>
              </div>

              <button 
                onClick={handleTransfer}
                disabled={!fromId || !toId || !amount}
                className="w-full mt-8 h-16 rounded-[32px] bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-[#23005c] font-headline font-extrabold uppercase tracking-widest active:scale-95 transition-all shadow-[0_10px_30px_rgba(76,215,246,0.3)] disabled:opacity-30"
              >
                Execute Magic
              </button>
            </div>
          ) : (
            <div className="py-20 text-center glass-card rounded-[32px] border-white/5 opacity-30">
              <span className="material-symbols-outlined !text-6xl mb-4">construction</span>
              <p className="text-sm font-bold uppercase tracking-widest">Logic coming soon</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${active ? 'bg-[#111318] text-white shadow-lg shadow-black/50' : 'text-[#cbc3d7] opacity-40 hover:opacity-100'}`}
    >
      <span className="material-symbols-outlined !text-lg">{icon}</span>
      {label}
    </button>
  );
}

"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, Users, ArrowRightLeft } from 'lucide-react';
import { useFinance } from '@/lib/store';

export default function TransfersPage() {
  const { accounts, transferMoney } = useFinance();
  const [activeTab, setActiveTab] = useState<'transfer' | 'lend' | 'borrow'>('transfer');

  // Form State
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');

  const handleTransfer = () => {
    const sum = parseFloat(amount);
    if (fromId && toId && sum > 0 && fromId !== toId) {
      transferMoney(fromId, toId, sum);
      setAmount('');
      alert('Перевод выполнен!');
    }
  };

  return (
    <div className="pb-24 pt-8 px-4 h-full overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Движение средств</h1>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-[#1A1C23] rounded-xl mb-8 border border-[#2E323E]">
        <TabButton active={activeTab === 'transfer'} onClick={() => setActiveTab('transfer')} icon={<ArrowRightLeft className="w-4 h-4" />} label="Перевод" />
        <TabButton active={activeTab === 'lend'} onClick={() => setActiveTab('lend')} icon={<ArrowDownUp className="w-4 h-4" />} label="Дал в долг" />
        <TabButton active={activeTab === 'borrow'} onClick={() => setActiveTab('borrow')} icon={<Users className="w-4 h-4" />} label="Взял в долг" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {activeTab === 'transfer' && (
            <div className="space-y-4">
              <div className="bg-[#1A1C23] border border-[#2E323E] rounded-2xl p-5 relative">
                <label className="text-xs text-gray-500 mb-1 block">Откуда</label>
                <select 
                  value={fromId} 
                  onChange={e => setFromId(e.target.value)}
                  className="w-full bg-transparent text-white outline-none appearance-none font-medium text-lg"
                >
                  <option value="">Выберите счет</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance.toLocaleString()} ₽)</option>
                  ))}
                </select>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 w-10 h-10 bg-primary rounded-full border-4 border-[#0F1014] flex items-center justify-center z-10">
                  <ArrowDownUp className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-[#1A1C23] border border-[#2E323E] rounded-2xl p-5 mt-2">
                <label className="text-xs text-gray-500 mb-1 block">Куда</label>
                <select 
                  value={toId} 
                  onChange={e => setToId(e.target.value)}
                  className="w-full bg-transparent text-white outline-none appearance-none font-medium text-lg"
                >
                  <option value="">Выберите счет</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance.toLocaleString()} ₽)</option>
                  ))}
                </select>
              </div>

              <div className="bg-[#1A1C23] border border-[#2E323E] rounded-2xl p-5 mt-4">
                <label className="text-xs text-gray-500 mb-1 block">Сумма</label>
                <div className="flex items-end gap-2">
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full bg-transparent text-4xl text-white outline-none font-bold" />
                  <span className="text-2xl text-gray-500 pb-1">₽</span>
                </div>
              </div>

              <button 
                onClick={handleTransfer}
                disabled={!fromId || !toId || !amount}
                className="w-full mt-6 bg-primary disabled:opacity-50 text-white py-4 rounded-xl font-medium shadow-lg"
              >
                Перевести
              </button>
            </div>
          )}
          {activeTab !== 'transfer' && <div className="text-center py-10 text-gray-500">Функция в разработке...</div>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-[#2E323E] text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
      {icon}
      {label}
    </button>
  );
}

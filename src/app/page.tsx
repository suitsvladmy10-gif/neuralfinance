"use client";
import { useState } from 'react';
import { DailyLimitDial } from '@/components/DailyLimitDial';
import { MagicInputModal } from '@/components/MagicInputModal';
import { RolloverModal } from '@/components/RolloverModal';
import { Sparkles, CreditCard, Wallet, MoonStar } from 'lucide-react';

const mockTransactions = [
  { id: 1, title: 'Вкусно и точка', category: 'Еда', amount: -650, time: '14:30', icon: '🍔' },
  { id: 2, title: 'Яндекс Такси', category: 'Транспорт', amount: -420, time: '12:15', icon: '🚕' },
  { id: 3, title: 'Перевод от Ивана', category: 'Перевод', amount: 5000, time: 'Вчера', icon: '💸' },
];

export default function Dashboard() {
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [isRolloverOpen, setIsRolloverOpen] = useState(false);

  // Daily logic simulation
  const totalBudget = 3500;
  const spentToday = 1070;
  const remaining = totalBudget - spentToday;

  return (
    <div className="pb-24 pt-8 px-4 h-full overflow-y-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-gray-400 text-sm font-medium">С возвращением,</h2>
          <h1 className="text-xl font-bold">Владислав</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsRolloverOpen(true)}
            className="w-10 h-10 rounded-full bg-[#1A1C23] border border-[#2E323E] flex items-center justify-center hover:text-primary transition-colors"
            title="Симуляция конца дня"
          >
            <MoonStar className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
            <div className="w-full h-full bg-[#1A1C23] rounded-full flex items-center justify-center text-sm font-bold">ВБ</div>
          </div>
        </div>
      </header>

      <DailyLimitDial remaining={remaining} total={totalBudget} />

      {/* Action Button */}
      <div className="flex justify-center mb-10">
        <button 
          onClick={() => setIsMagicModalOpen(true)}
          className="relative group bg-[#1A1C23] border border-[#2E323E] hover:border-primary/50 transition-all p-4 rounded-2xl w-full flex justify-center items-center gap-3 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-medium text-lg text-gray-200 group-hover:text-white transition-colors">Новая запись</span>
        </button>
      </div>

      {/* Assets Snapshot (Carousel) */}
      <section className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-semibold text-lg">Счета</h3>
          <span className="text-xs text-primary cursor-pointer">Все счета</span>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4">
          
          {/* Debit Card */}
          <div className="min-w-[240px] snap-center glass rounded-2xl p-5 relative overflow-hidden flex-shrink-0 border-l-4 border-l-[#FFE100]">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#FFE100]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-6">
              <div className="p-2 bg-white/5 rounded-lg"><Wallet className="w-5 h-5 text-[#FFE100]" /></div>
              <span className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">Дебетовая</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">Тинькофф Black</p>
            <h4 className="text-xl font-bold">124 500.00 ₽</h4>
          </div>

          {/* Credit Card - Showing DEBT */}
          <div className="min-w-[240px] snap-center glass rounded-2xl p-5 relative overflow-hidden flex-shrink-0 border-l-4 border-l-danger">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-danger/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-6">
              <div className="p-2 bg-white/5 rounded-lg"><CreditCard className="w-5 h-5 text-danger" /></div>
              <span className="text-xs text-danger bg-danger/10 px-2 py-1 rounded">Кредитная</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">Альфа Год без % (Долг)</p>
            <h4 className="text-xl font-bold text-white">45 000.00 ₽</h4>
            <div className="w-full bg-[#2E323E] h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-danger h-full w-[30%] shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Лимит 150 000 ₽</p>
          </div>

          {/* Crypto */}
          <div className="min-w-[240px] snap-center glass rounded-2xl p-5 relative overflow-hidden flex-shrink-0 border-l-4 border-l-[#26A17B]">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#26A17B]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-6">
              <div className="p-2 bg-white/5 rounded-lg font-bold text-[#26A17B]">₮</div>
              <span className="text-xs text-[#26A17B] bg-[#26A17B]/10 px-2 py-1 rounded">Крипта</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">Tether (USDT)</p>
            <h4 className="text-xl font-bold">1,250.45 ₮</h4>
          </div>

        </div>
      </section>

      {/* Transactions */}
      <section>
        <h3 className="font-semibold text-lg mb-4">Недавние операции</h3>
        <div className="space-y-3">
          {mockTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#1A1C23] border border-[#2E323E]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2E323E]/50 flex items-center justify-center text-xl">
                  {tx.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{tx.title}</p>
                  <p className="text-xs text-gray-500">{tx.category} • {tx.time}</p>
                </div>
              </div>
              <div className={`font-semibold ${tx.amount > 0 ? 'text-success' : 'text-white'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} ₽
              </div>
            </div>
          ))}
        </div>
      </section>

      <MagicInputModal isOpen={isMagicModalOpen} onClose={() => setIsMagicModalOpen(false)} />
      <RolloverModal isOpen={isRolloverOpen} onClose={() => setIsRolloverOpen(false)} surplus={remaining} />
    </div>
  );
}


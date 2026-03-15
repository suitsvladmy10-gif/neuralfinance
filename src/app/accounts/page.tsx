"use client";
import { Search, Plus, CreditCard, Wallet, Coins, Landmark, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccountsPage() {
  return (
    <div className="pb-24 pt-8 px-4 h-full overflow-y-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Счета и Активы</h1>
        <button className="w-10 h-10 rounded-full bg-[#1A1C23] border border-[#2E323E] flex items-center justify-center text-primary hover:bg-[#2E323E] transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input 
          type="text" 
          placeholder="Поиск по счетам..." 
          className="w-full bg-[#1A1C23] border border-[#2E323E] rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-primary transition-colors text-white placeholder-gray-500"
        />
      </div>

      {/* Active Assets */}
      <section className="mb-8">
        <h3 className="font-semibold text-lg mb-4 text-gray-300">Активные (Дебетовые)</h3>
        <div className="space-y-3">
          <AssetCard icon={<Wallet className="w-5 h-5 text-[#FFE100]" />} title="Тинькофф Black" amount="124 500.00 ₽" subtitle="Основная карта" />
          <AssetCard icon={<Landmark className="w-5 h-5 text-[#21A038]" />} title="Сбербанк" amount="12 400.00 ₽" subtitle="Зарплатная" />
          <AssetCard icon={<Coins className="w-5 h-5 text-[#26A17B]" />} title="USDT (Tether)" amount="1,250.45 ₮" subtitle="Криптокошелек" />
          <AssetCard icon={<Wallet className="w-5 h-5 text-gray-400" />} title="Наличные" amount="5 000.00 ₽" subtitle="В кошельке" />
        </div>
      </section>

      {/* Credit Section */}
      <section className="mb-8">
        <h3 className="font-semibold text-lg mb-4 text-gray-300">Кредитные (Долг)</h3>
        <div className="space-y-3">
          <div className="bg-[#1A1C23] border border-[#2E323E] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-danger" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Альфа Год без %</h4>
                  <p className="text-xs text-gray-500">Долг</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-white">45 000.00 ₽</p>
              </div>
            </div>
            <div className="w-full bg-[#2E323E] h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "30%" }}
                className="bg-danger h-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>Доступно: 105 000 ₽</span>
              <span>Лимит: 150 000 ₽</span>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Section */}
      <section className="mb-8">
        <h3 className="font-semibold text-lg mb-4 text-gray-300">Накопления</h3>
        <div className="space-y-4">
          <GoalCard title="Отпуск (Краткосрочная)" current={45000} target={100000} color="bg-secondary" glow="shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          <GoalCard title="Машина (Долгосрочная)" current={1200000} target={3000000} color="bg-primary" glow="shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
        </div>
      </section>

      {/* Debts Table */}
      <section>
        <h3 className="font-semibold text-lg mb-4 text-gray-300">Обязательства (Мои долги)</h3>
        <div className="bg-[#1A1C23] border border-[#2E323E] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#2E323E] flex justify-between items-center">
            <span className="text-sm font-medium text-white">Ипотека ВТБ</span>
            <span className="text-danger font-semibold">-4 500 000 ₽</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-white">Долг Ивану</span>
            <span className="text-warning font-semibold">-15 000 ₽</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function AssetCard({ icon, title, amount, subtitle }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1A1C23] border border-[#2E323E] hover:border-primary/30 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2E323E]/50 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-white text-sm">{title}</h4>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="font-semibold text-white">
        {amount}
      </div>
    </div>
  );
}

function GoalCard({ title, current, target, color, glow }: any) {
  const percentage = (current / target) * 100;
  return (
    <div className="bg-[#1A1C23] border border-[#2E323E] rounded-2xl p-4">
      <div className="flex justify-between items-end mb-2">
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <span className="text-xs text-gray-500">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-[#2E323E] h-2 rounded-full overflow-hidden mb-2">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${color} ${glow}`} 
        />
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-white">{current.toLocaleString('ru-RU')} ₽</span>
        <span className="text-gray-500">{target.toLocaleString('ru-RU')} ₽</span>
      </div>
    </div>
  );
}

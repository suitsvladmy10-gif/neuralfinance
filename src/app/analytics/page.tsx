"use client";
import { useMemo } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useFinance } from '@/lib/store';

export default function AnalyticsPage() {
  const { transactions } = useFinance();

  // Группировка по месяцам
  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number, expense: number }> = {};
    
    transactions.forEach(tx => {
      const monthKey = new Date(tx.date).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      if (!months[monthKey]) months[monthKey] = { income: 0, expense: 0 };
      
      if (tx.type === 'Income') months[monthKey].income += tx.amount;
      if (tx.type === 'Expense') months[monthKey].expense += tx.amount;
    });

    return Object.entries(months).map(([name, data]) => ({ name, ...data }));
  }, [transactions]);

  return (
    <div className="pb-24 pt-24 px-4 h-full overflow-y-auto">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 bg-[#1A1C23] border border-[#2E323E] rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Аналитика</h1>
      </header>

      <div className="space-y-6">
        {monthlyData.length === 0 ? (
          <div className="text-center py-20 opacity-30 text-sm">Нет данных для анализа</div>
        ) : (
          monthlyData.map(month => (
            <div key={month.name} className="bg-[#1A1C23] border border-[#2E323E] rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-lg capitalize">{month.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-success/5 border border-success/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-success mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">Доходы</span>
                  </div>
                  <p className="text-lg font-bold">{month.income.toLocaleString()} ₽</p>
                </div>

                <div className="bg-danger/5 border border-danger/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-danger mb-1">
                    <TrendingDown className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">Расходы</span>
                  </div>
                  <p className="text-lg font-bold">{month.expense.toLocaleString()} ₽</p>
                </div>
              </div>

              {/* Simple Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-[10px] font-bold uppercase mb-2 text-gray-500">
                  <span>Баланс месяца</span>
                  <span className={month.income >= month.expense ? 'text-success' : 'text-danger'}>
                    {(month.income - month.expense).toLocaleString()} ₽
                  </span>
                </div>
                <div className="h-2 bg-[#2E323E] rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-success" 
                    style={{ width: `${(month.income / (month.income + month.expense || 1)) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-danger" 
                    style={{ width: `${(month.expense / (month.income + month.expense || 1)) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

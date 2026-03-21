"use client";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance, Account } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SavingsPage() {
  const { accounts } = useFinance();
  const router = useRouter();

  // Filter for savings accounts only
  const savingsAccounts = useMemo(() => 
    accounts.filter(acc => acc.type === 'Savings' || acc.name.toLowerCase().includes('savings'))
  , [accounts]);

  const totalSavings = useMemo(() => 
    savingsAccounts.reduce((acc, curr) => acc + curr.balance, 0)
  , [savingsAccounts]);

  // Mock goals for the design demonstration (can be connected to a real 'Goals' store later)
  const goals = [
    { id: '1', title: 'Tesla Model S', current: 45000, target: 90000, icon: 'electric_car', color: '#d0bcff' },
    { id: '2', title: 'Home Renov', current: 12000, target: 35000, icon: 'home', color: '#4cd7f6' },
    { id: '3', title: 'Vacation 2026', current: 2500, target: 5000, icon: 'beach_access', color: '#c3c0ff' }
  ];

  return (
    <div className="pb-32 pt-12 px-4 h-full overflow-y-auto bg-[#111318]">
      {/* Header Aligned with design */}
      <header className="flex flex-col gap-6 mb-8 px-2 mt-4">
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#cbc3d7]">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-[#e2e2e9] font-extrabold text-lg uppercase tracking-tighter font-headline">Savings</h1>
          <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#d0bcff]">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        {/* Total Savings Card */}
        <div className="glass-card rounded-3xl p-6 border-[#d0bcff]/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4cd7f6]/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
          <p className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] mb-1">Total Savings Stashed</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tighter">${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 0 })}</h2>
            <span className="text-[10px] font-bold text-[#4cd7f6] uppercase tracking-widest">+2.4% APR</span>
          </div>
        </div>
      </header>

      {/* Goals Grid */}
      <section className="px-2 mb-10">
        <h3 className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] mb-6 ml-2">Active Goals</h3>
        <div className="grid grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <div key={goal.id} className="glass-card p-5 rounded-3xl border-white/5 relative overflow-hidden group active:scale-95 transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 opacity-10 blur-2xl rounded-full -mr-8 -mt-8" style={{ backgroundColor: goal.color }}></div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 transition-colors group-hover:border-white/20">
                  <span className="material-symbols-outlined !text-xl" style={{ color: goal.color }}>{goal.icon}</span>
                </div>
                <h4 className="text-white font-bold text-xs mb-1 truncate">{goal.title}</h4>
                <p className="text-lg font-extrabold text-white tracking-tighter mb-4">${goal.current.toLocaleString()}</p>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-[#cbc3d7]/50">
                    <span>{Math.round(progress)}%</span>
                    <span>${(goal.target/1000).toFixed(0)}k</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Create New Goal Placeholder */}
          <button className="border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-5 group hover:border-[#d0bcff]/20 transition-all">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#cbc3d7] group-hover:text-[#d0bcff] transition-colors mb-2">
              <span className="material-symbols-outlined">add</span>
            </div>
            <span className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-wider">New Goal</span>
          </button>
        </div>
      </section>

      {/* Savings Breakdown */}
      <section className="px-2 space-y-4">
        <h3 className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-2">Savings Accounts</h3>
        <div className="space-y-3">
          {savingsAccounts.length === 0 ? (
            <div className="py-10 text-center glass-card rounded-2xl border-white/5 opacity-30">
              <p className="text-xs font-bold uppercase tracking-widest">No dedicated savings found</p>
            </div>
          ) : (
            savingsAccounts.map((acc) => (
              <div key={acc.id} className="glass-card p-5 rounded-2xl border-white/5 flex justify-between items-center group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1a1b21] border border-white/5 flex items-center justify-center text-[#4cd7f6] shadow-inner group-hover:text-[#d0bcff] transition-colors">
                    <span className="material-symbols-outlined !text-2xl">account_balance</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">{acc.name}</h3>
                    <p className="text-[10px] font-bold text-[#cbc3d7] opacity-50 uppercase tracking-tighter">{acc.bankName || 'Direct'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-extrabold text-base tracking-tight">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
                  <span className="text-[8px] font-bold text-[#4cd7f6] uppercase tracking-widest bg-[#4cd7f6]/10 px-1.5 py-0.5 rounded">Active</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* FAB: Add Placeholder */}
      <button 
        className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#d0bcff] to-[#4cd7f6] shadow-[0_10px_30px_rgba(208,188,255,0.4)] flex items-center justify-center text-[#23005c] z-50 active:scale-90 transition-all hover:brightness-110"
      >
        <span className="material-symbols-outlined !text-[28px]">savings</span>
      </button>
    </div>
  );
}

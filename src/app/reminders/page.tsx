"use client";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance, Reminder } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RemindersPage() {
  const { reminders, addReminder, updateReminder, deleteReminder, confirmReminder, accounts } = useFinance();
  const router = useRouter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const today = new Date().getDate();
  const currentMonth = new Date().toISOString().substring(0, 7);

  const dueSoon = useMemo(() => 
    reminders.filter(r => r.dayOfMonth && r.dayOfMonth >= today && r.dayOfMonth <= today + 7 && r.lastConfirmedDate !== currentMonth)
    .sort((a, b) => (a.dayOfMonth || 0) - (b.dayOfMonth || 0))
  , [reminders, today, currentMonth]);

  const totalMonthly = useMemo(() => 
    reminders.reduce((acc, curr) => acc + curr.amount, 0)
  , [reminders]);

  const paidThisMonth = useMemo(() => 
    reminders.filter(r => r.lastConfirmedDate === currentMonth)
    .reduce((acc, curr) => acc + curr.amount, 0)
  , [reminders, currentMonth]);

  const progress = totalMonthly > 0 ? (paidThisMonth / totalMonthly) * 100 : 0;

  return (
    <div className="pb-32 pt-12 px-4 h-full overflow-y-auto bg-[#111318]">
      {/* Header Aligned with design v1 */}
      <header className="flex flex-col gap-6 mb-8 px-2 mt-4">
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#cbc3d7]">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-[#e2e2e9] font-extrabold text-lg uppercase tracking-tighter font-headline">Planning</h1>
          <button onClick={() => { setEditingReminder(null); setIsModalOpen(true); }} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#d0bcff]">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        {/* Monthly Planning Summary Card - Refined v1 */}
        <div className="glass-card rounded-3xl p-6 border-[#d0bcff]/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d0bcff]/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
          <p className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] mb-1">Monthly Budget</p>
          <div className="flex items-baseline gap-2 mb-4">
            <h2 className="text-3xl font-extrabold text-white tracking-tighter">${totalMonthly.toLocaleString('en-US', { minimumFractionDigits: 0 })}</h2>
            <span className="text-[10px] font-bold text-[#4cd7f6] uppercase tracking-widest">Allocated</span>
          </div>
          
          <div className="space-y-3">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6]"
              />
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-wider">Paid: ${paidThisMonth.toLocaleString()}</span>
               <span className="text-[10px] font-bold text-[#4cd7f6] uppercase tracking-wider">{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main List Section */}
      <section className="space-y-6 px-2">
        {/* Urgent Section Header */}
        {dueSoon.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-[#ffb4ab] uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-pulse"></span>
              Attention Required
            </h3>
            <div className="space-y-3">
              {dueSoon.map((rem) => (
                <div key={rem.id} className="glass-card p-4 rounded-2xl border-[#ffb4ab]/20 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#ffb4ab]/10 flex items-center justify-center text-[#ffb4ab]">
                      <span className="material-symbols-outlined !text-xl">{rem.icon || 'priority_high'}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm truncate max-w-[120px]">{rem.title}</h4>
                      <p className="text-[10px] font-bold text-[#ffb4ab] uppercase tracking-tighter">Due in {rem.dayOfMonth! - today} days</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => confirmReminder(rem.id)}
                    className="bg-[#ffb4ab] text-[#690005] text-[10px] font-bold px-4 py-2 rounded-xl uppercase tracking-wider active:scale-95 transition-transform"
                  >
                    Pay ${rem.amount.toLocaleString()}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Subscriptions */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-2">All Subscriptions</h3>
          <div className="space-y-3">
            {reminders.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <span className="material-symbols-outlined !text-6xl mb-4">notifications_off</span>
                <p className="text-sm font-medium">No active reminders</p>
              </div>
            ) : (
              reminders.map((rem) => (
                <div 
                  key={rem.id} 
                  className={`glass-card p-5 rounded-2xl border-white/5 flex justify-between items-center active:scale-[0.98] transition-all group ${rem.lastConfirmedDate === currentMonth ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-[#1a1b21] border border-white/5 flex items-center justify-center shadow-inner ${rem.lastConfirmedDate === currentMonth ? 'text-[#cbc3d7]' : 'text-[#4cd7f6]'}`}>
                      <span className="material-symbols-outlined !text-2xl">{rem.icon || 'description'}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">{rem.title}</h3>
                      <p className="text-[10px] font-bold text-[#cbc3d7] opacity-60 uppercase tracking-tighter">Day {rem.dayOfMonth} • Monthly</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-extrabold text-base tracking-tight">${rem.amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
                    {rem.lastConfirmedDate === currentMonth ? (
                      <span className="material-symbols-outlined text-[#4cd7f6] !text-lg">check_circle</span>
                    ) : (
                      <button 
                        onClick={() => confirmReminder(rem.id)}
                        className="text-[#d0bcff] text-[10px] font-bold uppercase hover:underline"
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FAB: Add Button - Simple Plus */}
      <button 
        onClick={() => { setEditingReminder(null); setIsModalOpen(true); }}
        className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#d0bcff] to-[#4cd7f6] shadow-[0_10px_30px_rgba(208,188,255,0.4)] flex items-center justify-center text-[#23005c] z-50 active:scale-90 transition-all hover:brightness-110"
      >
        <span className="material-symbols-outlined !text-[32px]">add</span>
      </button>
    </div>
  );
}

"use client";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance, Reminder } from '@/lib/store';
import { useRouter } from 'next/navigation';

const ICONS = [
  'notifications', 'subscriptions', 'wifi', 'fitness_center',
  'local_gas_station', 'credit_card', 'phone', 'stream',
  'water_drop', 'bolt', 'home', 'description',
  'restaurant', 'car_rental', 'school', 'favorite'
];
const CATEGORIES = ['Subscription', 'Bill', 'Rent', 'Insurance', 'Food', 'Transport', 'Services', 'Health', 'Entertainment', 'Other'];

interface FormState {
  title: string;
  amount: string;
  dayOfMonth: string;
  category: string;
  icon: string;
  type: 'subscription' | 'bill' | 'one-time';
  accountId: string;
  isMandatory: boolean;
}

const defaultForm: FormState = {
  title: '', amount: '', dayOfMonth: '1', category: 'Subscription',
  icon: 'notifications', type: 'subscription', accountId: '', isMandatory: true,
};

export default function RemindersPage() {
  const { reminders, addReminder, updateReminder, deleteReminder, confirmReminder, accounts } = useFinance();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState<FormState>(defaultForm);

  const today = new Date().getDate();
  const currentMonth = new Date().toISOString().substring(0, 7);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  const getDaysDiff = (dayOfMonth: number) =>
    dayOfMonth >= today ? dayOfMonth - today : (daysInMonth - today) + dayOfMonth;

  const dueSoon = useMemo(() =>
    reminders.filter(r => r.dayOfMonth && r.lastConfirmedDate !== currentMonth && getDaysDiff(r.dayOfMonth) <= 7)
      .sort((a, b) => getDaysDiff(a.dayOfMonth || 0) - getDaysDiff(b.dayOfMonth || 0))
  , [reminders, today, currentMonth, daysInMonth]);

  const totalMonthly = useMemo(() => reminders.reduce((acc, curr) => acc + curr.amount, 0), [reminders]);
  const paidThisMonth = useMemo(() =>
    reminders.filter(r => r.lastConfirmedDate === currentMonth).reduce((acc, curr) => acc + curr.amount, 0)
  , [reminders, currentMonth]);
  const progress = totalMonthly > 0 ? (paidThisMonth / totalMonthly) * 100 : 0;

  const openAddModal = () => {
    setEditingReminder(null);
    setFormData({ ...defaultForm, accountId: accounts[0]?.id || '' });
    setIsModalOpen(true);
  };
  const openEditModal = (rem: Reminder) => {
    setEditingReminder(rem);
    setFormData({
      title: rem.title, amount: rem.amount.toString(), dayOfMonth: rem.dayOfMonth?.toString() || '1',
      category: rem.category, icon: rem.icon || 'notifications', type: rem.type,
      accountId: rem.accountId || accounts[0]?.id || '', isMandatory: rem.isMandatory,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const data = {
      title: formData.title, amount: parseFloat(formData.amount) || 0,
      dayOfMonth: parseInt(formData.dayOfMonth) || 1, category: formData.category,
      icon: formData.icon, type: formData.type,
      accountId: formData.accountId || accounts[0]?.id || '', isMandatory: formData.isMandatory,
    };
    if (editingReminder) await updateReminder(editingReminder.id, data);
    else await addReminder(data);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (editingReminder) { await deleteReminder(editingReminder.id); setIsModalOpen(false); }
  };

  const INPUT_CLS = "w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 text-white text-sm outline-none focus:border-[#2563EB] transition-all";

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-28">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <div className="flex justify-between items-center mb-5">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#888888]">
            <span className="material-symbols-outlined !text-lg">arrow_back</span>
          </button>
          <h1 className="text-white font-bold text-base">Planning</h1>
          <button onClick={openAddModal} className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white">
            <span className="material-symbols-outlined !text-lg">add</span>
          </button>
        </div>

        {/* Monthly summary card */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1">Monthly Committed</p>
          <p className="text-3xl font-bold text-white tabular-nums mb-4">${totalMonthly.toLocaleString()}</p>
          <div className="h-1.5 w-full bg-[#2A2A2A] rounded-full overflow-hidden mb-2">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-[#2563EB] rounded-full" />
          </div>
          <div className="flex justify-between">
            <p className="text-[10px] text-[#888888]">Paid: ${paidThisMonth.toLocaleString()}</p>
            <p className="text-[10px] text-[#2563EB] font-semibold">{Math.round(progress)}% done</p>
          </div>
        </div>
      </header>

      <div className="px-5 space-y-5">
        {/* Due soon */}
        {dueSoon.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
              <p className="text-[10px] font-semibold text-[#DC2626] uppercase tracking-wider">Attention Required</p>
            </div>
            <div className="space-y-2">
              {dueSoon.map(rem => (
                <div key={rem.id} className="bg-[#141414] border border-[#DC2626]/20 rounded-2xl p-4 flex justify-between items-center">
                  <button onClick={() => openEditModal(rem)} className="flex items-center gap-3 flex-1 text-left">
                    <div className="w-9 h-9 rounded-xl bg-[#DC2626]/10 flex items-center justify-center text-[#DC2626]">
                      <span className="material-symbols-outlined !text-base">{rem.icon || 'notifications'}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{rem.title}</p>
                      <p className="text-[#DC2626] text-[10px] font-semibold">
                        {getDaysDiff(rem.dayOfMonth!) === 0 ? 'Due today' : `Due in ${getDaysDiff(rem.dayOfMonth!)}d`}
                      </p>
                    </div>
                  </button>
                  <button onClick={() => confirmReminder(rem.id)} className="bg-[#DC2626] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide active:opacity-70">
                    Pay ${rem.amount.toLocaleString()}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All reminders */}
        <section>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-3">All Subscriptions</p>
          {reminders.length === 0 ? (
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-10 text-center">
              <span className="material-symbols-outlined !text-4xl text-[#888888] mb-2 block">notifications_off</span>
              <p className="text-[#888888] text-sm">No reminders yet</p>
              <button onClick={openAddModal} className="text-[#2563EB] text-xs font-semibold mt-2">Add one</button>
            </div>
          ) : (
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden">
              {reminders.map((rem, idx) => (
                <button key={rem.id} onClick={() => openEditModal(rem)}
                  className={`w-full px-4 py-3.5 flex justify-between items-center active:bg-[#1E1E1E] transition-colors text-left ${rem.lastConfirmedDate === currentMonth ? 'opacity-40' : ''} ${idx < reminders.length - 1 ? 'border-b border-[#2A2A2A]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${rem.lastConfirmedDate === currentMonth ? 'bg-[#1E1E1E] text-[#888888]' : 'bg-[#2563EB]/10 text-[#2563EB]'}`}>
                      <span className="material-symbols-outlined !text-base">{rem.icon || 'description'}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{rem.title}</p>
                      <p className="text-[#888888] text-[10px]">Day {rem.dayOfMonth} · Monthly</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold tabular-nums text-sm">${rem.amount.toLocaleString()}</p>
                    {rem.lastConfirmedDate === currentMonth ? (
                      <span className="material-symbols-outlined text-[#16A34A] !text-sm">check_circle</span>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); confirmReminder(rem.id); }} className="text-[#2563EB] text-[10px] font-semibold">
                        Confirm
                      </button>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* FAB */}
      <button onClick={openAddModal} className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-[#2563EB] shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center justify-center text-white z-50 active:scale-90 transition-transform">
        <span className="material-symbols-outlined !text-2xl">add</span>
      </button>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}>
            <motion.div
              className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-t-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              onClick={e => e.stopPropagation()}>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white font-bold text-lg">{editingReminder ? 'Edit Reminder' : 'New Reminder'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg bg-[#1E1E1E] flex items-center justify-center text-[#888888]">
                  <span className="material-symbols-outlined !text-base">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Title</p>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Netflix, Rent, Gym..." className={INPUT_CLS} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Amount ($)</p>
                    <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0" className={INPUT_CLS + " text-xl font-bold tabular-nums"} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Day of Month</p>
                    <input type="number" min="1" max="31" value={formData.dayOfMonth} onChange={e => setFormData({ ...formData, dayOfMonth: e.target.value })}
                      className={INPUT_CLS + " text-xl font-bold tabular-nums"} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Category</p>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-3.5 text-white text-sm outline-none appearance-none">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Type</p>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as FormState['type'] })}
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-3.5 text-white text-sm outline-none appearance-none">
                      <option value="subscription">Subscription</option>
                      <option value="bill">Bill</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Icon</p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {ICONS.map(icon => (
                      <button key={icon} onClick={() => setFormData({ ...formData, icon })}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${formData.icon === icon ? 'bg-[#2563EB]/20 border border-[#2563EB]/50 text-[#2563EB]' : 'bg-[#1E1E1E] border border-[#2A2A2A] text-[#888888]'}`}>
                        <span className="material-symbols-outlined !text-sm">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {accounts.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">Deduct from Account</p>
                    <select value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-3.5 text-white text-sm outline-none appearance-none">
                      <option value="">None</option>
                      {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance.toLocaleString()})</option>)}
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  {editingReminder && (
                    <button onClick={handleDelete} className="flex-1 py-4 rounded-xl bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 font-semibold text-sm active:opacity-70">
                      Delete
                    </button>
                  )}
                  <button onClick={handleSave} disabled={!formData.title || !formData.amount}
                    className="flex-[2] py-4 rounded-xl bg-[#2563EB] text-white font-bold text-sm active:opacity-80 disabled:opacity-30">
                    {editingReminder ? 'Save Changes' : 'Add Reminder'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

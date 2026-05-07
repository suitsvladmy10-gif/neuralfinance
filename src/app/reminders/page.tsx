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
  title: '',
  amount: '',
  dayOfMonth: '1',
  category: 'Subscription',
  icon: 'notifications',
  type: 'subscription',
  accountId: '',
  isMandatory: true,
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

  const getDaysDiff = (dayOfMonth: number) => {
    if (dayOfMonth >= today) return dayOfMonth - today;
    return (daysInMonth - today) + dayOfMonth;
  };

  const dueSoon = useMemo(() =>
    reminders
      .filter(r => {
        if (!r.dayOfMonth || r.lastConfirmedDate === currentMonth) return false;
        return getDaysDiff(r.dayOfMonth) <= 7;
      })
      .sort((a, b) => getDaysDiff(a.dayOfMonth || 0) - getDaysDiff(b.dayOfMonth || 0))
  , [reminders, today, currentMonth, daysInMonth]);

  const totalMonthly = useMemo(() =>
    reminders.reduce((acc, curr) => acc + curr.amount, 0)
  , [reminders]);

  const paidThisMonth = useMemo(() =>
    reminders
      .filter(r => r.lastConfirmedDate === currentMonth)
      .reduce((acc, curr) => acc + curr.amount, 0)
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
      title: rem.title,
      amount: rem.amount.toString(),
      dayOfMonth: rem.dayOfMonth?.toString() || '1',
      category: rem.category,
      icon: rem.icon || 'notifications',
      type: rem.type,
      accountId: rem.accountId || accounts[0]?.id || '',
      isMandatory: rem.isMandatory,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const data = {
      title: formData.title,
      amount: parseFloat(formData.amount) || 0,
      dayOfMonth: parseInt(formData.dayOfMonth) || 1,
      category: formData.category,
      icon: formData.icon,
      type: formData.type,
      accountId: formData.accountId || accounts[0]?.id || '',
      isMandatory: formData.isMandatory,
    };
    if (editingReminder) {
      await updateReminder(editingReminder.id, data);
    } else {
      await addReminder(data);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (editingReminder) {
      await deleteReminder(editingReminder.id);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="pb-32 pt-12 px-4 h-full overflow-y-auto bg-[#111318]">
      <header className="flex flex-col gap-6 mb-8 px-2 mt-4">
        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#cbc3d7]">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-[#e2e2e9] font-extrabold text-lg uppercase tracking-tighter font-headline">Planning</h1>
          <button onClick={openAddModal} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#d0bcff]">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

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

      <section className="space-y-6 px-2">
        {dueSoon.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-[#ffb4ab] uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-pulse"></span>
              Attention Required
            </h3>
            <div className="space-y-3">
              {dueSoon.map((rem) => (
                <div key={rem.id} className="glass-card p-4 rounded-2xl border-[#ffb4ab]/20 flex justify-between items-center">
                  <button onClick={() => openEditModal(rem)} className="flex items-center gap-4 flex-1 text-left">
                    <div className="w-10 h-10 rounded-full bg-[#ffb4ab]/10 flex items-center justify-center text-[#ffb4ab]">
                      <span className="material-symbols-outlined !text-xl">{rem.icon || 'priority_high'}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm truncate max-w-[120px]">{rem.title}</h4>
                      <p className="text-[10px] font-bold text-[#ffb4ab] uppercase tracking-tighter">
                        {getDaysDiff(rem.dayOfMonth!) === 0 ? 'Due today' : `Due in ${getDaysDiff(rem.dayOfMonth!)} days`}
                      </p>
                    </div>
                  </button>
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
                <button
                  key={rem.id}
                  onClick={() => openEditModal(rem)}
                  className={`w-full glass-card p-5 rounded-2xl border-white/5 flex justify-between items-center active:scale-[0.98] transition-all text-left group ${rem.lastConfirmedDate === currentMonth ? 'opacity-40' : ''}`}
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
                        onClick={(e) => { e.stopPropagation(); confirmReminder(rem.id); }}
                        className="text-[#d0bcff] text-[10px] font-bold uppercase hover:underline"
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      <button
        onClick={openAddModal}
        className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#d0bcff] to-[#4cd7f6] shadow-[0_10px_30px_rgba(208,188,255,0.4)] flex items-center justify-center text-[#23005c] z-50 active:scale-90 transition-all hover:brightness-110"
      >
        <span className="material-symbols-outlined !text-[32px]">add</span>
      </button>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-md glass-card rounded-t-[40px] p-8 shadow-2xl border-t-2 border-[#d0bcff]/20 max-h-[90vh] overflow-y-auto custom-scrollbar"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-white font-headline font-extrabold text-xl uppercase tracking-tighter">
                  {editingReminder ? 'Edit Reminder' : 'New Reminder'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#cbc3d7]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Netflix, Rent, Gym..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-[#d0bcff]/50 transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Amount ($)</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl font-extrabold text-white outline-none focus:border-[#d0bcff]/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Day of Month</label>
                    <input
                      type="number"
                      min="1" max="31"
                      value={formData.dayOfMonth}
                      onChange={e => setFormData({ ...formData, dayOfMonth: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl font-extrabold text-white outline-none focus:border-[#d0bcff]/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#1a1b21] border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as FormState['type'] })}
                      className="w-full bg-[#1a1b21] border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none"
                    >
                      <option value="subscription">Subscription</option>
                      <option value="bill">Bill</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Icon</label>
                  <div className="grid grid-cols-8 gap-2">
                    {ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${formData.icon === icon ? 'bg-[#d0bcff]/20 border border-[#d0bcff]/50 text-[#d0bcff]' : 'bg-white/5 border border-white/5 text-[#cbc3d7]'}`}
                      >
                        <span className="material-symbols-outlined !text-base">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {accounts.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#cbc3d7] uppercase tracking-[0.2em] ml-1">Deduct from Account</label>
                    <select
                      value={formData.accountId}
                      onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                      className="w-full bg-[#1a1b21] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none"
                    >
                      <option value="">None</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  {editingReminder && (
                    <button
                      onClick={handleDelete}
                      className="flex-1 h-14 rounded-2xl bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20 font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={!formData.title || !formData.amount}
                    className="flex-[2] h-14 rounded-2xl bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-[#23005c] font-headline font-extrabold uppercase tracking-widest active:scale-95 transition-all shadow-lg disabled:opacity-30"
                  >
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

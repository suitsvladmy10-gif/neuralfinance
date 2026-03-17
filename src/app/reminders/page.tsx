"use client";
import { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Calendar, CreditCard, Trash2, CheckCircle2, Bell, X, Landmark, Tag, Edit2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance, Reminder } from '@/lib/store';

export default function RemindersPage() {
  const { reminders, accounts, addReminder, updateReminder, confirmReminder, deleteReminder } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    dayOfMonth: '1',
    accountId: '',
    receiver: '',
    category: 'Платежи',
    icon: '🔔',
    type: 'subscription' as 'subscription' | 'bill' | 'one-time',
    isMandatory: false
  });

  const currentMonth = new Date().toISOString().substring(0, 7);

  // Годовые расчеты
  const annualStats = useMemo(() => {
    const subs = reminders.filter(r => r.type === 'subscription');
    const mandatory = reminders.filter(r => r.isMandatory);
    
    return {
      subscriptionsYear: subs.reduce((acc, curr) => acc + curr.amount * 12, 0),
      mandatoryYear: mandatory.reduce((acc, curr) => acc + (curr.dayOfMonth ? curr.amount * 12 : curr.amount), 0)
    };
  }, [reminders]);

  const handleOpenEdit = (rem: Reminder) => {
    setEditingId(rem.id);
    setFormData({
      title: rem.title,
      amount: rem.amount.toString(),
      dayOfMonth: rem.dayOfMonth?.toString() || '1',
      accountId: rem.accountId,
      receiver: rem.receiver || '',
      category: rem.category,
      icon: rem.icon,
      type: rem.type,
      isMandatory: rem.isMandatory
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const data = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      dayOfMonth: parseInt(formData.dayOfMonth) || 1,
    };

    if (editingId) {
      updateReminder(editingId, data as any);
    } else {
      addReminder(data as any);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', amount: '', dayOfMonth: '1', accountId: '', receiver: '', category: 'Платежи', icon: '🔔', type: 'subscription', isMandatory: false });
  };

  return (
    <div className="pb-24 pt-24 px-4 h-full overflow-y-auto">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-[#1A1C23] border border-[#2E323E] rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Планирование</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Annual Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-primary/10 border border-primary/20 rounded-3xl p-4">
          <p className="text-[10px] text-primary font-bold uppercase mb-1">Подписки / год</p>
          <h3 className="text-lg font-bold">{annualStats.subscriptionsYear.toLocaleString()} ₽</h3>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-3xl p-4">
          <p className="text-[10px] text-warning font-bold uppercase mb-1">Обязательные / год</p>
          <h3 className="text-lg font-bold">{annualStats.mandatoryYear.toLocaleString()} ₽</h3>
        </div>
      </div>

      <div className="space-y-4">
        {reminders.map(rem => {
          const isConfirmed = rem.lastConfirmedDate === currentMonth;
          return (
            <div key={rem.id} className={`p-5 rounded-3xl bg-[#1A1C23] border transition-all ${isConfirmed ? 'opacity-50 border-success/20' : 'border-[#2E323E]'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#2E323E] flex items-center justify-center text-2xl">{rem.icon}</div>
                  <div>
                    <h4 className="font-bold flex items-center gap-2">
                      {rem.title}
                      {rem.isMandatory && <AlertCircle className="w-3 h-3 text-warning" />}
                    </h4>
                    <p className="text-xs text-gray-500">{rem.receiver || rem.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{rem.amount.toLocaleString()} ₽</p>
                  <button onClick={() => handleOpenEdit(rem)} className="text-primary text-[10px] font-bold">ИЗМЕНИТЬ</button>
                </div>
              </div>
              
              <div className="flex gap-2">
                {!isConfirmed ? (
                  <button onClick={() => confirmReminder(rem.id)} className="flex-1 bg-primary text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> ОПЛАТИТЬ
                  </button>
                ) : (
                  <div className="flex-1 bg-success/10 text-success py-3 rounded-xl text-xs font-bold text-center">ОПЛАЧЕНО</div>
                )}
                <button onClick={() => deleteReminder(rem.id)} className="p-3 bg-danger/10 text-danger rounded-xl"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="w-full max-w-sm bg-[#1A1C23] border border-[#2E323E] rounded-3xl p-6" initial={{ scale: 0.9 }}>
              <h2 className="text-xl font-bold mb-6">{editingId ? 'Редактировать' : 'Новое напоминание'}</h2>
              
              <div className="space-y-4">
                <input type="text" placeholder="Название" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#2E323E] rounded-xl p-3 outline-none" />
                <div className="flex gap-2">
                  <input type="number" placeholder="Сумма" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="flex-1 bg-[#2E323E] rounded-xl p-3 outline-none font-bold" />
                  <input type="number" placeholder="День" value={formData.dayOfMonth} onChange={e => setFormData({...formData, dayOfMonth: e.target.value})} className="w-20 bg-[#2E323E] rounded-xl p-3 outline-none text-center" />
                </div>

                <div onClick={() => setFormData({...formData, isMandatory: !formData.isMandatory})} className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${formData.isMandatory ? 'bg-warning/10 border-warning/50' : 'bg-[#2E323E] border-transparent opacity-50'}`}>
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`w-5 h-5 ${formData.isMandatory ? 'text-warning' : 'text-gray-500'}`} />
                    <span className="text-sm font-bold">Обязательная трата</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.isMandatory ? 'border-warning bg-warning' : 'border-gray-600'}`}>
                    {formData.isMandatory && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </div>
                </div>

                <select value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})} className="w-full bg-[#2E323E] rounded-xl p-3 outline-none">
                  <option value="">Выберите счет</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>

                <div className="flex gap-2">
                  <button onClick={closeModal} className="flex-1 bg-[#2E323E] py-4 rounded-xl font-bold">Отмена</button>
                  <button onClick={handleSave} className="flex-1 bg-primary py-4 rounded-xl font-bold">Сохранить</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

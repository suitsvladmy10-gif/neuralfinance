"use client";
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '@/lib/store';

interface DetectedTx {
  id: string;
  amount: number;
  category: string;
  accountName: string;
  accountId?: string;
  title: string;
  type: 'Expense' | 'Income';
  selected: boolean;
}

interface MagicInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { amount: number; category: string; accountName: string; type: 'Expense' | 'Income'; accountId?: string }) => void;
}

const KEYWORD_MAPS = {
  categories: [
    { label: 'Shopping', keywords: ['shop', 'store', 'mall', 'wildberries', 'ozon', 'amazon'] },
    { label: 'Food', keywords: ['food', 'eat', 'restaurant', 'cafe', 'dinner', 'lunch'] },
    { label: 'Coffee', keywords: ['coffee', 'starbucks', 'barista'] },
    { label: 'Transport', keywords: ['taxi', 'uber', 'bus', 'metro', 'gas'] },
    { label: 'Services', keywords: ['bill', 'internet', 'phone', 'subscription'] },
  ],
};

export function MagicInputModal({ isOpen, onClose, onAdd }: MagicInputModalProps) {
  const { accounts } = useFinance();
  const [input, setInput] = useState('');
  const [type, setType] = useState<'Expense' | 'Income'>('Expense');
  const [detectedList, setDetectedList] = useState<DetectedTx[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseMultiContent = (text: string) => {
    const parts = text.split(/[\n,]+/).map(p => p.trim()).filter(p => p.length > 2);
    return parts.reduce<DetectedTx[]>((results, part) => {
      const val = part.toLowerCase();
      const amountMatch = val.replace(/\s/g, '').replace(',', '.').match(/(\d{1,7}(?:\.\d{1,2})?)/);
      if (!amountMatch) return results;
      const amount = parseFloat(amountMatch[1]);
      let category = type === 'Expense' ? 'Other' : 'Income';
      for (const item of KEYWORD_MAPS.categories) {
        if (item.keywords.some(k => val.includes(k))) { category = item.label; break; }
      }
      results.push({
        id: Math.random().toString(36).substr(2, 9),
        amount, category,
        accountName: accounts[0]?.name || 'Main',
        accountId: accounts[0]?.id,
        title: part.substring(0, 30),
        type,
        selected: true,
      });
      return results;
    }, []);
  };

  const handleInput = (val: string) => {
    setInput(val);
    setDetectedList(val.length > 5 ? parseMultiContent(val) : []);
  };

  const handleSaveSelected = () => {
    detectedList.filter(t => t.selected).forEach(tx =>
      onAdd({ amount: tx.amount, category: tx.category, accountName: tx.accountName, accountId: tx.accountId, type: tx.type })
    );
    setDetectedList([]);
    setInput('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-t-2xl p-6 shadow-2xl"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#2563EB] !text-base">auto_awesome</span>
                </div>
                <h2 className="text-white font-bold text-lg">Smart Input</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#1E1E1E] flex items-center justify-center text-[#888888]">
                <span className="material-symbols-outlined !text-base">close</span>
              </button>
            </div>

            {/* Type Toggle */}
            <div className="flex p-1 bg-[#1E1E1E] rounded-xl mb-5 border border-[#2A2A2A]">
              <button onClick={() => setType('Expense')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${type === 'Expense' ? 'bg-[#DC2626] text-white' : 'text-[#888888]'}`}>
                Expense
              </button>
              <button onClick={() => setType('Income')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${type === 'Income' ? 'bg-[#16A34A] text-white' : 'text-[#888888]'}`}>
                Income
              </button>
            </div>

            {/* Input */}
            <textarea
              autoFocus
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Type amount and description... e.g. 50 coffee"
              className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 text-white text-base outline-none resize-none h-28 focus:border-[#2563EB] transition-all placeholder:text-[#888888]/50"
            />

            {/* Detected preview */}
            {detectedList.length > 0 && (
              <div className="mt-4 space-y-2">
                {detectedList.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A]">
                    <div>
                      <p className={`font-bold tabular-nums ${type === 'Expense' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                        {type === 'Expense' ? '−' : '+'}${tx.amount}
                      </p>
                      <p className="text-[10px] text-[#888888] uppercase font-semibold">{tx.category}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] flex items-center justify-center">
                      <span className="material-symbols-outlined !text-xs text-white">check</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex gap-3">
              <button onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center text-[#888888] active:opacity-70 transition-opacity">
                <span className="material-symbols-outlined !text-xl">photo_camera</span>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={() => {}} />
              </button>
              <button
                onClick={handleSaveSelected}
                disabled={input.length < 3}
                className="flex-1 h-12 rounded-xl bg-[#2563EB] text-white font-bold text-sm active:opacity-80 transition-opacity disabled:opacity-30">
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, Check } from 'lucide-react';
import Tesseract from 'tesseract.js';
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
  onAdd: (data: { amount: number, category: string, accountName: string, type: 'Expense' | 'Income', accountId?: string }) => void;
}

const KEYWORD_MAPS = {
  categories: [
    { label: 'Shopping', keywords: ['shop', 'store', 'mall', 'wildberries', 'ozon', 'amazon'] },
    { label: 'Food', keywords: ['food', 'eat', 'restaurant', 'cafe', 'dinner', 'lunch'] },
    { label: 'Coffee', keywords: ['coffee', 'starbucks', 'barista'] },
    { label: 'Transport', keywords: ['taxi', 'uber', 'bus', 'metro', 'gas'] },
    { label: 'Services', keywords: ['bill', 'internet', 'phone', 'subscription'] }
  ],
  accounts: [
    { label: 'Main', keywords: ['main', 'card', 'bank'] },
    { label: 'Savings', keywords: ['save', 'savings', 'vault'] },
    { label: 'Cash', keywords: ['cash', 'hand', 'pocket'] }
  ]
};

export function MagicInputModal({ isOpen, onClose, onAdd }: MagicInputModalProps) {
  const { accounts } = useFinance();
  const [input, setInput] = useState('');
  const [type, setType] = useState<'Expense' | 'Income'>('Expense');
  const [detectedList, setDetectedList] = useState<DetectedTx[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseMultiContent = (text: string) => {
    const parts = text.split(/[\n,]+/).map(p => p.trim()).filter(p => p.length > 2);
    const results: DetectedTx[] = [];
    parts.forEach((part) => {
      const val = part.toLowerCase();
      const amountMatch = val.replace(/\s/g, '').replace(',', '.').match(/(\d{1,7}(?:\.\d{1,2})?)/);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1]);
        let category = type === 'Expense' ? 'Other' : 'Income';
        for (const item of KEYWORD_MAPS.categories) {
          if (item.keywords.some(k => val.includes(k))) { category = item.label; break; }
        }
        let accountName = accounts[0]?.name || 'Main Account';
        let accountId = accounts[0]?.id;
        results.push({
          id: Math.random().toString(36).substr(2, 9),
          amount, category, accountName, accountId, title: part.substring(0, 30), type, selected: true
        });
      }
    });
    return results;
  };

  const handleInput = (val: string) => {
    setInput(val);
    if (val.length > 5) {
      const list = parseMultiContent(val);
      setDetectedList(list);
    } else {
      setDetectedList([]);
    }
  };

  const handleSaveSelected = () => {
    detectedList.filter(t => t.selected).forEach(tx => {
      onAdd({ amount: tx.amount, category: tx.category, accountName: tx.accountName, accountId: tx.accountId, type: tx.type });
    });
    setDetectedList([]);
    setInput('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-6" 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="w-full max-w-sm glass-card rounded-[40px] p-8 shadow-2xl relative overflow-hidden flex flex-col min-h-[600px] border-t-2 border-[#4cd7f6]/30" 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4cd7f6]/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#d0bcff]/10 blur-3xl rounded-full -ml-10 -mb-10"></div>

            {/* Header */}
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#d0bcff]/10 border border-[#d0bcff]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#d0bcff] !text-xl">auto_awesome</span>
                </div>
                <h2 className="text-white font-headline font-extrabold text-lg uppercase tracking-tight">Intelligence</h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#cbc3d7]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type Switcher */}
            <div className="flex p-1 bg-[#282a2f]/50 rounded-2xl mb-8 relative z-10">
              <button onClick={() => setType('Expense')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${type === 'Expense' ? 'bg-[#111318] text-white shadow-lg' : 'text-[#cbc3d7] opacity-50'}`}>Expense</button>
              <button onClick={() => setType('Income')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${type === 'Income' ? 'bg-[#111318] text-[#4cd7f6] shadow-lg' : 'text-[#cbc3d7] opacity-50'}`}>Income</button>
            </div>

            {/* Large Text Area */}
            <div className="flex-1 flex flex-col relative z-10">
              <textarea 
                autoFocus
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="Type anything... e.g. 50 coffee at main"
                className="w-full flex-1 bg-transparent text-white text-lg font-medium placeholder:text-[#958ea0]/30 outline-none resize-none"
              />
              
              {/* Detected Preview */}
              <div className="mt-4 space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {detectedList.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-white font-bold text-sm">${tx.amount}</p>
                      <p className="text-[10px] text-[#cbc3d7] uppercase font-bold">{tx.category}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#4cd7f6] flex items-center justify-center text-[#111318]">
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-8 flex gap-4 relative z-10">
              <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-[#cbc3d7] active:scale-95 transition-transform">
                <Camera className="w-6 h-6" />
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={() => {}} />
              </button>
              <button 
                onClick={handleSaveSelected}
                disabled={input.length < 3}
                className="flex-1 h-16 rounded-3xl bg-gradient-to-r from-[#d0bcff] to-[#a078ff] text-[#23005c] font-headline font-extrabold uppercase tracking-widest active:scale-95 transition-all shadow-[0_10px_30px_rgba(208,188,255,0.3)] disabled:opacity-30"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

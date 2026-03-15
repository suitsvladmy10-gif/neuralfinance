"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export function MagicInputModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<{ amount?: string, category?: string, account?: string } | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    
    // Simulate AI Parsing
    if (val.length > 5) {
      setTimeout(() => {
        setParsedData({
          amount: val.match(/\d+/) ? val.match(/\d+/)?.[0] + ' ₽' : undefined,
          category: val.toLowerCase().includes('еда') || val.toLowerCase().includes('бургер') ? 'Еда' : 'Неизвестно',
          account: val.toLowerCase().includes('тиньк') ? 'Тинькофф' : (val.toLowerCase().includes('сбер') ? 'Сбербанк' : 'Основной счет')
        });
      }, 300);
    } else {
      setParsedData(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-24 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="w-full max-w-md bg-[#1A1C23] border border-[#2E323E] rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-2 text-primary font-medium">
                <Sparkles className="w-5 h-5" />
                <span>AI Ассистент</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-[#2E323E]/50 hover:bg-[#2E323E] transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="relative z-10">
              <input
                autoFocus
                type="text"
                value={input}
                onChange={handleInput}
                placeholder="1500₽ Еда Тинькофф..."
                className="w-full bg-transparent text-2xl text-white placeholder-gray-600 outline-none border-b border-[#2E323E] pb-4 mb-6 focus:border-primary transition-colors"
              />

              <div className="h-32">
                <AnimatePresence>
                  {parsedData && (
                    <motion.div 
                      className="bg-[#2E323E]/30 rounded-2xl p-4 border border-[#2E323E]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-400 text-sm">Распознано:</span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md">Расход</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {parsedData.amount && <span className="bg-[#10B981]/20 text-[#10B981] px-3 py-1.5 rounded-lg text-sm font-medium">{parsedData.amount}</span>}
                        {parsedData.category && <span className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-medium">{parsedData.category}</span>}
                        {parsedData.account && <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-3 py-1.5 rounded-lg text-sm font-medium">{parsedData.account}</span>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button className="w-full mt-4 bg-primary text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                Добавить запись
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

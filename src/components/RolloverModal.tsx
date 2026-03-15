"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { MoonStar, PiggyBank, ArrowRight, SplitSquareHorizontal } from 'lucide-react';

export function RolloverModal({ isOpen, onClose, surplus }: { isOpen: boolean; onClose: () => void; surplus: number }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="w-full max-w-sm bg-[#1A1C23] border border-[#2E323E] rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-6 relative z-10">
              <div className="w-16 h-16 bg-[#2E323E]/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MoonStar className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">День подошел к концу</h2>
              <p className="text-gray-400 text-sm">Вы отлично справились! У вас остался свободный бюджет.</p>
            </div>

            <div className="text-center mb-8 relative z-10">
              <span className="text-4xl font-bold text-success glow-success">+{surplus.toLocaleString('ru-RU')} ₽</span>
            </div>

            <div className="space-y-3 relative z-10">
              <button onClick={onClose} className="w-full flex items-center justify-between p-4 rounded-xl bg-[#2E323E]/30 border border-[#2E323E] hover:border-primary/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  <span className="font-medium text-sm">Перенести на завтра</span>
                </div>
              </button>

              <button onClick={onClose} className="w-full flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/30 hover:border-primary transition-colors group">
                <div className="flex items-center gap-3">
                  <PiggyBank className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm text-primary">Отправить в копилку</span>
                </div>
              </button>

              <button onClick={onClose} className="w-full flex items-center justify-between p-4 rounded-xl bg-[#2E323E]/30 border border-[#2E323E] hover:border-white/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <SplitSquareHorizontal className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  <span className="font-medium text-sm">Поделить 50/50</span>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

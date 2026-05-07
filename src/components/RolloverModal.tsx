"use client";
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  surplus: number;
  onRollover?: () => void;
  onSaveToSavings?: () => void;
  onSplit?: () => void;
}

export function RolloverModal({ isOpen, onClose, surplus, onRollover, onSaveToSavings, onSplit }: Props) {
  const handleRollover = () => { onRollover?.(); onClose(); };
  const handleSavings = () => { onSaveToSavings?.(); onClose(); };
  const handleSplit = () => { onSplit?.(); onClose(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-t-2xl p-6 shadow-2xl"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="section-label mb-1">Day Summary</p>
                <h2 className="text-white font-bold text-xl">Great job today!</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#1E1E1E] flex items-center justify-center text-[#888888]">
                <span className="material-symbols-outlined !text-base">close</span>
              </button>
            </div>

            <div className="card-2 rounded-xl p-4 mb-6 text-center">
              <p className="text-[#888888] text-xs font-semibold mb-1">Budget Remaining</p>
              <p className="text-3xl font-bold text-[#16A34A] tabular-nums">+${surplus.toLocaleString('en-US')}</p>
            </div>

            <div className="space-y-2.5">
              <button onClick={handleRollover} className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#2563EB]/50 active:opacity-70 transition-all text-left">
                <div className="w-9 h-9 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#2563EB] !text-lg">arrow_forward</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Roll over to tomorrow</p>
                  <p className="text-[#888888] text-xs">Add to tomorrow's budget</p>
                </div>
              </button>

              <button onClick={handleSavings} className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 hover:border-[#16A34A]/60 active:opacity-70 transition-all text-left">
                <div className="w-9 h-9 rounded-lg bg-[#16A34A]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#16A34A] !text-lg">savings</span>
                </div>
                <div>
                  <p className="text-[#16A34A] font-semibold text-sm">Send to savings</p>
                  <p className="text-[#888888] text-xs">Move to your savings goal</p>
                </div>
              </button>

              <button onClick={handleSplit} className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] hover:border-white/20 active:opacity-70 transition-all text-left">
                <div className="w-9 h-9 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#888888] !text-lg">call_split</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Split 50/50</p>
                  <p className="text-[#888888] text-xs">Half to savings, half to tomorrow</p>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

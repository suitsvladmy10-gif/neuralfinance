"use client";
import { motion, AnimatePresence } from 'framer-motion';

export function DailyLimitDial({ remaining, total }: { remaining: number; total: number }) {
  const percentage = (remaining / total) * 100;
  
  // Calculate color based on percentage
  let colorClass = 'text-success glow-success';
  let strokeClass = 'stroke-success';
  if (percentage < 30) {
    colorClass = 'text-warning';
    strokeClass = 'stroke-warning';
  }
  if (percentage < 10) {
    colorClass = 'text-danger glow-danger';
    strokeClass = 'stroke-danger';
  }

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-72 h-72 mx-auto flex items-center justify-center mb-8 mt-4">
      <svg className="absolute inset-0 w-full h-full -rotate-90 transform">
        {/* Background circle */}
        <circle
          cx="144"
          cy="144"
          r={radius}
          className="stroke-[#2E323E]"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx="144"
          cy="144"
          r={radius}
          className={`${strokeClass} drop-shadow-[0_0_15px_rgba(var(--tw-stroke-color),0.5)]`}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      
      <div className="text-center z-10 flex flex-col items-center justify-center">
        <p className="text-sm text-gray-400 font-medium mb-1 tracking-wider uppercase">Бюджет на сегодня</p>
        <motion.h1 
          className={`text-5xl font-bold tracking-tight ${colorClass} transition-colors duration-500`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {remaining.toLocaleString('ru-RU')} ₽
        </motion.h1>
        <p className="text-xs text-gray-500 mt-2">из {total.toLocaleString('ru-RU')} ₽</p>
      </div>
    </div>
  );
}

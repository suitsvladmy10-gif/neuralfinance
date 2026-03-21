"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { icon: 'shield', path: '/', label: 'Vault' },
    { icon: 'account_balance_wallet', path: '/accounts', label: 'Assets' },
    { icon: 'analytics', path: '/analytics', label: 'Insights' },
    { icon: 'auto_awesome', path: '/transfers', label: 'Magic' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-24 bg-[#111318]/90 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-6 z-[60] pb-6">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link href={item.path} key={item.path} className="relative flex flex-col items-center gap-1.5 p-2 transition-all active:scale-90 group">
            {isActive && (
              <motion.div 
                layoutId="nav-glow"
                className="absolute -top-1 w-8 h-1 bg-[#4cd7f6] rounded-full shadow-[0_0_15px_rgba(76,215,246,0.8)]"
              />
            )}
            <span className={`material-symbols-outlined !text-2xl transition-all duration-300 ${isActive ? 'text-[#4cd7f6] scale-110 drop-shadow-[0_0_10px_rgba(76,215,246,0.3)]' : 'text-[#cbc3d7] opacity-40 group-hover:opacity-100'}`}>
              {item.icon}
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-[0.15em] transition-colors ${isActive ? 'text-[#4cd7f6]' : 'text-[#cbc3d7] opacity-40'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

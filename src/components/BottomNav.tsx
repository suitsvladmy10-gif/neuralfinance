"use client";
import { Home, WalletCards, ArrowLeftRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { icon: Home, path: '/', label: 'Vault' },
    { icon: WalletCards, path: '/accounts', label: 'Accounts' },
    { icon: BarChart3, path: '/analytics', label: 'Insights' },
    { icon: ArrowLeftRight, path: '/transfers', label: 'Magic' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-[#111318]/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-4 z-40">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        return (
          <Link href={item.path} key={item.path} className="flex flex-col items-center gap-1 p-2 transition-all active:scale-90">
            <Icon className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-[#4cd7f6] drop-shadow-[0_0_8px_rgba(76,215,246,0.5)]' : 'text-[#cbc3d7] opacity-50 hover:opacity-100'}`} />
            <span className={`text-[10px] font-medium uppercase tracking-widest transition-colors ${isActive ? 'text-[#4cd7f6]' : 'text-[#cbc3d7] opacity-50'}`}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

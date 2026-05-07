"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: 'home', path: '/', label: 'Home' },
    { icon: 'account_balance_wallet', path: '/accounts', label: 'Accounts' },
    { icon: 'analytics', path: '/analytics', label: 'Analytics' },
    { icon: 'swap_horiz', path: '/transfers', label: 'Transfers' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0A0A0A] border-t border-[#2A2A2A] flex items-center justify-around px-2 pb-6 pt-3 z-[60]">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all active:scale-90 ${isActive ? 'text-[#2563EB]' : 'text-[#888888]'}`}
          >
            <span className={`material-symbols-outlined !text-[22px] transition-all ${isActive ? '!fill-[1]' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {item.icon}
            </span>
            <span className={`text-[9px] font-semibold uppercase tracking-wider ${isActive ? 'text-[#2563EB]' : 'text-[#888888]'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

"use client";
import { Home, WalletCards, ArrowLeftRight, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { icon: Home, path: '/', label: 'Главная' },
    { icon: WalletCards, path: '/accounts', label: 'Счета' },
    { icon: ArrowLeftRight, path: '/transfers', label: 'Переводы' },
    { icon: Settings, path: '/settings', label: 'Настройки' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-[#1A1C23]/80 backdrop-blur-xl border-t border-[#2E323E] flex items-center justify-around px-4 z-40">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        return (
          <Link href={item.path} key={item.path} className="flex flex-col items-center gap-1 p-2">
            <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-400'}`} />
            {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-1" />}
          </Link>
        );
      })}
    </div>
  );
}

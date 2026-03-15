import type { Metadata } from 'next';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Neural Finance',
  description: 'AI-Powered Personal Finance',
  themeColor: '#0F1014',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-[#0F1014] text-white min-h-screen pb-20">
        <main className="max-w-md mx-auto relative min-h-screen overflow-hidden shadow-2xl bg-[#0F1014]">
          {children}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}

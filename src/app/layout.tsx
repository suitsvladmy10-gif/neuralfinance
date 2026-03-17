import type { Metadata } from 'next';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { FinanceProvider } from '@/lib/store';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Neural Finance',
  description: 'AI-Powered Personal Finance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="bg-[#0F1014] text-white min-h-screen pb-20">
        <FinanceProvider>
          <main className="max-w-md mx-auto relative min-h-screen overflow-hidden shadow-2xl bg-[#0F1014]">
            {children}
            <BottomNav />
          </main>
        </FinanceProvider>
      </body>
    </html>
  );
}

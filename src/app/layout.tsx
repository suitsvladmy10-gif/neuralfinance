import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { FinanceProvider } from '@/lib/store';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Neural Finance',
  description: 'AI-Powered Personal Finance',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,fill,GRAD@20..48,100..700,0..1,-50..200" />
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="bg-[#0A0A0A] text-white min-h-screen overflow-x-hidden selection:bg-[#2563EB]/30">
        <FinanceProvider>
          <main className="max-w-md mx-auto relative min-h-screen flex flex-col z-10">
            {children}
            <BottomNav />
          </main>
          <Script id="tma-init" strategy="afterInteractive">{`
            try {
              const tg = window.Telegram.WebApp;
              tg.expand();
              tg.ready();
              tg.enableClosingConfirmation();
              tg.setHeaderColor('#0A0A0A');
              tg.setBackgroundColor('#0A0A0A');
            } catch(e) { console.error('TMA Init Error', e); }
          `}</Script>
        </FinanceProvider>
      </body>
    </html>
  );
}

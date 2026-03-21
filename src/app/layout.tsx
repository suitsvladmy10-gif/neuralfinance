import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { FinanceProvider } from '@/lib/store';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Neural Finance',
  description: 'Stitch AI-Powered Finance',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,fill,GRAD@20..48,100..700,0..1,-50..200" />
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="bg-[#111318] text-[#e2e2e9] min-h-screen overflow-x-hidden selection:bg-[#d0bcff]/30">
        <FinanceProvider>
          {/* Global Background Glows matching Stitch design */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-[#4cd7f6]/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[40%] bg-[#d0bcff]/5 blur-[120px] rounded-full"></div>
          </div>

          <main className="max-w-md mx-auto relative min-h-screen flex flex-col pt-16 pb-32 px-1 z-10">
            {children}
            <BottomNav />
          </main>

          {/* Telegram WebApp Initializer */}
          <Script id="tma-init" strategy="afterInteractive">
            {`
              try {
                const tg = window.Telegram.WebApp;
                tg.expand();
                tg.ready();
                tg.enableClosingConfirmation();
                tg.setHeaderColor('#111318');
                tg.setBackgroundColor('#111318');
              } catch (e) { console.error("TMA Init Error", e); }
            `}
          </Script>
        </FinanceProvider>
      </body>
    </html>
  );
}

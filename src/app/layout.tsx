import type { Metadata } from 'next';
import Script from 'next/script';
import { FinanceProvider } from '@/lib/FinanceProvider';
import { ToastContainer } from '@/components/finance/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Meu Salário em dia',
  description: 'PWA de controle financeiro offline-first',
  manifest: '/manifest.json',
  themeColor: '#f5f7fa',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  icons: {
    icon: '/logonovo.png',
    apple: '/logonovo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Meu Salário em dia',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logonovo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logonovo.png" />
      </head>
      <body>
        <FinanceProvider>
          {children}
          <ToastContainer />
        </FinanceProvider>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator && typeof window !== 'undefined') {
              window.addEventListener('load', () => {
                navigator.serviceWorker
                  .register('/service-worker.js')
                  .then((registration) => {
                    console.log('SW registered:', registration);
                  })
                  .catch((error) => {
                    console.log('SW registration failed:', error);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}

'use client';

import { Sidebar } from '@/components/finance/Sidebar';
import { OnboardingQuiz } from '@/components/finance/OnboardingQuiz';
import { ThemeInitializer } from '@/components/finance/ThemeInitializer';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeInitializer />
      <div className="flex min-h-screen bg-gray-50 dark:from-[#202020] dark:via-[#252525] dark:to-[#2a2a2a] relative overflow-hidden">
        {/* Efeito de brilho decorativo baseado nas cores do logo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-light/20 dark:bg-primary-light/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        {/* Sidebar */}
        <Sidebar />
        
        {/* Conteúdo principal */}
        <main className="flex-1 md:ml-20 min-h-screen relative z-10">
          {children}
        </main>
        <OnboardingQuiz />
      </div>
    </>
  );
}

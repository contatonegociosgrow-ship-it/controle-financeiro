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
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden">
        {/* Efeito de brilho decorativo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
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

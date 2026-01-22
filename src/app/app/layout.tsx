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
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Conteúdo principal */}
        <main className="flex-1 md:ml-20 min-h-screen">
          {children}
        </main>
        <OnboardingQuiz />
      </div>
    </>
  );
}

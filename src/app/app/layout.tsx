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
      <div className="flex min-h-screen relative overflow-hidden transition-colors duration-300">
        
        {/* Sidebar */}
        <Sidebar />
        
        {/* Conteúdo principal - Ajustado para nova largura da sidebar */}
        <main className="flex-1 md:ml-24 min-h-screen relative z-10 transition-all duration-300">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
        <OnboardingQuiz />
      </div>
    </>
  );
}

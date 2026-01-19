'use client';

import { useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';

export function ThemeInitializer() {
  const { state } = useFinanceStore();

  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.settings.theme]);

  return null;
}

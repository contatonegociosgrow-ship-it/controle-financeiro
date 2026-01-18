'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { AddTransactionSheet } from './AddTransactionSheet';
import { CardGanhos } from './CardGanhos';
import { CardDividas } from './CardDividas';
import { CardDespesasVariaveis } from './CardDespesasVariaveis';
import { CardDespesasFixas } from './CardDespesasFixas';

export function FinanceDashboard() {
  const { isInitialized } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Grid 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[calc(100vh-8rem)]">
          {/* Top Left: Ganhos */}
          <CardGanhos />

          {/* Top Right: Dívidas */}
          <CardDividas />

          {/* Bottom Left: Despesas Variáveis */}
          <CardDespesasVariaveis />

          {/* Bottom Right: Despesas Fixas */}
          <CardDespesasFixas />
        </div>
      </div>

      {/* Botão flutuante */}
      <button
        onClick={() => setIsSheetOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-light transition-all hover:scale-110 z-40"
        aria-label="Adicionar transação"
      >
        +
      </button>

      {/* Sheet de adicionar transação */}
      <AddTransactionSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}

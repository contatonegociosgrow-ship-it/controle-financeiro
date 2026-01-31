'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { AddTransactionSheet } from './AddTransactionSheet';
import { BalanceModal } from './BalanceModal';
import { CardGanhos } from './CardGanhos';
import { CardDividas } from './CardDividas';
import { CardDespesasVariaveis } from './CardDespesasVariaveis';
import { CardDespesasFixas } from './CardDespesasFixas';
import { DashboardSummary } from './DashboardSummary';

export function FinanceDashboard() {
  const { isInitialized } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);

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
        {/* Cards de Resumo */}
        <DashboardSummary />

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

      {/* Botões flutuantes */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        {/* Botão Balance */}
        <button
          onClick={() => setIsBalanceOpen(true)}
          className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl flex items-center justify-center text-xl font-semibold transition-all hover:scale-110"
          aria-label="Ver saldo"
          title="Ver saldo do mês"
        >
          💰
        </button>
        
        {/* Botões de ação */}
        <div className="flex gap-2">
          {/* Botão Microfone */}
          <button
            onClick={() => {
              setVoiceMode(true);
              setIsSheetOpen(true);
            }}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110"
            aria-label="Falar e registrar"
            title="Falar e registrar transação"
          >
            🎙️
          </button>
          
          {/* Botão Adicionar */}
          <button
            onClick={() => {
              setVoiceMode(false);
              setIsSheetOpen(true);
            }}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-light transition-all hover:scale-110"
            aria-label="Adicionar transação"
            title="Adicionar transação manualmente"
          >
            +
          </button>
        </div>
      </div>

      {/* Sheet de adicionar transação */}
      <AddTransactionSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setVoiceMode(false);
        }}
        startWithVoice={voiceMode}
      />

      {/* Modal Balance */}
      <BalanceModal isOpen={isBalanceOpen} onClose={() => setIsBalanceOpen(false)} />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { PageHeader } from '@/components/finance/PageHeader';
import { TransactionList } from '@/components/finance/TransactionList';
import { AddTransactionSheet } from '@/components/finance/AddTransactionSheet';
import { DateFilter } from '@/components/finance/DateFilter';
import { Wallet, List } from 'lucide-react';

export default function GanhosPage() {
  const { isInitialized } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [filter, setFilter] = useState('');
  const [dateStart, setDateStart] = useState<string | null>(null);
  const [dateEnd, setDateEnd] = useState<string | null>(null);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <PageHeader
          title="Ganhos"
          icon={Wallet}
          onFilterChange={setFilter}
        />

        <div className="mb-4">
          <DateFilter
            pageKey="ganhos"
            onDateRangeChange={(start, end) => {
              setDateStart(start);
              setDateEnd(end);
            }}
          />
        </div>

        <PremiumContentCard
          title="Transações de Ganhos"
          icon={List}
          gradientFrom="from-green-600"
          gradientTo="to-green-700"
        >
          <TransactionList
            type="income"
            filter={filter}
            startDate={dateStart}
            endDate={dateEnd}
            columns={5}
          />
        </PremiumContentCard>
      </div>

      {/* Botões flutuantes */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex gap-2 z-40">
        {/* Botão Microfone */}
        <button
          onClick={() => {
            setVoiceMode(true);
            setIsSheetOpen(true);
          }}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center text-xl sm:text-2xl transition-all hover:scale-110"
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
          className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl sm:text-3xl font-light transition-all hover:scale-110"
          aria-label="Adicionar transação"
          title="Adicionar transação manualmente"
        >
          +
        </button>
      </div>

      <AddTransactionSheet 
        isOpen={isSheetOpen} 
        onClose={() => {
          setIsSheetOpen(false);
          setVoiceMode(false);
        }}
        startWithVoice={voiceMode}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { CardUI } from '@/components/finance/CardUI';
import { PageHeader } from '@/components/finance/PageHeader';
import { TransactionList } from '@/components/finance/TransactionList';
import { AddTransactionSheet } from '@/components/finance/AddTransactionSheet';
import { DateFilter } from '@/components/finance/DateFilter';

export default function GanhosPage() {
  const { isInitialized } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PageHeader
          title="Ganhos"
          icon="💰"
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

        <CardUI>
          <TransactionList
            type="income"
            filter={filter}
            startDate={dateStart}
            endDate={dateEnd}
            columns={5}
          />
        </CardUI>
      </div>

      <button
        onClick={() => setIsSheetOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-light transition-all hover:scale-110 z-40"
        aria-label="Adicionar transação"
      >
        +
      </button>

      <AddTransactionSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
    </div>
  );
}

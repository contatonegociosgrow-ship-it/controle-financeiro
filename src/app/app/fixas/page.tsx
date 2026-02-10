'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { PageHeader } from '@/components/finance/PageHeader';
import { TransactionList } from '@/components/finance/TransactionList';
import { AddTransactionSheet } from '@/components/finance/AddTransactionSheet';
import { DateFilter } from '@/components/finance/DateFilter';
import { Receipt, List, Filter, Tag } from 'lucide-react';

export default function FixasPage() {
  const { isInitialized, state } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [filter, setFilter] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [dateStart, setDateStart] = useState<string | null>(null);
  const [dateEnd, setDateEnd] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  // Calcular total gasto na categoria selecionada
  const categoryTotal = useMemo(() => {
    if (!categoryId) return null;

    let filtered = state.transactions.filter((t) => t.type === 'expense_fixed' && t.categoryId === categoryId);

    // Aplicar filtro de data
    if (dateStart || dateEnd) {
      filtered = filtered.filter((t) => {
        const transactionDate = t.date;
        if (dateStart && transactionDate < dateStart) return false;
        if (dateEnd && transactionDate > dateEnd) return false;
        return true;
      });
    }

    // Aplicar filtro de texto se houver
    if (filter) {
      const filterLower = filter.toLowerCase().trim();
      filtered = filtered.filter((t) => {
        const category = state.categories.find((c) => c.id === t.categoryId);
        const categoryName = category?.name.toLowerCase() || '';
        const notes = t.notes?.toLowerCase() || '';
        const valueStr = t.value.toString().replace('.', ',');
        const person = t.personId ? state.people.find((p) => p.id === t.personId) : null;
        const personName = person?.name.toLowerCase() || '';
        
        return (
          categoryName.includes(filterLower) ||
          notes.includes(filterLower) ||
          valueStr.includes(filterLower) ||
          personName.includes(filterLower) ||
          t.date.includes(filterLower)
        );
      });
    }

    return filtered.reduce((sum, t) => sum + t.value, 0);
  }, [state.transactions, state.categories, state.people, categoryId, dateStart, dateEnd, filter]);

  const selectedCategory = categoryId ? state.categories.find((c) => c.id === categoryId) : null;

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
          title="Despesas Fixas"
          icon={Receipt}
          onFilterChange={setFilter}
        />

        {/* Seção de Filtros - Design Moderno */}
        <div className="mb-6 bg-gradient-to-br from-white via-red-50/30 to-white dark:from-gray-800 dark:via-red-950/10 dark:to-gray-800 rounded-2xl shadow-lg border border-red-100/50 dark:border-red-900/30 p-5 sm:p-6 relative overflow-hidden">
          {/* Efeito de brilho decorativo */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-400/10 dark:bg-red-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          {/* Header da seção */}
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filtros</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Refine sua busca</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative z-10">
            {/* Filtro por Categoria */}
            <div className="bg-white/80 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-600/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Tag className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Categoria
                </label>
              </div>
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value || null)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all hover:border-gray-300 dark:hover:border-gray-500 font-medium"
              >
                <option value="">Todas as categorias</option>
                {state.categories
                  .filter((c) => c.name !== 'Ganhos')
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
              {categoryTotal !== null && selectedCategory && (
                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">
                        Total em {selectedCategory.name}
                      </div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(categoryTotal)}
                      </div>
                    </div>
                    <div className="p-3 bg-red-200/50 dark:bg-red-900/30 rounded-lg">
                      <Tag className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filtro por Data */}
            <div className="lg:col-span-1">
              <DateFilter
                pageKey="fixas"
                onDateRangeChange={(start, end) => {
                  setDateStart(start);
                  setDateEnd(end);
                }}
              />
            </div>
          </div>
        </div>

        <PremiumContentCard
          title="Despesas Fixas"
          icon={List}
          gradientFrom="from-red-600"
          gradientTo="to-red-700"
        >
          <TransactionList
            type="expense_fixed"
            filter={filter}
            categoryId={categoryId}
            startDate={dateStart}
            endDate={dateEnd}
            showCategory={true}
            showStatus={true}
            showDueDate={true}
            columns={5}
            onEdit={(id) => {
              setEditingId(id);
              setVoiceMode(false);
              setIsSheetOpen(true);
            }}
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
            setEditingId(null);
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
          setEditingId(null);
          setVoiceMode(false);
        }}
        defaultType="expense_fixed"
        startWithVoice={voiceMode}
        editingId={editingId}
      />
    </div>
  );
}

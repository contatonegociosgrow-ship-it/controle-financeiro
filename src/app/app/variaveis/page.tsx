'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { PageHeader } from '@/components/finance/PageHeader';
import { TransactionList } from '@/components/finance/TransactionList';
import { AddTransactionSheet } from '@/components/finance/AddTransactionSheet';
import { ImportExtractSheetVariaveis } from '@/components/finance/ImportExtractSheetVariaveis';
import { DateFilter } from '@/components/finance/DateFilter';
import { ShoppingCart, List, Upload, Filter, Tag, Calendar, Mic, Plus } from 'lucide-react';

export default function VariaveisPage() {
  const { isInitialized, state } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [filter, setFilter] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [personId, setPersonId] = useState<string | null>(null);
  const [dateStart, setDateStart] = useState<string | null>(null);
  const [dateEnd, setDateEnd] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  // Calcular total gasto na categoria selecionada
  const categoryTotal = useMemo(() => {
    if (!categoryId) return null;

    let filtered = state.transactions.filter((t) => t.type === 'expense_variable' && t.categoryId === categoryId);

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
          title="Despesas Variáveis"
          icon={ShoppingCart}
          headerAccent="green"
          walletPlacement="below"
          walletVariant="expense"
          onFilterChange={setFilter}
        />

        {/* Botão para mostrar/ocultar filtros */}
        <div className="mb-6">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full flex items-center justify-between p-4 glassmorphism rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400/30 to-orange-600/30 flex items-center justify-center neomorphic">
                <Filter size={20} strokeWidth={2.5} className="text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white">
                  Filtros
                </div>
                <div className="text-xs text-white/70">
                  {categoryId || personId || dateStart || dateEnd 
                    ? `${categoryId ? 'Categoria' : ''}${categoryId && personId ? ', ' : ''}${personId ? 'Pessoa' : ''}${(categoryId || personId) && (dateStart || dateEnd) ? ', ' : ''}${dateStart || dateEnd ? 'Período' : ''}`
                    : 'Nenhum filtro aplicado'
                  }
                </div>
              </div>
            </div>
            <div className={`transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Seção de Filtros - Oculto por padrão */}
        {isFiltersOpen && (
          <div className="mb-6 glassmorphism rounded-2xl p-5 sm:p-6 relative overflow-hidden animate-in slide-in-from-top-2 duration-300">
            {/* Header da seção */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400/30 to-orange-600/30 flex items-center justify-center neomorphic">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Filtros</h2>
                <p className="text-xs text-white/70">Refine sua busca</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
              {/* Filtro por Categoria */}
              <div className="glassmorphism rounded-xl p-5 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400/30 to-orange-600/30 flex items-center justify-center neomorphic">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <label className="text-sm font-semibold text-white">
                    Categoria
                  </label>
                </div>
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value || null)}
                  className="w-full px-4 py-3 glassmorphism rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
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
                <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/30 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">
                        Total em {selectedCategory.name}
                      </div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(categoryTotal)}
                      </div>
                    </div>
                    <div className="p-3 bg-orange-200/50 dark:bg-orange-900/30 rounded-lg">
                      <Tag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filtro por Pessoa */}
            <div className="glassmorphism rounded-xl p-5 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400/30 to-orange-600/30 flex items-center justify-center neomorphic">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <label className="text-sm font-semibold text-white">
                  Quem corresponde
                </label>
              </div>
              <select
                value={personId || ''}
                onChange={(e) => setPersonId(e.target.value || null)}
                className="w-full px-4 py-3 glassmorphism rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
              >
                <option value="">Todas as pessoas</option>
                {state.people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Data */}
            <div className="lg:col-span-1">
              <DateFilter
                pageKey="variaveis"
                onDateRangeChange={(start, end) => {
                  setDateStart(start);
                  setDateEnd(end);
                }}
              />
            </div>
          </div>
          </div>
        )}

        <TransactionList
          type="expense_variable"
          filter={filter}
          categoryId={categoryId}
          personId={personId}
          startDate={dateStart}
          endDate={dateEnd}
          showCategory={true}
          showInstallments={true}
          columns={5}
          onEdit={(id) => {
            setEditingId(id);
            setVoiceMode(false);
            setIsSheetOpen(true);
          }}
        />
      </div>

      {/* Botões flutuantes */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-3 z-40">
        {/* Botão Importar Extrato */}
        <button
          onClick={() => setIsImportSheetOpen(true)}
          className="fab-blue w-14 h-14 rounded-full flex items-center justify-center text-white"
          aria-label="Importar extrato"
          title="Importar extrato (CSV, PDF, TXT)"
        >
          <Upload size={20} />
        </button>
        
        {/* Botão Microfone */}
        <button
          onClick={() => {
            setVoiceMode(true);
            setIsSheetOpen(true);
          }}
          className="fab-blue w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white"
          aria-label="Falar e registrar"
          title="Falar e registrar transação"
        >
          <Mic size={22} strokeWidth={2.5} className="text-white" />
        </button>
        
        {/* Botão Adicionar */}
        <button
          onClick={() => {
            setEditingId(null);
            setVoiceMode(false);
            setIsSheetOpen(true);
          }}
          className="fab-blue w-16 h-16 rounded-full flex items-center justify-center text-3xl font-light text-white"
          aria-label="Adicionar transação"
          title="Adicionar transação manualmente"
        >
          <Plus size={26} strokeWidth={2.5} className="text-white" />
        </button>
      </div>

      <AddTransactionSheet 
        isOpen={isSheetOpen} 
        onClose={() => {
          setIsSheetOpen(false);
          setEditingId(null);
          setVoiceMode(false);
        }}
        defaultType="expense_variable"
        startWithVoice={voiceMode}
        editingId={editingId}
      />

      <ImportExtractSheetVariaveis
        isOpen={isImportSheetOpen}
        onClose={() => setIsImportSheetOpen(false)}
      />
    </div>
  );
}

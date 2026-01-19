'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { CardUI } from '@/components/finance/CardUI';
import { PageHeader } from '@/components/finance/PageHeader';
import { TransactionList } from '@/components/finance/TransactionList';
import { AddTransactionSheet } from '@/components/finance/AddTransactionSheet';
import { BalanceModal } from '@/components/finance/BalanceModal';
import { CategoryPieChart } from '@/components/finance/PieChart';
import { DateFilter } from '@/components/finance/DateFilter';

type FilterType = 'all' | 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings';

export default function GeraisPage() {
  const { state, isInitialized } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [dateStart, setDateStart] = useState<string | null>(null);
  const [dateEnd, setDateEnd] = useState<string | null>(null);

  // Filtrar transações por tipo, texto e data (usado apenas para gráficos)
  const filteredTransactions = useMemo(() => {
    let filtered = state.transactions;

    // Filtrar por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Filtrar por texto
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

    // Filtrar por data
    if (dateStart || dateEnd) {
      filtered = filtered.filter((t) => {
        const transactionDate = t.date;
        if (dateStart && transactionDate < dateStart) return false;
        if (dateEnd && transactionDate > dateEnd) return false;
        return true;
      });
    }

    return filtered;
  }, [state.transactions, state.categories, state.people, filter, typeFilter, dateStart, dateEnd]);

  // Calcular totais por tipo
  const totals = useMemo(() => {
    const income = state.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);
    
    const expenseFixed = state.transactions
      .filter((t) => t.type === 'expense_fixed')
      .reduce((sum, t) => sum + t.value, 0);
    
    const expenseVariable = state.transactions
      .filter((t) => t.type === 'expense_variable')
      .reduce((sum, t) => sum + t.value, 0);
    
    const debt = state.transactions
      .filter((t) => t.type === 'debt')
      .reduce((sum, t) => sum + t.value, 0);
    
    const savings = state.transactions
      .filter((t) => t.type === 'savings')
      .reduce((sum, t) => sum + t.value, 0);

    return { income, expenseFixed, expenseVariable, debt, savings };
  }, [state.transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <PageHeader
            title="Gerais"
            icon="📊"
            onFilterChange={setFilter}
          />
        </div>

        {/* Cards de Resumo por Tipo */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card Ganhos */}
            <CardUI className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setTypeFilter('income')}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💰</span>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ganhos</h4>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.income)}</p>
            </CardUI>

            {/* Card Despesas Fixas */}
            <CardUI className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setTypeFilter('expense_fixed')}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📌</span>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fixas</h4>
              </div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.expenseFixed)}</p>
            </CardUI>

            {/* Card Despesas Variáveis */}
            <CardUI className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setTypeFilter('expense_variable')}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📈</span>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Variáveis</h4>
              </div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.expenseVariable)}</p>
            </CardUI>

            {/* Card Dívidas */}
            <CardUI className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setTypeFilter('debt')}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔗</span>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dívidas</h4>
              </div>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totals.debt)}</p>
            </CardUI>

            {/* Card Economias */}
            <CardUI className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setTypeFilter('savings')}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💎</span>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Economias</h4>
              </div>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.savings)}</p>
            </CardUI>
          </div>
        </div>

        {/* Filtros Section */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2 font-semibold">Filtrar por tipo:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm hover:border-gray-400 dark:hover:border-gray-500"
              >
                <option value="all">Todas</option>
                <option value="income">Ganhos</option>
                <option value="expense_fixed">Despesas Fixas</option>
                <option value="expense_variable">Despesas Variáveis</option>
                <option value="debt">Dívidas</option>
                <option value="savings">Economias</option>
              </select>
            </div>
          </div>
          <DateFilter
            pageKey="gerais"
            onDateRangeChange={(start, end) => {
              setDateStart(start);
              setDateEnd(end);
            }}
          />
        </div>

        {/* Gráfico Section */}
        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <CardUI className="shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              <h3 className="text-base text-gray-900 dark:text-white font-semibold tracking-tight">Distribuição por Categoria</h3>
            </div>
            <CategoryPieChart
              transactions={filteredTransactions}
              categories={state.categories}
              type="all"
            />
          </CardUI>
        </div>

        {/* Lista de Transações Section */}
        <div>
          <CardUI className="shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              <h3 className="text-base text-gray-900 dark:text-white font-semibold tracking-tight">Transações</h3>
            </div>
            <TransactionList 
              type={typeFilter} 
              filter={filter} 
              startDate={dateStart}
              endDate={dateEnd}
              showCategory={true} 
              columns={5} 
            />
          </CardUI>
        </div>
      </div>

      {/* Botões flutuantes */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        {/* Botão Balance */}
        <button
          onClick={() => setIsBalanceOpen(true)}
          className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl flex items-center justify-center text-xl font-semibold transition-all hover:scale-110"
          aria-label="Ver carteira"
          title="Ver carteira e saldo"
        >
          💰
        </button>
        
        {/* Botão Adicionar */}
        <button
          onClick={() => setIsSheetOpen(true)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-light transition-all hover:scale-110"
          aria-label="Adicionar transação"
        >
          +
        </button>
      </div>

      <AddTransactionSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
      <BalanceModal isOpen={isBalanceOpen} onClose={() => setIsBalanceOpen(false)} />
    </div>
  );
}

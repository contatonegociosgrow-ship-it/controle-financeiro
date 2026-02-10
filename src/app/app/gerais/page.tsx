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
import { MonthlyInsight } from '@/components/finance/MonthlyInsight';
import { getSalaryPercentage, getSalaryStatus } from '@/lib/salaryUtils';
import { LayoutDashboard, Wallet, Receipt, ShoppingCart, Link as LinkIcon, PiggyBank, PieChart, List, Filter, Tag, Calendar, Layers } from 'lucide-react';
import { PremiumCard } from '@/components/finance/PremiumCard';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';

type FilterType = 'all' | 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings';

export default function GeraisPage() {
  const { state, isInitialized } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [dateStart, setDateStart] = useState<string | null>(null);
  const [dateEnd, setDateEnd] = useState<string | null>(null);
  
  // Estado para controlar o mês/ano visualizado
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const now = new Date();
    return now.getMonth();
  });
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (typeof window === 'undefined') return 2024;
    const now = new Date();
    return now.getFullYear();
  });

  // Filtrar transações por tipo, texto e data
  const filteredTransactions = useMemo(() => {
    let filtered = state.transactions;

    // Filtrar por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Filtrar por categoria
    if (categoryId) {
      filtered = filtered.filter((t) => t.categoryId === categoryId);
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

    // Se não houver filtro de data manual, filtrar pelo mês/ano selecionado
    if (!dateStart && !dateEnd) {
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
      const startDateStr = firstDay.toISOString().split('T')[0];
      const endDateStr = lastDay.toISOString().split('T')[0];
      
      filtered = filtered.filter((t) => {
        return t.date >= startDateStr && t.date <= endDateStr;
      });
    } else {
      // Filtrar por data manual (quando usuário usa DateFilter)
      if (dateStart || dateEnd) {
        filtered = filtered.filter((t) => {
          const transactionDate = t.date;
          if (dateStart && transactionDate < dateStart) return false;
          if (dateEnd && transactionDate > dateEnd) return false;
          return true;
        });
      }
    }

    return filtered;
  }, [state.transactions, state.categories, state.people, filter, typeFilter, categoryId, dateStart, dateEnd, selectedMonth, selectedYear]);

  // Calcular totais por tipo para o mês selecionado
  const totals = useMemo(() => {
    const monthlyIncome = state.profile.monthlyIncome || 0;

    const income = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'income' &&
          transactionDate.getMonth() === selectedMonth &&
          transactionDate.getFullYear() === selectedYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);
    
    const expenseFixed = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'expense_fixed' &&
          transactionDate.getMonth() === selectedMonth &&
          transactionDate.getFullYear() === selectedYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);
    
    const expenseVariable = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'expense_variable' &&
          transactionDate.getMonth() === selectedMonth &&
          transactionDate.getFullYear() === selectedYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);
    
    const debt = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'debt' &&
          transactionDate.getMonth() === selectedMonth &&
          transactionDate.getFullYear() === selectedYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);
    
    const savings = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'savings' &&
          transactionDate.getMonth() === selectedMonth &&
          transactionDate.getFullYear() === selectedYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);

    // Calcular percentuais
    const incomePercentage = getSalaryPercentage(income, monthlyIncome);
    const expenseFixedPercentage = getSalaryPercentage(expenseFixed, monthlyIncome);
    const expenseVariablePercentage = getSalaryPercentage(expenseVariable, monthlyIncome);
    const debtPercentage = getSalaryPercentage(debt, monthlyIncome);
    const savingsPercentage = getSalaryPercentage(savings, monthlyIncome);

    return { 
      income, 
      expenseFixed, 
      expenseVariable, 
      debt, 
      savings,
      incomePercentage,
      expenseFixedPercentage,
      expenseVariablePercentage,
      debtPercentage,
      savingsPercentage,
    };
  }, [state.transactions, state.profile.monthlyIncome, selectedMonth, selectedYear]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  // Calcular total gasto na categoria selecionada
  const categoryTotal = useMemo(() => {
    if (!categoryId) return null;

    let filtered = state.transactions.filter((t) => t.categoryId === categoryId);

    // Aplicar filtro de tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Aplicar filtro de data
    if (dateStart || dateEnd) {
      filtered = filtered.filter((t) => {
        const transactionDate = t.date;
        if (dateStart && transactionDate < dateStart) return false;
        if (dateEnd && transactionDate > dateEnd) return false;
        return true;
      });
    } else {
      // Se não houver filtro de data manual, usar o mês selecionado
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
      const startDateStr = firstDay.toISOString().split('T')[0];
      const endDateStr = lastDay.toISOString().split('T')[0];
      
      filtered = filtered.filter((t) => {
        return t.date >= startDateStr && t.date <= endDateStr;
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
  }, [state.transactions, state.categories, state.people, categoryId, typeFilter, dateStart, dateEnd, selectedMonth, selectedYear, filter]);

  const selectedCategory = categoryId ? state.categories.find((c) => c.id === categoryId) : null;

  // Função para navegar entre meses
  const handleMonthChange = (direction: 'prev' | 'next' | 'current') => {
    // Sempre limpar filtros de data manual ao navegar entre meses
    setDateStart(null);
    setDateEnd(null);
    
    if (direction === 'current') {
      const now = new Date();
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear());
      return;
    }
    
    // Calcular novo mês e ano
    let newMonth = selectedMonth;
    let newYear = selectedYear;
    
    if (direction === 'prev') {
      newMonth--;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      }
    } else if (direction === 'next') {
      newMonth++;
      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
    }
    
    // Atualizar ambos os estados
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
  }, [selectedMonth, selectedYear]);

  // Calcular datas de início e fim do mês selecionado para o TransactionList
  const monthStartDate = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    return firstDay.toISOString().split('T')[0];
  }, [selectedYear, selectedMonth]);

  const monthEndDate = useMemo(() => {
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    return lastDay.toISOString().split('T')[0];
  }, [selectedYear, selectedMonth]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <PageHeader
            title="Gerais"
            icon={LayoutDashboard}
            onFilterChange={setFilter}
          />
        </div>

        {/* Seletor de Mês/Ano */}
        <div className="mb-6 bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/30 rounded-2xl shadow-lg border border-blue-100/50 dark:border-blue-900/50 p-5 backdrop-blur-sm relative overflow-hidden">
          {/* Efeito de brilho decorativo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
          
          <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleMonthChange('prev')}
                className="p-2.5 bg-white/80 dark:bg-gray-700/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-600 rounded-xl transition-all hover:scale-105 hover:shadow-md active:scale-95"
                aria-label="Mês anterior"
                title="Mês anterior"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-4 text-center min-w-[220px]">
                {/* Ícone SVG de Calendário Moderno */}
                <div className="flex-shrink-0 relative">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <svg 
                      className="w-7 h-7 text-white drop-shadow-sm" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Corpo do calendário */}
                      <rect 
                        x="4" 
                        y="5" 
                        width="16" 
                        height="16" 
                        rx="2.5" 
                        stroke="currentColor" 
                        strokeWidth="1.8" 
                        fill="none"
                      />
                      
                      {/* Linha divisória do cabeçalho */}
                      <path 
                        d="M4 11h16" 
                        stroke="currentColor" 
                        strokeWidth="1.8" 
                        strokeLinecap="round"
                      />
                      
                      {/* Anéis de encadernação */}
                      <path 
                        d="M8 2v3M16 2v3" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                      />
                      
                      {/* Pontos representando dias */}
                      <circle 
                        cx="8" 
                        cy="15.5" 
                        r="1.2" 
                        fill="currentColor"
                        opacity="0.9"
                      />
                      <circle 
                        cx="12" 
                        cy="15.5" 
                        r="1.2" 
                        fill="currentColor"
                        opacity="0.9"
                      />
                      <circle 
                        cx="16" 
                        cy="15.5" 
                        r="1.2" 
                        fill="currentColor"
                        opacity="0.9"
                      />
                      <circle 
                        cx="8" 
                        cy="19" 
                        r="1.2" 
                        fill="currentColor"
                        opacity="0.7"
                      />
                      <circle 
                        cx="12" 
                        cy="19" 
                        r="1.2" 
                        fill="currentColor"
                        opacity="0.7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {monthNames[selectedMonth]} {selectedYear}
                  </div>
                  {!isCurrentMonth && (
                    <button
                      onClick={() => handleMonthChange('current')}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-1.5 transition-colors flex items-center gap-1 group"
                    >
                      <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Voltar para mês atual
                    </button>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleMonthChange('next')}
                className="p-2.5 bg-white/80 dark:bg-gray-700/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-600 rounded-xl transition-all hover:scale-105 hover:shadow-md active:scale-95"
                aria-label="Próximo mês"
                title="Próximo mês"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {!isCurrentMonth && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Visualizando mês anterior
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Insight do Mês - apenas quando for o mês atual */}
        {isCurrentMonth && <MonthlyInsight />}

        {/* Cards de Resumo por Tipo */}
        <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Card Ganhos */}
            <PremiumCard
              title="Ganhos"
              value={totals.income}
              percentage={state.profile.monthlyIncome > 0 ? totals.incomePercentage : undefined}
              icon={Wallet}
              gradientFrom="from-green-600"
              gradientTo="to-green-700"
              onClick={() => setTypeFilter('income')}
              formatCurrency={formatCurrency}
            />

            {/* Card Despesas Fixas */}
            <PremiumCard
              title="Fixas"
              value={totals.expenseFixed}
              percentage={state.profile.monthlyIncome > 0 ? totals.expenseFixedPercentage : undefined}
              icon={Receipt}
              gradientFrom="from-red-600"
              gradientTo="to-red-700"
              onClick={() => setTypeFilter('expense_fixed')}
              formatCurrency={formatCurrency}
              showProgress={state.profile.monthlyIncome > 0}
              progressValue={totals.expenseFixedPercentage}
            />

            {/* Card Despesas Variáveis */}
            <PremiumCard
              title="Variáveis"
              value={totals.expenseVariable}
              percentage={state.profile.monthlyIncome > 0 ? totals.expenseVariablePercentage : undefined}
              icon={ShoppingCart}
              gradientFrom="from-orange-600"
              gradientTo="to-orange-700"
              onClick={() => setTypeFilter('expense_variable')}
              formatCurrency={formatCurrency}
              showProgress={state.profile.monthlyIncome > 0}
              progressValue={totals.expenseVariablePercentage}
            />

            {/* Card Dívidas */}
            <PremiumCard
              title="Dívidas"
              value={totals.debt}
              percentage={state.profile.monthlyIncome > 0 ? totals.debtPercentage : undefined}
              icon={LinkIcon}
              gradientFrom="from-red-700"
              gradientTo="to-red-800"
              onClick={() => setTypeFilter('debt')}
              formatCurrency={formatCurrency}
              showProgress={state.profile.monthlyIncome > 0}
              progressValue={totals.debtPercentage}
            />

            {/* Card Economias */}
            <div className="col-span-2 md:col-span-1">
              <PremiumCard
                title="Economias"
                value={totals.savings}
                percentage={state.profile.monthlyIncome > 0 ? totals.savingsPercentage : undefined}
                icon={PiggyBank}
                gradientFrom="from-blue-600"
                gradientTo="to-blue-700"
                onClick={() => setTypeFilter('savings')}
                formatCurrency={formatCurrency}
                showProgress={state.profile.monthlyIncome > 0}
                progressValue={totals.savingsPercentage}
              />
            </div>
          </div>
        </div>

        {/* Filtros Section - Design Moderno */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-blue-950/10 dark:to-gray-800 rounded-2xl shadow-lg border border-blue-100/50 dark:border-blue-900/30 p-5 sm:p-6 relative overflow-hidden">
            {/* Efeito de brilho decorativo */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            {/* Header da seção */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filtros</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Refine sua busca</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
              {/* Filtro por Tipo */}
              <div className="bg-white/80 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-600/50 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tipo
                  </label>
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all hover:border-gray-300 dark:hover:border-gray-500 font-medium"
                >
                  <option value="all">Todas</option>
                  <option value="income">Ganhos</option>
                  <option value="expense_fixed">Despesas Fixas</option>
                  <option value="expense_variable">Despesas Variáveis</option>
                  <option value="debt">Dívidas</option>
                  <option value="savings">Economias</option>
                </select>
              </div>

              {/* Filtro por Categoria */}
              <div className="bg-white/80 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-600/50 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Categoria
                  </label>
                </div>
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value || null)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-gray-300 dark:hover:border-gray-500 font-medium"
                >
                  <option value="">Todas as categorias</option>
                  {state.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categoryTotal !== null && selectedCategory && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">
                          Total em {selectedCategory.name}
                        </div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(categoryTotal)}
                        </div>
                      </div>
                      <div className="p-3 bg-blue-200/50 dark:bg-blue-900/30 rounded-lg">
                        <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filtro por Data */}
              <div className="lg:col-span-3">
                <DateFilter
                  pageKey="gerais"
                  onDateRangeChange={(start, end) => {
                    setDateStart(start);
                    setDateEnd(end);
                    // Quando limpar o filtro de data manual, não resetar o mês selecionado
                    // Apenas quando houver filtro ativo, manter o mês atual
                    if (start || end) {
                      // Manter o mês selecionado, não resetar
                    } else {
                      // Quando limpar o filtro, manter o mês selecionado
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico Section */}
        <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200 dark:border-gray-700">
          <PremiumContentCard
            title="Distribuição por Categoria"
            icon={PieChart}
            gradientFrom="from-purple-600"
            gradientTo="to-purple-700"
          >
            <CategoryPieChart
              transactions={filteredTransactions}
              categories={state.categories}
              type="all"
            />
          </PremiumContentCard>
        </div>

        {/* Lista de Transações Section */}
        <div>
          <PremiumContentCard
            title="Transações"
            icon={List}
            gradientFrom="from-indigo-600"
            gradientTo="to-indigo-700"
          >
            <TransactionList 
              type={typeFilter} 
              filter={filter}
              categoryId={categoryId}
              startDate={dateStart || monthStartDate}
              endDate={dateEnd || monthEndDate}
              showCategory={true} 
              columns={5} 
            />
          </PremiumContentCard>
        </div>
      </div>

      {/* Botões flutuantes */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-3 z-40">
        {/* Botão Balance */}
        <button
          onClick={() => setIsBalanceOpen(true)}
          className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl flex items-center justify-center text-xl font-semibold transition-all hover:scale-110 active:scale-95"
          aria-label="Ver carteira"
          title="Ver carteira e saldo"
        >
          💰
        </button>
        
        {/* Botão Microfone */}
        <button
          onClick={() => {
            setVoiceMode(true);
            setIsSheetOpen(true);
          }}
          className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95"
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
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-light transition-all hover:scale-110 active:scale-95"
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
      <BalanceModal isOpen={isBalanceOpen} onClose={() => setIsBalanceOpen(false)} />
    </div>
  );
}

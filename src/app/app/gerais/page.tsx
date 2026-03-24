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
import { getBankInfo } from '@/lib/bankColors';
import { getCurrentInvoice } from '@/lib/cardUtils';
import { LayoutDashboard, Wallet, Receipt, ShoppingCart, Link as LinkIcon, PiggyBank, PieChart, List, Filter, Tag, Calendar, Layers, Mic, Plus } from 'lucide-react';
import { PremiumCard } from '@/components/finance/PremiumCard';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { WalletCard } from '@/components/finance/WalletCard';
import { PWAInstallPrompt } from '@/components/finance/PWAInstallPrompt';
import { usePWAInstall } from '@/hooks/usePWAInstall';

type FilterType = 'all' | 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings';

export default function GeraisPage() {
  const { state, isInitialized } = useFinanceStore();
  const { shouldBlock, isChecking } = usePWAInstall();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

  // Calcular despesas totais para o gráfico
  const expenseTransactions = useMemo(() => {
    return filteredTransactions.filter((t) => 
      ['expense_fixed', 'expense_variable', 'debt'].includes(t.type)
    );
  }, [filteredTransactions]);

  // Calcular total de despesas
  const totalExpenses = useMemo(() => {
    return expenseTransactions.reduce((sum, t) => sum + t.value, 0);
  }, [expenseTransactions]);

  if (!isInitialized || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <PWAInstallPrompt />
      {shouldBlock ? (
        <div className="hidden" aria-hidden="true">
          {/* Conteúdo oculto quando PWA não está instalado */}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Banner Superior - Planejamento */}
        <div className="mb-6 rounded-2xl p-6 relative overflow-hidden bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/40 shadow-xl">
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Planejamento de {state.profile.name || 'Usuário'}
              </h1>
              <p className="text-sm text-white/70 mt-1.5 font-medium">
                {monthNames[selectedMonth]} {selectedYear}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMonthChange('prev')}
                className="p-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 bg-white/10 border border-white/20"
                aria-label="Mês anterior"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => handleMonthChange('next')}
                className="p-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 bg-white/10 border border-white/20"
                aria-label="Próximo mês"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Cards de Resumo Financeiro */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {/* Carteira */}
          <div className="col-span-2 md:col-span-1">
            <WalletCard />
          </div>

          {/* Ganhos */}
          <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden group cursor-pointer hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-emerald-500 to-green-600 border border-emerald-300/40 shadow-xl shadow-emerald-900/20">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                  <Wallet size={28} className="text-white" strokeWidth={2} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">Ganhos</h4>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {formatCurrency(totals.income)}
              </p>
            </div>
          </div>

          {/* Despesas Fixas */}
          <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden group cursor-pointer hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-rose-500 to-red-600 border border-rose-300/40 shadow-xl shadow-rose-900/20">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                  <Receipt size={28} className="text-white" strokeWidth={2} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">Fixas</h4>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {formatCurrency(totals.expenseFixed)}
              </p>
            </div>
          </div>

          {/* Despesas Variáveis */}
          <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden group cursor-pointer hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-300/40 shadow-xl shadow-orange-900/20">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                  <ShoppingCart size={28} className="text-white" strokeWidth={2} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">Variáveis</h4>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {formatCurrency(totals.expenseVariable)}
              </p>
            </div>
          </div>

          {/* Dívidas */}
          <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden group cursor-pointer hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-violet-500 to-purple-700 border border-violet-300/40 shadow-xl shadow-purple-900/20">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                  <LinkIcon size={28} className="text-white" strokeWidth={2} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">Dívidas</h4>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {formatCurrency(totals.debt)}
              </p>
            </div>
          </div>
        </div>

        {/* Layout Principal: Gráfico à Esquerda, Informações à Direita */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Coluna Esquerda: Gráfico de Pizza */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shadow-sm">
                    <PieChart size={28} className="text-blue-600" strokeWidth={2} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Despesas por categoria
                  </h2>
                </div>
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                  aria-label="Abrir filtros"
                >
                  <Filter className="w-4 h-4" strokeWidth={2.5} />
                  <span className="text-sm font-semibold">Filtros</span>
                </button>
              </div>
              <CategoryPieChart
                transactions={expenseTransactions}
                categories={state.categories}
                type="expense"
              />
            </div>

            {/* Lista de Transações */}
            <div className="rounded-3xl p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center shadow-sm">
                  <List size={28} className="text-indigo-600" strokeWidth={2} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Transações
                </h2>
              </div>
              <TransactionList 
                type={typeFilter} 
                filter={filter}
                categoryId={categoryId}
                startDate={dateStart || monthStartDate}
                endDate={dateEnd || monthEndDate}
                showCategory={true} 
                columns={5} 
              />
            </div>
          </div>

          {/* Coluna Direita: Cards de Bancos */}
          <div className="space-y-6">
            {/* Cards de Bancos */}
            <div className="rounded-3xl p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center shadow-sm">
                  <LayoutDashboard size={28} className="text-violet-600" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Cartões
                </h3>
              </div>
              {state.cards.length > 0 ? (
                <div className="space-y-3">
                  {state.cards.slice(0, 3).map((card) => {
                    const bankInfo = getBankInfo(card.name);
                    const currentInvoice = getCurrentInvoice(card, state.transactions);
                    
                    return (
                      <div
                        key={card.id}
                        className="p-4 rounded-xl shadow-md flex items-center gap-3"
                        style={{ backgroundColor: bankInfo.color }}
                      >
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          {bankInfo.logoPath ? (
                            <img
                              src={bankInfo.logoPath}
                              alt={bankInfo.name}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <span className="text-xl">{bankInfo.icon}</span>
                          )}
                        </div>
                        <div className="flex-1 text-white">
                          <p className="font-semibold text-sm">{bankInfo.name}</p>
                          <p className="text-xs opacity-90">{formatCurrency(currentInvoice.total)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Nenhum cartão cadastrado
                </p>
              )}
            </div>
          </div>
        </div>

        </div>
      )}

      {/* Botões flutuantes */}
      {!shouldBlock && (
        <>
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-3 z-40">
            {/* Botão Balance */}
            <button
              onClick={() => setIsBalanceOpen(true)}
              className="fab-blue w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold text-white"
              aria-label="Ver carteira"
              title="Ver carteira e saldo"
            >
              <Wallet size={22} strokeWidth={2.5} className="text-white" />
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
            
            {/* Botão Adicionar - Principal */}
            <button
              onClick={() => {
                setVoiceMode(false);
                setIsSheetOpen(true);
              }}
              className="fab-blue w-16 h-16 rounded-full flex items-center justify-center text-3xl font-light text-white"
              aria-label="Adicionar transação"
              title="Adicionar transação manualmente"
            >
              <Plus size={28} strokeWidth={2.5} className="text-white" />
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

          {/* Modal de Filtros */}
          {isFilterOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsFilterOpen(false)}>
              <div className="glassmorphism-strong rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400/30 to-indigo-600/30 flex items-center justify-center neomorphic">
                      <Filter className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Filtros por categoria
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 glassmorphism rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                    aria-label="Fechar filtros"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6 space-y-6 bg-white rounded-b-3xl">
                  {/* Filtro por Período */}
                  <div>
                    <DateFilter
                      pageKey="gerais"
                      onDateRangeChange={(start, end) => {
                        setDateStart(start);
                        setDateEnd(end);
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Filtro por Tipo */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400/30 to-indigo-600/30 flex items-center justify-center neomorphic">
                          <Layers className="w-4 h-4 text-white" />
                        </div>
                        <label className="text-sm font-semibold text-gray-700">
                          Tipo
                        </label>
                      </div>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400/30 to-blue-600/30 flex items-center justify-center neomorphic">
                          <Tag className="w-4 h-4 text-white" />
                        </div>
                        <label className="text-sm font-semibold text-gray-700">
                          Categoria
                        </label>
                      </div>
                      <select
                        value={categoryId || ''}
                        onChange={(e) => setCategoryId(e.target.value || null)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      >
                        <option value="">Todas as categorias</option>
                        {state.categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Total da categoria selecionada */}
                  {categoryTotal !== null && selectedCategory && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                            Total em {selectedCategory.name}
                          </div>
                          <div className="text-xl font-bold text-blue-600">
                            {formatCurrency(categoryTotal)}
                          </div>
                        </div>
                        <div className="p-2 bg-blue-200/50 rounded-lg">
                          <Tag className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

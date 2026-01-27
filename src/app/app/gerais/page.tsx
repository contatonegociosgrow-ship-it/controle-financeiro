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
import { LayoutDashboard, Wallet, Receipt, ShoppingCart, Link as LinkIcon, PiggyBank, PieChart, List } from 'lucide-react';
import { PremiumCard } from '@/components/finance/PremiumCard';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';

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
    const monthlyIncome = state.profile.monthlyIncome || 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const income = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'income' &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);
    
    const expenseFixed = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'expense_fixed' &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);
    
    const expenseVariable = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'expense_variable' &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);
    
    const debt = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'debt' &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);
    
    const savings = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'savings' &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
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
  }, [state.transactions, state.profile.monthlyIncome]);

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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <PageHeader
            title="Gerais"
            icon={LayoutDashboard}
            onFilterChange={setFilter}
          />
        </div>

        {/* Insight do Mês */}
        <MonthlyInsight />

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

        {/* Filtros Section */}
        <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
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
              startDate={dateStart}
              endDate={dateEnd}
              showCategory={true} 
              columns={5} 
            />
          </PremiumContentCard>
        </div>
      </div>

      {/* Botões flutuantes */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 sm:gap-3 z-40">
        {/* Botão Balance */}
        <button
          onClick={() => setIsBalanceOpen(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl flex items-center justify-center text-lg sm:text-xl font-semibold transition-all hover:scale-110"
          aria-label="Ver carteira"
          title="Ver carteira e saldo"
        >
          💰
        </button>
        
        {/* Botão Adicionar */}
        <button
          onClick={() => setIsSheetOpen(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl sm:text-3xl font-light transition-all hover:scale-110"
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

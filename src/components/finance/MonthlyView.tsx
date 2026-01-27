'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { CardUI } from './CardUI';
import { PremiumContentCard } from './PremiumContentCard';
import { CategoryPieChart } from './PieChart';
import { BarChart, HorizontalBarChart } from './BarChart';
import { PieChart as PieChartIcon, BarChart3, TrendingUp } from 'lucide-react';

type MonthlyViewProps = {
  year: number;
  month: number; // 0-11 (0 = Janeiro)
};

export function MonthlyView({ year, month }: MonthlyViewProps) {
  const { state } = useFinanceStore();

  const monthTransactions = useMemo(() => {
    return state.transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getFullYear() === year &&
        transactionDate.getMonth() === month
      );
    });
  }, [state.transactions, year, month]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getCategoryName = (id: string) => {
    return state.categories.find((c) => c.id === id)?.name || 'Sem categoria';
  };

  // Agrupar por categoria
  const byCategory = useMemo(() => {
    const grouped: Record<string, { transactions: typeof monthTransactions; total: number }> = {};
    
    monthTransactions.forEach((t) => {
      const categoryName = getCategoryName(t.categoryId);
      if (!grouped[categoryName]) {
        grouped[categoryName] = { transactions: [], total: 0 };
      }
      grouped[categoryName].transactions.push(t);
      grouped[categoryName].total += t.value;
    });

    return Object.entries(grouped).sort((a, b) => b[1].total - a[1].total);
  }, [monthTransactions]);

  // Agrupar por tipo
  const byType = useMemo(() => {
    const grouped: Record<string, { transactions: typeof monthTransactions; total: number }> = {};
    
    monthTransactions.forEach((t) => {
      const typeLabels: Record<string, string> = {
        income: 'Ganhos',
        expense_fixed: 'Despesas Fixas',
        expense_variable: 'Despesas Variáveis',
        debt: 'Dívidas',
        savings: 'Economias',
      };
      const typeLabel = typeLabels[t.type] || t.type;
      
      if (!grouped[typeLabel]) {
        grouped[typeLabel] = { transactions: [], total: 0 };
      }
      grouped[typeLabel].transactions.push(t);
      grouped[typeLabel].total += t.value;
    });

    return Object.entries(grouped).sort((a, b) => b[1].total - a[1].total);
  }, [monthTransactions]);

  // Agrupar por dia
  const byDay = useMemo(() => {
    const grouped: Record<string, { income: number; expenses: number }> = {};
    
    monthTransactions.forEach((t) => {
      const dayKey = t.date;
      if (!grouped[dayKey]) {
        grouped[dayKey] = { income: 0, expenses: 0 };
      }
      
      if (t.type === 'income') {
        grouped[dayKey].income += t.value;
      } else if (['expense_fixed', 'expense_variable', 'debt'].includes(t.type)) {
        grouped[dayKey].expenses += t.value;
      }
    });

    return Object.entries(grouped)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, data]) => ({
        date,
        ...data,
        net: data.income - data.expenses,
      }));
  }, [monthTransactions]);

  // Totais gerais
  const totals = useMemo(() => {
    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);
    
    const expenses = monthTransactions
      .filter((t) => ['expense_fixed', 'expense_variable', 'debt'].includes(t.type))
      .reduce((sum, t) => sum + t.value, 0);
    
    const savings = monthTransactions
      .filter((t) => t.type === 'savings')
      .reduce((sum, t) => sum + t.value, 0);

    return { income, expenses, savings, balance: income - expenses - savings };
  }, [monthTransactions]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (monthTransactions.length === 0) {
    return (
      <CardUI className="shadow-md">
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">Nenhuma transação encontrada</p>
          <p className="text-sm">para {monthNames[month]} de {year}</p>
        </div>
      </CardUI>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <CardUI className="shadow-md">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-900">
            Resumo de {monthNames[month]} de {year}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-700 font-medium mb-1">Ganhos</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.income)}</div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-sm text-red-700 font-medium mb-1">Despesas</div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totals.expenses)}</div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700 font-medium mb-1">Economias</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totals.savings)}</div>
          </div>
          
          <div className={`p-4 rounded-lg border ${
            totals.balance >= 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`text-sm font-medium mb-1 ${
              totals.balance >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              Saldo
            </div>
            <div className={`text-2xl font-bold ${
              totals.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totals.balance)}
            </div>
          </div>
        </div>
      </CardUI>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza por Categoria */}
        <PremiumContentCard
          title="Distribuição por Categoria"
          icon={PieChartIcon}
          gradientFrom="from-pink-600"
          gradientTo="to-pink-700"
        >
          <CategoryPieChart
            transactions={monthTransactions}
            categories={state.categories}
            type="all"
          />
        </PremiumContentCard>

        {/* Gráfico de Barras por Tipo */}
        <PremiumContentCard
          title="Por Tipo de Transação"
          icon={BarChart3}
          gradientFrom="from-indigo-600"
          gradientTo="to-indigo-700"
        >
          <BarChart
            data={byType.map(([type, data]) => {
              const isIncome = type === 'Ganhos';
              const isExpense = ['Despesas Fixas', 'Despesas Variáveis', 'Dívidas'].includes(type);
              return {
                label: type.length > 8 ? type.substring(0, 8) + '...' : type,
                value: data.total,
                color: isIncome ? '#22c55e' : isExpense ? '#ef4444' : '#3b82f6',
              };
            })}
            height={200}
            formatValue={formatCurrency}
          />
        </PremiumContentCard>
      </div>

      {/* Gráfico de Barras por Dia */}
      {byDay.length > 0 && (
        <PremiumContentCard
          title="Evolução Diária"
          icon={TrendingUp}
          gradientFrom="from-teal-600"
          gradientTo="to-teal-700"
        >
          <div className="mb-4">
            <BarChart
              data={byDay.map((day) => ({
                label: formatDate(day.date).split('/')[0],
                value: Math.abs(day.net),
                color: day.net >= 0 ? '#22c55e' : '#ef4444',
              }))}
              height={200}
              formatValue={formatCurrency}
            />
          </div>
          <div className="flex gap-4 justify-center text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Saldo Positivo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Saldo Negativo</span>
            </div>
          </div>
        </PremiumContentCard>
      )}

      {/* Gráfico de Barras Horizontal por Categoria */}
      <PremiumContentCard
        title="Top Categorias (Despesas)"
        icon={TrendingUp}
        gradientFrom="from-amber-600"
        gradientTo="to-amber-700"
      >
        <HorizontalBarChart
          data={byCategory
            .filter(([_, data]) => {
              const expensesOnly = data.transactions.filter((t) => 
                ['expense_fixed', 'expense_variable', 'debt'].includes(t.type)
              );
              return expensesOnly.length > 0;
            })
            .map(([category, data]) => {
              const expensesOnly = data.transactions.filter((t) => 
                ['expense_fixed', 'expense_variable', 'debt'].includes(t.type)
              );
              const totalExpenses = expensesOnly.reduce((sum, t) => sum + t.value, 0);
              return {
                label: category,
                value: totalExpenses,
                color: '#ef4444',
              };
            })}
          formatValue={formatCurrency}
          maxBars={8}
        />
      </PremiumContentCard>

      {/* Por Tipo */}
      <CardUI className="shadow-md">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
          <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-900">Por Tipo de Transação</h3>
        </div>
        
        <div className="space-y-4">
          {byType.map(([type, data]) => {
            const isIncome = type === 'Ganhos';
            const isExpense = ['Despesas Fixas', 'Despesas Variáveis', 'Dívidas'].includes(type);
            
            return (
              <div key={type} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{type}</h4>
                  <span className={`text-xl font-bold ${
                    isIncome ? 'text-green-600' : isExpense ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {formatCurrency(data.total)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {data.transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {t.notes || getCategoryName(t.categoryId)}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {formatDate(t.date)}
                          {t.personId && (
                            <> • {state.people.find((p) => p.id === t.personId)?.name}</>
                          )}
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        isIncome ? 'text-green-600' : isExpense ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {isIncome ? '+' : '-'}{formatCurrency(t.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardUI>

      {/* Por Categoria */}
      <CardUI className="shadow-md">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
          <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-900">Por Categoria</h3>
        </div>
        
        <div className="space-y-4">
          {byCategory.map(([category, data]) => {
            const expensesOnly = data.transactions.filter((t) => 
              ['expense_fixed', 'expense_variable', 'debt'].includes(t.type)
            );
            const totalExpenses = expensesOnly.reduce((sum, t) => sum + t.value, 0);
            
            return (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{category}</h4>
                  <span className="text-xl font-bold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {expensesOnly.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {t.notes || category}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {formatDate(t.date)}
                          {t.personId && (
                            <> • {state.people.find((p) => p.id === t.personId)?.name}</>
                          )}
                        </div>
                      </div>
                      <div className="font-semibold text-red-600">
                        -{formatCurrency(t.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardUI>

      {/* Lista Completa Cronológica */}
      <CardUI className="shadow-md">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
          <div className="w-1 h-6 bg-gray-600 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-900">Todas as Transações (Cronológica)</h3>
        </div>
        
        <div className="space-y-2">
          {monthTransactions
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((t) => {
              const isIncome = t.type === 'income';
              const isExpense = ['expense_fixed', 'expense_variable', 'debt'].includes(t.type);
              const isSavings = t.type === 'savings';
              
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {t.notes || getCategoryName(t.categoryId)}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                        {getCategoryName(t.categoryId)}
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {formatDate(t.date)}
                      {t.personId && (
                        <> • {state.people.find((p) => p.id === t.personId)?.name}</>
                      )}
                      {t.notes && <> • {t.notes}</>}
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    isIncome ? 'text-green-600' : isExpense ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {isIncome ? '+' : '-'}{formatCurrency(t.value)}
                  </div>
                </div>
              );
            })}
        </div>
      </CardUI>
    </div>
  );
}

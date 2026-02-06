'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { calculateFinancialHealth } from '@/lib/financialHealthUtils';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { PremiumCard } from '@/components/finance/PremiumCard';
import { PageHeader } from '@/components/finance/PageHeader';
import { User, UserCircle, HeartPulse, FolderOpen, Download, CheckCircle2, AlertTriangle, XCircle, TrendingUp, Receipt } from 'lucide-react';
import { BalanceModal } from '@/components/finance/BalanceModal';
import { GoalCard } from '@/components/finance/GoalCard';
import { DataExportImport } from '@/components/finance/DataExportImport';
import { AddCategorySheet } from '@/components/finance/AddCategorySheet';
import { AddRecurringExpenseSheet } from '@/components/finance/AddRecurringExpenseSheet';
import { AccordionItem } from '@/components/finance/AccordionItem';
import { getCategoryColor } from '@/lib/categoryColors';

export default function PerfilPage() {
  const { state, isInitialized, setProfile, setMonthlyIncome, removeCategory, updateRecurringExpense, removeRecurringExpense } = useFinanceStore();
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [incomeValue, setIncomeValue] = useState('');
  const [walletValue, setWalletValue] = useState('');
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>(undefined);
  const [isRecurringExpenseSheetOpen, setIsRecurringExpenseSheetOpen] = useState(false);
  const [editingRecurringExpenseId, setEditingRecurringExpenseId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const healthData = calculateFinancialHealth(state);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return CheckCircle2;
      case 'good':
        return CheckCircle2;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return XCircle;
      default:
        return TrendingUp;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Boa';
      case 'warning':
        return 'Atenção';
      case 'critical':
        return 'Crítica';
      default:
        return 'Indefinida';
    }
  };

  const handleSaveName = () => {
    if (nameValue.trim()) {
      setProfile({ ...state.profile, name: nameValue.trim() });
      setIsEditingName(false);
      setNameValue('');
    }
  };

  const handleSaveIncome = () => {
    const value = parseFloat(incomeValue);
    if (!isNaN(value) && value >= 0) {
      setMonthlyIncome(value);
      setIsEditingIncome(false);
      setIncomeValue('');
    }
  };

  const handleSaveWallet = () => {
    const value = parseFloat(walletValue);
    if (!isNaN(value)) {
      setProfile({ ...state.profile, wallet: value });
      setIsEditingWallet(false);
      setWalletValue('');
    }
  };

  const activeGoals = state.goals.filter((g) => g.status === 'active');

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
        <PageHeader title="Meu Perfil" icon={User} />

        <div className="space-y-4">
          {/* Informações Pessoais */}
          <AccordionItem
            title="Informações Pessoais"
            icon={UserCircle}
            gradientFrom="from-blue-600"
            gradientTo="to-blue-700"
            defaultOpen={true}
          >
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') {
                          setIsEditingName(false);
                          setNameValue('');
                        }
                      }}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Seu nome"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-sm"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setNameValue('');
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-lg text-gray-900">
                      {state.profile.name || 'Não informado'}
                    </p>
                    <button
                      onClick={() => {
                        setNameValue(state.profile.name || '');
                        setIsEditingName(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>

              {/* Salário Mensal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Salário Mensal
                </label>
                {isEditingIncome ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={incomeValue}
                      onChange={(e) => setIncomeValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveIncome();
                        if (e.key === 'Escape') {
                          setIsEditingIncome(false);
                          setIncomeValue('');
                        }
                      }}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="0,00"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveIncome}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-sm"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingIncome(false);
                        setIncomeValue('');
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(state.profile.monthlyIncome)}
                    </p>
                    <button
                      onClick={() => {
                        setIncomeValue(state.profile.monthlyIncome.toString());
                        setIsEditingIncome(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>

              {/* Carteira Inicial */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Carteira Inicial
                </label>
                {isEditingWallet ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={walletValue}
                      onChange={(e) => setWalletValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveWallet();
                        if (e.key === 'Escape') {
                          setIsEditingWallet(false);
                          setWalletValue('');
                        }
                      }}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="0,00"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveWallet}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-sm"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingWallet(false);
                        setWalletValue('');
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(state.profile.wallet || 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Valor inicial da sua carteira
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setWalletValue((state.profile.wallet || 0).toString());
                        setIsEditingWallet(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </AccordionItem>

          {/* Saúde Financeira */}
          <AccordionItem
            title="Saúde Financeira"
            icon={HeartPulse}
            gradientFrom={healthData.status === 'excellent' ? 'from-green-600' : healthData.status === 'good' ? 'from-blue-600' : healthData.status === 'warning' ? 'from-yellow-600' : 'from-red-600'}
            gradientTo={healthData.status === 'excellent' ? 'to-green-700' : healthData.status === 'good' ? 'to-blue-700' : healthData.status === 'warning' ? 'to-yellow-700' : 'to-red-700'}
            defaultOpen={true}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const StatusIcon = getStatusIcon(healthData.status);
                  return <StatusIcon size={24} strokeWidth={2} className="text-gray-700 dark:text-gray-300" />;
                })()}
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{getStatusLabel(healthData.status)}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">• Score: {healthData.score}/100</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{healthData.message}</p>

              {/* Barra de progresso do score */}
              <div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      healthData.status === 'excellent' ? 'bg-green-500' : 
                      healthData.status === 'good' ? 'bg-blue-500' : 
                      healthData.status === 'warning' ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${healthData.score}%` }}
                  />
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Comprometido</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(healthData.totalCommitted)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {healthData.expensePercentage.toFixed(1)}% do salário
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Disponível</p>
                  <p className={`text-lg font-bold ${healthData.availableMoney >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(healthData.availableMoney)}
                  </p>
                </div>
              </div>

              {/* Recomendações */}
              {healthData.recommendations.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recomendações</h4>
                  <ul className="space-y-1">
                    {healthData.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span>•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botão Balance */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsBalanceOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Ver Saldo Detalhado
                </button>
              </div>
            </div>
          </AccordionItem>

          {/* Metas */}
          <AccordionItem
            title={activeGoals.length > 0 ? `Metas Ativas (${activeGoals.length})` : 'Metas'}
            icon={HeartPulse}
            gradientFrom="from-pink-600"
            gradientTo="to-pink-700"
          >
            {activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Crie metas financeiras para acompanhar seus objetivos</p>
              </div>
            )}
          </AccordionItem>

          {/* Gerenciar Categorias */}
          <AccordionItem
            title={`Categorias (${state.categories.length})`}
            icon={FolderOpen}
            gradientFrom="from-purple-600"
            gradientTo="to-purple-700"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  setEditingCategoryId(undefined);
                  setIsCategorySheetOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-sm shadow-sm hover:shadow-md"
              >
                + Nova Categoria
              </button>
            </div>

            {state.categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Nenhuma categoria cadastrada</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Crie categorias para organizar suas transações
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {state.categories.map((category) => {
                  const categoryColor = getCategoryColor(category);
                  const transactionsCount = state.transactions.filter(
                    (t) => t.categoryId === category.id
                  ).length;
                  
                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: categoryColor }}
                        >
                          <span className="text-sm">📁</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {category.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {transactionsCount} {transactionsCount === 1 ? 'transação' : 'transações'}
                            {category.limit && ` • Limite: ${formatCurrency(category.limit)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        <button
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setIsCategorySheetOpen(true);
                          }}
                          className="min-h-[44px] px-4 py-2.5 md:px-3 md:py-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/30 font-semibold rounded-lg transition-all text-sm touch-manipulation"
                          title="Editar categoria"
                          aria-label="Editar categoria"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Tem certeza que deseja excluir a categoria "${category.name}"?\n\n${
                              transactionsCount > 0
                                ? `ATENÇÃO: Esta categoria está sendo usada em ${transactionsCount} ${
                                    transactionsCount === 1 ? 'transação' : 'transações'
                                  }. As transações serão mantidas, mas ficarão sem categoria.`
                                : ''
                            }`
                              )
                            ) {
                              removeCategory(category.id);
                            }
                          }}
                          className="min-h-[44px] px-4 py-2.5 md:px-3 md:py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 font-semibold rounded-lg transition-all text-sm touch-manipulation"
                          title="Excluir categoria"
                          aria-label="Excluir categoria"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionItem>

          {/* Despesas Recorrentes */}
          <AccordionItem
            title={`Despesas Fixas Recorrentes (${state.recurringExpenses.length})`}
            icon={Receipt}
            gradientFrom="from-orange-600"
            gradientTo="to-orange-700"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure despesas que serão criadas automaticamente todo mês
              </p>
              <button
                onClick={() => {
                  setEditingRecurringExpenseId(null);
                  setIsRecurringExpenseSheetOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-sm shadow-sm hover:shadow-md"
              >
                + Nova Despesa Recorrente
              </button>
            </div>

            {state.recurringExpenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Nenhuma despesa recorrente cadastrada</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Configure despesas fixas que aparecerão automaticamente todo mês
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {state.recurringExpenses.map((expense) => {
                  const category = state.categories.find((c) => c.id === expense.categoryId);
                  const categoryName = category?.name || 'Sem categoria';
                  
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {expense.name}
                            </p>
                            {!expense.isActive && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                Inativa
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {categoryName} • Vence no dia {expense.dueDay} • {formatCurrency(expense.value)}
                          </p>
                          {expense.notes && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {expense.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            updateRecurringExpense(expense.id, { isActive: !expense.isActive });
                          }}
                          className={`min-h-[44px] px-4 py-2.5 md:px-3 md:py-1.5 font-semibold rounded-lg transition-all text-sm touch-manipulation ${
                            expense.isActive
                              ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={expense.isActive ? 'Desativar' : 'Ativar'}
                        >
                          {expense.isActive ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingRecurringExpenseId(expense.id);
                            setIsRecurringExpenseSheetOpen(true);
                          }}
                          className="min-h-[44px] px-4 py-2.5 md:px-3 md:py-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/30 font-semibold rounded-lg transition-all text-sm touch-manipulation"
                          title="Editar despesa recorrente"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Tem certeza que deseja excluir a despesa recorrente "${expense.name}"?`
                              )
                            ) {
                              removeRecurringExpense(expense.id);
                            }
                          }}
                          className="min-h-[44px] px-4 py-2.5 md:px-3 md:py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 font-semibold rounded-lg transition-all text-sm touch-manipulation"
                          title="Excluir despesa recorrente"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionItem>

          {/* Exportar/Importar Dados */}
          <AccordionItem
            title="Exportar/Importar Dados"
            icon={Download}
            gradientFrom="from-teal-600"
            gradientTo="to-teal-700"
          >
            <DataExportImport />
          </AccordionItem>
        </div>
      </div>

      <BalanceModal isOpen={isBalanceOpen} onClose={() => setIsBalanceOpen(false)} />
      <AddCategorySheet
        isOpen={isCategorySheetOpen}
        onClose={() => {
          setIsCategorySheetOpen(false);
          setEditingCategoryId(undefined);
        }}
        categoryId={editingCategoryId}
      />
      <AddRecurringExpenseSheet
        isOpen={isRecurringExpenseSheetOpen}
        onClose={() => {
          setIsRecurringExpenseSheetOpen(false);
          setEditingRecurringExpenseId(null);
        }}
        editingId={editingRecurringExpenseId}
      />
    </div>
  );
}

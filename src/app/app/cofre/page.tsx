'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { PremiumCard } from '@/components/finance/PremiumCard';
import { PageHeader } from '@/components/finance/PageHeader';
import { Lock, DollarSign, Target, Calendar, Plus, Edit, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { AddVaultSheet } from '@/components/finance/AddVaultSheet';
import { VaultDepositWithdrawSheet } from '@/components/finance/VaultDepositWithdrawSheet';

export default function CofrePage() {
  const { isInitialized, state, removeVault } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDepositSheetOpen, setIsDepositSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const [depositMode, setDepositMode] = useState<'deposit' | 'withdraw'>('deposit');
  
  // Estado para controlar o mês/ano visualizado
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const now = new Date();
    return now.getMonth();
  });
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const now = new Date();
    return now.getFullYear();
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  // Calcular depósitos do mês selecionado
  const monthlyDeposits = useMemo(() => {
    const vaultCategory = state.categories.find(c => c.name === '🔐 Cofre');
    if (!vaultCategory) return 0;

    return state.transactions
      .filter((t) => {
        // Comparar diretamente pela string ISO (YYYY-MM-DD) para evitar problemas de fuso horário
        if (!t.date || !t.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return false;
        }
        const [year, month] = t.date.split('-');
        return (
          t.type === 'savings' &&
          t.categoryId === vaultCategory.id &&
          parseInt(month, 10) === selectedMonth + 1 && // month é 0-indexed, mas ISO é 1-indexed
          parseInt(year, 10) === selectedYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);
  }, [state.transactions, state.categories, selectedMonth, selectedYear]);

  // Calcular totais
  const totals = useMemo(() => {
    const totalInVaults = state.vaults.reduce((sum, vault) => sum + vault.currentValue, 0);
    const activeVaults = state.vaults.length;

    return {
      totalInVaults,
      activeVaults,
      monthlyDeposits,
    };
  }, [state.vaults, monthlyDeposits]);

  // Função para navegar entre meses
  const handleMonthChange = (direction: 'prev' | 'next' | 'current') => {
    if (direction === 'current') {
      const now = new Date();
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear());
      return;
    }
    
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

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cofre? O valor será perdido.')) {
      removeVault(id);
    }
  };

  const handleDeposit = (id: string) => {
    setSelectedVaultId(id);
    setDepositMode('deposit');
    setIsDepositSheetOpen(true);
  };

  const handleWithdraw = (id: string) => {
    setSelectedVaultId(id);
    setDepositMode('withdraw');
    setIsDepositSheetOpen(true);
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
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <PageHeader
            title="🔐 Cofre"
            icon={Lock}
            onFilterChange={() => {}}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Dinheiro separado para te dar segurança
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">
            🔐 Dinheiro no cofre não é gasto, é proteção
          </p>
        </div>

        {/* Seletor de Mês/Ano */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleMonthChange('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Mês anterior"
                title="Mês anterior"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-center min-w-[200px]">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {monthNames[selectedMonth]} {selectedYear}
                </div>
                {!isCurrentMonth && (
                  <button
                    onClick={() => handleMonthChange('current')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                  >
                    Voltar para mês atual
                  </button>
                )}
              </div>
              
              <button
                onClick={() => handleMonthChange('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Próximo mês"
                title="Próximo mês"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {!isCurrentMonth && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Visualizando mês anterior
              </div>
            )}
          </div>
        </div>

        {/* Cards principais */}
        <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total no Cofre */}
            <PremiumCard
              title="💰 Total no Cofre"
              value={totals.totalInVaults}
              icon={DollarSign}
              gradientFrom="from-amber-600"
              gradientTo="to-amber-700"
              formatCurrency={formatCurrency}
            />

            {/* Objetivos Ativos */}
            <PremiumCard
              title="🎯 Objetivos Ativos"
              value={totals.activeVaults}
              icon={Target}
              gradientFrom="from-purple-600"
              gradientTo="to-purple-700"
              formatCurrency={(v) => `${v} ${v === 1 ? 'cofre' : 'cofres'}`}
            />

            {/* Depósitos do Mês */}
            <PremiumCard
              title="📅 Depósitos do Mês"
              value={totals.monthlyDeposits}
              icon={Calendar}
              gradientFrom="from-blue-600"
              gradientTo="to-blue-700"
              formatCurrency={formatCurrency}
            />
          </div>
        </div>

        {/* Lista de Cofres */}
        <div>
          <PremiumContentCard
            title="Meus Cofres"
            icon={Lock}
            gradientFrom="from-indigo-600"
            gradientTo="to-indigo-700"
          >
            {state.vaults.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Lock size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Nenhum cofre criado</p>
                <p className="text-sm">Comece criando seu primeiro cofre</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.vaults.map((vault) => {
                  const progress = vault.targetValue && vault.targetValue > 0
                    ? Math.min((vault.currentValue / vault.targetValue) * 100, 100)
                    : 0;

                  return (
                    <div
                      key={vault.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg transition-shadow"
                    >
                      {/* Header do Cofre */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{vault.emoji}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {vault.name}
                            </h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                              {formatCurrency(vault.currentValue)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(vault.id)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(vault.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Meta e Progresso */}
                      {vault.targetValue && vault.targetValue > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-gray-400">Meta:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(vault.targetValue)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                            {progress.toFixed(1)}% concluído
                          </p>
                        </div>
                      )}

                      {/* Botões de Ação */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleDeposit(vault.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-semibold"
                        >
                          <ArrowDownCircle size={16} />
                          Depositar
                        </button>
                        <button
                          onClick={() => handleWithdraw(vault.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold"
                          disabled={vault.currentValue === 0}
                        >
                          <ArrowUpCircle size={16} />
                          Retirar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PremiumContentCard>
        </div>
      </div>

      {/* Botão flutuante */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => {
            setEditingId(null);
            setIsSheetOpen(true);
          }}
          className="w-14 h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-light transition-all hover:scale-110"
          aria-label="Criar cofre"
        >
          <Plus size={28} />
        </button>
      </div>

      <AddVaultSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingId(null);
        }}
        editingId={editingId}
      />

      <VaultDepositWithdrawSheet
        isOpen={isDepositSheetOpen}
        onClose={() => {
          setIsDepositSheetOpen(false);
          setSelectedVaultId(null);
        }}
        vaultId={selectedVaultId}
        mode={depositMode}
      />
    </div>
  );
}

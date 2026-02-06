'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PageHeader } from '@/components/finance/PageHeader';
import { CardUI } from '@/components/finance/CardUI';
import { PremiumCard } from '@/components/finance/PremiumCard';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { BankLogo } from '@/components/finance/BankLogo';
import { AddCardSheet } from '@/components/finance/AddCardSheet';
import { getCurrentInvoice, getAvailableLimit } from '@/lib/cardUtils';
import { getBankInfo } from '@/lib/bankColors';
import { getSalaryPercentage, getSalaryStatus, getStatusColor } from '@/lib/salaryUtils';
import { AnimatedCounter } from '@/components/finance/AnimatedCounter';
import { CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function CartoesPage() {
  const { state, isInitialized, removeCard } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const cardsWithInvoice = useMemo(() => {
    const monthlyIncome = state.profile.monthlyIncome || 0;
    
    return state.cards.map((card) => {
      const currentInvoice = getCurrentInvoice(card, state.transactions);
      const availableLimit = getAvailableLimit(card, state.transactions);
      const usagePercentage = card.limit > 0 ? (currentInvoice.total / card.limit) * 100 : 0;
      
      // Calcular percentual do salário comprometido pela fatura
      const salaryPercentage = getSalaryPercentage(currentInvoice.total, monthlyIncome);
      const salaryStatus = getSalaryStatus(salaryPercentage);
      
      // Calcular melhor dia para comprar (dia após o fechamento)
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      let bestPurchaseDay = card.closingDay + 1;
      let bestPurchaseDate = new Date(currentYear, currentMonth, bestPurchaseDay);
      
      // Se já passou do melhor dia, calcular para o próximo mês
      if (currentDay > bestPurchaseDay) {
        bestPurchaseDate = new Date(currentYear, currentMonth + 1, bestPurchaseDay);
      }
      
      // Se o melhor dia ultrapassar o último dia do mês, usar o último dia
      const lastDayOfMonth = new Date(bestPurchaseDate.getFullYear(), bestPurchaseDate.getMonth() + 1, 0).getDate();
      if (bestPurchaseDay > lastDayOfMonth) {
        bestPurchaseDay = lastDayOfMonth;
        bestPurchaseDate = new Date(bestPurchaseDate.getFullYear(), bestPurchaseDate.getMonth(), bestPurchaseDay);
      }

      return {
        card,
        currentInvoice,
        availableLimit,
        usagePercentage,
        salaryPercentage,
        salaryStatus,
        bestPurchaseDay,
        bestPurchaseDate,
      };
    });
  }, [state.cards, state.transactions, state.profile.monthlyIncome]);

  const totalCurrentInvoice = useMemo(() => {
    return cardsWithInvoice.reduce((sum, item) => sum + item.currentInvoice.total, 0);
  }, [cardsWithInvoice]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <PageHeader title="Cartões de Crédito" icon={CreditCard} hideSearch />

        {/* Resumo Total */}
        <div className="mb-8">
          <PremiumCard
            title="Total da Fatura Atual"
            icon={CreditCard}
            value={totalCurrentInvoice}
            gradientFrom="from-purple-600"
            gradientTo="to-purple-700"
            formatCurrency={formatCurrency}
          />
        </div>

        {/* Lista de Cartões */}
        <div className="space-y-4">
          {cardsWithInvoice.length === 0 ? (
            <PremiumContentCard
              title="Nenhum cartão cadastrado"
              icon={CreditCard}
              gradientFrom="from-gray-600"
              gradientTo="to-gray-700"
            >
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Comece adicionando seu primeiro cartão de crédito
                </p>
                <button
                  onClick={() => setIsSheetOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
                >
                  Adicionar Primeiro Cartão
                </button>
              </div>
            </PremiumContentCard>
          ) : (
            cardsWithInvoice.map(({ card, currentInvoice, availableLimit, usagePercentage, salaryPercentage, salaryStatus, bestPurchaseDay, bestPurchaseDate }) => {
              const bankInfo = getBankInfo(card.name);
              
              return (
                <Link key={card.id} href={`/app/cartoes/${card.id}`}>
                  <CardUI className="shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden relative">
                    {/* Barra de cor do banco */}
                    <div
                      className="absolute top-0 left-0 right-0 h-2"
                      style={{ backgroundColor: bankInfo.color }}
                    />
                    
                    <div className="flex items-start justify-between mb-4 pt-2">
                      <div className="flex items-center gap-3">
                        {/* Logo do banco */}
                        <BankLogo bankName={card.name} size={48} />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {card.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Fatura atual: {formatCurrency(currentInvoice.total)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Limite</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(card.limit)}
                        </p>
                      </div>
                    </div>

                  {/* Barra de uso do limite */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Disponível: {formatCurrency(availableLimit)}</span>
                      <span>{usagePercentage.toFixed(1)}% usado</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePercentage >= 90
                            ? 'bg-red-500'
                            : usagePercentage >= 70
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                    {/* Impacto no salário */}
                    {state.profile.monthlyIncome > 0 && (
                      <div className="mb-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Impacto no próximo salário:</span>
                          <span className={`font-semibold ${getStatusColor(salaryStatus)}`}>
                            <AnimatedCounter value={salaryPercentage} decimals={1} suffix="%" />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Melhor dia para comprar */}
                    <div className="mb-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>📅</span>
                        <span>
                          Melhor dia para comprar: dia {bestPurchaseDay} ({bestPurchaseDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
                        </span>
                      </div>
                    </div>

                    {/* Informações da fatura */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span>
                        Fecha: {(() => {
                          const dateStr = currentInvoice.closingDate;
                          if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            const [year, month, day] = dateStr.split('-');
                            return `${day}/${month}/${year}`;
                          }
                          return dateStr || '';
                        })()}
                      </span>
                      <span>
                        Vence: {(() => {
                          const dateStr = currentInvoice.dueDate;
                          if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            const [year, month, day] = dateStr.split('-');
                            return `${day}/${month}/${year}`;
                          }
                          return dateStr || '';
                        })()}
                      </span>
                    </div>
                  </CardUI>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Botão flutuante */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => {
            setEditingCardId(null);
            setIsSheetOpen(true);
          }}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-light transition-all hover:scale-110"
          aria-label="Adicionar cartão"
        >
          +
        </button>
      </div>

      <AddCardSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingCardId(null);
        }}
        cardId={editingCardId || undefined}
      />
    </div>
  );
}

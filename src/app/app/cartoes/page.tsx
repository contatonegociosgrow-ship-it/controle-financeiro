'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PageHeader } from '@/components/finance/PageHeader';
import { CardUI } from '@/components/finance/CardUI';
import { AddCardSheet } from '@/components/finance/AddCardSheet';
import { getCurrentInvoice, getAvailableLimit } from '@/lib/cardUtils';
import { getBankInfo } from '@/lib/bankColors';
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
    return state.cards.map((card) => {
      const currentInvoice = getCurrentInvoice(card, state.transactions);
      const availableLimit = getAvailableLimit(card, state.transactions);
      const usagePercentage = card.limit > 0 ? (currentInvoice.total / card.limit) * 100 : 0;

      return {
        card,
        currentInvoice,
        availableLimit,
        usagePercentage,
      };
    });
  }, [state.cards, state.transactions]);

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
    <div className="min-h-screen pb-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <PageHeader title="Cartões de Crédito" icon="💳" hideSearch />

        {/* Resumo Total */}
        <div className="mb-8">
          <CardUI className="shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Total da Fatura Atual
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalCurrentInvoice)}
                </p>
              </div>
              <div className="text-4xl">💳</div>
            </div>
          </CardUI>
        </div>

        {/* Lista de Cartões */}
        <div className="space-y-4">
          {cardsWithInvoice.length === 0 ? (
            <CardUI className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <span className="text-4xl">💳</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Nenhum cartão cadastrado
              </p>
              <button
                onClick={() => setIsSheetOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
              >
                Adicionar Primeiro Cartão
              </button>
            </CardUI>
          ) : (
            cardsWithInvoice.map(({ card, currentInvoice, availableLimit, usagePercentage }) => {
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
                        {/* Ícone do banco */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                          style={{ backgroundColor: `${bankInfo.color}20` }}
                        >
                          {bankInfo.icon}
                        </div>
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

                    {/* Informações da fatura */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span>
                        Fecha: {new Date(currentInvoice.closingDate).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </span>
                      <span>
                        Vence: {new Date(currentInvoice.dueDate).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
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

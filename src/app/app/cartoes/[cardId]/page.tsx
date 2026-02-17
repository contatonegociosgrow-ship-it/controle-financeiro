'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PageHeader } from '@/components/finance/PageHeader';
import { CardUI } from '@/components/finance/CardUI';
import { BankLogo } from '@/components/finance/BankLogo';
import { AddCardSheet } from '@/components/finance/AddCardSheet';
import { getCurrentInvoice, getFutureInvoices, getAvailableLimit } from '@/lib/cardUtils';
import { getBankInfo } from '@/lib/bankColors';
import { ImportExtractSheet } from '@/components/finance/ImportExtractSheet';
import { AddTransactionSheet } from '@/components/finance/AddTransactionSheet';
import { CreditCard, Filter, Tag } from 'lucide-react';

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { state, isInitialized, removeCard } = useFinanceStore();
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const cardId = params.cardId as string;
  const card = state.cards.find((c) => c.id === cardId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    // Converter diretamente de ISO (YYYY-MM-DD) para BR (DD/MM/YYYY) sem usar Date
    if (!dateStr) return '';
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const currentInvoice = useMemo(() => {
    if (!card) return null;
    // Filtrar apenas transações do cartão para debug
    const cardTransactions = state.transactions.filter(t => t.cardId === card.id);
    console.log('Transações do cartão:', cardTransactions);
    return getCurrentInvoice(card, state.transactions);
  }, [card, state.transactions]);

  const availableLimit = useMemo(() => {
    if (!card) return 0;
    return getAvailableLimit(card, state.transactions);
  }, [card, state.transactions]);

  const futureInvoices = useMemo(() => {
    if (!card) return [];
    return getFutureInvoices(card, state.transactions);
  }, [card, state.transactions]);

  const usagePercentage = card && card.limit > 0 
    ? ((card.limit - availableLimit) / card.limit) * 100 
    : 0;

  // Calcular total por categoria para transações do cartão
  const categoryTotal = useMemo(() => {
    if (!categoryId || !card) return null;
    
    const allCardTransactions = state.transactions
      .filter((t) => t.cardId === cardId && t.type === 'expense_variable' && t.categoryId === categoryId);
    
    return allCardTransactions.reduce((sum, t) => sum + t.value, 0);
  }, [state.transactions, categoryId, cardId, card]);

  const selectedCategory = categoryId ? state.categories.find((c) => c.id === categoryId) : null;

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <CardUI className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Cartão não encontrado
            </p>
            <button
              onClick={() => router.push('/app/cartoes')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
            >
              Voltar para Cartões
            </button>
          </CardUI>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader title={card.name} icon={CreditCard} hideSearch />

        {/* Informações do Cartão */}
        <div className="mb-8">
          <CardUI className="shadow-md hover:shadow-lg transition-shadow overflow-hidden relative">
            {/* Barra de cor do banco */}
            <div
              className="absolute top-0 left-0 right-0 h-3"
              style={{ backgroundColor: getBankInfo(card.name).color }}
            />
            
            <div className="flex items-start justify-between mb-4 pt-3">
              <div className="flex items-center gap-4">
                {/* Logo do banco */}
                <BankLogo bankName={card.name} size={64} />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {card.name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Limite: {formatCurrency(card.limit)}</p>
                    <p>Disponível: {formatCurrency(availableLimit)}</p>
                    <p>
                      Fechamento: dia {card.closingDay} | Vencimento: dia {card.dueDay}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIsEditSheetOpen(true)}
                  className="min-h-[44px] px-4 py-2.5 md:px-3 md:py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold rounded-lg text-sm md:text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 active:bg-blue-200 dark:active:bg-blue-900/60 transition-all touch-manipulation"
                  aria-label="Editar cartão"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir este cartão?')) {
                      removeCard(card.id);
                      router.push('/app/cartoes');
                    }
                  }}
                  className="min-h-[44px] px-4 py-2.5 md:px-3 md:py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-lg text-sm md:text-xs hover:bg-red-100 dark:hover:bg-red-900/50 active:bg-red-200 dark:active:bg-red-900/60 transition-all touch-manipulation"
                  aria-label="Excluir cartão"
                >
                  Excluir
                </button>
              </div>
            </div>

            {/* Barra de uso do limite */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Uso do Limite</span>
                <span>{usagePercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
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
          </CardUI>
        </div>

        {/* Fatura Atual */}
        {currentInvoice && (
          <div className="mb-8">
            <CardUI className="shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                <h3 className="text-base text-gray-900 dark:text-white font-semibold tracking-tight">
                  Fatura Atual
                </h3>
              </div>

              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(currentInvoice.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Fecha: {formatDate(currentInvoice.closingDate)}</span>
                  <span>Vence: {formatDate(currentInvoice.dueDate)}</span>
                </div>
              </div>

              {/* Botão de importar extrato */}
              <div className="mb-4">
                <button
                  onClick={() => setIsImportSheetOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Importar Extrato (PDF, CSV, etc)
                </button>
              </div>

              {/* Extrato */}
              {currentInvoice.items.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                  Nenhuma compra nesta fatura
                </p>
              ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 py-2 px-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    <div className="col-span-3">Data</div>
                    <div className="col-span-5">Descrição</div>
                    <div className="col-span-2 text-center">Parcela</div>
                    <div className="col-span-2 text-right">Valor</div>
                  </div>
                  {currentInvoice.items.map((item) => {
                    const category = state.categories.find((c) => c.id === item.transaction.categoryId);
                    const description = item.transaction.notes || category?.name || 'Sem descrição';
                    
                    return (
                      <div
                        key={`${item.transaction.id}-${item.installment || 0}`}
                        className="grid grid-cols-12 gap-2 py-3 px-3 border-b border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 last:border-b-0"
                      >
                        <div className="col-span-3 text-gray-600 dark:text-gray-400">
                          {formatDate(item.transaction.date)}
                        </div>
                        <div className="col-span-5 text-gray-900 dark:text-white truncate" title={description}>
                          {description}
                        </div>
                        <div className="col-span-2 text-center text-gray-600 dark:text-gray-400">
                          {item.installment ? `${item.installment}/${item.totalInstallments}` : '-'}
                        </div>
                        <div className="col-span-2 text-right font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(
                            item.installment
                              ? item.transaction.value / (item.totalInstallments || 1)
                              : item.transaction.value
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardUI>
          </div>
        )}

        {/* Todas as Transações do Cartão */}
        <div className="mb-8">
          <CardUI className="shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                <h3 className="text-base text-gray-900 dark:text-white font-semibold tracking-tight">
                  Todas as Transações
                </h3>
              </div>
              <button
                onClick={() => setIsImportSheetOpen(true)}
                className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all shadow-sm"
              >
                + Importar
              </button>
            </div>

            {/* Filtro por Categoria */}
            <div className="mb-4 p-4 bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 rounded-xl border border-purple-200/50 dark:border-purple-800/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Filtrar por categoria:
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value || null)}
                  className="w-full sm:w-auto min-w-[200px] px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all hover:border-gray-300 dark:hover:border-gray-500 font-medium"
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
                  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-800/50 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                        Total em {selectedCategory.name}
                      </div>
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(categoryTotal)}
                      </div>
                    </div>
                    <div className="p-3 bg-purple-200/50 dark:bg-purple-900/30 rounded-lg">
                      <Tag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(() => {
              let allCardTransactions = state.transactions
                .filter((t) => t.cardId === cardId && t.type === 'expense_variable');
              
              // Filtrar por categoria se selecionada
              if (categoryId) {
                allCardTransactions = allCardTransactions.filter((t) => t.categoryId === categoryId);
              }
              
              allCardTransactions = allCardTransactions.sort((a, b) => b.date.localeCompare(a.date));

              if (allCardTransactions.length === 0) {
                return (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                    Nenhuma transação encontrada. Importe um extrato para começar.
                  </p>
                );
              }

              return (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 py-2 px-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    <div className="col-span-3">Data</div>
                    <div className="col-span-5">Descrição</div>
                    <div className="col-span-2 text-center">Parcela</div>
                    <div className="col-span-2 text-right">Valor</div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {allCardTransactions.map((transaction) => {
                      const category = state.categories.find((c) => c.id === transaction.categoryId);
                      const description = transaction.notes || category?.name || 'Sem descrição';
                      
                      return (
                        <div
                          key={transaction.id}
                          className="grid grid-cols-12 gap-2 py-3 px-3 border-b border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 last:border-b-0"
                        >
                          <div className="col-span-3 text-gray-600 dark:text-gray-400">
                            {formatDate(transaction.date)}
                          </div>
                          <div className="col-span-5 text-gray-900 dark:text-white truncate" title={description}>
                            {description}
                          </div>
                          <div className="col-span-2 text-center text-gray-600 dark:text-gray-400">
                            {transaction.installments ? `${transaction.installments.current}/${transaction.installments.total}` : '-'}
                          </div>
                          <div className="col-span-2 text-right font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(transaction.value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </CardUI>
        </div>

        {/* Faturas Futuras */}
        {futureInvoices.length > 0 && (
          <div className="mb-8">
            <CardUI className="shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                <h3 className="text-base text-gray-900 dark:text-white font-semibold tracking-tight">
                  Faturas Futuras
                </h3>
              </div>

              {/* Botão de importar extrato */}
              <div className="mb-4">
                <button
                  onClick={() => setIsImportSheetOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Importar Extrato (PDF, CSV, etc)
                </button>
              </div>

              <div className="space-y-4">
                {futureInvoices.map((invoice, index) => (
                  <div
                    key={`${invoice.invoiceMonth.year}-${invoice.invoiceMonth.month}`}
                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(invoice.closingDate)}
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(invoice.total)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {invoice.items.length} {invoice.items.length === 1 ? 'item' : 'itens'} • Vence: {formatDate(invoice.dueDate)}
                    </div>
                  </div>
                ))}
              </div>
            </CardUI>
          </div>
        )}
      </div>

      {/* Botões flutuantes */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 sm:gap-3 z-40">
        <button
          onClick={() => setIsAddTransactionOpen(true)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-light transition-all hover:scale-110"
          aria-label="Adicionar transação manual"
          title="Adicionar transação manual"
        >
          +
        </button>
        <button
          onClick={() => setIsImportSheetOpen(true)}
          className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl flex items-center justify-center text-xl font-semibold transition-all hover:scale-110"
          aria-label="Importar extrato"
          title="Importar extrato"
        >
          📄
        </button>
        <button
          onClick={() => setIsEditSheetOpen(true)}
          className="w-14 h-14 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-2xl flex items-center justify-center text-xl font-semibold transition-all hover:scale-110"
          aria-label="Editar cartão"
          title="Editar cartão"
        >
          ✏️
        </button>
      </div>

      <AddCardSheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        cardId={cardId}
      />
      <ImportExtractSheet
        isOpen={isImportSheetOpen}
        onClose={() => setIsImportSheetOpen(false)}
        cardId={cardId}
      />
      <AddTransactionSheet
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        defaultType="expense_variable"
        defaultCardId={cardId}
      />
    </div>
  );
}

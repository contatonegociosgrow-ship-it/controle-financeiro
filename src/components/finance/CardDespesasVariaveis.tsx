'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { CardUI } from './CardUI';

const CATEGORY_COLORS: Record<string, string> = {
  'Compras': 'bg-purple-500/20 text-purple-300',
  'Educação': 'bg-blue-500/20 text-blue-300',
  'Saúde': 'bg-yellow-500/20 text-yellow-300',
  'Carro': 'bg-orange-500/20 text-orange-300',
  'Restaurante': 'bg-green-500/20 text-green-300',
  'Casa': 'bg-gray-500/20 text-gray-300',
  'Lazer': 'bg-pink-500/20 text-pink-300',
  'Presente': 'bg-purple-400/20 text-purple-200',
};

export function CardDespesasVariaveis() {
  const { state } = useFinanceStore();
  const [activeTab, setActiveTab] = useState('variaveis');
  const [filter, setFilter] = useState('');

  const tabs = [
    { id: 'gerais', label: 'Gerais' },
    { id: 'ganhos', label: 'Ganhos' },
    { id: 'fixas', label: 'Fixas' },
    { id: 'variaveis', label: 'Variáveis' },
    { id: 'dividas', label: 'Dívidas' },
    { id: 'economias', label: 'Economias' },
  ];

  const filteredTransactions = useMemo(() => {
    let filtered = state.transactions.filter((t) => t.type === 'expense_variable');

    if (filter) {
      const filterLower = filter.toLowerCase();
      filtered = filtered.filter((t) => {
        const category = state.categories.find((c) => c.id === t.categoryId);
        const categoryName = category?.name.toLowerCase() || '';
        const notes = t.notes?.toLowerCase() || '';
        return categoryName.includes(filterLower) || notes.includes(filterLower);
      });
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [state.transactions, state.categories, filter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getCategoryName = (id: string) => {
    return state.categories.find((c) => c.id === id)?.name || 'Sem categoria';
  };

  const getCategoryColor = (categoryName: string) => {
    const baseColor = CATEGORY_COLORS[categoryName] || 'bg-gray-500/20';
    const bgColor = baseColor.split(' ').find(c => c.startsWith('bg-')) || 'bg-gray-500/20';
    return `${bgColor} text-gray-900`;
  };

  return (
    <CardUI className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📈</span>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Despesas Variáveis</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
            + Set/25
          </button>
          <input
            type="text"
            placeholder="Filtrar por"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm w-32 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm border border-gray-200 rounded-lg">
            Nenhuma despesa variável encontrada
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-5 py-3 px-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <div className="font-medium px-3">Descrição</div>
              <div className="font-medium px-3 border-l border-gray-200">Categoria</div>
              <div className="font-medium px-3 border-l border-gray-200">Data da compra</div>
              <div className="font-medium px-3 border-l border-gray-200">Valor</div>
              <div className="font-medium px-3 border-l border-gray-200">Parcelas</div>
            </div>
            
            {/* Rows */}
            {filteredTransactions.map((transaction, index) => {
              const categoryName = getCategoryName(transaction.categoryId);
              return (
                <div
                  key={transaction.id}
                  className={`grid grid-cols-5 py-3 px-4 hover:bg-gray-50 text-sm border-b border-gray-200 ${
                    index === filteredTransactions.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <div className="text-gray-900 truncate font-medium px-3">{transaction.notes || categoryName}</div>
                  <div className={`px-3 py-3 border-l border-gray-200 flex items-center ${getCategoryColor(categoryName)}`}>
                    <span className="text-xs font-medium">
                      {categoryName}
                    </span>
                  </div>
                  <div className="text-gray-600 text-sm px-3 border-l border-gray-200">{formatDate(transaction.date)}</div>
                  <div className="text-red-600 font-semibold text-base px-3 border-l border-gray-200">{formatCurrency(transaction.value)}</div>
                  <div className="text-gray-600 text-sm px-3 border-l border-gray-200">
                    {transaction.installments
                      ? `${transaction.installments.current} de ${transaction.installments.total}`
                      : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CardUI>
  );
}

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { CardUI } from './CardUI';

type TabType = 'gerais' | 'ganhos' | 'fixas' | 'variaveis' | 'dividas' | 'economias';

export function CardGanhos() {
  const { state, updateTransaction, addPerson } = useFinanceStore();
  const [activeTab, setActiveTab] = useState<TabType>('ganhos');
  const [filter, setFilter] = useState('');
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editingPersonValue, setEditingPersonValue] = useState('');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'gerais', label: 'Gerais' },
    { id: 'ganhos', label: 'Ganhos' },
    { id: 'fixas', label: 'Fixas' },
    { id: 'variaveis', label: 'Variáveis' },
    { id: 'dividas', label: 'Dívidas' },
    { id: 'economias', label: 'Economias' },
  ];

  const filteredTransactions = useMemo(() => {
    let filtered = state.transactions.filter((t) => {
      if (activeTab === 'ganhos') return t.type === 'income';
      if (activeTab === 'fixas') return t.type === 'expense_fixed';
      if (activeTab === 'variaveis') return t.type === 'expense_variable';
      if (activeTab === 'dividas') return t.type === 'debt';
      if (activeTab === 'economias') return t.type === 'savings';
      return true; // gerais
    });

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
  }, [state.transactions, state.categories, activeTab, filter]);

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

  const getPersonName = (id: string | null | undefined) => {
    if (!id) return '';
    return state.people.find((p) => p.id === id)?.name || '';
  };

  const handlePersonChange = useCallback((transactionId: string, personName: string) => {
    if (!personName.trim()) {
      updateTransaction(transactionId, { personId: null });
      return;
    }

    const trimmedName = personName.trim();
    const existingPerson = state.people.find((p) => p.name.toLowerCase() === trimmedName.toLowerCase());
    
    if (existingPerson) {
      updateTransaction(transactionId, { personId: existingPerson.id });
    } else {
      const newPersonId = addPerson(trimmedName);
      updateTransaction(transactionId, { personId: newPersonId });
    }
  }, [state.people, updateTransaction, addPerson]);

  return (
    <CardUI className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Ganhos</h2>
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
            Nenhum lançamento encontrado
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-5 py-3 px-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <div className="font-medium px-3">Descrição</div>
              <div className="font-medium px-3 border-l border-gray-200">Recebido em</div>
              <div className="font-medium px-3 border-l border-gray-200">Valor</div>
              <div className="font-medium px-3 border-l border-gray-200">Corresponde</div>
              <div className="font-medium px-3 border-l border-gray-200">Anotação</div>
            </div>
            
            {/* Rows */}
            {filteredTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className={`grid grid-cols-5 py-3 px-4 hover:bg-gray-50 text-sm items-center border-b border-gray-200 ${
                  index === filteredTransactions.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <div className="text-gray-900 truncate font-medium px-3" title={transaction.notes || getCategoryName(transaction.categoryId)}>
                  {transaction.notes || getCategoryName(transaction.categoryId)}
                </div>
                <div className="text-gray-600 text-sm px-3 border-l border-gray-200">{formatDate(transaction.date)}</div>
                <div className="text-green-600 font-semibold text-base px-3 border-l border-gray-200">{formatCurrency(transaction.value)}</div>
                <div className="px-3 border-l border-gray-200">
                  {editingPersonId === transaction.id ? (
                    <input
                      type="text"
                      value={editingPersonValue}
                      onChange={(e) => setEditingPersonValue(e.target.value)}
                      onBlur={() => {
                        handlePersonChange(transaction.id, editingPersonValue);
                        setEditingPersonId(null);
                        setEditingPersonValue('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handlePersonChange(transaction.id, editingPersonValue);
                          setEditingPersonId(null);
                          setEditingPersonValue('');
                        } else if (e.key === 'Escape') {
                          setEditingPersonId(null);
                          setEditingPersonValue('');
                        }
                      }}
                      className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                  ) : (
                    <div
                      className="text-gray-600 truncate text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded -mx-2 -my-1"
                      onClick={() => {
                        setEditingPersonId(transaction.id);
                        setEditingPersonValue(getPersonName(transaction.personId));
                      }}
                      title="Clique para editar"
                    >
                      {getPersonName(transaction.personId) || '-'}
                    </div>
                  )}
                </div>
                <div className="text-gray-500 text-xs truncate px-3 border-l border-gray-200" title={transaction.notes}>
                  {transaction.notes || '-'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardUI>
  );
}

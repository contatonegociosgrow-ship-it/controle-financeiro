'use client';

import { useMemo, useCallback, useState } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';

type TransactionListProps = {
  type?: 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings' | 'all';
  filter?: string;
  startDate?: string | null;
  endDate?: string | null;
  showCategory?: boolean;
  showStatus?: boolean;
  showInstallments?: boolean;
  showDueDate?: boolean;
  columns?: number;
};

import { getCategoryColor } from '@/lib/categoryColors';

const getCategoryColorClass = (category: { name: string; color?: string }) => {
  const hexColor = getCategoryColor(category);
  // Converter hex para RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
    color: `rgb(${r}, ${g}, ${b})`,
  };
};


export function TransactionList({
  type = 'all',
  filter = '',
  startDate = null,
  endDate = null,
  showCategory = false,
  showStatus = false,
  showInstallments = false,
  showDueDate = false,
  columns = 5,
}: TransactionListProps) {
  const { state, updateTransaction, addPerson } = useFinanceStore();
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editingPersonValue, setEditingPersonValue] = useState('');

  const filteredTransactions = useMemo(() => {
    let filtered = state.transactions;

    // Filtrar por tipo - deve ser aplicado primeiro
    if (type && type !== 'all') {
      filtered = filtered.filter((t) => t.type === type);
    }

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
    if (startDate || endDate) {
      filtered = filtered.filter((t) => {
        const transactionDate = t.date;
        if (startDate && transactionDate < startDate) return false;
        if (endDate && transactionDate > endDate) return false;
        return true;
      });
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [state.transactions, state.categories, state.people, type, filter, startDate, endDate]);

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
      year: 'numeric',
    });
  };

  const getCategoryName = (id: string) => {
    return state.categories.find((c) => c.id === id)?.name || 'Sem categoria';
  };


  const getStatusColor = (status?: string) => {
    if (status === 'paid') return 'bg-green-100 text-gray-900';
    if (status === 'overdue') return 'bg-red-100 text-gray-900';
    return 'bg-orange-100 text-gray-900';
  };

  const getStatusLabel = (status?: string) => {
    if (status === 'paid') return 'Pago';
    if (status === 'overdue') return 'Em atraso';
    return 'A pagar';
  };

  const getPersonName = (id: string | null | undefined) => {
    if (!id) return '';
    return state.people.find((p) => p.id === id)?.name || '';
  };

  const handlePersonChange = useCallback((transactionId: string, personName: string) => {
    if (!personName.trim()) {
      // Se vazio, remove a pessoa
      updateTransaction(transactionId, { personId: null });
      return;
    }

    const trimmedName = personName.trim();
    // Procura se a pessoa já existe (case insensitive)
    const existingPerson = state.people.find((p) => p.name.toLowerCase() === trimmedName.toLowerCase());
    
    if (existingPerson) {
      // Usa pessoa existente
      updateTransaction(transactionId, { personId: existingPerson.id });
    } else {
      // Cria nova pessoa e atualiza a transação
      const newPersonId = addPerson(trimmedName);
      // Atualiza a transação imediatamente com o novo ID
      updateTransaction(transactionId, { personId: newPersonId });
    }
  }, [state.people, updateTransaction, addPerson]);

  // Calcular número real de colunas baseado no tipo
  const getActualColumns = useCallback(() => {
    if (type === 'income') return 5; // Descrição, Recebido em, Valor, Corresponde, Anotação
    if (type === 'expense_fixed') return 5; // Descrição, Categoria, Valor, Vencimento, Status
    if (type === 'expense_variable') return 5; // Descrição, Categoria, Data, Valor, Parcelas
    if (type === 'debt') return 4; // Data, Tipo, Valor, Status
    return columns;
  }, [type, columns]);

  const actualColumns = getActualColumns();

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm border border-gray-200 rounded-lg">
        Nenhum lançamento encontrado
      </div>
    );
  }

  // Função para obter os headers baseado no tipo
  const getHeaders = () => {
    if (type === 'income') {
      return ['Descrição', 'Recebido em', 'Valor', 'Corresponde', 'Anotação'];
    }
    if (type === 'expense_fixed') {
      return ['Descrição', 'Categoria', 'Valor', 'Vencimento', 'Status'];
    }
    if (type === 'expense_variable') {
      return ['Descrição', 'Categoria', 'Data da compra', 'Valor', 'Parcelas'];
    }
    if (type === 'debt') {
      return ['Data do Pagamento', 'Tipo de Lançamento', 'Valor', 'Status'];
    }
    return [];
  };

  const headers = getHeaders();

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* Header - Desktop only */}
      {headers.length > 0 && (
        <div
          className="hidden md:grid py-3 px-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
          style={{ gridTemplateColumns: `repeat(${actualColumns}, minmax(0, 1fr))` }}
        >
          {headers.map((header, idx) => (
            <div 
              key={idx} 
              className={`font-medium px-3 ${idx !== 0 ? 'border-l border-gray-200 dark:border-gray-700' : ''}`}
            >
              {header}
            </div>
          ))}
        </div>
      )}
      
      {/* Rows */}
      {filteredTransactions.map((transaction, index) => {
        const category = state.categories.find((c) => c.id === transaction.categoryId);
        const categoryName = category?.name || 'Sem categoria';
        const isIncome = transaction.type === 'income';

        return (
          <div key={transaction.id}>
            {/* Desktop View - Grid */}
            <div
              className={`hidden md:grid py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm items-center border-b border-gray-200 dark:border-gray-700 ${
                index === filteredTransactions.length - 1 ? 'border-b-0' : ''
              }`}
              style={{ gridTemplateColumns: `repeat(${actualColumns}, minmax(0, 1fr))` }}
            >
            {type === 'income' ? (
              <>
                <div className="text-gray-900 truncate font-medium px-3" title={transaction.notes || categoryName}>
                  {transaction.notes || categoryName}
                </div>
                <div className="text-gray-600 text-sm px-3 border-l border-gray-200">{formatDate(transaction.date)}</div>
                <div className="text-green-600 font-semibold text-base px-3 border-l border-gray-200">
                  {formatCurrency(transaction.value)}
                </div>
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
              </>
            ) : type === 'debt' ? (
              <>
                <div className="text-gray-600 text-sm px-3">
                  {formatDate(transaction.dueDate || transaction.date)}
                </div>
                <div className="text-gray-900 font-medium px-3 border-l border-gray-200">Pagamento Mensal</div>
                <div className="text-gray-900 font-semibold text-base px-3 border-l border-gray-200">{formatCurrency(transaction.value)}</div>
                {showStatus && transaction.status && (
                  <div className={`px-3 py-3 border-l border-gray-200 flex items-center gap-2 ${getStatusColor(transaction.status)}`}>
                    <input
                      type="checkbox"
                      checked={transaction.status === 'paid'}
                      onChange={(e) => {
                        updateTransaction(transaction.id, {
                          status: e.target.checked ? 'paid' : 'pending',
                        });
                      }}
                      className="w-5 h-5 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all duration-200 checked:bg-blue-600 checked:border-blue-600 hover:border-blue-400 shadow-sm"
                      title={transaction.status === 'paid' ? 'Marcar como não pago' : 'Marcar como pago'}
                    />
                    <span className="text-xs font-medium">
                      {getStatusLabel(transaction.status)}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-gray-900 truncate font-medium px-3" title={transaction.notes || categoryName}>
                  {transaction.notes || categoryName}
                </div>
                {showCategory && category && (
                  <div 
                    className="px-3 py-3 border-l border-gray-200 dark:border-gray-700 flex items-center rounded"
                    style={getCategoryColorClass(category)}
                  >
                    <span className="text-xs font-semibold">
                      {categoryName}
                    </span>
                  </div>
                )}
                {type === 'expense_variable' && (
                  <div className="text-gray-600 text-sm px-3 border-l border-gray-200">{formatDate(transaction.date)}</div>
                )}
                <div
                  className={`font-semibold text-base px-3 border-l border-gray-200 ${
                    isIncome ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(transaction.value)}
                </div>
                {showDueDate && type === 'expense_fixed' && (
                  <div className="text-gray-600 text-sm px-3 border-l border-gray-200">
                    {formatDate(transaction.dueDate || transaction.date)}
                  </div>
                )}
                {showInstallments && transaction.installments && (
                  <div className="text-gray-600 text-sm px-3 border-l border-gray-200">
                    {transaction.installments.current} de {transaction.installments.total}
                  </div>
                )}
                {showStatus && transaction.status && (
                  <div className={`px-3 py-3 border-l border-gray-200 flex items-center gap-2 ${getStatusColor(transaction.status)}`}>
                    <input
                      type="checkbox"
                      checked={transaction.status === 'paid'}
                      onChange={(e) => {
                        updateTransaction(transaction.id, {
                          status: e.target.checked ? 'paid' : 'pending',
                        });
                      }}
                      className="w-5 h-5 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all duration-200 checked:bg-blue-600 checked:border-blue-600 hover:border-blue-400 shadow-sm"
                      title={transaction.status === 'paid' ? 'Marcar como não pago' : 'Marcar como pago'}
                    />
                    <span className="text-xs font-medium">
                      {getStatusLabel(transaction.status)}
                    </span>
                  </div>
                )}
              </>
            )}
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              {type === 'income' ? (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {transaction.notes || categoryName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(transaction.date)}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600 whitespace-nowrap">
                      {formatCurrency(transaction.value)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Corresponde:</span>
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
                        className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="flex-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 px-2 py-1 rounded -mx-2"
                        onClick={() => {
                          setEditingPersonId(transaction.id);
                          setEditingPersonValue(getPersonName(transaction.personId));
                        }}
                      >
                        {getPersonName(transaction.personId) || '-'}
                      </div>
                    )}
                  </div>
                  {transaction.notes && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                      {transaction.notes}
                    </div>
                  )}
                </div>
              ) : type === 'debt' ? (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        Pagamento Mensal
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(transaction.dueDate || transaction.date)}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(transaction.value)}
                    </div>
                  </div>
                  {showStatus && transaction.status && (
                    <div className={`flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 px-2 py-2 rounded ${getStatusColor(transaction.status)}`}>
                      <input
                        type="checkbox"
                        checked={transaction.status === 'paid'}
                        onChange={(e) => {
                          updateTransaction(transaction.id, {
                            status: e.target.checked ? 'paid' : 'pending',
                          });
                        }}
                        className="w-5 h-5 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all duration-200 checked:bg-blue-600 checked:border-blue-600 hover:border-blue-400 shadow-sm"
                        title={transaction.status === 'paid' ? 'Marcar como não pago' : 'Marcar como pago'}
                      />
                      <span className="text-xs font-medium">
                        {getStatusLabel(transaction.status)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {transaction.notes || categoryName}
                      </div>
                      {showCategory && category && (
                        <div 
                          className="inline-block mt-1 px-2 py-1 rounded text-xs font-semibold"
                          style={getCategoryColorClass(category)}
                        >
                          {categoryName}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {type === 'expense_variable' && (
                          <span>📅 {formatDate(transaction.date)}</span>
                        )}
                        {showDueDate && type === 'expense_fixed' && (
                          <span>📅 {formatDate(transaction.dueDate || transaction.date)}</span>
                        )}
                        {showInstallments && transaction.installments && (
                          <span>💳 {transaction.installments.current} de {transaction.installments.total}</span>
                        )}
                      </div>
                    </div>
                    <div className={`text-lg font-bold whitespace-nowrap ${
                      isIncome ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isIncome ? '+' : '-'}
                      {formatCurrency(transaction.value)}
                    </div>
                  </div>
                  {showStatus && transaction.status && (
                    <div className={`flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 px-2 py-2 rounded ${getStatusColor(transaction.status)}`}>
                      <input
                        type="checkbox"
                        checked={transaction.status === 'paid'}
                        onChange={(e) => {
                          updateTransaction(transaction.id, {
                            status: e.target.checked ? 'paid' : 'pending',
                          });
                        }}
                        className="w-5 h-5 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all duration-200 checked:bg-blue-600 checked:border-blue-600 hover:border-blue-400 shadow-sm"
                        title={transaction.status === 'paid' ? 'Marcar como não pago' : 'Marcar como pago'}
                      />
                      <span className="text-xs font-medium">
                        {getStatusLabel(transaction.status)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

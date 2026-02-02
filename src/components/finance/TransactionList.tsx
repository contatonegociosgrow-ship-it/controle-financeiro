'use client';

import { useMemo, useCallback, useState } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { Trash2 } from 'lucide-react';

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
  const { state, updateTransaction, addPerson, removeTransaction } = useFinanceStore();
  
  // Criar um mapa de transações para acesso rápido
  const transactionsMap = useMemo(() => {
    const map = new Map();
    state.transactions.forEach(t => map.set(t.id, t));
    return map;
  }, [state.transactions]);
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
    // Usar formatDateToBR para evitar problemas de fuso horário
    if (!dateStr) return '';
    // Se já está no formato ISO (YYYY-MM-DD), converter diretamente
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    // Se não está no formato esperado, tentar converter
    return dateStr;
  };

  const getCategoryName = (id: string) => {
    return state.categories.find((c) => c.id === id)?.name || 'Sem categoria';
  };


  const getStatusColor = (status?: string) => {
    if (status === 'paid') return 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-gray-900 dark:text-gray-100 border border-green-200/50 dark:border-green-800/50';
    if (status === 'overdue') return 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 text-gray-900 dark:text-gray-100 border border-red-200/50 dark:border-red-800/50';
    return 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 text-gray-900 dark:text-gray-100 border border-orange-200/50 dark:border-orange-800/50';
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

  // Calcular número real de colunas baseado no tipo (incluindo coluna de ações)
  const getActualColumns = useCallback(() => {
    let baseColumns = 0;
    if (type === 'income') baseColumns = 5; // Descrição, Recebido em, Valor, Corresponde, Anotação
    else if (type === 'expense_fixed') baseColumns = 5; // Descrição, Categoria, Valor, Vencimento, Status
    else if (type === 'expense_variable') baseColumns = 5; // Descrição, Categoria, Data, Valor, Parcelas
    else if (type === 'debt') baseColumns = 4; // Data, Tipo, Valor, Status
    else baseColumns = columns;
    return baseColumns + 1; // +1 para coluna de ações (remover)
  }, [type, columns]);

  const handleRemove = useCallback((id: string) => {
    if (confirm('Tem certeza que deseja remover esta transação?')) {
      removeTransaction(id);
    }
  }, [removeTransaction]);

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
    let headers: string[] = [];
    if (type === 'income') {
      headers = ['Descrição', 'Recebido em', 'Valor', 'Corresponde', 'Anotação'];
    } else if (type === 'expense_fixed') {
      headers = ['Descrição', 'Categoria', 'Valor', 'Vencimento', 'Status'];
    } else if (type === 'expense_variable') {
      headers = ['Descrição', 'Categoria', 'Data da compra', 'Valor', 'Parcelas'];
    } else if (type === 'debt') {
      headers = ['Data do Pagamento', 'Tipo de Lançamento', 'Valor', 'Status'];
    }
    return [...headers, 'Ações'];
  };

  const headers = getHeaders();

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* Header - Desktop only */}
      {headers.length > 0 && (
        <div
          className="hidden md:grid py-3 px-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
          style={{ gridTemplateColumns: `repeat(${actualColumns - 1}, minmax(0, 1fr)) auto` }}
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
        // Buscar transação atualizada do estado para garantir que temos o status mais recente
        const currentTransaction = transactionsMap.get(transaction.id) || transaction;
        const category = state.categories.find((c) => c.id === currentTransaction.categoryId);
        const categoryName = category?.name || 'Sem categoria';
        const isIncome = currentTransaction.type === 'income';

        return (
          <div key={`${currentTransaction.id}-${currentTransaction.status || 'pending'}`}>
            {/* Desktop View - Grid */}
            <div
              className={`hidden md:grid py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm items-center border-b border-gray-200 dark:border-gray-700 ${
                index === filteredTransactions.length - 1 ? 'border-b-0' : ''
              }`}
              style={{ gridTemplateColumns: `repeat(${actualColumns - 1}, minmax(0, 1fr)) auto` }}
            >
            {type === 'income' ? (
              <>
                <div className="text-gray-900 truncate font-medium px-3" title={currentTransaction.notes || categoryName}>
                  {currentTransaction.notes || categoryName}
                </div>
                <div className="text-gray-600 text-sm px-3 border-l border-gray-200">{formatDate(currentTransaction.date)}</div>
                <div className="text-green-600 font-semibold text-base px-3 border-l border-gray-200">
                  {formatCurrency(currentTransaction.value)}
                </div>
                <div className="px-3 border-l border-gray-200">
                  {editingPersonId === currentTransaction.id ? (
                    <input
                      type="text"
                      value={editingPersonValue}
                      onChange={(e) => setEditingPersonValue(e.target.value)}
                      onBlur={() => {
                        handlePersonChange(currentTransaction.id, editingPersonValue);
                        setEditingPersonId(null);
                        setEditingPersonValue('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handlePersonChange(currentTransaction.id, editingPersonValue);
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
                        setEditingPersonId(currentTransaction.id);
                        setEditingPersonValue(getPersonName(currentTransaction.personId));
                      }}
                      title="Clique para editar"
                    >
                      {getPersonName(currentTransaction.personId) || '-'}
                    </div>
                  )}
                </div>
                <div className="text-gray-500 text-xs truncate px-3 border-l border-gray-200" title={currentTransaction.notes}>
                  {currentTransaction.notes || '-'}
                </div>
                <div className="px-3 border-l border-gray-200 flex items-center justify-center">
                  <button
                    onClick={() => handleRemove(currentTransaction.id)}
                    className="p-2 md:p-1.5 w-10 h-10 md:w-auto md:h-auto flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 rounded transition-colors touch-manipulation"
                    title="Remover transação"
                    aria-label="Remover transação"
                  >
                    <Trash2 size={18} className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : type === 'debt' ? (
              <>
                <div className="text-gray-600 text-sm px-3">
                  {formatDate(currentTransaction.dueDate || currentTransaction.date)}
                </div>
                <div className="text-gray-900 font-medium px-3 border-l border-gray-200">Pagamento Mensal</div>
                <div className="text-gray-900 font-semibold text-base px-3 border-l border-gray-200">{formatCurrency(currentTransaction.value)}</div>
                {showStatus && currentTransaction.status && (
                  <div className={`px-4 py-2.5 border-l border-gray-200 dark:border-gray-700 flex items-center gap-3 rounded-lg ${getStatusColor(currentTransaction.status)}`}>
                    <label 
                      className="relative inline-flex items-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newStatus = currentTransaction.status === 'paid' ? 'pending' : 'paid';
                        updateTransaction(currentTransaction.id, {
                          status: newStatus,
                        });
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={currentTransaction.status === 'paid'}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newStatus = e.target.checked ? 'paid' : 'pending';
                          updateTransaction(currentTransaction.id, {
                            status: newStatus,
                          });
                        }}
                        className="sr-only"
                        title={currentTransaction.status === 'paid' ? 'Marcar como não pago' : 'Marcar como pago'}
                      />
                      <div className="relative w-5 h-5 flex items-center justify-center pointer-events-none">
                        <div className={`absolute inset-0 w-5 h-5 border-2 rounded-md transition-all duration-300 ease-out shadow-sm hover:shadow-md hover:scale-110 ${
                          currentTransaction.status === 'paid' 
                            ? 'border-[#22C55E] bg-[#22C55E] hover:border-[#16A34A] hover:bg-[#16A34A]' 
                            : 'bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500 hover:border-[#22C55E]/70'
                        }`}></div>
                        <svg className={`relative w-3.5 h-3.5 transition-all duration-300 ease-out pointer-events-none z-10 ${
                          currentTransaction.status === 'paid' 
                            ? 'opacity-100 transform scale-100 text-white' 
                            : 'opacity-0 transform scale-0 text-white'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </label>
                    <span className="text-sm font-semibold tracking-wide">
                      {getStatusLabel(currentTransaction.status)}
                    </span>
                  </div>
                )}
                <div className="px-3 border-l border-gray-200 flex items-center justify-center">
                  <button
                    onClick={() => handleRemove(currentTransaction.id)}
                    className="p-2 md:p-1.5 w-10 h-10 md:w-auto md:h-auto flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 rounded transition-colors touch-manipulation"
                    title="Remover transação"
                    aria-label="Remover transação"
                  >
                    <Trash2 size={18} className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-gray-900 truncate font-medium px-3" title={currentTransaction.notes || categoryName}>
                  {currentTransaction.notes || categoryName}
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
                  <div className="text-gray-600 text-sm px-3 border-l border-gray-200">{formatDate(currentTransaction.date)}</div>
                )}
                <div
                  className={`font-semibold text-base px-3 border-l border-gray-200 ${
                    isIncome ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(currentTransaction.value)}
                </div>
                {showDueDate && type === 'expense_fixed' && (
                  <div className="text-gray-600 text-sm px-3 border-l border-gray-200">
                    {formatDate(currentTransaction.dueDate || currentTransaction.date)}
                  </div>
                )}
                {showInstallments && currentTransaction.installments && (
                  <div className="text-gray-600 text-sm px-3 border-l border-gray-200">
                    {currentTransaction.installments.current} de {currentTransaction.installments.total}
                  </div>
                )}
                {showStatus && currentTransaction.status && (
                  <div className={`px-4 py-2.5 border-l border-gray-200 dark:border-gray-700 flex items-center gap-3 rounded-lg ${getStatusColor(currentTransaction.status)}`}>
                    <label 
                      className="relative inline-flex items-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newStatus = currentTransaction.status === 'paid' ? 'pending' : 'paid';
                        updateTransaction(currentTransaction.id, {
                          status: newStatus,
                        });
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={currentTransaction.status === 'paid'}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newStatus = e.target.checked ? 'paid' : 'pending';
                          updateTransaction(currentTransaction.id, {
                            status: newStatus,
                          });
                        }}
                        className="sr-only"
                        title={currentTransaction.status === 'paid' ? 'Marcar como não pago' : 'Marcar como pago'}
                      />
                      <div className="relative w-5 h-5 flex items-center justify-center pointer-events-none">
                        <div className={`absolute inset-0 w-5 h-5 border-2 rounded-md transition-all duration-300 ease-out shadow-sm hover:shadow-md hover:scale-110 ${
                          currentTransaction.status === 'paid' 
                            ? 'border-[#22C55E] bg-[#22C55E] hover:border-[#16A34A] hover:bg-[#16A34A]' 
                            : 'bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500 hover:border-[#22C55E]/70'
                        }`}></div>
                        <svg className={`relative w-3.5 h-3.5 transition-all duration-300 ease-out pointer-events-none z-10 ${
                          currentTransaction.status === 'paid' 
                            ? 'opacity-100 transform scale-100 text-white' 
                            : 'opacity-0 transform scale-0 text-white'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </label>
                    <span className="text-sm font-semibold tracking-wide">
                      {getStatusLabel(currentTransaction.status)}
                    </span>
                  </div>
                )}
                <div className="px-3 border-l border-gray-200 flex items-center justify-center">
                  <button
                    onClick={() => handleRemove(currentTransaction.id)}
                    className="p-2 md:p-1.5 w-10 h-10 md:w-auto md:h-auto flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 rounded transition-colors touch-manipulation"
                    title="Remover transação"
                    aria-label="Remover transação"
                  >
                    <Trash2 size={18} className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 relative pr-14">
              {/* Botão remover mobile */}
              <button
                onClick={() => handleRemove(currentTransaction.id)}
                className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 rounded-lg transition-colors touch-manipulation"
                title="Remover transação"
                aria-label="Remover transação"
              >
                <Trash2 size={18} />
              </button>
              {type === 'income' ? (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {currentTransaction.notes || categoryName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(currentTransaction.date)}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600 whitespace-nowrap">
                      {formatCurrency(currentTransaction.value)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Corresponde:</span>
                    {editingPersonId === currentTransaction.id ? (
                      <input
                        type="text"
                        value={editingPersonValue}
                        onChange={(e) => setEditingPersonValue(e.target.value)}
                        onBlur={() => {
                          handlePersonChange(currentTransaction.id, editingPersonValue);
                          setEditingPersonId(null);
                          setEditingPersonValue('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handlePersonChange(currentTransaction.id, editingPersonValue);
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
                          setEditingPersonId(currentTransaction.id);
                          setEditingPersonValue(getPersonName(currentTransaction.personId));
                        }}
                      >
                        {getPersonName(currentTransaction.personId) || '-'}
                      </div>
                    )}
                  </div>
                  {currentTransaction.notes && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                      {currentTransaction.notes}
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
                        {formatDate(currentTransaction.dueDate || currentTransaction.date)}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(currentTransaction.value)}
                    </div>
                  </div>
                  {showStatus && currentTransaction.status && (
                    <div className={`flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 px-3 py-2.5 rounded-lg ${getStatusColor(currentTransaction.status)}`}>
                      <label 
                        className="relative inline-flex items-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newStatus = currentTransaction.status === 'paid' ? 'pending' : 'paid';
                          updateTransaction(currentTransaction.id, {
                            status: newStatus,
                          });
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={currentTransaction.status === 'paid'}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateTransaction(currentTransaction.id, {
                              status: e.target.checked ? 'paid' : 'pending',
                            });
                          }}
                          className="sr-only"
                          title={currentTransaction.status === 'paid' ? 'Marcar como não pago' : 'Marcar como pago'}
                        />
                        <div className={`relative w-5 h-5 flex items-center justify-center pointer-events-none ${currentTransaction.status === 'paid' ? 'border-[#22C55E] bg-[#22C55E]' : ''}`}>
                          <div className={`absolute inset-0 w-5 h-5 bg-white dark:bg-gray-800 border-2 rounded-md transition-all duration-300 ease-out shadow-sm hover:shadow-md hover:scale-110 ${
                            currentTransaction.status === 'paid' 
                              ? 'border-[#22C55E] bg-[#22C55E] hover:border-[#16A34A] hover:bg-[#16A34A]' 
                              : 'border-gray-400 dark:border-gray-500 hover:border-[#22C55E]/70'
                          }`}></div>
                          <svg className={`relative w-3.5 h-3.5 text-white transition-all duration-300 ease-out pointer-events-none ${
                            currentTransaction.status === 'paid' 
                              ? 'opacity-100 transform scale-100' 
                              : 'opacity-0 transform scale-0'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </label>
                      <span className="text-sm font-semibold tracking-wide">
                        {getStatusLabel(currentTransaction.status)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {currentTransaction.notes || categoryName}
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
                          <span>📅 {formatDate(currentTransaction.date)}</span>
                        )}
                        {showDueDate && type === 'expense_fixed' && (
                          <span>📅 {formatDate(currentTransaction.dueDate || currentTransaction.date)}</span>
                        )}
                        {showInstallments && currentTransaction.installments && (
                          <span>💳 {currentTransaction.installments.current} de {currentTransaction.installments.total}</span>
                        )}
                      </div>
                    </div>
                    <div className={`text-lg font-bold whitespace-nowrap ${
                      isIncome ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isIncome ? '+' : '-'}
                      {formatCurrency(currentTransaction.value)}
                    </div>
                  </div>
                  {showStatus && currentTransaction.status && (
                    <div className={`flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 px-3 py-2.5 rounded-lg ${getStatusColor(currentTransaction.status)}`}>
                      <label 
                        className="relative inline-flex items-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newStatus = currentTransaction.status === 'paid' ? 'pending' : 'paid';
                          updateTransaction(currentTransaction.id, {
                            status: newStatus,
                          });
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={currentTransaction.status === 'paid'}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateTransaction(currentTransaction.id, {
                              status: e.target.checked ? 'paid' : 'pending',
                            });
                          }}
                          className="sr-only"
                          title={currentTransaction.status === 'paid' ? 'Marcar como não pago' : 'Marcar como pago'}
                        />
                        <div className={`relative w-5 h-5 flex items-center justify-center pointer-events-none ${currentTransaction.status === 'paid' ? 'border-[#22C55E] bg-[#22C55E]' : ''}`}>
                          <div className={`absolute inset-0 w-5 h-5 bg-white dark:bg-gray-800 border-2 rounded-md transition-all duration-300 ease-out shadow-sm hover:shadow-md hover:scale-110 ${
                            currentTransaction.status === 'paid' 
                              ? 'border-[#22C55E] bg-[#22C55E] hover:border-[#16A34A] hover:bg-[#16A34A]' 
                              : 'border-gray-400 dark:border-gray-500 hover:border-[#22C55E]/70'
                          }`}></div>
                          <svg className={`relative w-3.5 h-3.5 text-white transition-all duration-300 ease-out pointer-events-none ${
                            currentTransaction.status === 'paid' 
                              ? 'opacity-100 transform scale-100' 
                              : 'opacity-0 transform scale-0'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </label>
                      <span className="text-sm font-semibold tracking-wide">
                        {getStatusLabel(currentTransaction.status)}
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

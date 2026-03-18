'use client';

import { useMemo, useCallback, useState } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { Trash2, Edit2 } from 'lucide-react';
import { getCategoryEmoji, getContextualIcon } from '@/lib/categoryEmojis';

type TransactionListProps = {
  type?: 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings' | 'all';
  filter?: string;
  categoryId?: string | null;
  personId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  showCategory?: boolean;
  showStatus?: boolean;
  showInstallments?: boolean;
  showDueDate?: boolean;
  columns?: number;
  onEdit?: (transactionId: string) => void;
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

const CategoryEmojiSvg = ({
  emoji,
  backgroundColor,
  textColor,
  size = 48,
}: {
  emoji: string;
  backgroundColor: string;
  textColor: string;
  size?: number;
}) => {
  const center = size / 2;
  const radius = size * 0.45; // 45% do tamanho para o círculo
  const fontSize = size * 0.55; // 55% do tamanho para o emoji
  
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Categoria: ${emoji}`}
      className="shrink-0"
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill={backgroundColor}
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.5"
      />
      <text
        x={center}
        y={center + fontSize * 0.15}
        textAnchor="middle"
        fontSize={fontSize}
        fill={textColor}
        dominantBaseline="middle"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {emoji}
      </text>
    </svg>
  );
};


export function TransactionList({
  type = 'all',
  filter = '',
  categoryId = null,
  personId = null,
  startDate = null,
  endDate = null,
  showCategory = false,
  showStatus = false,
  showInstallments = false,
  showDueDate = false,
  columns = 5,
  onEdit,
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

    // Filtrar por categoria
    if (categoryId) {
      filtered = filtered.filter((t) => t.categoryId === categoryId);
    }

    // Filtrar por pessoa
    if (personId) {
      filtered = filtered.filter((t) => t.personId === personId);
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
  }, [state.transactions, state.categories, state.people, type, filter, categoryId, personId, startDate, endDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    // Converter para formato brasileiro DD/MM/YYYY
    if (!dateStr) return '';
    
    // Se já está no formato ISO (YYYY-MM-DD), converter diretamente
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Se já está no formato brasileiro (DD/MM/YYYY), retornar como está
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateStr;
    }
    
    // Tentar converter de outros formatos
    // Se tem barras mas não está no formato esperado, tentar parsear
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        // Se o primeiro elemento tem 4 dígitos, é YYYY/MM/DD
        if (parts[0].length === 4) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        // Se não, assumir que já está em DD/MM/YYYY
        return dateStr;
      }
    }
    
    // Se não conseguiu converter, retornar como está (mas isso não deveria acontecer)
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
    return baseColumns + 1; // +1 para coluna de ações (editar/remover)
  }, [type, columns]);

  const handleRemove = useCallback((id: string) => {
    if (confirm('Tem certeza que deseja remover esta transação?')) {
      removeTransaction(id);
    }
  }, [removeTransaction]);

  const actualColumns = getActualColumns();

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm border-2 border-dashed border-gray-200/60 dark:border-gray-700/40 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl opacity-50">📋</div>
          <p className="font-medium">Nenhum lançamento encontrado</p>
        </div>
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
    return [...headers, onEdit ? 'Ações' : 'Ação'];
  };

  const headers = getHeaders();

  if (filteredTransactions.length === 0) {
    return (
      <div className="glassmorphism rounded-2xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-white text-lg font-semibold">Nenhum lançamento encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cards individuais */}
      {filteredTransactions.map((transaction, index) => {
        // Buscar transação atualizada do estado para garantir que temos o status mais recente
        const currentTransaction = transactionsMap.get(transaction.id) || transaction;
        const category = state.categories.find((c) => c.id === currentTransaction.categoryId);
        const categoryName = category?.name || 'Sem categoria';
        const isIncome = currentTransaction.type === 'income';

        return (
          <div 
            key={`${currentTransaction.id}-${currentTransaction.status || 'pending'}`}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 p-5 relative"
          >
            {/* Botões de ação - canto superior direito */}
            <div className="absolute top-4 right-4 flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(currentTransaction.id)}
                  className="w-9 h-9 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar transação"
                  aria-label="Editar transação"
                >
                  <Edit2 size={18} />
                </button>
              )}
              <button
                onClick={() => handleRemove(currentTransaction.id)}
                className="w-9 h-9 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Remover transação"
                aria-label="Remover transação"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Conteúdo do Card */}
            <div className="flex items-start gap-4 pr-20">
              {/* Ícone grande e redondo */}
              <div className="shrink-0">
                {category ? (
                  <CategoryEmojiSvg
                    emoji={getContextualIcon(currentTransaction.notes || categoryName, categoryName)}
                    backgroundColor={getCategoryColorClass(category).backgroundColor}
                    textColor={getCategoryColorClass(category).color}
                    size={56}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl">{getContextualIcon(currentTransaction.notes || '', null)}</span>
                  </div>
                )}
              </div>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                {type === 'income' ? (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate mb-1">
                          {currentTransaction.notes || categoryName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(currentTransaction.date)}
                        </p>
                      </div>
                      <div className="text-xl font-bold text-green-600 whitespace-nowrap">
                        {formatCurrency(currentTransaction.value)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">Corresponde:</span>
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
                          className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="flex-1 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                          onClick={() => {
                            setEditingPersonId(currentTransaction.id);
                            setEditingPersonValue(getPersonName(currentTransaction.personId));
                          }}
                        >
                          {getPersonName(currentTransaction.personId) || '-'}
                        </div>
                      )}
                    </div>
                    {currentTransaction.notes && category && (
                      <p className="text-xs text-gray-400 mt-2">
                        {currentTransaction.notes}
                      </p>
                    )}
                  </>
                ) : type === 'debt' ? (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          Pagamento Mensal
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(currentTransaction.dueDate || currentTransaction.date)}
                        </p>
                      </div>
                      <div className="text-xl font-bold text-gray-900 whitespace-nowrap">
                        {formatCurrency(currentTransaction.value)}
                      </div>
                    </div>
                    {showStatus && currentTransaction.status && (
                      <div className={`flex items-center gap-3 pt-3 border-t border-gray-100 ${getStatusColor(currentTransaction.status)}`}>
                        <label 
                          className="relative inline-flex items-center cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newStatus = currentTransaction.status === 'paid' ? 'pending' : 'paid';
                            updateTransaction(currentTransaction.id, { status: newStatus });
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
                          />
                          <div className="relative w-6 h-6 flex items-center justify-center">
                            <div className={`absolute inset-0 w-6 h-6 border-2 rounded-md transition-all ${
                              currentTransaction.status === 'paid' 
                                ? 'border-primary bg-primary' 
                                : 'bg-white border-gray-300'
                            }`}></div>
                            <svg className={`relative w-4 h-4 transition-all ${
                              currentTransaction.status === 'paid' 
                                ? 'opacity-100 text-white' 
                                : 'opacity-0'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </label>
                        <span className={`text-sm font-semibold ${
                          currentTransaction.status === 'paid' 
                            ? 'text-gray-900' 
                            : 'text-gray-700'
                        }`}>
                          {getStatusLabel(currentTransaction.status)}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate mb-1">
                          {currentTransaction.notes || categoryName}
                        </h3>
                        {showCategory && category && (
                          <span 
                            className="inline-block text-xs font-semibold px-2 py-1 rounded-full mb-2"
                            style={getCategoryColorClass(category)}
                          >
                            {categoryName}
                          </span>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                          {type === 'expense_variable' && (
                            <span>{formatDate(currentTransaction.date)}</span>
                          )}
                          {showDueDate && type === 'expense_fixed' && (
                            <span>{formatDate(currentTransaction.dueDate || currentTransaction.date)}</span>
                          )}
                          {showInstallments && currentTransaction.installments && (
                            <span>{currentTransaction.installments.current} de {currentTransaction.installments.total}</span>
                          )}
                        </div>
                      </div>
                      <div className={`text-xl font-bold whitespace-nowrap ${
                        isIncome ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isIncome ? '+' : '-'}
                        {formatCurrency(currentTransaction.value)}
                      </div>
                    </div>
                    {showStatus && currentTransaction.status && (
                      <div className={`flex items-center gap-3 pt-3 border-t border-gray-100 ${getStatusColor(currentTransaction.status)}`}>
                        <label 
                          className="relative inline-flex items-center cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newStatus = currentTransaction.status === 'paid' ? 'pending' : 'paid';
                            updateTransaction(currentTransaction.id, { status: newStatus });
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
                          />
                          <div className="relative w-6 h-6 flex items-center justify-center">
                            <div className={`absolute inset-0 w-6 h-6 border-2 rounded-md transition-all ${
                              currentTransaction.status === 'paid' 
                                ? 'border-primary bg-primary' 
                                : 'bg-white border-gray-300'
                            }`}></div>
                            <svg className={`relative w-4 h-4 transition-all ${
                              currentTransaction.status === 'paid' 
                                ? 'opacity-100 text-white' 
                                : 'opacity-0'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </label>
                        <span className={`text-sm font-semibold ${
                          currentTransaction.status === 'paid' 
                            ? 'text-gray-900' 
                            : 'text-gray-700'
                        }`}>
                          {getStatusLabel(currentTransaction.status)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

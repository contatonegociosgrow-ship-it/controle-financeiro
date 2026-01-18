'use client';

import { useMemo, useCallback, useState } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';

type TransactionListProps = {
  type?: 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings' | 'all';
  filter?: string;
  showCategory?: boolean;
  showStatus?: boolean;
  showInstallments?: boolean;
  showDueDate?: boolean;
  columns?: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  'Compras': 'bg-purple-500/20 text-purple-300',
  'Educação': 'bg-blue-500/20 text-blue-300',
  'Saúde': 'bg-yellow-500/20 text-yellow-300',
  'Carro': 'bg-orange-500/20 text-orange-300',
  'Restaurante': 'bg-green-500/20 text-green-300',
  'Casa': 'bg-gray-500/20 text-gray-300',
  'Lazer': 'bg-pink-500/20 text-pink-300',
  'Presente': 'bg-purple-400/20 text-purple-200',
  'Farmácia': 'bg-purple-500/20 text-purple-300',
  'Seguro': 'bg-blue-500/20 text-blue-300',
  'Mercado': 'bg-green-500/20 text-green-300',
  'Assinatura': 'bg-pink-500/20 text-pink-300',
};

export function TransactionList({
  type = 'all',
  filter = '',
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

    if (type !== 'all') {
      filtered = filtered.filter((t) => t.type === type);
    }

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
  }, [state.transactions, state.categories, type, filter]);

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

  const getCategoryColor = (categoryName: string) => {
    const baseColor = CATEGORY_COLORS[categoryName] || 'bg-gray-500/20';
    // Extrair apenas a cor de fundo, forçar texto preto
    const bgColor = baseColor.split(' ').find(c => c.startsWith('bg-')) || 'bg-gray-500/20';
    return `${bgColor} text-gray-900`;
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

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm border border-gray-200 rounded-lg">
        Nenhum lançamento encontrado
      </div>
    );
  }

  // Calcular número real de colunas baseado no tipo
  const getActualColumns = useCallback(() => {
    if (type === 'income') return 5; // Descrição, Recebido em, Valor, Corresponde, Anotação
    if (type === 'expense_fixed') return 5; // Descrição, Categoria, Valor, Vencimento, Status
    if (type === 'expense_variable') return 5; // Descrição, Categoria, Data, Valor, Parcelas
    if (type === 'debt') return 4; // Data, Tipo, Valor, Status
    return columns;
  }, [type, columns]);

  const actualColumns = getActualColumns();

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
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      {headers.length > 0 && (
        <div
          className="grid py-3 px-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider"
          style={{ gridTemplateColumns: `repeat(${actualColumns}, minmax(0, 1fr))` }}
        >
          {headers.map((header, idx) => (
            <div 
              key={idx} 
              className={`font-medium px-3 ${idx !== 0 ? 'border-l border-gray-200' : ''}`}
            >
              {header}
            </div>
          ))}
        </div>
      )}
      
      {/* Rows */}
      {filteredTransactions.map((transaction, index) => {
        const categoryName = getCategoryName(transaction.categoryId);
        const isIncome = transaction.type === 'income';

        return (
          <div
            key={transaction.id}
            className={`grid py-3 px-4 hover:bg-gray-50 text-sm items-center border-b border-gray-200 ${
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
                  <div className={`px-3 py-3 border-l border-gray-200 flex items-center ${getStatusColor(transaction.status)}`}>
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
                {showCategory && (
                  <div className={`px-3 py-3 border-l border-gray-200 flex items-center ${getCategoryColor(categoryName)}`}>
                    <span className="text-xs font-medium">
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
                  <div className={`px-3 py-3 border-l border-gray-200 flex items-center ${getStatusColor(transaction.status)}`}>
                    <span className="text-xs font-medium">
                      {getStatusLabel(transaction.status)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

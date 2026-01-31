'use client';

import { useState } from 'react';
import { Check, X, Edit2, Loader2 } from 'lucide-react';

type ParsedTransaction = {
  description: string;
  value: number;
  type: 'income' | 'expense_fixed' | 'expense_variable';
  category?: string;
  date?: string;
};

type VoiceTransactionConfirmationProps = {
  originalText: string;
  transactions: ParsedTransaction[];
  onConfirm: (transactions: ParsedTransaction[]) => void;
  onEdit: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
};

/**
 * Componente para confirmar lançamentos detectados pela voz
 */
export function VoiceTransactionConfirmation({
  originalText,
  transactions,
  onConfirm,
  onEdit,
  onCancel,
  isProcessing = false,
}: VoiceTransactionConfirmationProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedTransactions, setEditedTransactions] = useState<ParsedTransaction[]>(transactions);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      income: '💰 Ganho',
      expense_fixed: '📅 Despesa Fixa',
      expense_variable: '💳 Despesa Variável',
    };
    return labels[type] || type;
  };

  const handleEditTransaction = (index: number, field: keyof ParsedTransaction, value: any) => {
    const updated = [...editedTransactions];
    updated[index] = { ...updated[index], [field]: value };
    setEditedTransactions(updated);
  };

  const handleConfirm = () => {
    onConfirm(editedTransactions);
  };

  if (isProcessing) {
    return (
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Processando lançamentos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Texto original */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
          Você disse:
        </p>
        <p className="text-sm text-gray-900 dark:text-gray-100 italic">
          "{originalText}"
        </p>
      </div>

      {/* Mensagem de confirmação */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
          Confira se entendi corretamente:
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          {transactions.length === 1 
            ? '1 lançamento detectado' 
            : `${transactions.length} lançamentos detectados`}
        </p>
      </div>

      {/* Lista de transações */}
      <div className="space-y-3">
        {editedTransactions.map((transaction, index) => (
          <div
            key={index}
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            {editingIndex === index ? (
              // Modo edição
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={transaction.description}
                    onChange={(e) => handleEditTransaction(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={transaction.value}
                    onChange={(e) => handleEditTransaction(index, 'value', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Tipo
                  </label>
                  <select
                    value={transaction.type}
                    onChange={(e) => handleEditTransaction(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                  >
                    <option value="income">💰 Ganho</option>
                    <option value="expense_fixed">📅 Despesa Fixa</option>
                    <option value="expense_variable">💳 Despesa Variável</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              // Modo visualização
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getTypeLabel(transaction.type)}
                      {transaction.category && ` • ${transaction.category}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'income' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.value)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingIndex(index)}
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Edit2 className="w-3 h-3" />
                  Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors touch-manipulation"
        >
          <Check className="w-5 h-5" />
          Confirmar {transactions.length > 1 ? `${transactions.length} lançamentos` : 'lançamento'}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors touch-manipulation"
        >
          <Edit2 className="w-5 h-5" />
          Editar Texto
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors touch-manipulation"
        >
          <X className="w-5 h-5" />
          Cancelar
        </button>
      </div>
    </div>
  );
}

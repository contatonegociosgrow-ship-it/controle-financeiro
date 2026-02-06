'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';

type AddRecurringExpenseSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  editingId?: string | null;
};

export function AddRecurringExpenseSheet({ isOpen, onClose, editingId }: AddRecurringExpenseSheetProps) {
  const { state, addRecurringExpense, updateRecurringExpense } = useFinanceStore();
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const editingExpense = editingId ? state.recurringExpenses.find((e) => e.id === editingId) : null;

  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setName(editingExpense.name);
        setValue(editingExpense.value.toString());
        setCategoryId(editingExpense.categoryId);
        setDueDay(editingExpense.dueDay.toString());
        setNotes(editingExpense.notes || '');
      } else {
        setName('');
        setValue('');
        setCategoryId('');
        setDueDay('1');
        setNotes('');
      }
      setSaved(false);
    }
  }, [isOpen, editingExpense]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !value || !categoryId || !dueDay) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      alert('Por favor, insira um valor válido maior que zero.');
      return;
    }

    const numDueDay = parseInt(dueDay, 10);
    if (isNaN(numDueDay) || numDueDay < 1 || numDueDay > 31) {
      alert('Por favor, insira um dia válido (1-31).');
      return;
    }

    if (editingExpense) {
      updateRecurringExpense(editingExpense.id, {
        name: name.trim(),
        value: numValue,
        categoryId,
        dueDay: numDueDay,
        notes: notes.trim() || undefined,
      });
    } else {
      addRecurringExpense({
        name: name.trim(),
        value: numValue,
        categoryId,
        dueDay: numDueDay,
        notes: notes.trim() || undefined,
      });
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {editingExpense ? 'Editar Despesa Recorrente' : 'Nova Despesa Recorrente'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nome da Despesa *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Ex: Aluguel, Internet, Academia"
              required
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Valor Mensal *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="0,00"
              required
            />
            {value && !isNaN(parseFloat(value)) && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(parseFloat(value))}
              </p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Categoria *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              required
            >
              <option value="">Selecione uma categoria</option>
              {state.categories
                .filter((c) => c.name !== 'Ganhos')
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Dia de Vencimento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Dia de Vencimento (1-31) *
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="1"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Esta despesa será criada automaticamente todo mês neste dia
            </p>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              placeholder="Notas adicionais sobre esta despesa..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saved ? '✓ Salvo!' : editingExpense ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

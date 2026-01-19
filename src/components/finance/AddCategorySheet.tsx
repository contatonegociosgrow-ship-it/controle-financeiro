'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { generateColorFromName, COLOR_PALETTE } from '@/lib/categoryColors';
import { ColorPicker } from './ColorPicker';

type AddCategorySheetProps = {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string; // Se fornecido, edita a categoria existente
};

export function AddCategorySheet({ isOpen, onClose, categoryId }: AddCategorySheetProps) {
  const { state, addCategory, updateCategory } = useFinanceStore();
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [color, setColor] = useState<string>('');

  const category = categoryId ? state.categories.find((c) => c.id === categoryId) : null;

  useEffect(() => {
    if (isOpen) {
      if (category) {
        // Modo edição
        setName(category.name);
        setLimit(category.limit?.toString() || '');
        setColor(category.color || generateColorFromName(category.name));
      } else {
        // Modo criação
        setName('');
        setLimit('');
        setColor('');
      }
    }
  }, [isOpen, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor, insira um nome para a categoria.');
      return;
    }

    const limitValue = limit.trim() ? parseFloat(limit.replace(',', '.')) : null;

    if (category) {
      // Editar categoria existente
      updateCategory(categoryId!, {
        name: name.trim(),
        limit: limitValue,
        color: color || undefined,
      });
    } else {
      // Criar nova categoria
      addCategory(name.trim(), limitValue, color || undefined);
    }

    // Resetar formulário
    setName('');
    setLimit('');
    setColor('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-2xl p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {category ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">
              Nome da Categoria
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Gerar cor automaticamente se não tiver selecionado uma
                if (!color && e.target.value.trim()) {
                  setColor(generateColorFromName(e.target.value.trim()));
                }
              }}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Ex: Alimentação"
              required
              autoFocus
            />
          </div>

          <ColorPicker selectedColor={color} onColorChange={setColor} />

          <div>
            <label htmlFor="limit" className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">
              Limite Mensal (Opcional)
            </label>
            <input
              type="number"
              id="limit"
              step="0.01"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="0,00"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
            >
              {category ? 'Salvar Alterações' : 'Adicionar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

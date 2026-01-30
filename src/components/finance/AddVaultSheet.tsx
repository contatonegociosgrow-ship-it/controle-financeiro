'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';

type AddVaultSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  editingId?: string | null;
};

const EMOJI_OPTIONS = ['💰', '🚗', '✈️', '🏠', '🎓', '💍', '🎁', '🏥', '📱', '💻', '🎮', '🎨', '🏋️', '🌴', '🎯'];

export function AddVaultSheet({ isOpen, onClose, editingId }: AddVaultSheetProps) {
  const { addVault, updateVault, state } = useFinanceStore();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💰');
  const [targetValue, setTargetValue] = useState('');
  const [saved, setSaved] = useState(false);

  const editingVault = editingId ? state.vaults.find((v) => v.id === editingId) : null;

  useEffect(() => {
    if (isOpen) {
      if (editingVault) {
        setName(editingVault.name);
        setEmoji(editingVault.emoji);
        setTargetValue(editingVault.targetValue?.toString() || '');
      } else {
        setName('');
        setEmoji('💰');
        setTargetValue('');
      }
      setSaved(false);
    }
  }, [isOpen, editingVault]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor, insira um nome para o cofre.');
      return;
    }

    if (editingVault) {
      updateVault(editingVault.id, {
        name: name.trim(),
        emoji,
        targetValue: targetValue ? parseFloat(targetValue) : undefined,
      });
    } else {
      addVault({
        name: name.trim(),
        emoji,
        targetValue: targetValue ? parseFloat(targetValue) : undefined,
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
            {editingVault ? 'Editar Cofre' : 'Novo Cofre'}
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
              Nome do Cofre *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Ex: Reserva de Emergência"
              required
            />
          </div>

          {/* Emoji */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Emoji
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    emoji === e
                      ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-full mt-2 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-center text-2xl"
              placeholder="💰"
              maxLength={2}
            />
          </div>

          {/* Meta (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Meta (opcional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="0,00"
            />
            {targetValue && !isNaN(parseFloat(targetValue)) && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(parseFloat(targetValue))}
              </p>
            )}
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
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {saved ? '✓ Salvo!' : editingVault ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

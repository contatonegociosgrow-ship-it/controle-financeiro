'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

type VaultDepositWithdrawSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string | null;
  mode: 'deposit' | 'withdraw';
};

export function VaultDepositWithdrawSheet({
  isOpen,
  onClose,
  vaultId,
  mode,
}: VaultDepositWithdrawSheetProps) {
  const { depositToVault, withdrawFromVault, state } = useFinanceStore();
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);

  const vault = vaultId ? state.vaults.find((v) => v.id === vaultId) : null;

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setSaved(false);
    }
  }, [isOpen]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!value || !vault) {
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      alert('Por favor, insira um valor válido maior que zero.');
      return;
    }

    if (mode === 'withdraw' && numValue > vault.currentValue) {
      alert('Valor maior que o disponível no cofre.');
      return;
    }

    if (mode === 'deposit') {
      depositToVault(vault.id, numValue);
    } else {
      withdrawFromVault(vault.id, numValue);
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  if (!isOpen || !vault) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {mode === 'deposit' ? (
              <ArrowDownCircle className="text-green-600" size={24} />
            ) : (
              <ArrowUpCircle className="text-red-600" size={24} />
            )}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {mode === 'deposit' ? 'Depositar no Cofre' : 'Retirar do Cofre'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{vault.emoji}</span>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{vault.name}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(vault.currentValue)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Valor {mode === 'deposit' ? 'a depositar' : 'a retirar'} *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={mode === 'withdraw' ? vault.currentValue : undefined}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
              placeholder="0,00"
              required
              autoFocus
            />
            {value && !isNaN(parseFloat(value)) && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(parseFloat(value))}
              </p>
            )}
            {mode === 'withdraw' && vault.currentValue > 0 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Disponível: {formatCurrency(vault.currentValue)}
              </p>
            )}
          </div>

          {mode === 'deposit' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                💡 O depósito será registrado como movimentação interna. O dinheiro no cofre não conta como gasto.
              </p>
            </div>
          )}

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
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors text-white ${
                saved
                  ? 'bg-green-600'
                  : mode === 'deposit'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {saved ? '✓ Concluído!' : mode === 'deposit' ? 'Depositar' : 'Retirar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

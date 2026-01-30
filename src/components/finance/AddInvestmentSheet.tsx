'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { formatDateToBR, formatDateToISO, applyDateMask, getTodayISO } from '@/lib/goalUtils';

type AddInvestmentSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  editingId?: string | null;
};

const INVESTMENT_TYPES = [
  { value: 'fixed_income', label: '🏦 Renda Fixa' },
  { value: 'variable_income', label: '📈 Renda Variável' },
  { value: 'crypto', label: '🪙 Criptomoedas' },
  { value: 'monthly', label: '🌱 Investimento Mensal' },
  { value: 'goal_based', label: '🎯 Investimento por Meta' },
];

export function AddInvestmentSheet({ isOpen, onClose, editingId }: AddInvestmentSheetProps) {
  const { addInvestment, updateInvestment, investFromVault, state } = useFinanceStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<'fixed_income' | 'variable_income' | 'crypto' | 'monthly' | 'goal_based'>('fixed_income');
  const [value, setValue] = useState('');
  const [applicationDate, setApplicationDate] = useState('');
  
  // Função helper para garantir que a data está sempre no formato BR
  const getDisplayDate = (date: string): string => {
    if (!date) return '';
    // Se já está no formato BR (contém /), retornar como está
    if (date.includes('/')) return date;
    // Se está no formato ISO (YYYY-MM-DD), converter
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return formatDateToBR(date);
    }
    return date;
  };
  const [estimatedReturn, setEstimatedReturn] = useState('');
  const [notes, setNotes] = useState('');
  const [sourceFromVault, setSourceFromVault] = useState(false);
  const [selectedVaultId, setSelectedVaultId] = useState<string>('');
  const [saved, setSaved] = useState(false);

  const editingInvestment = editingId ? state.investments.find((inv) => inv.id === editingId) : null;

  useEffect(() => {
    if (isOpen) {
      if (editingInvestment) {
        setName(editingInvestment.name);
        setType(editingInvestment.type);
        setValue(editingInvestment.value.toString());
        // Garantir que a data está no formato brasileiro
        const brDate = formatDateToBR(editingInvestment.applicationDate);
        setApplicationDate(brDate || '');
        setEstimatedReturn(editingInvestment.estimatedReturn?.toString() || '');
        setNotes(editingInvestment.notes || '');
        setSourceFromVault(false);
        setSelectedVaultId('');
      } else {
        const todayISO = getTodayISO();
        setName('');
        setType('fixed_income');
        setValue('');
        setApplicationDate(formatDateToBR(todayISO));
        setEstimatedReturn('');
        setNotes('');
        setSourceFromVault(false);
        setSelectedVaultId('');
      }
      setSaved(false);
    }
  }, [isOpen, editingInvestment]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !value || !applicationDate) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Converter data brasileira para ISO
    const isoDate = formatDateToISO(applicationDate);
    if (!isoDate) {
      alert('Por favor, insira uma data válida no formato DD/MM/AAAA.');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      alert('Por favor, insira um valor válido maior que zero.');
      return;
    }

    const numReturn = estimatedReturn ? parseFloat(estimatedReturn) : undefined;
    if (estimatedReturn && (isNaN(numReturn!) || numReturn! < 0)) {
      alert('Por favor, insira um rendimento válido (0 ou maior).');
      return;
    }

    if (editingInvestment) {
      updateInvestment(editingInvestment.id, {
        name: name.trim(),
        type,
        value: numValue,
        applicationDate: isoDate,
        estimatedReturn: numReturn,
        notes: notes.trim() || undefined,
      });
    } else {
      const investmentId = addInvestment({
        name: name.trim(),
        type,
        value: numValue,
        applicationDate: isoDate,
        estimatedReturn: numReturn,
        notes: notes.trim() || undefined,
      });

      // Se o investimento veio do cofre, fazer a transferência
      if (sourceFromVault && selectedVaultId) {
        const vault = state.vaults.find((v) => v.id === selectedVaultId);
        if (vault && vault.currentValue >= numValue) {
          investFromVault(selectedVaultId, investmentId, numValue);
        } else {
          alert('Valor insuficiente no cofre selecionado.');
          return;
        }
      }
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
            {editingInvestment ? 'Editar Investimento' : 'Novo Investimento'}
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
              Nome do Investimento *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Ex: Tesouro IPCA+ 2029"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Investimento *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              required
            >
              {INVESTMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Valor Aplicado *
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

          {/* Data de Aplicação */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Data de Aplicação *
            </label>
            <input
              type="text"
              value={getDisplayDate(applicationDate)}
              onChange={(e) => {
                // Se o valor parece ser ISO (YYYY-MM-DD), converter primeiro
                let inputValue = e.target.value;
                if (inputValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  inputValue = formatDateToBR(inputValue);
                }
                const masked = applyDateMask(inputValue);
                if (masked.length <= 10) {
                  setApplicationDate(masked);
                }
              }}
              onBlur={(e) => {
                // Se o valor está vazio ou incompleto, não fazer nada
                if (!e.target.value || e.target.value.length < 10) {
                  return;
                }
                // Validar a data sem converter de volta (para evitar problemas de fuso horário)
                const isoDate = formatDateToISO(e.target.value);
                if (!isoDate) {
                  // Se a data é inválida, tentar converter se estiver em formato ISO
                  if (e.target.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    setApplicationDate(formatDateToBR(e.target.value));
                  } else {
                    // Se inválida, limpar o campo
                    setApplicationDate('');
                  }
                }
                // Se a data é válida, manter o valor original (já está no formato BR)
              }}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              required
            />
          </div>

          {/* Rendimento Estimado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Rendimento Estimado (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={estimatedReturn}
              onChange={(e) => setEstimatedReturn(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Ex: 4.5"
            />
            {estimatedReturn && !isNaN(parseFloat(estimatedReturn)) && value && !isNaN(parseFloat(value)) && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                Retorno estimado: {formatCurrency(parseFloat(value) * parseFloat(estimatedReturn) / 100)}
              </p>
            )}
          </div>

          {/* Fonte do Investimento (apenas para novos investimentos) */}
          {!editingInvestment && state.vaults.length > 0 && (
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={sourceFromVault}
                  onChange={(e) => {
                    setSourceFromVault(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedVaultId('');
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  📈 Investir a partir do Cofre
                </span>
              </label>
              
              {sourceFromVault && (
                <select
                  value={selectedVaultId}
                  onChange={(e) => setSelectedVaultId(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required={sourceFromVault}
                >
                  <option value="">Selecione um cofre</option>
                  {state.vaults.map((vault) => (
                    <option key={vault.id} value={vault.id}>
                      {vault.emoji} {vault.name} - {formatCurrency(vault.currentValue)}
                    </option>
                  ))}
                </select>
              )}
              
              {sourceFromVault && selectedVaultId && value && !isNaN(parseFloat(value)) && (
                (() => {
                  const vault = state.vaults.find((v) => v.id === selectedVaultId);
                  const canInvest = vault && vault.currentValue >= parseFloat(value);
                  return (
                    <p className={`mt-2 text-xs ${canInvest ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {canInvest
                        ? `✓ Valor disponível no cofre`
                        : `⚠ Valor insuficiente no cofre`}
                    </p>
                  );
                })()
              )}
            </div>
          )}

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
              placeholder="Notas adicionais sobre o investimento..."
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
              {saved ? '✓ Salvo!' : editingInvestment ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

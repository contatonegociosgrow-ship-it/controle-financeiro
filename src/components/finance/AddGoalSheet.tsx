'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { validateGoal, formatDateToISO, formatDateToBR } from '@/lib/goalUtils';

type AddGoalSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddGoalSheet({ isOpen, onClose }: AddGoalSheetProps) {
  const { addGoal, state } = useFinanceStore();
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [saved, setSaved] = useState(false);
  const [showAutoAdjust, setShowAutoAdjust] = useState(false);

  // Função para aplicar máscara DD/MM/YYYY
  const applyDateMask = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4, 8)}`;
  };

  // Validação em tempo real
  const validation = useMemo(() => {
    if (!targetValue || !monthlyContribution || !startDate) {
      return null;
    }

    const target = parseFloat(targetValue);
    const monthly = parseFloat(monthlyContribution);
    const isoStartDate = formatDateToISO(startDate);
    const isoDeadline = deadline ? formatDateToISO(deadline) : undefined;

    if (!isoStartDate || isNaN(target) || isNaN(monthly) || target <= 0 || monthly <= 0) {
      return null;
    }

    return validateGoal(target, monthly, isoStartDate, isoDeadline);
  }, [targetValue, monthlyContribution, startDate, deadline]);

  // Inicializar data de início quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      setStartDate(formatDateToBR(today.toISOString().split('T')[0]));
      setDeadline('');
      setTitle('');
      setTargetValue('');
      setMonthlyContribution('');
      setSaved(false);
    }
  }, [isOpen]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const handleAutoAdjustDeadline = () => {
    if (validation && validation.minEndDateBR) {
      setDeadline(validation.minEndDateBR);
      setShowAutoAdjust(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !targetValue || !monthlyContribution || !startDate) {
      return;
    }

    // Validar e converter datas
    const isoStartDate = formatDateToISO(startDate);
    if (!isoStartDate || isoStartDate.length !== 10) {
      alert('Por favor, insira uma data de início válida no formato DD/MM/AAAA');
      return;
    }

    const target = parseFloat(targetValue);
    const monthly = parseFloat(monthlyContribution);

    if (isNaN(target) || isNaN(monthly) || target <= 0 || monthly <= 0) {
      alert('Por favor, insira valores válidos maiores que zero.');
      return;
    }

    // Validar meta matematicamente
    const isoDeadline = deadline ? formatDateToISO(deadline) : undefined;
    const goalValidation = validateGoal(target, monthly, isoStartDate, isoDeadline);

    if (!goalValidation.isValid) {
      // Mostrar mensagem de erro e oferecer ajuste automático
      setShowAutoAdjust(true);
      return;
    }

    // Se não há prazo informado, usar o prazo mínimo calculado
    const finalDeadline = deadline ? isoDeadline : goalValidation.minEndDate;

    addGoal({
      title: title.trim(),
      targetValue: target,
      monthlyContribution: monthly,
      startDate: isoStartDate,
      deadline: finalDeadline,
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setTitle('');
      setTargetValue('');
      setMonthlyContribution('');
      setDeadline('');
      setShowAutoAdjust(false);
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
        className="w-full max-w-sm mx-auto bg-white rounded-t-2xl p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Nova Meta</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">
              Título da Meta
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Ex: Reserva de emergência"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">
              Valor Alvo
            </label>
            <input
              type="number"
              step="0.01"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">
              Contribuição Mensal
            </label>
            <input
              type="number"
              step="0.01"
              value={monthlyContribution}
              onChange={(e) => {
                setMonthlyContribution(e.target.value);
                setShowAutoAdjust(false);
              }}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="0,00"
              required
            />
            {validation && validation.message && (
              <p className={`text-xs mt-1.5 ${
                validation.isValid ? 'text-blue-600' : 'text-red-600'
              }`}>
                {validation.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">
              Data de Início
            </label>
            <input
              type="text"
              value={startDate}
              onChange={(e) => {
                const masked = applyDateMask(e.target.value);
                if (masked.length <= 10) {
                  setStartDate(masked);
                }
              }}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">
              Prazo (Opcional)
            </label>
            <input
              type="text"
              value={deadline}
              onChange={(e) => {
                const masked = applyDateMask(e.target.value);
                if (masked.length <= 10) {
                  setDeadline(masked);
                  setShowAutoAdjust(false);
                }
              }}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 transition-all ${
                validation && !validation.isValid && deadline
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {validation && !validation.isValid && deadline && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700 mb-2">{validation.message}</p>
                {showAutoAdjust && (
                  <button
                    type="button"
                    onClick={handleAutoAdjustDeadline}
                    className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
                  >
                    Ajustar prazo para {validation.minEndDateBR}
                  </button>
                )}
              </div>
            )}
            {validation && validation.isValid && !deadline && (
              <p className="text-xs text-gray-500 mt-1.5">
                Se não informar, o prazo será definido automaticamente para {validation.minEndDateBR}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saved || (validation !== null && !validation.isValid && deadline.length > 0)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm"
          >
            {saved ? '✓ Salvo!' : 'Criar Meta'}
          </button>
        </form>
      </div>
    </div>
  );
}

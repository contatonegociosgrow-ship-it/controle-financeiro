'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';

type AddDebtSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddDebtSheet({ isOpen, onClose }: AddDebtSheetProps) {
  const { addDebt, state } = useFinanceStore();
  const [title, setTitle] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [installments, setInstallments] = useState('');
  const [startDate, setStartDate] = useState('');
  const [saved, setSaved] = useState(false);

  // Função para aplicar máscara DD/MM/YYYY
  const applyDateMask = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4, 8)}`;
  };

  // Converter data BR para ISO
  const formatDateToISO = (brDate: string): string => {
    if (!brDate) return '';
    const cleaned = brDate.replace(/\D/g, '');
    if (cleaned.length !== 8) return '';
    const day = cleaned.substring(0, 2);
    const month = cleaned.substring(2, 4);
    const year = cleaned.substring(4, 8);
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(date.getTime())) return '';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Converter data ISO para BR
  const formatDateToBR = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Obter data atual sem problemas de fuso horário
  const getTodayISO = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Inicializar quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setStartDate(formatDateToBR(getTodayISO()));
      setTitle('');
      setTotalValue('');
      setInstallments('');
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

    if (!title || !totalValue || !installments || !startDate) {
      return;
    }

    const total = parseFloat(totalValue);
    const installmentsNum = parseInt(installments, 10);
    const isoStartDate = formatDateToISO(startDate);

    if (isNaN(total) || isNaN(installmentsNum) || total <= 0 || installmentsNum <= 0 || !isoStartDate) {
      return;
    }

    try {
      addDebt({
        title,
        totalValue: total,
        installments: installmentsNum,
        startDate: isoStartDate,
      });

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao adicionar dívida:', error);
    }
  };

  const installmentValue =
    totalValue && installments
      ? parseFloat(totalValue) / parseInt(installments, 10)
      : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-2xl p-4 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Nova Dívida Parcelada</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Ex: Financiamento do carro"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">
              Valor Total
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={totalValue}
              onChange={(e) => setTotalValue(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">
              Número de Parcelas
            </label>
            <input
              type="number"
              min="1"
              value={installments}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || parseInt(val, 10) > 0) {
                  setInstallments(val);
                }
              }}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Ex: 12"
              required
            />
          </div>

          {installmentValue > 0 && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Valor por parcela:</span>{' '}
                {formatCurrency(installmentValue)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">
              Data de Início
            </label>
            <input
              type="text"
              value={startDate}
              onChange={(e) => {
                const masked = applyDateMask(e.target.value);
                setStartDate(masked);
              }}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="DD/MM/AAAA"
              maxLength={10}
              required
            />
          </div>

          <button
            type="submit"
            disabled={saved}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all disabled:bg-green-600 shadow-sm hover:shadow-md text-sm"
          >
            {saved ? '✓ Salvo!' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { CardUI } from './CardUI';

type DebtInstallmentsCardProps = {
  debt: {
    id: string;
    value: number;
    date: string;
    dueDate?: string;
    monthlyPaymentDate?: number;
    installments?: { current: number; total: number } | null;
    paidInstallments?: number[];
    notes?: string;
  };
};

export function DebtInstallmentsCard({ debt }: DebtInstallmentsCardProps) {
  const { updateTransaction, state } = useFinanceStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    // Converter diretamente de ISO (YYYY-MM-DD) para BR (DD/MM/YYYY) sem usar Date
    if (!dateStr) return '';
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  // Calcular datas das parcelas
  const installments = useMemo(() => {
    if (!debt.installments || debt.installments.total <= 1) {
      return [];
    }

    // Parse da data ISO (YYYY-MM-DD) diretamente para evitar problemas de fuso horário
    const dateMatch = debt.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) {
      return [];
    }

    const startYear = parseInt(dateMatch[1], 10);
    const startMonth = parseInt(dateMatch[2], 10) - 1; // getMonth() retorna 0-11
    const startDay = parseInt(dateMatch[3], 10);

    // Criar data local (sem fuso horário)
    const startDate = new Date(startYear, startMonth, startDay);
    const total = debt.installments.total;
    const paidInstallments = debt.paidInstallments || [];
    const paymentDay = debt.monthlyPaymentDate || startDay;

    const result = [];
    for (let i = 1; i <= total; i++) {
      // Calcular data da parcela adicionando meses
      const installmentYear = startYear + Math.floor((startMonth + (i - 1)) / 12);
      const installmentMonth = (startMonth + (i - 1)) % 12;
      const installmentDate = new Date(installmentYear, installmentMonth, paymentDay);

      result.push({
        number: i,
        date: installmentDate,
        isPaid: paidInstallments.includes(i),
      });
    }

    return result;
  }, [debt]);

  const handleToggleInstallment = (installmentNumber: number) => {
    const currentPaid = debt.paidInstallments || [];
    const isPaid = currentPaid.includes(installmentNumber);

    let newPaidInstallments: number[];
    if (isPaid) {
      // Desmarcar: remover do array
      newPaidInstallments = currentPaid.filter((n) => n !== installmentNumber);
    } else {
      // Marcar: adicionar ao array
      newPaidInstallments = [...currentPaid, installmentNumber].sort((a, b) => a - b);
    }

    // Atualizar status geral baseado nas parcelas pagas
    const totalInstallments = debt.installments?.total || 1;
    const allPaid = newPaidInstallments.length === totalInstallments;

    updateTransaction(debt.id, {
      paidInstallments: newPaidInstallments,
      status: allPaid ? 'paid' : newPaidInstallments.length > 0 ? 'pending' : 'pending',
    });
  };

  if (!debt.installments || debt.installments.total <= 1) {
    return null;
  }

  const paidCount = (debt.paidInstallments || []).length;
  const totalCount = debt.installments.total;
  const percentage = (paidCount / totalCount) * 100;

  return (
    <CardUI className="shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {debt.notes || 'Dívida Parcelada'}
          </h3>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{formatCurrency(debt.value)}</span>
            {' × '}
            <span>{totalCount} parcelas</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-700">
            {paidCount} de {totalCount}
          </div>
          <div className="text-xs text-gray-500">parcelas pagas</div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Lista de parcelas */}
      <div className="space-y-2">
        {installments.map((installment) => {
          if (typeof window === 'undefined') return null;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const installmentDate = new Date(installment.date);
          if (isNaN(installmentDate.getTime())) return null;
          installmentDate.setHours(0, 0, 0, 0);
          const isPastDue = installmentDate < today && !installment.isPaid;

          return (
            <div
              key={installment.number}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                installment.isPaid
                  ? 'bg-green-50 border-green-200'
                  : isPastDue
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={installment.isPaid}
                  onChange={() => handleToggleInstallment(installment.number)}
                  className="w-5 h-5 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all duration-200 checked:bg-blue-600 checked:border-blue-600 hover:border-blue-400 shadow-sm"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      Parcela {installment.number}/{totalCount}
                    </span>
                    {isPastDue && !installment.isPaid && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                        Vencida
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {formatDate(typeof installment.date === 'string' ? installment.date : installment.date.toISOString().split('T')[0])} • {formatCurrency(debt.value)}
                  </div>
                </div>
              </div>
              {installment.isPaid && (
                <div className="text-green-600 font-semibold text-sm">✓ Pago</div>
              )}
            </div>
          );
        })}
      </div>
    </CardUI>
  );
}

'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { CardUI } from './CardUI';

export function CardDividas() {
  const { state } = useFinanceStore();

  const debts = useMemo(() => {
    return state.transactions.filter((t) => t.type === 'debt');
  }, [state.transactions]);

  const currentYear = new Date().getFullYear();
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

  const monthlyData = useMemo(() => {
    const data = new Map<string, { paid: number; pending: number }>();
    
    debts.forEach((debt) => {
      if (debt.monthlyPaymentDate) {
        for (let month = 0; month < 12; month++) {
          const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
          const debtDate = new Date(`${monthKey}-${String(debt.monthlyPaymentDate).padStart(2, '0')}`);
          const now = new Date();
          
          if (debtDate <= now && debt.status === 'paid') {
            const current = data.get(monthKey) || { paid: 0, pending: 0 };
            current.paid += debt.value;
            data.set(monthKey, current);
          } else if (debtDate > now || debt.status === 'pending') {
            const current = data.get(monthKey) || { paid: 0, pending: 0 };
            current.pending += debt.value;
            data.set(monthKey, current);
          }
        }
      }
    });

    return data;
  }, [debts, currentYear]);

  const summary = useMemo(() => {
    const totalOwed = debts.reduce((sum, d) => sum + d.value, 0);
    const totalPaid = debts.filter((d) => d.status === 'paid').reduce((sum, d) => sum + d.value, 0);
    const remaining = totalOwed - totalPaid;
    const monthlyPayment = debts.length > 0 ? debts[0].value : 0;
    const monthsToZero = monthlyPayment > 0 ? Math.ceil(remaining / monthlyPayment) : 0;

    return {
      totalOwed,
      totalPaid,
      monthsToZero,
    };
  }, [debts]);

  const upcomingPayments = useMemo(() => {
    return debts
      .filter((d) => d.status === 'pending' || d.status === 'overdue')
      .sort((a, b) => {
        const dateA = new Date(a.dueDate || a.date).getTime();
        const dateB = new Date(b.dueDate || b.date).getTime();
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [debts]);

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

  const maxBarValue = useMemo(() => {
    let max = 0;
    monthlyData.forEach((data) => {
      max = Math.max(max, data.paid + data.pending);
    });
    return max || 1;
  }, [monthlyData]);

  return (
    <CardUI className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔗</span>
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Dívidas</h2>
      </div>

      {/* Gráfico de Pagamentos */}
      <div className="mb-6">
        <h3 className="text-sm text-gray-700 mb-3 font-semibold tracking-tight">Gráfico de Pagamentos</h3>
        <div className="flex items-end gap-2 h-24">
          {months.slice(8, 12).map((month, idx) => {
            const monthNum = idx + 9;
            const monthKey = `${currentYear}-${String(monthNum).padStart(2, '0')}`;
            const data = monthlyData.get(monthKey) || { paid: 0, pending: 0 };
            const total = data.paid + data.pending;
            const paidHeight = maxBarValue > 0 ? (data.paid / maxBarValue) * 100 : 0;
            const pendingHeight = maxBarValue > 0 ? (data.pending / maxBarValue) * 100 : 0;

            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col-reverse gap-0.5 h-20">
                  {data.paid > 0 && (
                    <div
                      className="bg-green-500 rounded-t"
                      style={{ height: `${paidHeight}%` }}
                    />
                  )}
                  {data.pending > 0 && (
                    <div
                      className="bg-pink-500 rounded-t"
                      style={{ height: `${pendingHeight}%` }}
                    />
                  )}
                </div>
                <span className="text-xs text-gray-600">{month}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Pago</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-pink-500 rounded"></div>
            <span>A pagar</span>
          </div>
        </div>
      </div>

      {/* Resumo do Ano */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm text-gray-700 mb-3 font-semibold tracking-tight">Resumo do Ano</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Quanto devo</span>
            <span className="text-gray-800 font-semibold">{formatCurrency(summary.totalOwed)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Quanto paguei</span>
            <span className="text-gray-800 font-semibold">{formatCurrency(summary.totalPaid)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Meses até zerar</span>
            <span className="text-gray-800 font-semibold">{summary.monthsToZero} meses</span>
          </div>
        </div>
      </div>

      {/* Lista de Pagamentos */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-sm text-gray-700 mb-3 font-semibold tracking-tight">Próximos Pagamentos</h3>
        {upcomingPayments.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">Nenhum pagamento pendente</div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 py-3 px-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <div className="font-medium px-3">Data do Pagamento</div>
              <div className="font-medium px-3 border-l border-gray-200">Tipo de Lançamento</div>
              <div className="font-medium px-3 border-l border-gray-200">Valor</div>
              <div className="font-medium px-3 border-l border-gray-200">Status</div>
            </div>
            
            {/* Rows */}
            {upcomingPayments.map((payment, index) => (
              <div
                key={payment.id}
                className={`grid grid-cols-4 py-3 px-4 hover:bg-gray-50 text-sm border-b border-gray-200 ${
                  index === upcomingPayments.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <div className="text-gray-600 text-sm px-3">{formatDate(payment.dueDate || payment.date)}</div>
                <div className="text-gray-900 font-medium px-3 border-l border-gray-200">Pagamento Mensal</div>
                <div className="text-gray-900 font-semibold text-base px-3 border-l border-gray-200">{formatCurrency(payment.value)}</div>
                <div className={`px-3 py-3 border-l border-gray-200 flex items-center ${getStatusColor(payment.status)}`}>
                  <span className="text-xs font-medium">
                    {getStatusLabel(payment.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardUI>
  );
}

'use client';

import { useFinanceStore } from '@/lib/FinanceProvider';
import { getCurrentInstallment, getInstallmentDueDate, canMarkInstallmentAsPaid } from '@/lib/debtUtils';
import { CardUI } from './CardUI';

type DebtCardProps = {
  debt: {
    id: string;
    title: string;
    totalValue: number;
    installments: number;
    installmentValue: number;
    startDate: string;
    paidInstallments: number[];
    status: 'active' | 'completed';
    createdAt: number;
  };
};

export function DebtCard({ debt }: DebtCardProps) {
  const { markDebtInstallmentAsPaid, removeDebt, state } = useFinanceStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const currentInstallment = getCurrentInstallment(debt);
  const paidCount = debt.paidInstallments.length;
  const progress = debt.installments > 0 ? (paidCount / debt.installments) * 100 : 0;

  const handleMarkAsPaid = () => {
    if (currentInstallment === null) {
      return;
    }

    if (!canMarkInstallmentAsPaid(debt, currentInstallment)) {
      return;
    }

    markDebtInstallmentAsPaid(debt.id, currentInstallment);
  };

  const handleRemove = () => {
    if (confirm(`Tem certeza que deseja remover a dívida "${debt.title}"?`)) {
      removeDebt(debt.id);
    }
  };

  return (
    <CardUI>
      <div className="space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{debt.title}</h3>
            <p className="text-sm text-gray-600">
              Total: {formatCurrency(debt.totalValue)} • {debt.installments} parcelas
            </p>
          </div>
          {debt.status === 'completed' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              Concluída
            </span>
          )}
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Parcela {currentInstallment || 'N/A'} de {debt.installments}
            </span>
            <span className="font-semibold text-gray-900">
              {paidCount} de {debt.installments} pagas
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Informações da parcela atual */}
        {currentInstallment !== null && debt.status === 'active' && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Parcela {currentInstallment}
                </p>
                <p className="text-xs text-gray-600">
                  Vencimento: {getInstallmentDueDate(debt, currentInstallment)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(debt.installmentValue)}
                </p>
              </div>
            </div>

            {/* Botão marcar como paga */}
            {!debt.paidInstallments.includes(currentInstallment) && (
              <button
                onClick={handleMarkAsPaid}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all text-sm shadow-sm hover:shadow-md"
              >
                Marcar como paga
              </button>
            )}

            {/* Status se já está paga */}
            {debt.paidInstallments.includes(currentInstallment) && (
              <div className="w-full mt-2 bg-green-100 text-green-800 font-semibold py-2 rounded-lg text-sm text-center">
                ✓ Paga
              </div>
            )}
          </div>
        )}

        {/* Mensagem se todas as parcelas foram pagas */}
        {debt.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-green-800">
              ✓ Todas as parcelas foram pagas!
            </p>
          </div>
        )}

        {/* Mensagem se não há parcela atual */}
        {currentInstallment === null && debt.status === 'active' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">
              {paidCount === debt.installments
                ? 'Todas as parcelas foram pagas'
                : 'Aguardando próxima parcela'}
            </p>
          </div>
        )}

        {/* Botão remover */}
        <button
          onClick={handleRemove}
          className="w-full min-h-[44px] text-red-600 hover:text-red-700 active:text-red-800 active:bg-red-50 dark:active:bg-red-900/20 text-sm font-medium py-3 px-4 rounded-lg transition-colors touch-manipulation border border-red-200 dark:border-red-800/30 hover:border-red-300 dark:hover:border-red-700/50"
          aria-label="Remover dívida"
        >
          Remover dívida
        </button>
      </div>
    </CardUI>
  );
}

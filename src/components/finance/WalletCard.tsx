'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { getCurrentMonthUnpaidInstallments } from '@/lib/debtUtils';
import { CardUI } from './CardUI';

type WalletCardProps = {
  variant?: 'income' | 'expense';
};

export function WalletCard({ variant = 'income' }: WalletCardProps) {
  const { state } = useFinanceStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  // Calcular valores do mês atual e carteira
  const balanceData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyIncome = state.profile.monthlyIncome || 0;

    // Ganhos do mês atual
    const monthlyIncomeTransactions = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'income' &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);

    // Gastos do mês atual (despesas fixas, variáveis, dívidas e economias)
    const monthlyExpenses = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          ['expense_fixed', 'expense_variable', 'debt', 'savings'].includes(t.type) &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);

    // Investimentos do mês atual (deduzir da carteira)
    const monthlyInvestments = state.investments
      .filter((inv) => {
        const investmentDate = new Date(inv.applicationDate);
        return (
          investmentDate.getMonth() === currentMonth &&
          investmentDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, inv) => sum + inv.value, 0);

    // Saldo do mês = Salário + Ganhos do mês - Gastos do mês - Investimentos do mês
    const currentBalance = monthlyIncome + monthlyIncomeTransactions - monthlyExpenses - monthlyInvestments;

    return {
      monthlyIncome,
      monthlyIncomeTransactions,
      monthlyExpenses,
      monthlyInvestments,
      currentBalance,
    };
  }, [state]);

  return (
    <div className="relative w-full h-[180px] sm:h-[200px] overflow-hidden group">
      {/* Carteira - Efeito 3D */}
      <div className="relative w-full h-full transform transition-all duration-500 group-hover:scale-[1.01]">
        {/* Sombra da carteira - dentro do container */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-2 bg-black/10 dark:bg-black/20 rounded-full blur-md"></div>
        
        {/* Corpo principal da carteira - Textura de couro realista (marrom para ganhos, preto para gastos) */}
        <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 wallet-leather-texture ${
          variant === 'expense' 
            ? 'border-gray-900/50 dark:border-gray-800/50' 
            : 'border-amber-900/40 dark:border-amber-800/50'
        }`}
          style={{
            background: variant === 'expense' 
              ? `
                radial-gradient(ellipse 120% 80% at 15% 25%, rgba(20, 20, 20, 0.95) 0%, transparent 60%),
                radial-gradient(ellipse 100% 70% at 85% 75%, rgba(10, 10, 10, 1) 0%, transparent 60%),
                radial-gradient(ellipse 150% 90% at 50% 50%, rgba(30, 30, 30, 0.9) 0%, transparent 70%),
                radial-gradient(ellipse 80% 60% at 70% 30%, rgba(25, 25, 25, 0.9) 0%, transparent 55%),
                linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 15%, #2a2a2a 30%, #0f0f0f 45%, #1a1a1a 60%, #0f0f0f 75%, #1a1a1a 90%, #0f0f0f 100%)
              `
              : `
                radial-gradient(ellipse 120% 80% at 15% 25%, rgba(139, 69, 19, 0.9) 0%, transparent 60%),
                radial-gradient(ellipse 100% 70% at 85% 75%, rgba(101, 67, 33, 1) 0%, transparent 60%),
                radial-gradient(ellipse 150% 90% at 50% 50%, rgba(120, 80, 40, 0.8) 0%, transparent 70%),
                radial-gradient(ellipse 80% 60% at 70% 30%, rgba(139, 69, 19, 0.85) 0%, transparent 55%),
                linear-gradient(135deg, #8B4513 0%, #654321 15%, #7A4A2A 30%, #654321 45%, #8B4513 60%, #654321 75%, #8B4513 90%, #654321 100%)
              `,
            backgroundSize: '200% 200%',
          }}
        >
          {/* Textura de couro - Padrão de poros e veios realista */}
          <div className="absolute inset-0 opacity-50" style={{
            backgroundImage: `
              radial-gradient(circle at 12% 22%, rgba(0,0,0,0.5) 0.3px, transparent 0.3px),
              radial-gradient(circle at 28% 38%, rgba(0,0,0,0.4) 0.3px, transparent 0.3px),
              radial-gradient(circle at 45% 28%, rgba(0,0,0,0.45) 0.3px, transparent 0.3px),
              radial-gradient(circle at 62% 48%, rgba(0,0,0,0.4) 0.3px, transparent 0.3px),
              radial-gradient(circle at 78% 68%, rgba(0,0,0,0.5) 0.3px, transparent 0.3px),
              radial-gradient(circle at 35% 58%, rgba(0,0,0,0.4) 0.3px, transparent 0.3px),
              radial-gradient(circle at 55% 72%, rgba(0,0,0,0.35) 0.3px, transparent 0.3px),
              radial-gradient(circle at 18% 45%, rgba(0,0,0,0.4) 0.3px, transparent 0.3px),
              radial-gradient(circle at 88% 35%, rgba(0,0,0,0.45) 0.3px, transparent 0.3px),
              linear-gradient(25deg, transparent 0%, rgba(0,0,0,0.2) 20%, transparent 40%, rgba(0,0,0,0.15) 60%, transparent 80%, rgba(0,0,0,0.1) 100%),
              linear-gradient(115deg, transparent 0%, rgba(0,0,0,0.15) 25%, transparent 50%, rgba(0,0,0,0.12) 75%, transparent 100%),
              linear-gradient(155deg, transparent 0%, rgba(0,0,0,0.1) 30%, transparent 70%, rgba(0,0,0,0.08) 100%)
            `,
            backgroundSize: '22px 22px, 26px 26px, 30px 30px, 24px 24px, 28px 28px, 25px 25px, 27px 27px, 23px 23px, 29px 29px, 120px 120px, 140px 140px, 160px 160px',
            backgroundPosition: '0 0, 8px 8px, 4px 12px, 12px 4px, 16px 16px, 6px 10px, 14px 18px, 2px 6px, 18px 14px, 0 0, 30px 30px, 60px 60px'
          }}></div>
          
          {/* Padrão de veios e estrias do couro */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `
              repeating-linear-gradient(42deg, transparent, transparent 1.5px, rgba(0,0,0,0.12) 1.5px, rgba(0,0,0,0.12) 3px),
              repeating-linear-gradient(-38deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px),
              repeating-linear-gradient(128deg, transparent, transparent 2.5px, rgba(0,0,0,0.08) 2.5px, rgba(0,0,0,0.08) 5px)
            `,
            backgroundSize: '35px 35px, 45px 45px, 55px 55px',
            backgroundPosition: '0 0, 10px 10px, 20px 20px'
          }}></div>
          
          {/* Efeito Glossy no topo - brilho sutil */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-amber-200/25 via-amber-100/10 to-transparent rounded-t-2xl"></div>
          
          {/* Brilho e profundidade do couro - múltiplas camadas */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 via-transparent to-amber-900/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/25 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/5 to-transparent"></div>
          
          {/* Efeito de relevo e profundidade - sombra interna para parecer costurado */}
          <div className="absolute inset-0" style={{
            boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(255,255,255,0.15), 0 0 0 1px rgba(0,0,0,0.1)'
          }}></div>
          
          {/* Costura nas bordas */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Costura superior */}
            <div className="absolute top-2 left-4 right-4 h-0.5 border-t border-b border-amber-800/40"></div>
            {/* Costura inferior */}
            <div className="absolute bottom-2 left-4 right-4 h-0.5 border-t border-b border-amber-800/40"></div>
            {/* Pontos de costura */}
            <div className="absolute top-2 left-4 w-1 h-1 bg-amber-800/60 rounded-full"></div>
            <div className="absolute top-2 right-4 w-1 h-1 bg-amber-800/60 rounded-full"></div>
            <div className="absolute bottom-2 left-4 w-1 h-1 bg-amber-800/60 rounded-full"></div>
            <div className="absolute bottom-2 right-4 w-1 h-1 bg-amber-800/60 rounded-full"></div>
          </div>

          {/* Conteúdo interno */}
          <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-5">
            {/* Header - Logo/Título */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-900/50 rounded-lg backdrop-blur-sm border border-amber-800/40 shadow-inner">
                  <svg className="w-4 h-4 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-amber-50 tracking-wide drop-shadow-md">Carteira</h2>
              </div>
              {/* Indicador de status - Verde para ganhos, Vermelho para gastos */}
              <div className={`w-3 h-3 rounded-full shadow-lg ${
                variant === 'expense' ? 'bg-red-500' : 'bg-green-500'
              }`}></div>
            </div>

            {/* Valor principal - Destaque */}
            <div className="flex items-baseline gap-1 px-1">
              <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight truncate drop-shadow-lg ${
                balanceData.currentBalance >= 0 
                  ? 'text-amber-50' 
                  : 'text-red-300'
              }`}>
                {formatCurrency(balanceData.currentBalance)}
              </p>
            </div>

            {/* Informações do mês - Estilo de etiqueta */}
            <div className="space-y-1.5 pt-1 bg-amber-900/20 rounded-lg p-2 border border-amber-800/30 backdrop-blur-sm">
              {/* Salário base */}
              <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="text-amber-200/90 font-medium">Salário:</span>
                <span className="font-bold truncate ml-2 text-amber-50 drop-shadow-sm">
                  {formatCurrency(balanceData.monthlyIncome)}
                </span>
              </div>

              {/* Gastos do mês */}
              <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="text-amber-200/90 font-medium">Gastos:</span>
                <span className="font-bold truncate ml-2 text-red-300 drop-shadow-sm">
                  {formatCurrency(balanceData.monthlyExpenses)}
                </span>
              </div>

              {/* Ganhos do mês */}
              <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="text-amber-200/90 font-medium">Ganhos:</span>
                <span className="font-bold truncate ml-2 text-green-300 drop-shadow-sm">
                  {formatCurrency(balanceData.monthlyIncomeTransactions)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

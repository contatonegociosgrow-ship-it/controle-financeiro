import { getCurrentMonthUnpaidInstallments } from './debtUtils';
import type { FinanceState } from './storage';

export type FinancialHealthStatus = 'excellent' | 'good' | 'warning' | 'critical';

export type FinancialHealthData = {
  status: FinancialHealthStatus;
  score: number; // 0-100
  message: string;
  recommendations: string[];
  monthlyIncome: number;
  totalExpenses: number;
  totalGoals: number;
  totalDebts: number;
  totalCommitted: number;
  availableMoney: number;
  expensePercentage: number; // % do salário comprometido
};

/**
 * Calcula a saúde financeira do usuário baseado em:
 * - Salário mensal
 * - Gastos do mês
 * - Metas ativas
 * - Dívidas parceladas do mês
 */
export function calculateFinancialHealth(state: FinanceState): FinancialHealthData {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyIncome = state.profile.monthlyIncome || 0;

  // Calcular despesas do mês atual
  const monthlyExpenses = state.transactions
    .filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        ['expense_fixed', 'expense_variable', 'debt'].includes(t.type) &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.value, 0);

  // Calcular total de contribuições mensais das metas ativas
  const monthlyGoals = state.goals
    .filter((g) => g.status === 'active')
    .reduce((sum, g) => sum + g.monthlyContribution, 0);

  // Calcular dívidas parceladas do mês atual
  const monthlyDebts = getCurrentMonthUnpaidInstallments(state.debts);

  // Total comprometido
  const totalCommitted = monthlyExpenses + monthlyGoals + monthlyDebts;

  // Dinheiro disponível
  const availableMoney = monthlyIncome - totalCommitted;

  // Porcentagem do salário comprometido
  const expensePercentage = monthlyIncome > 0 ? (totalCommitted / monthlyIncome) * 100 : 0;

  // Calcular score e status
  let score = 100;
  let status: FinancialHealthStatus = 'excellent';
  let message = '';
  const recommendations: string[] = [];

  // Critérios de avaliação
  if (monthlyIncome === 0) {
    score = 0;
    status = 'critical';
    message = 'Configure seu salário mensal para começar a análise';
    recommendations.push('Adicione seu salário mensal no perfil');
  } else if (availableMoney < 0) {
    // Saldo negativo
    score = 20;
    status = 'critical';
    message = 'Atenção! Você está gastando mais do que ganha';
    recommendations.push('Reduza gastos urgentemente');
    recommendations.push('Revise suas metas financeiras');
    recommendations.push('Considere negociar dívidas');
  } else if (expensePercentage >= 90) {
    // Mais de 90% comprometido
    score = 30;
    status = 'critical';
    message = 'Situação crítica: quase todo seu salário está comprometido';
    recommendations.push('Reduza gastos não essenciais');
    recommendations.push('Revise suas metas e dívidas');
    recommendations.push('Crie uma reserva de emergência');
  } else if (expensePercentage >= 75) {
    // Entre 75% e 90%
    score = 50;
    status = 'warning';
    message = 'Cuidado: você está comprometendo muito do seu salário';
    recommendations.push('Tente reduzir gastos em 10-15%');
    recommendations.push('Revise se todas as metas são prioritárias');
    recommendations.push('Considere aumentar sua renda');
  } else if (expensePercentage >= 60) {
    // Entre 60% e 75%
    score = 70;
    status = 'good';
    message = 'Bom controle financeiro, mas há espaço para melhorias';
    recommendations.push('Mantenha o controle dos gastos');
    recommendations.push('Considere aumentar suas economias');
    recommendations.push('Revise periodicamente suas metas');
  } else if (expensePercentage >= 50) {
    // Entre 50% e 60%
    score = 85;
    status = 'good';
    message = 'Excelente controle financeiro!';
    recommendations.push('Continue mantendo esse padrão');
    recommendations.push('Considere investir o excedente');
    recommendations.push('Mantenha uma reserva de emergência');
  } else {
    // Menos de 50%
    score = 100;
    status = 'excellent';
    message = 'Parabéns! Sua saúde financeira está excelente';
    recommendations.push('Continue mantendo esse padrão');
    recommendations.push('Considere investir o excedente');
    recommendations.push('Aumente suas metas de economia');
  }

  // Recomendações adicionais baseadas em metas e dívidas
  if (monthlyGoals > monthlyIncome * 0.3) {
    recommendations.push('Suas metas estão consumindo mais de 30% da renda - considere revisar');
  }

  if (monthlyDebts > monthlyIncome * 0.2) {
    recommendations.push('Suas dívidas estão altas - priorize o pagamento');
  }

  if (availableMoney > monthlyIncome * 0.3 && state.goals.filter((g) => g.status === 'active').length === 0) {
    recommendations.push('Você tem dinheiro disponível - considere criar metas de economia');
  }

  return {
    status,
    score,
    message,
    recommendations,
    monthlyIncome,
    totalExpenses: monthlyExpenses,
    totalGoals: monthlyGoals,
    totalDebts: monthlyDebts,
    totalCommitted: totalCommitted,
    availableMoney,
    expensePercentage,
  };
}

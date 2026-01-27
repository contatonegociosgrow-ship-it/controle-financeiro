import type { FinanceState } from './storage';

export type SalaryStatus = 'excellent' | 'good' | 'warning' | 'critical';

export function getSalaryPercentage(value: number, monthlyIncome: number): number {
  if (monthlyIncome === 0) return 0;
  return (value / monthlyIncome) * 100;
}

export function getSalaryStatus(percentage: number): SalaryStatus {
  if (percentage < 50) return 'excellent';
  if (percentage < 60) return 'good';
  if (percentage < 75) return 'warning';
  return 'critical';
}

export function getStatusColor(status: SalaryStatus): string {
  switch (status) {
    case 'excellent':
      return 'text-green-600 dark:text-green-400';
    case 'good':
      return 'text-green-500 dark:text-green-500';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'critical':
      return 'text-red-600 dark:text-red-400';
  }
}

export function getStatusBgColor(status: SalaryStatus): string {
  switch (status) {
    case 'excellent':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    case 'good':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    case 'critical':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  }
}

export function calculateMonthlyTotal(
  state: FinanceState,
  type: 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings'
): number {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return state.transactions
    .filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        t.type === type &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.value, 0);
}

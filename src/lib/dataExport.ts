import type { FinanceState } from './storage';

/**
 * Exporta os dados financeiros para JSON
 */
export function exportToJSON(state: FinanceState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Exporta as transações para CSV
 */
export function exportToCSV(state: FinanceState): string {
  const headers = [
    'ID',
    'Tipo',
    'Categoria',
    'Valor',
    'Data',
    'Data Vencimento',
    'Status',
    'Parcelas',
    'Notas',
  ];

  const rows = state.transactions.map((transaction) => {
    const category = state.categories.find((c) => c.id === transaction.categoryId);
    const categoryName = category?.name || 'Sem categoria';
    
    const typeMap: Record<string, string> = {
      income: 'Ganho',
      expense_fixed: 'Despesa Fixa',
      expense_variable: 'Despesa Variável',
      debt: 'Dívida',
      savings: 'Economia',
    };

    const statusMap: Record<string, string> = {
      paid: 'Pago',
      pending: 'Pendente',
      overdue: 'Vencido',
    };

    const installmentsStr = transaction.installments
      ? `${transaction.installments.current}/${transaction.installments.total}`
      : '';

    return [
      transaction.id,
      typeMap[transaction.type] || transaction.type,
      categoryName,
      transaction.value.toFixed(2).replace('.', ','),
      transaction.date,
      transaction.dueDate || '',
      transaction.status ? statusMap[transaction.status] || transaction.status : '',
      installmentsStr,
      transaction.notes || '',
    ];
  });

  const csvContent = [
    headers.join(';'),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(';')),
  ].join('\n');

  return csvContent;
}

/**
 * Valida e importa dados JSON
 */
export function importFromJSON(jsonData: string): FinanceState | null {
  try {
    const imported = JSON.parse(jsonData);
    
    // Validação básica da estrutura
    if (
      !imported ||
      typeof imported !== 'object' ||
      !imported.profile ||
      !Array.isArray(imported.transactions) ||
      !Array.isArray(imported.categories)
    ) {
      return null;
    }

    // Garantir estrutura mínima
    const importedState: FinanceState = {
      meta: {
        schemaVersion: imported.meta?.schemaVersion || 1,
        updatedAt: Date.now(),
      },
      profile: {
        name: imported.profile.name || '',
        currency: imported.profile.currency || 'BRL',
        monthlyIncome: imported.profile.monthlyIncome || 0,
        wallet: imported.profile.wallet || 0,
      },
      categories: imported.categories || [],
      people: imported.people || [],
      cards: imported.cards || [],
      transactions: imported.transactions || [],
      goals: imported.goals || [],
      debts: imported.debts || [],
      investments: imported.investments || [],
      vaults: imported.vaults || [],
      settings: {
        theme: imported.settings?.theme || 'light',
      },
    };

    return importedState;
  } catch (error) {
    console.error('Erro ao importar JSON:', error);
    return null;
  }
}

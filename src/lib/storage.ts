type FinanceState = {
  meta: { schemaVersion: number; updatedAt: number };
  profile: { 
    name: string; 
    currency: 'BRL' | 'USD' | 'EUR';
    monthlyIncome: number;
    wallet: number; // Carteira/Saldo atual
  };
  categories: { id: string; name: string; limit?: number | null; color?: string }[];
  people: { id: string; name: string }[];
  cards: { id: string; name: string; limit: number; closingDay: number; dueDay: number; createdAt: number }[];
  transactions: {
    id: string;
    value: number;
    type: 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings';
    categoryId: string;
    cardId?: string | null;
    personId?: string | null;
    date: string; // YYYY-MM-DD
    dueDate?: string; // YYYY-MM-DD (para despesas fixas e dívidas)
    notes?: string;
    createdAt: number;
    // Para despesas variáveis
    installments?: {
      current: number;
      total: number;
    } | null;
    // Status para despesas fixas e dívidas
    status?: 'paid' | 'pending' | 'overdue';
    // Para dívidas: data de pagamento mensal
    monthlyPaymentDate?: number; // dia do mês (1-31)
    // Para dívidas parceladas: controle de parcelas pagas
    paidInstallments?: number[]; // array com números das parcelas pagas (ex: [1, 2, 3])
  }[];
  goals: {
    id: string;
    title: string;
    targetValue: number;
    monthlyContribution: number;
    currentValue: number;
    startDate: string;
    deadline?: string;
    status: 'active' | 'completed';
  }[];
  debts: {
    id: string;
    title: string;
    totalValue: number;
    installments: number;
    installmentValue: number;
    startDate: string;
    paidInstallments: number[];
    status: 'active' | 'completed';
    createdAt: number;
  }[];
  settings: { theme: 'dark' | 'light' };
};

const STORAGE_KEY = 'app:finance:v1';

const defaultState: FinanceState = {
  meta: {
    schemaVersion: 1,
    updatedAt: Date.now(),
  },
  profile: {
    name: '',
    currency: 'BRL',
    monthlyIncome: 0,
    wallet: 0,
  },
  categories: [],
  people: [],
  cards: [],
  transactions: [],
  goals: [],
  debts: [],
  settings: {
    theme: 'light',
  },
};

let saveTimeout: NodeJS.Timeout | null = null;

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function loadState(): FinanceState {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  const state = safeParse<FinanceState>(stored, defaultState);

  // Migração futura baseada em schemaVersion pode ser adicionada aqui
  if (state.meta?.schemaVersion !== 1) {
    return defaultState;
  }

  // Migração: garantir compatibilidade com dados antigos
  // Primeiro, garantir que a categoria "Ganhos" existe
  let categories = [...state.categories];
  let ganhosCategory = categories.find((c) => c.name === 'Ganhos');
  let categoriesChanged = false;
  
  if (!ganhosCategory) {
    ganhosCategory = {
      id: crypto.randomUUID(),
      name: 'Ganhos',
      limit: null,
      color: '#22c55e', // verde
    };
    categories.push(ganhosCategory);
    categoriesChanged = true;
  }

  // Migração: corrigir transações de ganho que têm categoria errada
  let transactionsChanged = false;
  const migratedTransactions = state.transactions.map((t) => {
    // Se é transação de ganho e não tem categoria "Ganhos", corrigir
    if (t.type === 'income') {
      const currentCategory = categories.find((c) => c.id === t.categoryId);
      if (!currentCategory || currentCategory.name !== 'Ganhos') {
        // Corrigir para usar categoria "Ganhos"
        transactionsChanged = true;
        return {
          ...t,
          categoryId: ganhosCategory!.id,
          paidInstallments: t.paidInstallments ?? undefined,
        };
      }
    }
    return {
      ...t,
      paidInstallments: t.paidInstallments ?? undefined,
    };
  });

  const migratedState: FinanceState = {
    ...state,
    profile: {
      ...state.profile,
      monthlyIncome: state.profile.monthlyIncome ?? 0,
      wallet: state.profile.wallet ?? 0,
    },
    goals: state.goals ?? [],
    debts: state.debts ?? [],
    transactions: migratedTransactions,
    categories: categories,
    settings: {
      theme: state.settings?.theme ?? 'light',
    },
  };

  // Salvar estado migrado se houve mudanças
  if (transactionsChanged || categoriesChanged) {
    // Salvar apenas se estiver no cliente
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...migratedState,
            meta: {
              ...migratedState.meta,
              updatedAt: Date.now(),
            },
          }));
        } catch (error) {
          console.error('Erro ao salvar migração:', error);
        }
      }, 100);
    }
  }

  return migratedState;
}

export function saveState(state: FinanceState): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Debounce: cancela o save anterior se ainda não executou
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    const stateToSave: FinanceState = {
      ...state,
      meta: {
        ...state.meta,
        updatedAt: Date.now(),
      },
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }, 250);
}

export function resetState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Erro ao resetar localStorage:', error);
  }
}

export type { FinanceState };

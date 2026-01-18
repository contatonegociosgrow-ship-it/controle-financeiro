type FinanceState = {
  meta: { schemaVersion: number; updatedAt: number };
  profile: { name: string; currency: 'BRL' | 'USD' | 'EUR' };
  categories: { id: string; name: string; limit?: number | null }[];
  people: { id: string; name: string }[];
  cards: { id: string; name: string; closingDay: number; dueDay: number }[];
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
  },
  categories: [],
  people: [],
  cards: [],
  transactions: [],
  settings: {
    theme: 'dark',
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

  return state;
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

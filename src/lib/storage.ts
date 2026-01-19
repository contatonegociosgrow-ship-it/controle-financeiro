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

  // Migração: simplificar categorias
  const CATEGORY_MIGRATION_MAP: Record<string, string> = {
    'Casa': 'Moradia',
    'Restaurante': 'Alimentação',
    'Mercado': 'Alimentação',
    'Carro': 'Transporte',
    'Farmácia': 'Saúde',
    'Presente': 'Outros',
    'Assinatura': 'Outros',
    'Seguro': 'Outros',
  };

  const DEFAULT_CATEGORIES = [
    'Ganhos',
    'Moradia',
    'Alimentação',
    'Transporte',
    'Compras',
    'Educação',
    'Saúde',
    'Lazer',
    'Trabalho',
    'Outros',
  ];

  let categories = [...state.categories];
  let categoriesChanged = false;
  let transactionsChanged = false;

  // 1. Criar categorias padrão se não existirem (incluindo "Ganhos")
  const existingCategoryNames = new Set(categories.map((c) => c.name));
  const missingCategories = DEFAULT_CATEGORIES.filter((name) => !existingCategoryNames.has(name));
  
  if (missingCategories.length > 0) {
    const { DEFAULT_CATEGORY_COLORS } = require('./categoryColors');
    missingCategories.forEach((name) => {
      categories.push({
        id: crypto.randomUUID(),
        name,
        limit: null,
        color: DEFAULT_CATEGORY_COLORS[name] || '#94a3b8',
      });
      categoriesChanged = true;
    });
  }

  // 2. Remover apenas categorias antigas que têm migração (mantém "Ganhos")
  const categoriesToKeep = categories.filter((cat) => {
    // Remover categorias antigas que têm migração
    if (CATEGORY_MIGRATION_MAP[cat.name] && CATEGORY_MIGRATION_MAP[cat.name] !== cat.name) {
      categoriesChanged = true;
      return false;
    }
    return true;
  });

  categories = categoriesToKeep;

  // 3. Criar mapa de nomes para IDs (após remoção)
  const categoryNameToId = new Map<string, string>();
  categories.forEach((cat) => {
    categoryNameToId.set(cat.name, cat.id);
  });

  // 4. Migrar transações: atualizar categoryId para novas categorias
  const migratedTransactions = state.transactions.map((t) => {
    // Buscar categoria original (antes da remoção)
    const originalCategory = state.categories.find((c) => c.id === t.categoryId);
    const currentCategory = categories.find((c) => c.id === t.categoryId);
    
    // Se é transação de income e não está usando "Ganhos", migrar para "Ganhos"
    if (t.type === 'income') {
      const ganhosId = categoryNameToId.get('Ganhos');
      if (ganhosId && t.categoryId !== ganhosId) {
        transactionsChanged = true;
        return {
          ...t,
          categoryId: ganhosId,
          paidInstallments: t.paidInstallments ?? undefined,
        };
      }
    }
    
    // Se categoria não existe mais (foi removida)
    if (!currentCategory) {
      let targetCategoryId: string | undefined;
      
      if (originalCategory) {
        // Verificar se precisa migrar
        const newName = CATEGORY_MIGRATION_MAP[originalCategory.name];
        if (newName) {
          targetCategoryId = categoryNameToId.get(newName);
        }
      }
      
      // Se não encontrou, usar "Outros"
      if (!targetCategoryId) {
        targetCategoryId = categoryNameToId.get('Outros');
      }
      
      if (targetCategoryId && t.categoryId !== targetCategoryId) {
        transactionsChanged = true;
        return {
          ...t,
          categoryId: targetCategoryId,
          paidInstallments: t.paidInstallments ?? undefined,
        };
      }
    } else if (originalCategory && CATEGORY_MIGRATION_MAP[originalCategory.name] && CATEGORY_MIGRATION_MAP[originalCategory.name] !== originalCategory.name) {
      // Categoria antiga ainda existe: migrar para nova
      const newName = CATEGORY_MIGRATION_MAP[originalCategory.name];
      const newCategoryId = categoryNameToId.get(newName);
      if (newCategoryId && newCategoryId !== t.categoryId) {
        transactionsChanged = true;
        return {
          ...t,
          categoryId: newCategoryId,
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

// Helper para popular dados iniciais (apenas para desenvolvimento/teste)
import { type FinanceState } from './storage';
import { DEFAULT_CATEGORY_COLORS } from './categoryColors';

export function getSeedData(): Partial<FinanceState> {
  return {
    categories: [
      { id: crypto.randomUUID(), name: 'Ganhos', limit: null, color: DEFAULT_CATEGORY_COLORS['Ganhos'] },
      { id: crypto.randomUUID(), name: 'Casa', limit: null, color: DEFAULT_CATEGORY_COLORS['Casa'] },
      { id: crypto.randomUUID(), name: 'Restaurante', limit: null, color: DEFAULT_CATEGORY_COLORS['Restaurante'] },
      { id: crypto.randomUUID(), name: 'Carro', limit: null, color: DEFAULT_CATEGORY_COLORS['Carro'] },
      { id: crypto.randomUUID(), name: 'Compras', limit: null, color: DEFAULT_CATEGORY_COLORS['Compras'] },
      { id: crypto.randomUUID(), name: 'Educação', limit: null, color: DEFAULT_CATEGORY_COLORS['Educação'] },
      { id: crypto.randomUUID(), name: 'Saúde', limit: null, color: DEFAULT_CATEGORY_COLORS['Saúde'] },
      { id: crypto.randomUUID(), name: 'Presente', limit: null, color: DEFAULT_CATEGORY_COLORS['Presente'] },
      { id: crypto.randomUUID(), name: 'Lazer', limit: null, color: DEFAULT_CATEGORY_COLORS['Lazer'] },
      { id: crypto.randomUUID(), name: 'Farmácia', limit: null, color: DEFAULT_CATEGORY_COLORS['Farmácia'] },
      { id: crypto.randomUUID(), name: 'Seguro', limit: null, color: DEFAULT_CATEGORY_COLORS['Seguro'] },
      { id: crypto.randomUUID(), name: 'Mercado', limit: null, color: DEFAULT_CATEGORY_COLORS['Mercado'] },
      { id: crypto.randomUUID(), name: 'Assinatura', limit: null, color: DEFAULT_CATEGORY_COLORS['Assinatura'] },
    ],
    profile: {
      name: 'Usuário',
      currency: 'BRL',
      monthlyIncome: 0,
      wallet: 0,
    },
    goals: [],
    debts: [],
  };
}

// Função para garantir que categorias padrão existam
export function ensureDefaultCategories(state: FinanceState): FinanceState {
  const defaultCategories = [
    'Ganhos',
    'Casa',
    'Restaurante',
    'Carro',
    'Compras',
    'Educação',
    'Saúde',
    'Presente',
    'Lazer',
    'Farmácia',
    'Seguro',
    'Mercado',
    'Assinatura',
  ];

  const existingNames = new Set(state.categories.map((c) => c.name));
  const missingCategories = defaultCategories
    .filter((name) => !existingNames.has(name))
    .map((name) => ({
      id: crypto.randomUUID(),
      name,
      limit: null,
      color: DEFAULT_CATEGORY_COLORS[name],
    }));

  if (missingCategories.length > 0) {
    return {
      ...state,
      categories: [...state.categories, ...missingCategories],
    };
  }

  return state;
}

// Para usar no console do browser durante desenvolvimento:
// const seed = getSeedData();
// // Depois adicionar via store ou editar localStorage diretamente

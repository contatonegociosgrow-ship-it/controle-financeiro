// Helper para popular dados iniciais (apenas para desenvolvimento/teste)
import { type FinanceState } from './storage';
import { DEFAULT_CATEGORY_COLORS } from './categoryColors';

export function getSeedData(): Partial<FinanceState> {
  return {
    categories: [
      { id: crypto.randomUUID(), name: 'Ganhos', limit: null, color: DEFAULT_CATEGORY_COLORS['Ganhos'] },
      { id: crypto.randomUUID(), name: 'Moradia', limit: null, color: DEFAULT_CATEGORY_COLORS['Moradia'] },
      { id: crypto.randomUUID(), name: 'Alimentação', limit: null, color: DEFAULT_CATEGORY_COLORS['Alimentação'] },
      { id: crypto.randomUUID(), name: 'Transporte', limit: null, color: DEFAULT_CATEGORY_COLORS['Transporte'] },
      { id: crypto.randomUUID(), name: 'Compras', limit: null, color: DEFAULT_CATEGORY_COLORS['Compras'] },
      { id: crypto.randomUUID(), name: 'Educação', limit: null, color: DEFAULT_CATEGORY_COLORS['Educação'] },
      { id: crypto.randomUUID(), name: 'Saúde', limit: null, color: DEFAULT_CATEGORY_COLORS['Saúde'] },
      { id: crypto.randomUUID(), name: 'Lazer', limit: null, color: DEFAULT_CATEGORY_COLORS['Lazer'] },
      { id: crypto.randomUUID(), name: 'Trabalho', limit: null, color: DEFAULT_CATEGORY_COLORS['Trabalho'] },
      { id: crypto.randomUUID(), name: 'Outros', limit: null, color: DEFAULT_CATEGORY_COLORS['Outros'] },
    ],
    profile: {
      name: '',
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

// Mapeamento de categorias antigas para novas
export const CATEGORY_MIGRATION_MAP: Record<string, string> = {
  'Casa': 'Moradia',
  'Restaurante': 'Alimentação',
  'Mercado': 'Alimentação',
  'Carro': 'Transporte',
  'Farmácia': 'Saúde',
  'Presente': 'Outros',
  'Assinatura': 'Outros',
  'Seguro': 'Outros',
};

// Para usar no console do browser durante desenvolvimento:
// const seed = getSeedData();
// // Depois adicionar via store ou editar localStorage diretamente

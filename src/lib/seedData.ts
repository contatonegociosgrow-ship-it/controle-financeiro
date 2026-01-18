// Helper para popular dados iniciais (apenas para desenvolvimento/teste)
import { type FinanceState } from './storage';

export function getSeedData(): Partial<FinanceState> {
  return {
    categories: [
      { id: crypto.randomUUID(), name: 'Casa', limit: null },
      { id: crypto.randomUUID(), name: 'Restaurante', limit: null },
      { id: crypto.randomUUID(), name: 'Carro', limit: null },
      { id: crypto.randomUUID(), name: 'Compras', limit: null },
      { id: crypto.randomUUID(), name: 'Educação', limit: null },
      { id: crypto.randomUUID(), name: 'Saúde', limit: null },
      { id: crypto.randomUUID(), name: 'Presente', limit: null },
      { id: crypto.randomUUID(), name: 'Lazer', limit: null },
      { id: crypto.randomUUID(), name: 'Farmácia', limit: null },
      { id: crypto.randomUUID(), name: 'Seguro', limit: null },
      { id: crypto.randomUUID(), name: 'Mercado', limit: null },
      { id: crypto.randomUUID(), name: 'Assinatura', limit: null },
    ],
    profile: {
      name: 'Usuário',
      currency: 'BRL',
    },
  };
}

// Função para garantir que categorias padrão existam
export function ensureDefaultCategories(state: FinanceState): FinanceState {
  const defaultCategories = [
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

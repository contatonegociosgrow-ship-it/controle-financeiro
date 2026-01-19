// Utilitário para gerenciar cores de categorias

// Cores padrão para categorias conhecidas
export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  'Ganhos': '#22c55e',       // green-500 (verde)
  'Casa': '#f97316',         // orange-500 (laranja)
  'Compras': '#c084fc',      // purple-400
  'Educação': '#ec4899',     // pink-500
  'Saúde': '#eab308',        // yellow-500
  'Carro': '#f97316',        // orange-500
  'Restaurante': '#22c55e',  // green-500
  'Lazer': '#ec4899',        // pink-500
  'Presente': '#c084fc',     // purple-400
  'Farmácia': '#a855f7',     // purple-500
  'Seguro': '#3b82f6',       // blue-500
  'Mercado': '#f97316',      // orange-500
  'Assinatura': '#ec4899',   // pink-500
};

// Paleta de cores predefinidas para escolha do usuário
export const COLOR_PALETTE = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#c084fc', // purple-400
];

/**
 * Gera uma cor baseada no nome da categoria usando hash
 * Retorna uma cor consistente para o mesmo nome
 */
export function generateColorFromName(name: string): string {
  // Se existe cor padrão, usa ela
  if (DEFAULT_CATEGORY_COLORS[name]) {
    return DEFAULT_CATEGORY_COLORS[name];
  }

  // Gera hash do nome
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Usa o hash para escolher uma cor da paleta
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

/**
 * Obtém a cor de uma categoria
 * Prioriza: cor armazenada > cor padrão > cor gerada
 */
export function getCategoryColor(category: { name: string; color?: string }): string {
  if (category.color) {
    return category.color;
  }
  return generateColorFromName(category.name);
}

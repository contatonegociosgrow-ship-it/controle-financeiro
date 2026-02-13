// Utilitário para gerenciar cores de categorias

// Cores padrão para categorias conhecidas
// Usa a cor primária do logo (#80c040) para categorias de ganhos
export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  'Ganhos': '#80c040',       // Cor primária do logo (verde)
  'Moradia': '#f97316',      // orange-500 (laranja)
  'Alimentação': '#80c040',  // Cor primária do logo (verde)
  'Transporte': '#3b82f6',   // blue-500 (azul)
  'Compras': '#c084fc',      // purple-400 (roxo)
  'Educação': '#ec4899',     // pink-500 (rosa)
  'Saúde': '#eab308',        // yellow-500 (amarelo)
  'Lazer': '#06b6d4',        // cyan-500 (ciano)
  'Trabalho': '#6366f1',     // indigo-500 (índigo)
  'Outros': '#94a3b8',       // slate-400 (cinza)
  // Categorias antigas (mantidas para migração)
  'Casa': '#f97316',         // orange-500
  'Restaurante': '#80c040',  // Cor primária do logo
  'Carro': '#3b82f6',        // blue-500
  'Presente': '#94a3b8',     // slate-400
  'Farmácia': '#eab308',     // yellow-500
  'Seguro': '#94a3b8',       // slate-400
  'Mercado': '#80c040',      // Cor primária do logo
  'Assinatura': '#94a3b8',   // slate-400
};

// Paleta de cores predefinidas para escolha do usuário
// Inclui a cor primária do logo
export const COLOR_PALETTE = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#80c040', // Cor primária do logo (verde)
  '#90d040', // Cor secundária do logo (verde claro)
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

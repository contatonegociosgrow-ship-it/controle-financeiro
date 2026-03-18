export const CATEGORY_EMOJIS: Record<string, string> = {
  'Ganhos': '💰',
  'Moradia': '🏠',
  'Alimentação': '🍽️',
  'Transporte': '🚗',
  'Compras': '🛒',
  'Educação': '📚',
  'Saúde': '🏥',
  'Lazer': '🎬',
  'Trabalho': '💼',
  'Outros': '📦',

  // Categorias antigas/migradas (mantidas para compatibilidade)
  'Casa': '🏠',
  'Restaurante': '🍽️',
  'Mercado': '🛒',
  'Carro': '🚗',
  'Farmácia': '💊',
  'Presente': '🎁',
  'Assinatura': '📱',
  'Seguro': '🛡️',

  // Mais específicas (caso existam como nome)
  'Dívidas': '💳',
  'Investimentos': '📈',
  'Cofre': '🔐',
};

export function getCategoryEmoji(categoryName: string | undefined | null) {
  const key = (categoryName || '').trim();
  return CATEGORY_EMOJIS[key] || '📋';
}

/**
 * Detecta ícone contextual inteligente baseado no nome ou descrição da transação
 */
export function getContextualIcon(transactionName: string, categoryName?: string | null): string {
  const normalized = (transactionName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const category = (categoryName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Detecção por palavras-chave na descrição
  const keywordMap: Record<string, string> = {
    // Transporte
    'uber': '🚗', 'taxi': '🚗', 'onibus': '🚌', 'ônibus': '🚌', 'metro': '🚇', 'metrô': '🚇',
    'combustivel': '⛽', 'combustível': '⛽', 'gasolina': '⛽', 'estacionamento': '🅿️',
    // Alimentação
    'mercado': '🛒', 'supermercado': '🛒', 'padaria': '🥖', 'restaurante': '🍽️', 'lanche': '🍔',
    'ifood': '🍔', 'delivery': '🍔', 'pizza': '🍕', 'cafe': '☕', 'café': '☕',
    // Compras
    'amazon': '📦', 'magazine': '🛍️', 'loja': '🛍️', 'shopping': '🛍️', 'roupa': '👕',
    // Saúde
    'farmacia': '💊', 'farmácia': '💊', 'medico': '🏥', 'médico': '🏥', 'hospital': '🏥',
    'remedio': '💊', 'remédio': '💊', 'consulta': '🏥',
    // Educação
    'escola': '📚', 'curso': '📚', 'livro': '📚', 'material': '📚', 'faculdade': '🎓',
    // Lazer
    'cinema': '🎬', 'netflix': '🎬', 'spotify': '🎵', 'jogo': '🎮', 'viagem': '✈️',
    // Trabalho
    'salario': '💰', 'salário': '💰', 'pagamento': '💰', 'recebimento': '💰',
    // Moradia
    'aluguel': '🏠', 'condominio': '🏠', 'condomínio': '🏠', 'luz': '💡', 'agua': '💧',
    'água': '💧', 'internet': '📶', 'telefone': '📱',
  };
  
  // Verificar palavras-chave
  for (const [keyword, emoji] of Object.entries(keywordMap)) {
    if (normalized.includes(keyword) || category.includes(keyword)) {
      return emoji;
    }
  }
  
  // Se não encontrou, usar emoji da categoria
  if (categoryName) {
    return getCategoryEmoji(categoryName);
  }
  
  // Fallback padrão
  return '📋';
}


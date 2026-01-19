// Cores e logos dos principais bancos brasileiros

export type BankInfo = {
  name: string;
  color: string;
  icon: string;
  gradient?: string; // Gradiente opcional
};

export const BANK_COLORS: Record<string, BankInfo> = {
  // Nubank
  nubank: {
    name: 'Nubank',
    color: '#8A05BE',
    icon: '💜',
    gradient: 'from-purple-600 to-purple-800',
  },
  // Itaú
  itau: {
    name: 'Itaú',
    color: '#EC7000',
    icon: '🟠',
    gradient: 'from-orange-500 to-orange-700',
  },
  // Bradesco
  bradesco: {
    name: 'Bradesco',
    color: '#CC092F',
    icon: '🔴',
    gradient: 'from-red-600 to-red-800',
  },
  // Banco do Brasil
  'banco do brasil': {
    name: 'Banco do Brasil',
    color: '#FEDD00',
    icon: '🟡',
    gradient: 'from-yellow-400 to-yellow-600',
  },
  bb: {
    name: 'Banco do Brasil',
    color: '#FEDD00',
    icon: '🟡',
    gradient: 'from-yellow-400 to-yellow-600',
  },
  // Santander
  santander: {
    name: 'Santander',
    color: '#EC0000',
    icon: '🔴',
    gradient: 'from-red-500 to-red-700',
  },
  // Caixa
  caixa: {
    name: 'Caixa',
    color: '#0066B3',
    icon: '🔵',
    gradient: 'from-blue-600 to-blue-800',
  },
  'caixa econômica': {
    name: 'Caixa',
    color: '#0066B3',
    icon: '🔵',
    gradient: 'from-blue-600 to-blue-800',
  },
  // Inter
  inter: {
    name: 'Inter',
    color: '#FF6B35',
    icon: '🟠',
    gradient: 'from-orange-500 to-orange-600',
  },
  // C6 Bank
  c6: {
    name: 'C6 Bank',
    color: '#000000',
    icon: '⚫',
    gradient: 'from-gray-800 to-gray-900',
  },
  'c6 bank': {
    name: 'C6 Bank',
    color: '#000000',
    icon: '⚫',
    gradient: 'from-gray-800 to-gray-900',
  },
  // PicPay
  picpay: {
    name: 'PicPay',
    color: '#21C25E',
    icon: '💚',
    gradient: 'from-green-500 to-green-600',
  },
  // Mercado Pago
  'mercado pago': {
    name: 'Mercado Pago',
    color: '#009EE3',
    icon: '💙',
    gradient: 'from-blue-500 to-blue-600',
  },
  // PagSeguro
  pagseguro: {
    name: 'PagSeguro',
    color: '#FFC801',
    icon: '🟡',
    gradient: 'from-yellow-400 to-yellow-500',
  },
  // Neon
  neon: {
    name: 'Neon',
    color: '#00D9FF',
    icon: '💎',
    gradient: 'from-cyan-400 to-cyan-600',
  },
  // Original
  original: {
    name: 'Original',
    color: '#FF6B00',
    icon: '🟠',
    gradient: 'from-orange-500 to-orange-600',
  },
  // Next
  next: {
    name: 'Next',
    color: '#7B68EE',
    icon: '💜',
    gradient: 'from-purple-500 to-purple-600',
  },
  // XP
  xp: {
    name: 'XP',
    color: '#000000',
    icon: '⚫',
    gradient: 'from-gray-900 to-black',
  },
  // BTG
  btg: {
    name: 'BTG',
    color: '#000000',
    icon: '⚫',
    gradient: 'from-gray-800 to-black',
  },
  // Citi
  citi: {
    name: 'Citi',
    color: '#0066CC',
    icon: '🔵',
    gradient: 'from-blue-600 to-blue-700',
  },
  // HSBC
  hsbc: {
    name: 'HSBC',
    color: '#DC143C',
    icon: '🔴',
    gradient: 'from-red-600 to-red-700',
  },
};

/**
 * Detecta o banco pelo nome do cartão
 */
export function detectBank(cardName: string): BankInfo | null {
  const normalizedName = cardName.toLowerCase().trim();
  
  // Buscar correspondência exata ou parcial
  for (const [key, bankInfo] of Object.entries(BANK_COLORS)) {
    if (normalizedName.includes(key)) {
      return bankInfo;
    }
  }
  
  return null;
}

/**
 * Obtém informações do banco ou retorna padrão
 */
export function getBankInfo(cardName: string): BankInfo {
  const detected = detectBank(cardName);
  
  if (detected) {
    return detected;
  }
  
  // Padrão para bancos não identificados
  return {
    name: cardName,
    color: '#6366F1', // indigo-500
    icon: '💳',
    gradient: 'from-indigo-500 to-indigo-600',
  };
}

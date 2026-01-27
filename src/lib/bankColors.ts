// Cores e logos dos principais bancos brasileiros

export type BankInfo = {
  name: string;
  color: string;
  icon: string;
  gradient?: string; // Gradiente opcional
  logoPath?: string; // Caminho para o SVG do logo (do repositório https://github.com/Tgentil/Bancos-em-SVG)
};

export const BANK_COLORS: Record<string, BankInfo> = {
  // Nubank
  nubank: {
    name: 'Nubank',
    color: '#8A05BE',
    icon: '💜',
    gradient: 'from-purple-600 to-purple-800',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Nu Pagamentos S.A/nubank-logo-2021.svg',
  },
  // Itaú - variações para cobrir erros de escrita
  itau: {
    name: 'Itaú',
    color: '#EC7000',
    icon: '🟠',
    gradient: 'from-orange-500 to-orange-700',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Itaú Unibanco S.A/itau.svg',
  },
  'itáu': {
    name: 'Itaú',
    color: '#EC7000',
    icon: '🟠',
    gradient: 'from-orange-500 to-orange-700',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Itaú Unibanco S.A/itau.svg',
  },
  'itáú': {
    name: 'Itaú',
    color: '#EC7000',
    icon: '🟠',
    gradient: 'from-orange-500 to-orange-700',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Itaú Unibanco S.A/itau.svg',
  },
  'itaú': {
    name: 'Itaú',
    color: '#EC7000',
    icon: '🟠',
    gradient: 'from-orange-500 to-orange-700',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Itaú Unibanco S.A/itau.svg',
  },
  // Bradesco
  bradesco: {
    name: 'Bradesco',
    color: '#CC092F',
    icon: '🔴',
    gradient: 'from-red-600 to-red-800',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Bradesco S.A/bradesco.svg',
  },
  // Banco do Brasil
  'banco do brasil': {
    name: 'Banco do Brasil',
    color: '#FEDD00',
    icon: '🟡',
    gradient: 'from-yellow-400 to-yellow-600',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Banco do Brasil S.A/banco-do-brasil-sem-fundo.svg',
  },
  bb: {
    name: 'Banco do Brasil',
    color: '#FEDD00',
    icon: '🟡',
    gradient: 'from-yellow-400 to-yellow-600',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Banco do Brasil S.A/banco-do-brasil-sem-fundo.svg',
  },
  // Santander
  santander: {
    name: 'Santander',
    color: '#EC0000',
    icon: '🔴',
    gradient: 'from-red-500 to-red-700',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Banco Santander Brasil S.A/banco-santander-logo.svg',
  },
  // Caixa
  caixa: {
    name: 'Caixa',
    color: '#0066B3',
    icon: '🔵',
    gradient: 'from-blue-600 to-blue-800',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Caixa Econômica Federal/caixa-economica-federal-X.svg',
  },
  'caixa econômica': {
    name: 'Caixa',
    color: '#0066B3',
    icon: '🔵',
    gradient: 'from-blue-600 to-blue-800',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Caixa Econômica Federal/caixa-economica-federal-X.svg',
  },
  // Inter
  inter: {
    name: 'Inter',
    color: '#FF6B35',
    icon: '🟠',
    gradient: 'from-orange-500 to-orange-600',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Banco Inter S.A/inter.svg',
  },
  // C6 Bank
  c6: {
    name: 'C6 Bank',
    color: '#000000',
    icon: '⚫',
    gradient: 'from-gray-800 to-gray-900',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Banco C6 S.A/c6 bank.svg',
  },
  'c6 bank': {
    name: 'C6 Bank',
    color: '#000000',
    icon: '⚫',
    gradient: 'from-gray-800 to-gray-900',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Banco C6 S.A/c6 bank.svg',
  },
  // PicPay
  picpay: {
    name: 'PicPay',
    color: '#21C25E',
    icon: '💚',
    gradient: 'from-green-500 to-green-600',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/PicPay/Logo-PicPay.svg',
  },
  // Mercado Pago
  'mercado pago': {
    name: 'Mercado Pago',
    color: '#009EE3',
    icon: '💙',
    gradient: 'from-blue-500 to-blue-600',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Mercado Pago/mercado-pago.svg',
  },
  // PagSeguro
  pagseguro: {
    name: 'PagSeguro',
    color: '#FFC801',
    icon: '🟡',
    gradient: 'from-yellow-400 to-yellow-500',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/PagSeguro Internet S.A/logo.svg',
  },
  // Neon
  neon: {
    name: 'Neon',
    color: '#00D9FF',
    icon: '💎',
    gradient: 'from-cyan-400 to-cyan-600',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Neon/header-logo-neon.svg',
  },
  // Original
  original: {
    name: 'Original',
    color: '#FF6B00',
    icon: '🟠',
    gradient: 'from-orange-500 to-orange-600',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Banco Original S.A/banco-original-logo-verde.svg',
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
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/XP Investimentos/xp-investimentos-logo.svg',
  },
  // BTG
  btg: {
    name: 'BTG',
    color: '#000000',
    icon: '⚫',
    gradient: 'from-gray-800 to-black',
    logoPath: '/banks/Bancos-em-SVG-main/Bancos-em-SVG-main/Banco BTG Pacutal/btg-pactual.svg',
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
 * Normaliza o nome removendo acentos e caracteres especiais para comparação
 */
function normalizeBankName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
}

/**
 * Detecta o banco pelo nome do cartão (ignora erros de escrita e acentos)
 */
export function detectBank(cardName: string): BankInfo | null {
  const normalizedName = normalizeBankName(cardName);
  
  // Buscar correspondência exata ou parcial (normalizada)
  for (const [key, bankInfo] of Object.entries(BANK_COLORS)) {
    const normalizedKey = normalizeBankName(key);
    if (normalizedName.includes(normalizedKey) || normalizedKey.includes(normalizedName)) {
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

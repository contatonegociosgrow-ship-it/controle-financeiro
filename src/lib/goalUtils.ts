/**
 * Utilitários para cálculos e validações de metas financeiras
 */

/**
 * Calcula quantos meses são necessários para alcançar a meta
 * @param targetValue Valor alvo da meta
 * @param monthlyContribution Contribuição mensal
 * @returns Número de meses necessários (arredondado para cima)
 */
export function calculateMonthsRequired(
  targetValue: number,
  monthlyContribution: number
): number {
  if (monthlyContribution <= 0) {
    return Infinity; // Meta impossível se não há contribuição
  }
  return Math.ceil(targetValue / monthlyContribution);
}

/**
 * Calcula a data mínima de término baseada na data de início e meses necessários
 * @param startDate Data de início (YYYY-MM-DD)
 * @param monthsRequired Número de meses necessários
 * @returns Data mínima de término (YYYY-MM-DD)
 */
export function calculateMinEndDate(
  startDate: string,
  monthsRequired: number
): string {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + monthsRequired);
  
  // Formatar como YYYY-MM-DD
  const year = end.getFullYear();
  const month = String(end.getMonth() + 1).padStart(2, '0');
  const day = String(end.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Converte data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
 */
export function formatDateToBR(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Converte data brasileira (DD/MM/YYYY) para ISO (YYYY-MM-DD)
 */
export function formatDateToISO(brDate: string): string {
  if (!brDate) return '';
  const cleaned = brDate.replace(/\D/g, '');
  if (cleaned.length !== 8) {
    return '';
  }
  const day = cleaned.substring(0, 2);
  const month = cleaned.substring(2, 4);
  const year = cleaned.substring(4, 8);
  
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
    return '';
  }
  
  return `${year}-${month}-${day}`;
}

/**
 * Aplica máscara de data brasileira (DD/MM/YYYY)
 */
export function applyDateMask(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
  return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4, 8)}`;
}

/**
 * Valida se uma meta é matematicamente viável
 * @param targetValue Valor alvo
 * @param monthlyContribution Contribuição mensal
 * @param startDate Data de início (YYYY-MM-DD)
 * @param deadline Prazo informado (YYYY-MM-DD ou vazio)
 * @returns Objeto com validação e informações calculadas
 */
export function validateGoal(
  targetValue: number,
  monthlyContribution: number,
  startDate: string,
  deadline?: string
): {
  isValid: boolean;
  monthsRequired: number;
  minEndDate: string;
  minEndDateBR: string;
  message?: string;
} {
  const monthsRequired = calculateMonthsRequired(targetValue, monthlyContribution);
  const minEndDate = calculateMinEndDate(startDate, monthsRequired);
  const minEndDateBR = formatDateToBR(minEndDate);

  // Se não há contribuição mensal, meta é impossível
  if (monthlyContribution <= 0) {
    return {
      isValid: false,
      monthsRequired: Infinity,
      minEndDate,
      minEndDateBR,
      message: 'A contribuição mensal deve ser maior que zero.',
    };
  }

  // Se não há prazo informado, é válido (será definido automaticamente)
  if (!deadline) {
    return {
      isValid: true,
      monthsRequired,
      minEndDate,
      minEndDateBR,
      message: `Com essa contribuição, você alcança sua meta em ${monthsRequired} ${monthsRequired === 1 ? 'mês' : 'meses'}.`,
    };
  }

  // Validar se prazo informado é suficiente
  const deadlineDate = new Date(deadline);
  const minEndDateObj = new Date(minEndDate);

  if (deadlineDate < minEndDateObj) {
    return {
      isValid: false,
      monthsRequired,
      minEndDate,
      minEndDateBR,
      message: `O prazo informado é insuficiente. Com essa contribuição mensal, você precisa de pelo menos ${monthsRequired} ${monthsRequired === 1 ? 'mês' : 'meses'} (até ${minEndDateBR}).`,
    };
  }

  return {
    isValid: true,
    monthsRequired,
    minEndDate,
    minEndDateBR,
    message: `Com essa contribuição, você alcança sua meta em ${monthsRequired} ${monthsRequired === 1 ? 'mês' : 'meses'}.`,
  };
}

export type Debt = {
  id: string;
  title: string;
  totalValue: number;
  installments: number;
  installmentValue: number;
  startDate: string;
  paidInstallments: number[];
  status: 'active' | 'completed';
  createdAt: number;
};

/**
 * Calcula a diferença de meses entre duas datas
 */
function differenceInMonths(date1: Date, date2: Date): number {
  const yearDiff = date1.getFullYear() - date2.getFullYear();
  const monthDiff = date1.getMonth() - date2.getMonth();
  return yearDiff * 12 + monthDiff;
}

/**
 * Adiciona meses a uma data
 */
function addMonths(date: Date, months: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Criar nova data com os valores explícitos para evitar problemas de fuso horário
  const result = new Date(year, month + months, day);
  return result;
}

/**
 * Formata data para DD/MM/YYYY
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calcula a parcela atual baseada na diferença de meses desde a data inicial
 * @param debt - Dívida parcelada
 * @param today - Data de referência (padrão: hoje)
 * @returns Número da parcela atual (1-indexed) ou null se não houver parcela atual
 */
export function getCurrentInstallment(debt: Debt, today?: Date): number | null {
  if (!today) {
    today = new Date();
  }
  // Parse da data ISO (YYYY-MM-DD) diretamente para evitar problemas de fuso horário
  const dateMatch = debt.startDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) {
    return null;
  }

  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10) - 1; // getMonth() retorna 0-11
  const day = parseInt(dateMatch[3], 10);

  // Criar data local (sem fuso horário)
  const startDate = new Date(year, month, day);
  if (isNaN(startDate.getTime())) {
    return null;
  }

  // Calcular diferença de meses
  const monthsDiff = differenceInMonths(today, startDate);

  // Parcela atual = diferença de meses + 1
  // Exemplo: se começou em janeiro e estamos em março, monthsDiff = 2, parcela atual = 3
  const currentInstallment = monthsDiff + 1;

  // Se a parcela atual for maior que o total de parcelas, retornar null
  if (currentInstallment > debt.installments) {
    return null;
  }

  // Se a parcela atual for menor que 1, ainda não começou
  if (currentInstallment < 1) {
    return null;
  }

  return currentInstallment;
}

/**
 * Retorna a data de vencimento de uma parcela específica
 * @param debt - Dívida parcelada
 * @param installmentNumber - Número da parcela (1-indexed)
 * @returns Data formatada (DD/MM/YYYY) ou string vazia se inválida
 */
export function getInstallmentDueDate(debt: Debt, installmentNumber: number): string {
  if (installmentNumber < 1 || installmentNumber > debt.installments) {
    return '';
  }

  // Parse da data ISO (YYYY-MM-DD) diretamente para evitar problemas de fuso horário
  const dateMatch = debt.startDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) {
    return '';
  }

  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10) - 1; // getMonth() retorna 0-11
  const day = parseInt(dateMatch[3], 10);

  // Criar data local (sem fuso horário)
  const startDate = new Date(year, month, day);
  
  // Adicionar (installmentNumber - 1) meses à data inicial
  // Exemplo: parcela 1 = startDate + 0 meses, parcela 2 = startDate + 1 mês
  const dueDate = addMonths(startDate, installmentNumber - 1);
  return formatDate(dueDate);
}

/**
 * Verifica se uma parcela pode ser marcada como paga
 * @param debt - Dívida parcelada
 * @param installmentNumber - Número da parcela (1-indexed)
 * @param today - Data de referência (padrão: hoje)
 * @returns true se pode ser marcada, false caso contrário
 */
export function canMarkInstallmentAsPaid(
  debt: Debt,
  installmentNumber: number,
  today?: Date
): boolean {
  if (!today) {
    today = new Date();
  }
  // Não pode marcar se já está completa
  if (debt.status === 'completed') {
    return false;
  }

  // Não pode marcar se a parcela já está paga
  if (debt.paidInstallments.includes(installmentNumber)) {
    return false;
  }

  // Não pode marcar se a parcela é maior que o total
  if (installmentNumber > debt.installments) {
    return false;
  }

  // Não pode marcar se a parcela é menor que 1
  if (installmentNumber < 1) {
    return false;
  }

  // Só pode marcar a parcela atual ou anteriores
  const currentInstallment = getCurrentInstallment(debt, today);
  if (currentInstallment === null) {
    return false;
  }

  // Pode marcar a parcela atual ou qualquer parcela anterior
  return installmentNumber <= currentInstallment;
}

/**
 * Calcula o total de parcelas não pagas do mês atual
 * @param debts - Array de dívidas
 * @param today - Data de referência (padrão: hoje)
 * @returns Valor total das parcelas não pagas do mês atual
 */
export function getCurrentMonthUnpaidInstallments(
  debts: Debt[],
  today?: Date
): number {
  if (!today) {
    today = new Date();
  }
  let total = 0;

  debts.forEach((debt) => {
    if (debt.status === 'completed') {
      return;
    }

    const currentInstallment = getCurrentInstallment(debt, today);
    if (currentInstallment === null) {
      return;
    }

    // Se a parcela atual não está paga, adicionar ao total
    if (!debt.paidInstallments.includes(currentInstallment)) {
      total += debt.installmentValue;
    }
  });

  return total;
}

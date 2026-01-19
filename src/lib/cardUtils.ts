// Utilitários para cálculos de cartão de crédito e faturas

export type Card = {
  id: string;
  name: string;
  limit: number;
  closingDay: number; // Dia do fechamento (1-31)
  dueDay: number; // Dia do vencimento (1-31)
  createdAt: number;
};

export type Transaction = {
  id: string;
  value: number;
  type: 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings';
  categoryId: string;
  cardId?: string | null;
  date: string; // YYYY-MM-DD
  installments?: { current: number; total: number } | null;
  notes?: string;
};

/**
 * Calcula o mês da fatura baseado na data de compra e dia de fechamento
 * Regra: Se a compra foi feita após o fechamento, cai na próxima fatura
 */
export function getInvoiceMonth(
  purchaseDate: string, // YYYY-MM-DD
  closingDay: number,
  referenceDate?: Date
): { year: number; month: number } {
  const purchase = new Date(purchaseDate);
  const ref = referenceDate || new Date();
  
  const purchaseYear = purchase.getFullYear();
  const purchaseMonth = purchase.getMonth() + 1; // 1-12
  const purchaseDay = purchase.getDate();

  // Se a compra foi feita após o dia de fechamento, cai na próxima fatura
  if (purchaseDay > closingDay) {
    // Próximo mês
    if (purchaseMonth === 12) {
      return { year: purchaseYear + 1, month: 1 };
    }
    return { year: purchaseYear, month: purchaseMonth + 1 };
  }

  // Caso contrário, cai na fatura do mês atual
  return { year: purchaseYear, month: purchaseMonth };
}

/**
 * Obtém a fatura atual de um cartão
 */
export function getCurrentInvoice(
  card: Card,
  transactions: Transaction[],
  referenceDate?: Date
): {
  invoiceMonth: { year: number; month: number };
  closingDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  total: number;
  items: Array<{
    transaction: Transaction;
    installment?: number;
    totalInstallments?: number;
  }>;
} {
  const ref = referenceDate || new Date();
  const currentYear = ref.getFullYear();
  const currentMonth = ref.getMonth() + 1;
  const currentDay = ref.getDate();

  // Determinar qual é a fatura atual
  // Se já passou do fechamento, a fatura atual é a próxima
  let invoiceYear = currentYear;
  let invoiceMonth = currentMonth;

  if (currentDay > card.closingDay) {
    // Já passou do fechamento, próxima fatura
    if (currentMonth === 12) {
      invoiceYear = currentYear + 1;
      invoiceMonth = 1;
    } else {
      invoiceMonth = currentMonth + 1;
    }
  }

  // Calcular data de fechamento e vencimento
  const closingDate = `${invoiceYear}-${String(invoiceMonth).padStart(2, '0')}-${String(card.closingDay).padStart(2, '0')}`;
  
  // Vencimento é no mês seguinte ao fechamento
  let dueYear = invoiceYear;
  let dueMonth = invoiceMonth + 1;
  if (dueMonth > 12) {
    dueYear++;
    dueMonth = 1;
  }
  const dueDate = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(card.dueDay).padStart(2, '0')}`;

  // Filtrar transações que pertencem a esta fatura
  const invoiceItems: Array<{
    transaction: Transaction;
    installment?: number;
    totalInstallments?: number;
  }> = [];

  let total = 0;

  transactions
    .filter((t) => t.cardId === card.id && t.type === 'expense_variable')
    .forEach((transaction) => {
      const invoiceMonthForTransaction = getInvoiceMonth(
        transaction.date,
        card.closingDay,
        ref
      );

      // Verificar se pertence à fatura atual
      if (
        invoiceMonthForTransaction.year === invoiceYear &&
        invoiceMonthForTransaction.month === invoiceMonth
      ) {
        // Compra à vista
        invoiceItems.push({ transaction });
        total += transaction.value;
      } else if (transaction.installments) {
        // Compra parcelada - verificar se alguma parcela cai nesta fatura
        const purchaseInvoice = getInvoiceMonth(
          transaction.date,
          card.closingDay,
          ref
        );

        // Calcular em qual fatura cada parcela cai
        for (let i = 1; i <= transaction.installments.total; i++) {
          let parcelInvoiceYear = purchaseInvoice.year;
          let parcelInvoiceMonth = purchaseInvoice.month + (i - 1);

          // Ajustar ano se necessário
          while (parcelInvoiceMonth > 12) {
            parcelInvoiceYear++;
            parcelInvoiceMonth -= 12;
          }

          // Se esta parcela cai na fatura atual
          if (
            parcelInvoiceYear === invoiceYear &&
            parcelInvoiceMonth === invoiceMonth
          ) {
            const installmentValue = transaction.value / transaction.installments.total;
            invoiceItems.push({
              transaction,
              installment: i,
              totalInstallments: transaction.installments.total,
            });
            total += installmentValue;
            break; // Só adicionar uma vez por transação
          }
        }
      }
    });

  return {
    invoiceMonth: { year: invoiceYear, month: invoiceMonth },
    closingDate,
    dueDate,
    total,
    items: invoiceItems.sort((a, b) => {
      // Ordenar por data da transação
      return a.transaction.date.localeCompare(b.transaction.date);
    }),
  };
}

/**
 * Calcula o limite disponível de um cartão
 */
export function getAvailableLimit(
  card: Card,
  transactions: Transaction[],
  referenceDate?: Date
): number {
  const currentInvoice = getCurrentInvoice(card, transactions, referenceDate);
  const used = currentInvoice.total;
  return Math.max(0, card.limit - used);
}

/**
 * Calcula todas as faturas futuras de um cartão
 */
export function getFutureInvoices(
  card: Card,
  transactions: Transaction[],
  referenceDate?: Date,
  monthsAhead: number = 6
): Array<{
  invoiceMonth: { year: number; month: number };
  closingDate: string;
  dueDate: string;
  total: number;
  items: Array<{
    transaction: Transaction;
    installment?: number;
    totalInstallments?: number;
  }>;
}> {
  const ref = referenceDate || new Date();
  const invoices: Array<ReturnType<typeof getCurrentInvoice>> = [];

  // Calcular faturas futuras
  for (let i = 1; i <= monthsAhead; i++) {
    const futureDate = new Date(ref);
    futureDate.setMonth(futureDate.getMonth() + i);
    
    const invoice = getCurrentInvoice(card, transactions, futureDate);
    if (invoice.total > 0 || invoice.items.length > 0) {
      invoices.push(invoice);
    }
  }

  return invoices;
}

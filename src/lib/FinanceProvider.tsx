'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { loadState, saveState, resetState, type FinanceState } from './storage';
import { ensureDefaultCategories } from './seedData';

type Profile = { name: string; currency: 'BRL' | 'USD' | 'EUR'; monthlyIncome?: number; wallet?: number };
type Goal = {
  id: string;
  title: string;
  targetValue: number;
  monthlyContribution: number;
  currentValue: number;
  startDate: string;
  deadline?: string;
  status: 'active' | 'completed';
};
type Debt = {
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
type Category = { id: string; name: string; limit?: number | null; color?: string };
type Person = { id: string; name: string };
type Card = { id: string; name: string; limit: number; closingDay: number; dueDay: number; createdAt: number };
type Transaction = {
  id: string;
  value: number;
  type: 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings';
  categoryId: string;
  cardId?: string | null;
  personId?: string | null;
  date: string;
  dueDate?: string;
  notes?: string;
  createdAt: number;
  installments?: { current: number; total: number } | null;
  status?: 'paid' | 'pending' | 'overdue';
  monthlyPaymentDate?: number;
  paidInstallments?: number[];
};
type Investment = {
  id: string;
  name: string;
  type: 'fixed_income' | 'variable_income' | 'crypto' | 'monthly' | 'goal_based';
  value: number;
  applicationDate: string;
  estimatedReturn?: number;
  notes?: string;
  createdAt: number;
};
type Vault = {
  id: string;
  name: string;
  emoji: string;
  currentValue: number;
  targetValue?: number;
  createdAt: number;
};

type FinanceContextType = {
  state: FinanceState;
  isInitialized: boolean;
  setState: (state: FinanceState | ((prev: FinanceState) => FinanceState)) => void;
  setProfile: (profile: Profile) => void;
  setMonthlyIncome: (value: number) => void;
  addCategory: (name: string, limit?: number | null, color?: string) => string;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  addPerson: (name: string) => string;
  addCard: (card: { name: string; limit: number; closingDay: number; dueDay: number }) => string;
  updateCard: (id: string, updates: Partial<Card>) => void;
  removeCard: (id: string) => void;
  addTransaction: (transaction: {
    value: number;
    type: 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings';
    categoryId: string;
    cardId?: string | null;
    personId?: string | null;
    date: string;
    dueDate?: string;
    notes?: string;
    installments?: { current: number; total: number } | null;
    status?: 'paid' | 'pending' | 'overdue';
    monthlyPaymentDate?: number;
    paidInstallments?: number[];
  }) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  addGoal: (goal: {
    title: string;
    targetValue: number;
    monthlyContribution: number;
    startDate: string;
    deadline?: string;
  }) => string;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  contributeToGoal: (id: string, value: number) => void;
  addDebt: (input: {
    title: string;
    totalValue: number;
    installments: number;
    startDate: string;
  }) => string;
  markDebtInstallmentAsPaid: (debtId: string, installmentNumber: number) => void;
  removeDebt: (id: string) => void;
  resetState: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  // Investimentos
  addInvestment: (investment: {
    name: string;
    type: 'fixed_income' | 'variable_income' | 'crypto' | 'monthly' | 'goal_based';
    value: number;
    applicationDate: string;
    estimatedReturn?: number;
    notes?: string;
  }) => string;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  removeInvestment: (id: string) => void;
  // Cofres
  addVault: (vault: {
    name: string;
    emoji: string;
    targetValue?: number;
  }) => string;
  updateVault: (id: string, updates: Partial<Vault>) => void;
  removeVault: (id: string) => void;
  depositToVault: (vaultId: string, value: number) => void;
  withdrawFromVault: (vaultId: string, value: number) => void;
  investFromVault: (vaultId: string, investmentId: string, value: number) => void;
  // Despesas Recorrentes
  addRecurringExpense: (expense: {
    name: string;
    value: number;
    categoryId: string;
    dueDay: number;
    notes?: string;
  }) => string;
  updateRecurringExpense: (id: string, updates: Partial<{
    name: string;
    value: number;
    categoryId: string;
    dueDay: number;
    notes?: string;
    isActive: boolean;
  }>) => void;
  removeRecurringExpense: (id: string) => void;
  generateMonthlyRecurringExpenses: () => void;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(() => loadState());
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar estado inicial e garantir categorias padrão
  useEffect(() => {
    const loaded = loadState();
    const stateWithCategories = ensureDefaultCategories(loaded);
    setState(stateWithCategories);
    setIsInitialized(true);
  }, []);

  // Salvar automaticamente quando state mudar (após inicialização)
  useEffect(() => {
    if (isInitialized) {
      saveState(state);
    }
  }, [state, isInitialized]);

  const setProfile = useCallback((profile: Profile) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profile,
      },
    }));
  }, []);

  const setMonthlyIncome = useCallback((value: number) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        monthlyIncome: value,
      },
    }));
  }, []);

  const addCategory = useCallback((name: string, limit?: number | null, color?: string) => {
    const category: Category = {
      id: crypto.randomUUID(),
      name,
      limit: limit ?? null,
      color: color || undefined,
    };
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, category],
    }));
    return category.id;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  }, []);

  const removeCategory = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }));
  }, []);

  const addPerson = useCallback((name: string) => {
    const person: Person = {
      id: crypto.randomUUID(),
      name,
    };
    setState((prev) => ({
      ...prev,
      people: [...prev.people, person],
    }));
    return person.id;
  }, []);

  const addCard = useCallback(
    (card: { name: string; limit: number; closingDay: number; dueDay: number }) => {
      const newCard: Card = {
        id: crypto.randomUUID(),
        ...card,
        createdAt: Date.now(),
      };
      setState((prev) => ({
        ...prev,
        cards: [...prev.cards, newCard],
      }));
      return newCard.id;
    },
    []
  );

  const updateCard = useCallback((id: string, updates: Partial<Card>) => {
    setState((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  }, []);

  const removeCard = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== id),
      // Remover cardId das transações que usam esse cartão
      transactions: prev.transactions.map((t) =>
        t.cardId === id ? { ...t, cardId: null } : t
      ),
    }));
  }, []);

  const addTransaction = useCallback(
    (transaction: {
      value: number;
      type: 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings';
      categoryId: string;
      cardId?: string | null;
      personId?: string | null;
      date: string;
      dueDate?: string;
      notes?: string;
      installments?: { current: number; total: number } | null;
      status?: 'paid' | 'pending' | 'overdue';
      monthlyPaymentDate?: number;
      paidInstallments?: number[];
    }) => {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        ...transaction,
        createdAt: Date.now(),
      };
      setState((prev) => ({
        ...prev,
        transactions: [...prev.transactions, newTransaction],
      }));
    },
    []
  );

  const removeTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  }, []);

  const addGoal = useCallback((goal: {
    title: string;
    targetValue: number;
    monthlyContribution: number;
    startDate: string;
    deadline?: string;
  }) => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      ...goal,
      currentValue: 0,
      status: 'active',
    };
    setState((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
    return newGoal.id;
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    }));
  }, []);

  const removeGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  }, []);

  const contributeToGoal = useCallback((id: string, value: number) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => {
        if (g.id === id) {
          const newValue = g.currentValue + value;
          const isCompleted = newValue >= g.targetValue;
          return {
            ...g,
            currentValue: newValue,
            status: isCompleted ? 'completed' : g.status,
          };
        }
        return g;
      }),
    }));
  }, []);

  const addDebt = useCallback(
    (input: { title: string; totalValue: number; installments: number; startDate: string }) => {
      if (input.installments <= 0) {
        throw new Error('O número de parcelas deve ser maior que zero');
      }

      const installmentValue = input.totalValue / input.installments;
      const newDebt: Debt = {
        id: crypto.randomUUID(),
        title: input.title,
        totalValue: input.totalValue,
        installments: input.installments,
        installmentValue,
        startDate: input.startDate,
        paidInstallments: [],
        status: 'active',
        createdAt: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        debts: [...prev.debts, newDebt],
      }));

      return newDebt.id;
    },
    []
  );

  const markDebtInstallmentAsPaid = useCallback((debtId: string, installmentNumber: number) => {
    setState((prev) => {
      const debt = prev.debts.find((d) => d.id === debtId);
      if (!debt) {
        return prev;
      }

      // Não permitir marcar se já está completa
      if (debt.status === 'completed') {
        return prev;
      }

      // Não permitir marcar se já está paga
      if (debt.paidInstallments.includes(installmentNumber)) {
        return prev;
      }

      // Não permitir marcar parcela futura ou inválida
      if (installmentNumber < 1 || installmentNumber > debt.installments) {
        return prev;
      }

      // Adicionar parcela aos pagos
      const newPaidInstallments = [...debt.paidInstallments, installmentNumber].sort((a, b) => a - b);

      // Se todas as parcelas foram pagas, marcar como completa
      const isCompleted = newPaidInstallments.length === debt.installments;

      return {
        ...prev,
        debts: prev.debts.map((d) =>
          d.id === debtId
            ? {
                ...d,
                paidInstallments: newPaidInstallments,
                status: isCompleted ? 'completed' : d.status,
              }
            : d
        ),
      };
    });
  }, []);

  const removeDebt = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== id),
    }));
  }, []);

  const handleResetState = useCallback(() => {
    resetState();
    setState(loadState());
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'light') => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme,
      },
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: prev.settings.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importData = useCallback((jsonData: string): boolean => {
    try {
      const imported = JSON.parse(jsonData);
      // Validar estrutura básica
      if (
        imported &&
        typeof imported === 'object' &&
        imported.profile &&
        Array.isArray(imported.transactions) &&
        Array.isArray(imported.categories)
      ) {
        // Garantir que tenha meta
        const importedState: FinanceState = {
          ...imported,
          meta: {
            schemaVersion: imported.meta?.schemaVersion || 1,
            updatedAt: Date.now(),
          },
          settings: {
            theme: imported.settings?.theme || state.settings.theme,
          },
        };
        setState(importedState);
        saveState(importedState);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }, [state.settings.theme]);

  // Investimentos
  const addInvestment = useCallback((investment: {
    name: string;
    type: 'fixed_income' | 'variable_income' | 'crypto' | 'monthly' | 'goal_based';
    value: number;
    applicationDate: string;
    estimatedReturn?: number;
    notes?: string;
  }) => {
    const newInvestment: Investment = {
      id: crypto.randomUUID(),
      ...investment,
      createdAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      investments: [...prev.investments, newInvestment],
    }));
    return newInvestment.id;
  }, []);

  const updateInvestment = useCallback((id: string, updates: Partial<Investment>) => {
    setState((prev) => ({
      ...prev,
      investments: prev.investments.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    }));
  }, []);

  const removeInvestment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      investments: prev.investments.filter((i) => i.id !== id),
    }));
  }, []);

  // Cofres
  const addVault = useCallback((vault: {
    name: string;
    emoji: string;
    targetValue?: number;
  }) => {
    const newVault: Vault = {
      id: crypto.randomUUID(),
      ...vault,
      currentValue: 0,
      createdAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      vaults: [...prev.vaults, newVault],
    }));
    return newVault.id;
  }, []);

  const updateVault = useCallback((id: string, updates: Partial<Vault>) => {
    setState((prev) => ({
      ...prev,
      vaults: prev.vaults.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    }));
  }, []);

  const removeVault = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      vaults: prev.vaults.filter((v) => v.id !== id),
    }));
  }, []);

  const depositToVault = useCallback((vaultId: string, value: number) => {
    setState((prev) => ({
      ...prev,
      vaults: prev.vaults.map((v) =>
        v.id === vaultId ? { ...v, currentValue: v.currentValue + value } : v
      ),
    }));
  }, []);

  const withdrawFromVault = useCallback((vaultId: string, value: number) => {
    setState((prev) => ({
      ...prev,
      vaults: prev.vaults.map((v) =>
        v.id === vaultId ? { ...v, currentValue: Math.max(0, v.currentValue - value) } : v
      ),
    }));
  }, []);

  const investFromVault = useCallback((vaultId: string, investmentId: string, value: number) => {
    setState((prev) => {
      const vault = prev.vaults.find((v) => v.id === vaultId);
      if (!vault || vault.currentValue < value) {
        return prev;
      }
      // Remover valor do cofre
      const updatedVaults = prev.vaults.map((v) =>
        v.id === vaultId ? { ...v, currentValue: v.currentValue - value } : v
      );
      // O investimento já foi criado, então não precisamos atualizar aqui
      // A função é chamada após o investimento ser criado
      return {
        ...prev,
        vaults: updatedVaults,
      };
    });
  }, []);

  // Função auxiliar para criar transação de uma despesa recorrente
  const createTransactionFromRecurringExpense = useCallback((recurring: {
    id: string;
    name: string;
    value: number;
    categoryId: string;
    dueDay: number;
    notes?: string;
  }, targetMonth?: number, targetYear?: number): Transaction | null => {
    const now = new Date();
    const currentMonth = targetMonth !== undefined ? targetMonth : now.getMonth();
    const currentYear = targetYear !== undefined ? targetYear : now.getFullYear();
    
    // Formatar data como YYYY-MM-DD
    const formatDate = (year: number, month: number, day: number): string => {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      return `${year}-${monthStr}-${dayStr}`;
    };

    // Calcular data de vencimento (dia do mês)
    const dueDay = Math.min(recurring.dueDay, new Date(currentYear, currentMonth + 1, 0).getDate());
    const dueDate = formatDate(currentYear, currentMonth, dueDay);
    
    // Data da transação: usar dia atual se estiver no mês alvo, senão usar dia 1
    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
    const transactionDay = isCurrentMonth ? today.getDate() : 1;
    const transactionDate = formatDate(currentYear, currentMonth, transactionDay);

    return {
      id: crypto.randomUUID(),
      value: recurring.value,
      type: 'expense_fixed',
      categoryId: recurring.categoryId,
      date: transactionDate,
      dueDate: dueDate,
      notes: recurring.notes || recurring.name,
      status: 'pending',
      createdAt: Date.now(),
    };
  }, []);

  // Despesas Recorrentes
  const addRecurringExpense = useCallback((expense: {
    name: string;
    value: number;
    categoryId: string;
    dueDay: number;
    notes?: string;
  }) => {
    const newRecurringExpense = {
      id: crypto.randomUUID(),
      ...expense,
      isActive: true,
      createdAt: Date.now(),
    };
    
    setState((prev) => {
      // Criar transação para o mês atual imediatamente
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Verificar se já existe uma transação para este mês
      const existingTransaction = prev.transactions.find((t) => {
        if (t.type !== 'expense_fixed') return false;
        const transactionDate = new Date(t.date);
        const isSameMonth = transactionDate.getMonth() === currentMonth && 
                           transactionDate.getFullYear() === currentYear;
        if (!isSameMonth) return false;
        
        const transactionDueDate = t.dueDate ? new Date(t.dueDate) : transactionDate;
        const isSameDay = transactionDueDate.getDate() === newRecurringExpense.dueDay;
        const isSameValue = Math.abs(t.value - newRecurringExpense.value) < 0.01;
        const isSameCategory = t.categoryId === newRecurringExpense.categoryId;
        
        return isSameDay && isSameValue && isSameCategory;
      });

      let newTransaction: Transaction | null = null;
      if (!existingTransaction) {
        newTransaction = createTransactionFromRecurringExpense(newRecurringExpense, currentMonth, currentYear);
      }

      return {
        ...prev,
        recurringExpenses: [...prev.recurringExpenses, newRecurringExpense],
        transactions: newTransaction ? [...prev.transactions, newTransaction] : prev.transactions,
      };
    });
    
    return newRecurringExpense.id;
  }, [createTransactionFromRecurringExpense]);

  const updateRecurringExpense = useCallback((id: string, updates: Partial<{
    name: string;
    value: number;
    categoryId: string;
    dueDay: number;
    notes?: string;
    isActive: boolean;
  }>) => {
    setState((prev) => ({
      ...prev,
      recurringExpenses: prev.recurringExpenses.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  }, []);

  const removeRecurringExpense = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      recurringExpenses: prev.recurringExpenses.filter((e) => e.id !== id),
    }));
  }, []);

  const generateMonthlyRecurringExpenses = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Formatar data atual como YYYY-MM-DD
    const formatDate = (year: number, month: number, day: number): string => {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      return `${year}-${monthStr}-${dayStr}`;
    };

    setState((prev) => {
      // Verificar se já foi gerado para este mês (usar uma marca no meta)
      const lastGeneratedMonth = prev.meta?.lastRecurringExpensesMonth;
      const lastGeneratedYear = prev.meta?.lastRecurringExpensesYear;
      
      if (lastGeneratedMonth === currentMonth && lastGeneratedYear === currentYear) {
        // Já foi gerado para este mês
        return prev;
      }

      const activeRecurringExpenses = prev.recurringExpenses.filter((e) => e.isActive);
      const newTransactions: Transaction[] = [];

      activeRecurringExpenses.forEach((recurring) => {
        // Verificar se já existe uma transação para este mês para esta despesa recorrente
        // Usar uma verificação mais flexível: mesmo valor, categoria e dia de vencimento
        const existingTransaction = prev.transactions.find((t) => {
          if (t.type !== 'expense_fixed') return false;
          const transactionDate = new Date(t.date);
          const isSameMonth = transactionDate.getMonth() === currentMonth && 
                             transactionDate.getFullYear() === currentYear;
          if (!isSameMonth) return false;
          
          // Verificar se a transação corresponde à despesa recorrente
          const transactionDueDate = t.dueDate ? new Date(t.dueDate) : transactionDate;
          const isSameDay = transactionDueDate.getDate() === recurring.dueDay;
          const isSameValue = Math.abs(t.value - recurring.value) < 0.01; // Tolerância para valores decimais
          const isSameCategory = t.categoryId === recurring.categoryId;
          
          return isSameDay && isSameValue && isSameCategory;
        });

        if (!existingTransaction) {
          // Calcular data de vencimento (dia do mês atual)
          const dueDay = Math.min(recurring.dueDay, new Date(currentYear, currentMonth + 1, 0).getDate());
          const dueDate = formatDate(currentYear, currentMonth, dueDay);
          
          // Data da transação (usar dia 1 do mês)
          const transactionDate = formatDate(currentYear, currentMonth, 1);

          const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            value: recurring.value,
            type: 'expense_fixed',
            categoryId: recurring.categoryId,
            date: transactionDate,
            dueDate: dueDate,
            notes: recurring.notes || recurring.name,
            status: 'pending',
            createdAt: Date.now(),
          };

          newTransactions.push(newTransaction);
        }
      });

      if (newTransactions.length > 0 || lastGeneratedMonth !== currentMonth || lastGeneratedYear !== currentYear) {
        return {
          ...prev,
          transactions: [...prev.transactions, ...newTransactions],
          meta: {
            ...prev.meta,
            lastRecurringExpensesMonth: currentMonth,
            lastRecurringExpensesYear: currentYear,
          },
        };
      }

      return prev;
    });
  }, []);

  // Gerar despesas recorrentes automaticamente no início de cada mês
  useEffect(() => {
    if (isInitialized) {
      generateMonthlyRecurringExpenses();
    }
  }, [isInitialized, generateMonthlyRecurringExpenses]);

  return (
    <FinanceContext.Provider
      value={{
        state,
        isInitialized,
        setState,
        setProfile,
        setMonthlyIncome,
        addCategory,
        updateCategory,
        removeCategory,
        addPerson,
        addCard,
        updateCard,
        removeCard,
        addTransaction,
        updateTransaction,
        removeTransaction,
        addGoal,
        updateGoal,
        removeGoal,
        contributeToGoal,
        addDebt,
        markDebtInstallmentAsPaid,
        removeDebt,
        resetState: handleResetState,
        setTheme,
        toggleTheme,
        exportData,
        importData,
        addInvestment,
        updateInvestment,
        removeInvestment,
        addVault,
        updateVault,
        removeVault,
        depositToVault,
        withdrawFromVault,
        investFromVault,
        addRecurringExpense,
        updateRecurringExpense,
        removeRecurringExpense,
        generateMonthlyRecurringExpenses,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinanceStore() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinanceStore must be used within a FinanceProvider');
  }
  return context;
}

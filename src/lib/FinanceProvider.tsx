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

type FinanceContextType = {
  state: FinanceState;
  isInitialized: boolean;
  setState: (state: FinanceState | ((prev: FinanceState) => FinanceState)) => void;
  setProfile: (profile: Profile) => void;
  setMonthlyIncome: (value: number) => void;
  addCategory: (name: string, limit?: number | null, color?: string) => string;
  updateCategory: (id: string, updates: Partial<Category>) => void;
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

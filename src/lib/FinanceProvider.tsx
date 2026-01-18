'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { loadState, saveState, resetState, type FinanceState } from './storage';
import { ensureDefaultCategories } from './seedData';

type Profile = { name: string; currency: 'BRL' | 'USD' | 'EUR' };
type Category = { id: string; name: string; limit?: number | null };
type Person = { id: string; name: string };
type Card = { id: string; name: string; closingDay: number; dueDay: number };
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
};

type FinanceContextType = {
  state: FinanceState;
  isInitialized: boolean;
  setState: (state: FinanceState | ((prev: FinanceState) => FinanceState)) => void;
  setProfile: (profile: Profile) => void;
  addCategory: (name: string, limit?: number | null) => void;
  addPerson: (name: string) => void;
  addCard: (card: { name: string; closingDay: number; dueDay: number }) => void;
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
  }) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  resetState: () => void;
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
      profile,
    }));
  }, []);

  const addCategory = useCallback((name: string, limit?: number | null) => {
    const category: Category = {
      id: crypto.randomUUID(),
      name,
      limit: limit ?? null,
    };
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, category],
    }));
    return category.id;
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
    (card: { name: string; closingDay: number; dueDay: number }) => {
      const newCard: Card = {
        id: crypto.randomUUID(),
        ...card,
      };
      setState((prev) => ({
        ...prev,
        cards: [...prev.cards, newCard],
      }));
    },
    []
  );

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

  const handleResetState = useCallback(() => {
    resetState();
    setState(loadState());
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        state,
        isInitialized,
        setState,
        setProfile,
        addCategory,
        addPerson,
        addCard,
        addTransaction,
        updateTransaction,
        removeTransaction,
        resetState: handleResetState,
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

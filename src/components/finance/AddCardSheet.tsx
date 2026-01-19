'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';

type AddCardSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  cardId?: string; // Se fornecido, edita o cartão existente
};

export function AddCardSheet({ isOpen, onClose, cardId }: AddCardSheetProps) {
  const { state, addCard, updateCard } = useFinanceStore();
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');

  const card = cardId ? state.cards.find((c) => c.id === cardId) : null;

  useEffect(() => {
    if (isOpen) {
      if (card) {
        // Modo edição
        setName(card.name);
        setLimit(card.limit.toString());
        setClosingDay(card.closingDay.toString());
        setDueDay(card.dueDay.toString());
      } else {
        // Modo criação
        setName('');
        setLimit('');
        setClosingDay('');
        setDueDay('');
      }
    }
  }, [isOpen, card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor, insira um nome para o cartão.');
      return;
    }

    const limitValue = parseFloat(limit.replace(',', '.'));
    if (isNaN(limitValue) || limitValue <= 0) {
      alert('Por favor, insira um limite válido maior que zero.');
      return;
    }

    const closingDayNum = parseInt(closingDay, 10);
    const dueDayNum = parseInt(dueDay, 10);

    if (isNaN(closingDayNum) || closingDayNum < 1 || closingDayNum > 31) {
      alert('Por favor, insira um dia de fechamento válido (1-31).');
      return;
    }

    if (isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 31) {
      alert('Por favor, insira um dia de vencimento válido (1-31).');
      return;
    }

    if (card) {
      // Editar cartão existente
      updateCard(cardId!, {
        name: name.trim(),
        limit: limitValue,
        closingDay: closingDayNum,
        dueDay: dueDayNum,
      });
    } else {
      // Criar novo cartão
      addCard({
        name: name.trim(),
        limit: limitValue,
        closingDay: closingDayNum,
        dueDay: dueDayNum,
      });
    }

    // Resetar formulário
    setName('');
    setLimit('');
    setClosingDay('');
    setDueDay('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-2xl p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {card ? 'Editar Cartão' : 'Adicionar Novo Cartão'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">
              Nome do Cartão
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Ex: Nubank, Itaú..."
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="limit" className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">
              Limite do Cartão
            </label>
            <input
              type="number"
              id="limit"
              step="0.01"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="0,00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="closingDay" className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">
                Dia de Fechamento
              </label>
              <input
                type="number"
                id="closingDay"
                min="1"
                max="31"
                value={closingDay}
                onChange={(e) => setClosingDay(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Ex: 15"
                required
              />
            </div>

            <div>
              <label htmlFor="dueDay" className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">
                Dia de Vencimento
              </label>
              <input
                type="number"
                id="dueDay"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Ex: 20"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
            >
              {card ? 'Salvar Alterações' : 'Adicionar Cartão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { CategoryExamples } from './CategoryExamples';

type AddTransactionSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings';
};

export function AddTransactionSheet({
  isOpen,
  onClose,
  defaultType,
}: AddTransactionSheetProps) {
  const { state, addTransaction, addPerson, addCategory } = useFinanceStore();
  const pathname = usePathname();

  // Detectar tipo baseado na rota ou prop
  const getDefaultType = () => {
    if (defaultType) return defaultType;
    if (pathname?.includes('/ganhos')) return 'income';
    if (pathname?.includes('/fixas')) return 'expense_fixed';
    if (pathname?.includes('/variaveis')) return 'expense_variable';
    if (pathname?.includes('/dividas')) return 'debt';
    if (pathname?.includes('/economias')) return 'savings';
    return 'expense_variable';
  };

  const [type, setType] = useState<'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings'>(getDefaultType());
  
  // Campos comuns
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  // Função para converter ISO (YYYY-MM-DD) para brasileiro (DD/MM/YYYY)
  const formatDateToBR = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Função para converter brasileiro (DD/MM/YYYY) para ISO (YYYY-MM-DD)
  const formatDateToISO = (brDate: string): string => {
    if (!brDate) return '';
    const cleaned = brDate.replace(/\D/g, '');
    if (cleaned.length !== 8) {
      // Se não tem 8 dígitos, retorna data inválida
      return '';
    }
    const day = cleaned.substring(0, 2);
    const month = cleaned.substring(2, 4);
    const year = cleaned.substring(4, 8);
    
    // Validar se a data é válida
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
      return '';
    }
    
    return `${year}-${month}-${day}`;
  };

  // Função para aplicar máscara DD/MM/YYYY
  const applyDateMask = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4, 8)}`;
  };

  const [date, setDate] = useState(() => {
    const today = new Date();
    return formatDateToBR(today.toISOString().split('T')[0]);
  });
  const [saved, setSaved] = useState(false);

  // Campos específicos por tipo
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'paid' | 'pending'>('pending');
  const [installments, setInstallments] = useState({ current: 1, total: 1 });
  const [hasInstallments, setHasInstallments] = useState(false);
  const [personId, setPersonId] = useState<string | null>(null);
  const [personInput, setPersonInput] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionType, setTransactionType] = useState('Pagamento Mensal');

  // Categorias já são garantidas no FinanceProvider

  useEffect(() => {
    if (isOpen) {
      const detectedType = getDefaultType();
      setType(detectedType);
      setDescription('');
      setValue('');
      setCategoryId('');
      const today = new Date();
      setDate(formatDateToBR(today.toISOString().split('T')[0]));
      setDueDate('');
      setStatus('pending');
      setInstallments({ current: 1, total: 1 });
      setHasInstallments(false);
      setPersonId(null);
      setPersonInput('');
      setNotes('');
      setTransactionType('Pagamento Mensal');
      setSaved(false);
    }
  }, [isOpen, pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!value || !description) {
      return;
    }

    // Validar data
    const isoDate = formatDateToISO(date);
    if (!isoDate || isoDate.length !== 10) {
      alert('Por favor, insira uma data válida no formato DD/MM/AAAA');
      return;
    }

    if ((type === 'expense_fixed' || type === 'expense_variable') && !categoryId) {
      return;
    }

    // Validar data de vencimento se for despesa fixa
    if (type === 'expense_fixed' && dueDate) {
      const isoDueDate = formatDateToISO(dueDate);
      if (!isoDueDate || isoDueDate.length !== 10) {
        alert('Por favor, insira uma data de vencimento válida no formato DD/MM/AAAA');
        return;
      }
    }

    // Processar pessoa - criar se não existir
    let finalPersonId = personId;
    if (personInput.trim() && type === 'income') {
      const existingPerson = state.people.find(
        (p) => p.name.toLowerCase() === personInput.trim().toLowerCase()
      );
      if (existingPerson) {
        finalPersonId = existingPerson.id;
      } else {
        // Criar nova pessoa
        const newPersonId = addPerson(personInput.trim());
        finalPersonId = newPersonId;
      }
    }

    const transactionData: any = {
      value: parseFloat(value),
      type,
      date: isoDate,
    };

    // Campos específicos por tipo
    if (type === 'income') {
      transactionData.categoryId = state.categories[0]?.id || '';
      transactionData.personId = finalPersonId || null;
      transactionData.notes = notes || description;
    } else if (type === 'debt') {
      transactionData.categoryId = state.categories[0]?.id || '';
      transactionData.dueDate = formatDateToISO(date);
      transactionData.status = status;
      transactionData.notes = transactionType;
    } else {
      // expense_fixed, expense_variable, savings
      transactionData.categoryId = categoryId;
      transactionData.notes = description;
      
      if (type === 'expense_fixed') {
        transactionData.dueDate = dueDate ? formatDateToISO(dueDate) : formatDateToISO(date);
        transactionData.status = status;
      }
      
      if (type === 'expense_variable') {
        transactionData.installments = hasInstallments ? installments : null;
      }
    }

    addTransaction(transactionData);

    setSaved(true);
    setTimeout(() => {
      onClose();
      setSaved(false);
    }, 800);
  };

  if (!isOpen) return null;

  // Formulário para Despesas Variáveis
  if (type === 'expense_variable') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm mx-auto bg-white rounded-t-2xl p-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Nova Despesa Variável</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">
                Descrição <span className="text-gray-400 font-normal normal-case">(pode usar emojis)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Ex: 🍽️ Almoço ou Iphone"
                required
                autoFocus
              />
              <CategoryExamples type={type} />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Categoria</label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all hover:border-gray-300"
                  required
                >
                  <option value="">Selecione uma categoria...</option>
                  {state.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Data da compra</label>
              <input
                type="text"
                value={date}
                onChange={(e) => {
                  const masked = applyDateMask(e.target.value);
                  if (masked.length <= 10) {
                    setDate(masked);
                  }
                }}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Valor</label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">
                <input
                  type="checkbox"
                  checked={hasInstallments}
                  onChange={(e) => setHasInstallments(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="normal-case">Parcelado</span>
              </label>
              {hasInstallments && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={installments.current}
                    onChange={(e) => setInstallments({ ...installments, current: parseInt(e.target.value) || 1 })}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Parcela atual"
                  />
                  <span className="text-gray-600 self-center">de</span>
                  <input
                    type="number"
                    min="1"
                    value={installments.total}
                    onChange={(e) => setInstallments({ ...installments, total: parseInt(e.target.value) || 1 })}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Total"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saved}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all disabled:bg-green-600 shadow-sm hover:shadow-md text-sm"
            >
              {saved ? '✓ Salvo!' : 'Salvar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Formulário para Ganhos
  if (type === 'income') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm mx-auto bg-white rounded-t-2xl p-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Novo Ganho</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">
                Descrição <span className="text-gray-400 font-normal normal-case">(pode usar emojis)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Ex: 💰 Salário Pedro"
                required
                autoFocus
              />
              <CategoryExamples type={type} />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Recebido em</label>
              <input
                type="text"
                value={date}
                onChange={(e) => {
                  const masked = applyDateMask(e.target.value);
                  if (masked.length <= 10) {
                    setDate(masked);
                  }
                }}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Valor</label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Corresponde</label>
              <input
                type="text"
                list="people-list"
                value={personInput}
                onChange={(e) => {
                  setPersonInput(e.target.value);
                  const found = state.people.find(
                    (p) => p.name.toLowerCase() === e.target.value.toLowerCase()
                  );
                  if (found) {
                    setPersonId(found.id);
                  } else {
                    setPersonId(null);
                  }
                }}
                onBlur={() => {
                  // Manter o texto para criar nova pessoa se necessário
                }}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Digite ou selecione uma pessoa"
              />
              <datalist id="people-list">
                {state.people.map((person) => (
                  <option key={person.id} value={person.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Anotação</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
                rows={3}
                placeholder="Opcional"
              />
            </div>

            <button
              type="submit"
              disabled={saved}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all disabled:bg-green-600 shadow-sm hover:shadow-md text-sm"
            >
              {saved ? '✓ Salvo!' : 'Salvar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Formulário para Dívidas
  if (type === 'debt') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm mx-auto bg-white rounded-t-2xl p-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Nova Dívida</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Data do pagamento</label>
              <input
                type="text"
                value={date}
                onChange={(e) => {
                  const masked = applyDateMask(e.target.value);
                  if (masked.length <= 10) {
                    setDate(masked);
                  }
                }}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Tipo do lançamento</label>
              <div className="relative">
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all hover:border-gray-300"
                >
                  <option value="Pagamento Mensal">Pagamento Mensal</option>
                  <option value="Pagamento Único">Pagamento Único</option>
                  <option value="Parcela">Parcela</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Valor</label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'paid' | 'pending')}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all hover:border-gray-300"
                >
                  <option value="pending">A pagar</option>
                  <option value="paid">Pago</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saved}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all disabled:bg-green-600 shadow-sm hover:shadow-md text-sm"
            >
              {saved ? '✓ Salvo!' : 'Salvar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Formulário para Despesas Fixas
  if (type === 'expense_fixed') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm mx-auto bg-white rounded-t-2xl p-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Nova Despesa Fixa</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Descrição <span className="text-gray-500 text-xs font-normal">(pode usar emojis)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Ex: 🏠 Aluguel"
                required
                autoFocus
              />
              <CategoryExamples type={type} />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Categoria</label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all hover:border-gray-300"
                  required
                >
                  <option value="">Selecione uma categoria...</option>
                  {state.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Valor</label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Vencimento</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => {
                  const masked = applyDateMask(e.target.value);
                  if (masked.length <= 10) {
                    setDueDate(masked);
                  }
                }}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wide">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'paid' | 'pending')}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="pending">A pagar</option>
                <option value="paid">Pagou</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saved}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all disabled:bg-green-600 shadow-sm hover:shadow-md text-sm"
            >
              {saved ? '✓ Salvo!' : 'Salvar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Fallback (não deveria acontecer)
  return null;
}

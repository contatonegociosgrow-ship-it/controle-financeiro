'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { CategoryExamples } from './CategoryExamples';
import { VoiceInput } from './VoiceInput';
import { VoiceConfirmModal } from './VoiceConfirmModal';

type AddTransactionSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings';
  startWithVoice?: boolean;
  defaultCardId?: string; // ID do cartão para pré-selecionar
  editingId?: string | null; // ID da transação para editar
};

export function AddTransactionSheet({
  isOpen,
  onClose,
  defaultType,
  startWithVoice = false,
  defaultCardId,
  editingId,
}: AddTransactionSheetProps) {
  const { state, addTransaction, updateTransaction, addPerson, addCategory } = useFinanceStore();
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
  const [cardId, setCardId] = useState('');
  
  // Função para converter ISO (YYYY-MM-DD) para brasileiro (DD/MM/YYYY)
  const formatDateToBR = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Obter data atual sem problemas de fuso horário
  const getTodayISO = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    return formatDateToBR(getTodayISO());
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
  const [monthlyPaymentDate, setMonthlyPaymentDate] = useState('');

  // Estados para captura de voz
  const [voiceMode, setVoiceMode] = useState<'idle' | 'transcribing' | 'confirming'>('idle');
  const [voiceText, setVoiceText] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState<any[]>([]);
  const [interpretedItens, setInterpretedItens] = useState<any[]>([]);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showOnlyVoice, setShowOnlyVoice] = useState(false);

  // Categorias já são garantidas no FinanceProvider

  // Buscar transação para edição
  const editingTransaction = editingId ? state.transactions.find((t) => t.id === editingId) : null;

  // Função helper para obter o título do formulário
  const getFormTitle = () => {
    if (editingTransaction) {
      if (type === 'income') return 'Editar Ganho';
      if (type === 'expense_fixed') return 'Editar Despesa Fixa';
      if (type === 'expense_variable') return 'Editar Despesa Variável';
      if (type === 'debt') return 'Editar Dívida';
      if (type === 'savings') return 'Editar Economia';
      return 'Editar Transação';
    } else {
      if (type === 'income') return 'Novo Ganho';
      if (type === 'expense_fixed') return 'Nova Despesa Fixa';
      if (type === 'expense_variable') return 'Nova Despesa Variável';
      if (type === 'debt') return 'Nova Dívida';
      if (type === 'savings') return 'Nova Economia';
      return 'Nova Transação';
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        // Modo edição - preencher com dados da transação
        setType(editingTransaction.type);
        setDescription(editingTransaction.notes || '');
        setValue(editingTransaction.value.toString());
        setCategoryId(editingTransaction.categoryId || '');
        setCardId(editingTransaction.cardId || defaultCardId || '');
        setDate(formatDateToBR(editingTransaction.date));
        setDueDate(editingTransaction.dueDate ? formatDateToBR(editingTransaction.dueDate) : formatDateToBR(editingTransaction.date));
        setStatus(editingTransaction.status || 'pending');
        setInstallments(editingTransaction.installments || { current: 1, total: 1 });
        setHasInstallments(!!editingTransaction.installments);
        setPersonId(editingTransaction.personId || null);
        const person = editingTransaction.personId ? state.people.find((p) => p.id === editingTransaction.personId) : null;
        setPersonInput(person?.name || '');
        setNotes(editingTransaction.notes || '');
        setTransactionType(editingTransaction.installments ? 'Parcela' : 'Pagamento Mensal');
        setMonthlyPaymentDate(editingTransaction.monthlyPaymentDate?.toString() || '');
        setSaved(false);
        setShowOnlyVoice(false);
        setVoiceMode('idle');
      } else {
        // Modo criação - resetar campos
        const detectedType = getDefaultType();
        setType(detectedType);
        setDescription('');
        setValue('');
        setCategoryId('');
        // Pré-selecionar cartão se fornecido
        setCardId(defaultCardId || '');
        const today = new Date();
        const todayBR = formatDateToBR(getTodayISO());
        setDate(todayBR);
        setDueDate(todayBR); // Pré-preencher data de vencimento com data atual
        setStatus('pending');
        setInstallments({ current: 1, total: 1 });
        setHasInstallments(false);
        setPersonId(null);
        setPersonInput('');
        setNotes('');
        setTransactionType('Pagamento Mensal');
        setMonthlyPaymentDate('');
        setSaved(false);
        // Se startWithVoice for true, mostrar apenas interface de voz
        if (startWithVoice) {
          setShowOnlyVoice(true);
          setVoiceMode('idle');
        } else {
          setShowOnlyVoice(false);
          setVoiceMode('idle');
          setVoiceText('');
          setParsedTransactions([]);
          setInterpretedItens([]);
          setIsProcessingVoice(false);
          setShowConfirmModal(false);
        }
      }
    } else {
      // Resetar quando fechar
      setShowOnlyVoice(false);
    }
  }, [isOpen, pathname, startWithVoice, defaultCardId, editingTransaction, state.people]);

  const handleExampleClick = (exampleDescription: string, categoryName: string) => {
    // Preencher descrição
    setDescription(exampleDescription);
    
    // Encontrar e selecionar categoria pelo nome
    if (type === 'expense_variable' || type === 'expense_fixed') {
      const foundCategory = state.categories.find(
        (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (foundCategory) {
        setCategoryId(foundCategory.id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações com mensagens claras
    if (!value || parseFloat(value) <= 0) {
      alert('Por favor, insira um valor válido maior que zero.');
      return;
    }

    if (!description || description.trim() === '') {
      alert('Por favor, insira uma descrição.');
      return;
    }

    // Validar data
    const isoDate = formatDateToISO(date);
    if (!isoDate || isoDate.length !== 10) {
      alert('Por favor, insira uma data válida no formato DD/MM/AAAA');
      return;
    }

    if ((type === 'expense_fixed' || type === 'expense_variable') && !categoryId) {
      alert('Por favor, selecione uma categoria.');
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
      // Buscar categoria "Ganhos" (deve existir no seedData)
      let ganhosCategory = state.categories.find((c) => c.name === 'Ganhos');
      // Se não existir, criar (não deveria acontecer, mas por segurança)
      if (!ganhosCategory) {
        const ganhosId = addCategory('Ganhos', null, '#22c55e');
        ganhosCategory = { id: ganhosId, name: 'Ganhos', limit: null, color: '#22c55e' };
      }
      transactionData.categoryId = ganhosCategory.id;
      transactionData.personId = finalPersonId || null;
      transactionData.notes = notes || description;
    } else if (type === 'debt') {
      transactionData.categoryId = state.categories[0]?.id || '';
      transactionData.dueDate = formatDateToISO(date);
      transactionData.status = status;
      transactionData.notes = description || transactionType;
      
      // Se for parcelado, adicionar installments
      if (transactionType === 'Parcela' && hasInstallments) {
        transactionData.installments = installments;
        transactionData.paidInstallments = [];
      }
      
      // Se for pagamento mensal, adicionar monthlyPaymentDate
      if (transactionType === 'Pagamento Mensal' && monthlyPaymentDate) {
        const day = parseInt(monthlyPaymentDate, 10);
        if (day >= 1 && day <= 31) {
          transactionData.monthlyPaymentDate = day;
        }
      }
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
        // Se houver cartão selecionado, adicionar cardId
        if (cardId) {
          transactionData.cardId = cardId;
        }
      }
    }

    if (editingTransaction) {
      // Modo edição
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      // Modo criação
      addTransaction(transactionData);
    }

    setSaved(true);
    
    // Aguardar um pouco para garantir que o estado foi atualizado
    setTimeout(() => {
      onClose();
      setSaved(false);
    }, 800);
  };

  // Handler para processar texto transcrito da voz
  const handleVoiceTranscript = async (text: string) => {
    console.log('handleVoiceTranscript chamado com texto:', text);
    if (!text || text.trim().length === 0) {
      console.log('Texto vazio, retornando');
      return;
    }

    setVoiceText(text);
    setVoiceMode('transcribing');
    setIsProcessingVoice(true);

    try {
      const response = await fetch('/api/voice/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar o texto');
      }

      const data = await response.json();
      
      console.log('Resposta da API:', data);
      
      if (data.success) {
        setParsedTransactions(data.transactions || []);
        
        // Converter para formato do modal de confirmação
        const itens = (data.transactions || [])
          .filter((t: any) => t.value > 0) // Filtrar apenas transações com valor > 0
          .map((t: any) => ({
            valor: t.value,
            categoria: t.category || 'Outros',
            descricao: t.description || 'Lançamento por voz',
            data: t.date || 'hoje',
            necessita_confirmacao: t.needsConfirmation || false,
          }));
        
        console.log('Itens convertidos (após filtro):', itens);
        console.log('Número de itens válidos:', itens.length);
        
        setInterpretedItens(itens);
        setVoiceMode('idle'); // Resetar para não mostrar o componente antigo
        setIsProcessingVoice(false); // Resetar antes de abrir o modal
        // Usar setTimeout para garantir que o estado foi atualizado
        setTimeout(() => {
          setShowConfirmModal(true); // Abrir modal de confirmação (mesmo se vazio)
        }, 100);
      } else {
        alert('Erro ao processar o texto. Tente novamente.');
        setVoiceMode('idle');
        setIsProcessingVoice(false);
      }
    } catch (error: any) {
      console.error('Erro ao processar voz:', error);
      alert('Erro ao processar o texto. Tente novamente.');
      setVoiceMode('idle');
      setIsProcessingVoice(false);
    }
  };

  // Handler para confirmar lançamentos do modal
  const handleConfirmModalItens = async (itens: any[]) => {
    setIsProcessingVoice(true);
    setShowConfirmModal(false);

    try {
      // Converter itens do modal para formato de transação
      // Usar o tipo atual do formulário como padrão (baseado na página)
      const currentDefaultType = getDefaultType();
      const transactions: Array<{
        value: number;
        type: 'income' | 'expense_fixed' | 'expense_variable' | 'savings' | 'debt';
        date: string;
        notes: string;
        category?: string;
      }> = itens.map((item) => {
        // Determinar tipo baseado na categoria ou usar o tipo da página atual
        let type: 'income' | 'expense_fixed' | 'expense_variable' | 'savings' | 'debt' = currentDefaultType;
        if (item.categoria === 'Ganhos') {
          type = 'income';
        } else if (item.categoria === 'Cofre') {
          type = 'savings';
        }

        // Converter data
        let dateISO = getTodayISO();
        if (item.data === 'ontem') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          dateISO = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        } else if (item.data && item.data.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateISO = item.data;
        }

        return {
          value: item.valor,
          type,
          date: dateISO,
          notes: item.descricao,
          category: item.categoria !== 'Ganhos' ? item.categoria : undefined,
        };
      });

      // Preparar todas as transações primeiro
      const transactionsToAdd: any[] = [];
      
      for (const transaction of transactions) {
        // Capturar o tipo ANTES das verificações condicionais para evitar type narrowing
        const transactionType: 'income' | 'expense_fixed' | 'expense_variable' | 'savings' | 'debt' = transaction.type;
        
        // Encontrar ou criar categoria se necessário
        let finalCategoryId: string;
        
        if (transactionType === 'income') {
          // Para ganhos, buscar categoria "Ganhos"
          let ganhosCategory = state.categories.find((c) => c.name === 'Ganhos');
          if (!ganhosCategory) {
            const ganhosId = addCategory('Ganhos', null, '#22c55e');
            ganhosCategory = { id: ganhosId, name: 'Ganhos', limit: null, color: '#22c55e' };
          }
          finalCategoryId = ganhosCategory.id;
        } else if (transactionType === 'savings') {
          // Para cofre, buscar categoria "Cofre"
          let cofreCategory = state.categories.find((c) => c.name === 'Cofre');
          if (!cofreCategory) {
            const cofreId = addCategory('Cofre', null, '#8b5cf6');
            cofreCategory = { id: cofreId, name: 'Cofre', limit: null, color: '#8b5cf6' };
          }
          finalCategoryId = cofreCategory.id;
        } else if (transaction.category) {
          // Para despesas (expense_fixed ou expense_variable), buscar ou criar categoria
          const foundCategory = state.categories.find(
            (cat) => cat.name.toLowerCase() === transaction.category!.toLowerCase()
          );
          if (foundCategory) {
            finalCategoryId = foundCategory.id;
          } else {
            // Criar nova categoria
            finalCategoryId = addCategory(transaction.category, null, '#6366f1');
          }
        } else {
          // Fallback: usar primeira categoria disponível ou criar "Outros"
          const outrasCategory = state.categories.find((c) => c.name === 'Outros');
          if (outrasCategory) {
            finalCategoryId = outrasCategory.id;
          } else {
            finalCategoryId = addCategory('Outros', null, '#6b7280');
          }
        }

        const transactionData: any = {
          value: transaction.value,
          type: transactionType,
          date: transaction.date, // Usar a data convertida
          notes: transaction.notes, // Usar notes que foi definido no map
          categoryId: finalCategoryId, // Sempre definir categoryId
        };

        // Campos específicos por tipo
        if (transactionType === 'expense_fixed') {
          transactionData.dueDate = transaction.date;
          transactionData.status = 'pending';
        }

        if (transactionType === 'expense_variable') {
          // Se houver cartão selecionado, adicionar
          if (cardId) {
            transactionData.cardId = cardId;
          }
        }

        transactionsToAdd.push(transactionData);
      }

      // Adicionar todas as transações
      transactionsToAdd.forEach(transactionData => {
        addTransaction(transactionData);
      });

      // Aguardar um pouco para garantir que o estado foi atualizado e os componentes re-renderizem
      await new Promise(resolve => setTimeout(resolve, 150));

      // Mostrar mensagem de sucesso
      const successMessage = transactions.length === 1 
        ? 'Lançamento salvo com sucesso!'
        : `${transactions.length} lançamentos salvos com sucesso!`;
      
      // Fechar e resetar
      setVoiceMode('idle');
      setVoiceText('');
      setParsedTransactions([]);
      setInterpretedItens([]);
      
      // Fechar o modal primeiro para permitir que os componentes re-renderizem
      onClose();
      
      // Mostrar alerta de sucesso após fechar o modal
      setTimeout(() => {
        alert(successMessage);
      }, 100);
    } catch (error: any) {
      console.error('Erro ao salvar transações:', error);
      alert('Erro ao salvar os lançamentos. Tente novamente.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Handler para editar texto de voz
  const handleEditVoiceText = () => {
    setVoiceMode('idle');
    setParsedTransactions([]);
  };

  // Handler para cancelar fluxo de voz
  const handleCancelVoice = () => {
    setVoiceMode('idle');
    setVoiceText('');
    setParsedTransactions([]);
  };

  // Handler para cancelar modal
  const handleCancelModal = () => {
    setShowConfirmModal(false);
    setVoiceMode('idle');
    setVoiceText('');
    setInterpretedItens([]);
  };

  if (!isOpen) return null;

  // Se showOnlyVoice for true, mostrar apenas interface de voz
  if (showOnlyVoice && !showConfirmModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center bg-black/40 backdrop-blur-sm p-0 md:p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm md:max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl p-4 md:p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                🎙️ Falar e Registrar
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Fale sua transação normalmente
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          {/* Componente de captura de voz */}
          <div className="mb-4">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              onError={(error) => {
                console.error('Erro no VoiceInput:', error);
                // Só mostrar alerta para erros críticos (permissão negada)
                if (error.includes('Permissão') || error.includes('negada')) {
                  alert(error);
                }
              }}
              disabled={voiceMode === 'transcribing' || isProcessingVoice}
              autoStart={true}
            />
          </div>

          {/* Botão para voltar ao formulário manual */}
          <button
            onClick={() => {
              setShowOnlyVoice(false);
            }}
            className="w-full mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            Ou adicionar manualmente →
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal de confirmação de voz */}
      <VoiceConfirmModal
        isOpen={showConfirmModal}
        originalText={voiceText}
        itens={interpretedItens}
        onConfirm={handleConfirmModalItens}
        onCancel={handleCancelModal}
        isProcessing={isProcessingVoice}
      />

      {/* Formulários originais */}
      {!showConfirmModal && (
        <>
          {/* Formulário para Despesas Variáveis */}
          {type === 'expense_variable' && (
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center bg-black/40 backdrop-blur-sm p-0 md:p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm md:max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl p-4 md:p-6 shadow-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">{getFormTitle()}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Componente de captura de voz */}
          <div className="mb-4">
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  onError={(error) => {
                    console.error('Erro no VoiceInput:', error);
                    // Só mostrar alerta para erros críticos (permissão negada)
                    if (error.includes('Permissão') || error.includes('negada')) {
                      alert(error);
                    }
                  }}
                  disabled={voiceMode === 'transcribing' || isProcessingVoice}
                  autoStart={startWithVoice && isOpen}
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">
                    Descrição <span className="text-gray-400 font-normal normal-case">(pode usar emojis)</span>
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Ex: 🍽️ Almoço ou Iphone"
                    required
                    autoFocus
                  />
                  <CategoryExamples type={type} onExampleClick={handleExampleClick} />
                </div>

                <div>
                  <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Categoria</label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-500"
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
                <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">
                  Cartão de Crédito <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                </label>
              <div className="relative">
                <select
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-500"
                >
                  <option value="">Sem cartão</option>
                  {state.cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name}
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
                <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Data da compra</label>
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
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Valor</label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="0,00"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={hasInstallments}
                      onChange={(e) => setHasInstallments(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-blue-700 shadow-inner"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Parcelado
                  </span>
                </label>
              {hasInstallments && (
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <input
                    type="number"
                    min="1"
                    value={installments.current}
                    onChange={(e) => setInstallments({ ...installments, current: parseInt(e.target.value) || 1 })}
                    className="flex-1 min-w-[100px] bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Parcela atual"
                  />
                  <span className="text-gray-600 text-sm whitespace-nowrap">de</span>
                  <input
                    type="number"
                    min="1"
                    value={installments.total}
                    onChange={(e) => setInstallments({ ...installments, total: parseInt(e.target.value) || 1 })}
                    className="flex-1 min-w-[100px] bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Total"
                  />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={saved}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 md:py-3 rounded-lg transition-all disabled:bg-green-600 shadow-sm hover:shadow-md text-sm md:text-base"
              >
                {saved ? '✓ Salvo!' : editingTransaction ? 'Salvar Alterações' : 'Salvar'}
              </button>
            </form>
        </div>
      </div>
      )}

          {/* Formulário para Ganhos */}
          {type === 'income' && (
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center bg-black/40 backdrop-blur-sm p-0 md:p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm md:max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl p-4 md:p-6 shadow-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">{getFormTitle()}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Componente de captura de voz */}
          <div className="mb-4">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              onError={(error) => {
                console.error('Erro no VoiceInput:', error);
                // Só mostrar alerta para erros críticos (permissão negada)
                if (error.includes('Permissão') || error.includes('negada')) {
                  alert(error);
                }
              }}
              disabled={voiceMode === 'transcribing' || isProcessingVoice}
              autoStart={startWithVoice && isOpen}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">
                Descrição <span className="text-gray-400 font-normal normal-case">(pode usar emojis)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Ex: 💰 Salário Pedro"
                required
                autoFocus
              />
              <CategoryExamples type={type} onExampleClick={handleExampleClick} />
            </div>

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Recebido em</label>
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
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Valor</label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Corresponde</label>
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
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Digite ou selecione uma pessoa"
              />
              <datalist id="people-list">
                {state.people.map((person) => (
                  <option key={person.id} value={person.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Anotação</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3.5 py-2.5 md:px-4 md:py-3 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
                rows={3}
                placeholder="Opcional"
              />
            </div>

            <button
              type="submit"
              disabled={saved}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 md:py-3 rounded-lg transition-all disabled:bg-green-600 shadow-sm hover:shadow-md text-sm md:text-base"
            >
              {saved ? '✓ Salvo!' : 'Salvar'}
            </button>
          </form>
        </div>
      </div>
          )}

          {/* Formulário para Dívidas */}
          {type === 'debt' && (
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center bg-black/40 backdrop-blur-sm p-0 md:p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm md:max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl p-4 md:p-6 shadow-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Nova Dívida</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Componente de captura de voz */}
          <div className="mb-4">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              onError={(error) => {
                console.error('Erro no VoiceInput:', error);
                // Só mostrar alerta para erros críticos (permissão negada)
                if (error.includes('Permissão') || error.includes('negada')) {
                  alert(error);
                }
              }}
              disabled={voiceMode === 'transcribing' || isProcessingVoice}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">
                Descrição <span className="text-gray-400 font-normal normal-case">(pode usar emojis)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Ex: 💳 Cartão de Crédito ou Financiamento"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Data do pagamento</label>
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
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Tipo do lançamento</label>
              <div className="relative">
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-500"
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
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Valor</label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="0,00"
                required
              />
            </div>

            {/* Campo de parcelas - apenas se tipo for "Parcela" */}
            {transactionType === 'Parcela' && (
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={hasInstallments}
                      onChange={(e) => setHasInstallments(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-blue-700 shadow-inner"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Parcelado
                  </span>
                </label>
                {hasInstallments && (
                  <div className="mt-2">
                    <input
                      type="number"
                      min="1"
                      value={installments.total}
                      onChange={(e) => setInstallments({ ...installments, total: parseInt(e.target.value) || 1 })}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Total de parcelas"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Campo de dia do mês - apenas se tipo for "Pagamento Mensal" */}
            {transactionType === 'Pagamento Mensal' && (
              <div>
                <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">
                  Dia do mês para pagamento
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={monthlyPaymentDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 31)) {
                      setMonthlyPaymentDate(val);
                    }
                  }}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Ex: 15 (dia 15 de cada mês)"
                />
              </div>
            )}

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'paid' | 'pending')}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-500"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 md:py-3 rounded-lg transition-all disabled:bg-green-600 shadow-sm hover:shadow-md text-sm md:text-base"
            >
              {saved ? '✓ Salvo!' : 'Salvar'}
            </button>
          </form>
        </div>
      </div>
          )}

          {/* Formulário para Despesas Fixas */}
          {type === 'expense_fixed' && (
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center bg-black/40 backdrop-blur-sm p-0 md:p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm md:max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl p-4 md:p-6 shadow-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">{getFormTitle()}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Componente de captura de voz */}
          <div className="mb-4">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              onError={(error) => {
                console.error('Erro no VoiceInput:', error);
                // Só mostrar alerta para erros críticos (permissão negada)
                if (error.includes('Permissão') || error.includes('negada')) {
                  alert(error);
                }
              }}
              disabled={voiceMode === 'transcribing' || isProcessingVoice}
              autoStart={startWithVoice && isOpen}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Descrição <span className="text-gray-500 text-xs font-normal">(pode usar emojis)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Ex: 🏠 Aluguel"
                required
                autoFocus
              />
              <CategoryExamples type={type} onExampleClick={handleExampleClick} />
            </div>

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Categoria</label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-500"
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
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Valor</label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Vencimento</label>
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
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'paid' | 'pending')}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="pending">A pagar</option>
                <option value="paid">Pagou</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saved}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 md:py-3 rounded-lg transition-all disabled:bg-green-600 shadow-sm hover:shadow-md text-sm md:text-base"
            >
              {saved ? '✓ Salvo!' : 'Salvar'}
            </button>
          </form>
        </div>
      </div>
          )}

          {/* Formulário para Economias */}
          {type === 'savings' && (
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center bg-black/40 backdrop-blur-sm p-0 md:p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm md:max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl p-4 md:p-6 shadow-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Nova Economia</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Componente de captura de voz */}
          <div className="mb-4">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              onError={(error) => {
                console.error('Erro no VoiceInput:', error);
                // Só mostrar alerta para erros críticos (permissão negada)
                if (error.includes('Permissão') || error.includes('negada')) {
                  alert(error);
                }
              }}
              disabled={voiceMode === 'transcribing' || isProcessingVoice}
              autoStart={startWithVoice && isOpen}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Descrição <span className="text-gray-500 text-xs font-normal">(pode usar emojis)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Ex: 💰 Depósito na poupança"
                required
                autoFocus
              />
              <CategoryExamples type={type} onExampleClick={handleExampleClick} />
            </div>

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Categoria</label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-500"
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
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Data</label>
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
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Valor</label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 font-semibold uppercase tracking-wide">Anotação</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3.5 py-2.5 md:px-4 md:py-3 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
                rows={3}
                placeholder="Opcional"
              />
            </div>

            <button
              type="submit"
              disabled={saved}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 md:py-3 rounded-lg transition-all disabled:from-green-500 disabled:to-green-600 shadow-md hover:shadow-lg text-sm md:text-base"
            >
              {saved ? '✓ Salvo!' : 'Salvar'}
            </button>
          </form>
        </div>
      </div>
          )}
        </>
      )}
    </>
  );
}

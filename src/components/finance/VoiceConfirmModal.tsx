'use client';

import { useState, useEffect } from 'react';
import { Check, X, Edit2, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

type InterpretedItem = {
  valor: number;
  categoria: string;
  descricao: string;
  data: string; // "hoje" | "ontem" | "YYYY-MM-DD"
  necessita_confirmacao: boolean;
};

type VoiceConfirmModalProps = {
  isOpen: boolean;
  originalText: string;
  itens: InterpretedItem[];
  onConfirm: (itens: InterpretedItem[]) => void;
  onCancel: () => void;
  isProcessing?: boolean;
};

/**
 * Modal de confirmação visual para lançamentos detectados pela IA
 * Mobile-first com bottom-sheet
 */
export function VoiceConfirmModal({
  isOpen,
  originalText,
  itens,
  onConfirm,
  onCancel,
  isProcessing = false,
}: VoiceConfirmModalProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedItens, setEditedItens] = useState<InterpretedItem[]>(itens);
  const [removedIndexes, setRemovedIndexes] = useState<Set<number>>(new Set());

  // Atualizar editedItens quando itens mudar
  useEffect(() => {
    console.log('VoiceConfirmModal: itens recebidos:', itens);
    // Filtrar apenas itens com valor > 0
    const validItens = itens.filter(item => item.valor > 0);
    console.log('VoiceConfirmModal: itens válidos após filtro:', validItens);
    setEditedItens(validItens);
    setRemovedIndexes(new Set());
  }, [itens]);

  // Mapeamento de emojis por categoria
  const getCategoryEmoji = (categoria: string): string => {
    const emojiMap: Record<string, string> = {
      'Transporte': '🚗',
      'Alimentação': '🍽️',
      'Lazer': '🎬',
      'Saúde': '🏥',
      'Educação': '📚',
      'Moradia': '🏠',
      'Assinaturas': '📱',
      'Compras': '🛒',
      'Dívidas': '💳',
      'Investimentos': '📈',
      'Cofre': '🔐',
      'Ganhos': '💰',
      'Outros': '📦',
    };
    return emojiMap[categoria] || '📝';
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Formatar data
  const formatDate = (data: string): string => {
    if (data === 'hoje') return 'Hoje';
    if (data === 'ontem') return 'Ontem';
    
    // Se for formato ISO (YYYY-MM-DD), converter para DD/MM
    if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = data.split('-');
      return `${day}/${month}`;
    }
    
    return data;
  };

  // Editar item
  const handleEditItem = (index: number, field: keyof InterpretedItem, value: any) => {
    const updated = [...editedItens];
    updated[index] = { ...updated[index], [field]: value };
    setEditedItens(updated);
  };

  // Remover item
  const handleRemoveItem = (index: number) => {
    setRemovedIndexes(new Set([...removedIndexes, index]));
  };

  // Restaurar item removido
  const handleRestoreItem = (index: number) => {
    const newRemoved = new Set(removedIndexes);
    newRemoved.delete(index);
    setRemovedIndexes(newRemoved);
  };

  // Confirmar
  const handleConfirm = () => {
    // Filtrar itens removidos
    const validItens = editedItens.filter((_, index) => !removedIndexes.has(index));
    
    if (validItens.length === 0) {
      alert('Adicione pelo menos um lançamento para confirmar.');
      return;
    }

    onConfirm(validItens);
  };

  // Itens válidos (não removidos)
  const validItens = editedItens.filter((_, index) => !removedIndexes.has(index));
  
  // Debug: log dos itens válidos
  useEffect(() => {
    console.log('VoiceConfirmModal: validItens:', validItens);
    console.log('VoiceConfirmModal: editedItens:', editedItens);
    console.log('VoiceConfirmModal: removedIndexes:', removedIndexes);
  }, [validItens, editedItens, removedIndexes]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-xl">🎙️</span>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                Confirme os lançamentos
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Confira se entendi corretamente antes de salvar
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Texto original */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Você disse:
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 italic">
              "{originalText}"
            </p>
          </div>

          {/* Mensagem de segurança */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Nada é salvo sem sua confirmação</strong> • Você sempre pode editar depois
            </p>
          </div>

          {/* Lista de itens */}
          {validItens.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Não identifiquei lançamentos financeiros
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {editedItens.map((item, index) => {
                if (removedIndexes.has(index)) return null;

                const isEditing = editingIndex === index;
                const emoji = getCategoryEmoji(item.categoria);

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      item.necessita_confirmacao
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {isEditing ? (
                      // Modo edição
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Descrição
                          </label>
                          <input
                            type="text"
                            value={item.descricao}
                            onChange={(e) => handleEditItem(index, 'descricao', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Valor
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.valor}
                            onChange={(e) => handleEditItem(index, 'valor', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Categoria
                          </label>
                          <input
                            type="text"
                            value={item.categoria}
                            onChange={(e) => handleEditItem(index, 'categoria', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Modo visualização
                      <div className="space-y-2">
                        {/* Aviso de confirmação necessária */}
                        {item.necessita_confirmacao && (
                          <div className="flex items-center gap-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mb-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                              Precisa de confirmação
                            </span>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          {/* Emoji e checkbox */}
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                              {emoji}
                            </div>
                            <Check className="w-5 h-5 text-green-500" />
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {item.descricao}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {item.categoria} · {formatDate(item.data)}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                              {formatCurrency(item.valor)}
                            </p>
                          </div>

                          {/* Ações */}
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingIndex(index)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Editar"
                              aria-label="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Remover"
                              aria-label="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Itens removidos (se houver) */}
          {removedIndexes.size > 0 && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {removedIndexes.size} item(ns) removido(s)
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from(removedIndexes).map((index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleRestoreItem(index)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Restaurar: {editedItens[index].descricao}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer com ações */}
        <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
          {/* Botão principal */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || validItens.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors touch-manipulation shadow-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>✅ Confirmar e salvar {validItens.length > 1 ? `${validItens.length} lançamentos` : 'lançamento'}</span>
              </>
            )}
          </button>

          {/* Botões secundários */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                // Editar todos (abrir edição do primeiro)
                if (validItens.length > 0) {
                  const firstIndex = editedItens.findIndex((_, i) => !removedIndexes.has(i));
                  if (firstIndex !== -1) {
                    setEditingIndex(firstIndex);
                  }
                }
              }}
              disabled={validItens.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors touch-manipulation"
            >
              <Edit2 className="w-4 h-4" />
              <span className="text-sm">✏️ Editar tudo</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors touch-manipulation"
            >
              <span className="text-sm">Cancelar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

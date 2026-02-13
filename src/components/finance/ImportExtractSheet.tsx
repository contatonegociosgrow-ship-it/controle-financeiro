'use client';

import { useState, useRef } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { formatDateToISO } from '@/lib/goalUtils';
import { Upload, FileText } from 'lucide-react';

type ImportExtractSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
};

type CSVRow = {
  date: string;
  description: string;
  value: number;
  installments?: number;
  categoryId?: string;
  categoryName?: string;
};

export function ImportExtractSheet({ isOpen, onClose, cardId }: ImportExtractSheetProps) {
  const { state, addTransaction, addCategory } = useFinanceStore();
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [importMethod, setImportMethod] = useState<'paste' | 'file'>('paste');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const card = state.cards.find((c) => c.id === cardId);
  const outrosCategory = state.categories.find((c) => c.name === 'Outros') || state.categories[0];

  // Mapeamento de palavras-chave para categorias (baseado em estabelecimentos e descrições comuns)
  const CATEGORY_MAP: Record<string, string> = {
    // Transporte
    'uber': 'Transporte',
    '99': 'Transporte',
    'taxi': 'Transporte',
    'táxi': 'Transporte',
    'combustível': 'Transporte',
    'combustivel': 'Transporte',
    'gasolina': 'Transporte',
    'posto': 'Transporte',
    'estacionamento': 'Transporte',
    'pedágio': 'Transporte',
    'pedagio': 'Transporte',
    'ônibus': 'Transporte',
    'onibus': 'Transporte',
    'metrô': 'Transporte',
    'metro': 'Transporte',
    'transporte': 'Transporte',
    // Alimentação
    'mercado': 'Alimentação',
    'supermercado': 'Alimentação',
    'sup': 'Alimentação', // SUP EPA, etc
    'epa': 'Alimentação',
    'sacolão': 'Alimentação',
    'sacolao': 'Alimentação',
    'atacadão': 'Alimentação',
    'atacadao': 'Alimentação',
    'atacado': 'Alimentação',
    'extra': 'Alimentação',
    'carrefour': 'Alimentação',
    'walmart': 'Alimentação',
    'pao de açúcar': 'Alimentação',
    'pao de acucar': 'Alimentação',
    'pão de açúcar': 'Alimentação',
    'assai': 'Alimentação',
    'sams': 'Alimentação',
    'costco': 'Alimentação',
    'big': 'Alimentação',
    'hipermercado': 'Alimentação',
    'hiper': 'Alimentação',
    'restaurante': 'Alimentação',
    'lanchonete': 'Alimentação',
    'lanche': 'Alimentação',
    'fast food': 'Alimentação',
    'mcdonalds': 'Alimentação',
    'burger king': 'Alimentação',
    'subway': 'Alimentação',
    'pizza': 'Alimentação',
    'pizzaria': 'Alimentação',
    'ifood': 'Alimentação',
    'rappi': 'Alimentação',
    'delivery': 'Alimentação',
    'padaria': 'Alimentação',
    'padariamd': 'Alimentação', // PADARIAMD do exemplo
    'açougue': 'Alimentação',
    'acougue': 'Alimentação',
    'peixaria': 'Alimentação',
    'peixe': 'Alimentação',
    'hortifruti': 'Alimentação',
    'feira': 'Alimentação',
    'feira livre': 'Alimentação',
    'comida': 'Alimentação',
    'almoço': 'Alimentação',
    'almoco': 'Alimentação',
    'jantar': 'Alimentação',
    'café': 'Alimentação',
    'cafe': 'Alimentação',
    'starbucks': 'Alimentação',
    'bakery': 'Alimentação',
    // Moradia
    'aluguel': 'Moradia',
    'condomínio': 'Moradia',
    'condominio': 'Moradia',
    'iptu': 'Moradia',
    'luz': 'Moradia',
    'energia': 'Moradia',
    'água': 'Moradia',
    'agua': 'Moradia',
    'gás': 'Moradia',
    'gas': 'Moradia',
    'internet': 'Moradia',
    'telefone': 'Moradia',
    'tv': 'Moradia',
    'net': 'Moradia',
    'vivo': 'Moradia',
    'claro': 'Moradia',
    'oi': 'Moradia',
    'tim': 'Moradia',
    'energia elétrica': 'Moradia',
    'energia eletrica': 'Moradia',
    // Saúde
    'farmácia': 'Saúde',
    'farmacia': 'Saúde',
    'drogaria': 'Saúde',
    'hospital': 'Saúde',
    'clínica': 'Saúde',
    'clinica': 'Saúde',
    'médico': 'Saúde',
    'medico': 'Saúde',
    'dentista': 'Saúde',
    'laboratório': 'Saúde',
    'laboratorio': 'Saúde',
    'exame': 'Saúde',
    'plano de saúde': 'Saúde',
    'plano de saude': 'Saúde',
    'unimed': 'Saúde',
    'amil': 'Saúde',
    'sulamerica': 'Saúde',
    // Lazer
    'cinema': 'Lazer',
    'show': 'Lazer',
    'teatro': 'Lazer',
    'bar': 'Lazer',
    'balada': 'Lazer',
    'festival': 'Lazer',
    'parque': 'Lazer',
    'viagem': 'Lazer',
    'hotel': 'Lazer',
    'passeio': 'Lazer',
    'jogo': 'Lazer',
    'streaming': 'Lazer',
    'netflix': 'Lazer',
    'spotify': 'Lazer',
    'youtube': 'Lazer',
    'amazon prime': 'Lazer',
    'disney': 'Lazer',
    // Educação
    'escola': 'Educação',
    'faculdade': 'Educação',
    'universidade': 'Educação',
    'curso': 'Educação',
    'material escolar': 'Educação',
    'livro': 'Educação',
    'livros': 'Educação',
    'material': 'Educação',
    // Compras
    'loja': 'Compras',
    'shopping': 'Compras',
    'magazine': 'Compras',
    'amazon': 'Compras',
    'mercado livre': 'Compras',
    'mercadolivre': 'Compras',
    'americanas': 'Compras',
    'casas bahia': 'Compras',
    'magazine luiza': 'Compras',
    'magalu': 'Compras',
    'riachuelo': 'Compras',
    'renner': 'Compras',
    'c&a': 'Compras',
    'zara': 'Compras',
    'h&m': 'Compras',
    // Trabalho
    'trabalho': 'Trabalho',
    'escritório': 'Trabalho',
    'escritorio': 'Trabalho',
    'material de escritório': 'Trabalho',
    'material de escritorio': 'Trabalho',
  };

  /**
   * Identifica a categoria baseada na descrição da transação
   */
  const identifyCategory = (description: string): { id: string; name: string } | null => {
    if (!description) return outrosCategory || state.categories[0] || null;
    
    const normalizedDesc = description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Buscar palavra-chave na descrição (ordenado por especificidade - palavras mais específicas primeiro)
    const sortedKeywords = Object.entries(CATEGORY_MAP).sort((a, b) => b[0].length - a[0].length);
    
    for (const [keyword, categoryName] of sortedKeywords) {
      const normalizedKeyword = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalizedDesc.includes(normalizedKeyword)) {
        // Encontrar categoria correspondente
        const category = state.categories.find((c) => c.name === categoryName);
        if (category) {
          return category;
        }
      }
    }
    
    // Se não encontrou, retornar "Outros"
    return outrosCategory || state.categories[0] || null;
  };

  const parsePDF = async (file: File): Promise<string> => {
    // Para PDF, vamos tentar extrair texto usando uma biblioteca ou API
    // Por enquanto, vamos mostrar uma mensagem informativa
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Nota: Para processar PDF de verdade, seria necessário usar uma biblioteca como pdf.js
          // Por enquanto, vamos retornar uma mensagem informativa
          alert('Importação de PDF ainda não está totalmente implementada. Por favor, use CSV ou cole o texto do extrato.');
          reject(new Error('PDF parsing not fully implemented'));
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsProcessing(true);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv' || fileExtension === 'txt') {
        const text = await file.text();
        setCsvText(text);
        setImportMethod('paste');
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          setPreview(parsed);
        } else {
          alert('Não foi possível processar o arquivo. Verifique o formato.');
        }
      } else if (fileExtension === 'pdf') {
        await parsePDF(file);
      } else {
        // Tentar como texto genérico
        const text = await file.text();
        setCsvText(text);
        setImportMethod('paste');
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          setPreview(parsed);
        } else {
          alert('Formato de arquivo não reconhecido. Tente CSV ou cole o texto manualmente.');
        }
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      alert('Erro ao processar arquivo. Verifique o formato e tente novamente.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    // Tentar detectar separador (vírgula ou ponto e vírgula)
    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';

    // Detectar índices das colunas no cabeçalho
    const headerColumns = firstLine.split(separator).map((col) => col.trim().replace(/^"|"$/g, '').toLowerCase());
    const dateIndex = headerColumns.findIndex((col) => col.includes('data') || col.includes('date'));
    const descriptionIndex = headerColumns.findIndex((col) => col.includes('descrição') || col.includes('descricao') || col.includes('description') || col.includes('desc'));
    const tipoIndex = headerColumns.findIndex((col) => col.includes('tipo') || col.includes('type'));
    const valorIndex = headerColumns.findIndex((col) => col.includes('valor') || col.includes('value') || col.includes('amount'));
    const entradaIndex = headerColumns.findIndex((col) => col.includes('entrada') || col.includes('credit'));
    const saidaIndex = headerColumns.findIndex((col) => col.includes('saída') || col.includes('saida') || col.includes('debit') || col.includes('débito'));
    const categoriaIndex = headerColumns.findIndex((col) => col.includes('categoria') || col.includes('category'));
    const formaPagamentoIndex = headerColumns.findIndex((col) => col.includes('forma') || col.includes('payment'));
    const bancoIndex = headerColumns.findIndex((col) => col.includes('banco') || col.includes('bank'));

    // Pular cabeçalho se existir
    const dataLines = lines.slice(1);

    const rows: CSVRow[] = [];

    dataLines.forEach((line) => {
      const columns = line.split(separator).map((col) => col.trim().replace(/^"|"$/g, ''));
      
      if (columns.length < 3) return;

      // Usar índices do cabeçalho se encontrados, senão usar posições padrão
      let dateStr = '';
      if (dateIndex >= 0 && dateIndex < columns.length) {
        dateStr = columns[dateIndex];
      } else {
        dateStr = columns[0];
      }

      let description = '';
      if (descriptionIndex >= 0 && descriptionIndex < columns.length) {
        description = columns[descriptionIndex];
      } else if (tipoIndex >= 0 && tipoIndex < columns.length) {
        // Se não tem descrição mas tem tipo, usar tipo
        description = columns[tipoIndex];
      } else {
        description = columns[1] || columns[2] || '';
      }
      
      // Detectar valor - pode estar em "Entrada", "Saída" ou "Valor"
      let valueStr = '';
      if (entradaIndex >= 0 && entradaIndex < columns.length && columns[entradaIndex]) {
        valueStr = columns[entradaIndex];
      } else if (saidaIndex >= 0 && saidaIndex < columns.length && columns[saidaIndex]) {
        valueStr = columns[saidaIndex];
      } else if (valorIndex >= 0 && valorIndex < columns.length) {
        valueStr = columns[valorIndex];
      } else if (columns.length >= 4) {
        // Formato com Entrada/Saída: usar o que tiver valor
        const entrada = columns[2] || '';
        const saida = columns[3] || '';
        valueStr = entrada || saida || '0';
      } else {
        // Formato simples: Data, Descrição, Valor
        valueStr = columns[2] || columns[3] || columns[1] || '0';
      }

      // Ler categoria do CSV se existir
      let categoryName = '';
      if (categoriaIndex >= 0 && categoriaIndex < columns.length) {
        categoryName = columns[categoriaIndex];
      }

      // Normalizar data (aceitar DD/MM/YYYY, DD/MM/YYYY HH:MM:SS, YYYY-MM-DD, etc)
      if (dateStr.includes('/')) {
        // Remover hora se existir (formato: DD/MM/YYYY HH:MM:SS)
        const datePart = dateStr.split(' ')[0].trim();
        const dateParts = datePart.split('/');
        
        if (dateParts.length === 3) {
          const [day, month, year] = dateParts;
          dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      } else if (dateStr.includes('-') && !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Tentar outros formatos com hífen
        const datePart = dateStr.split(' ')[0].trim();
        if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateStr = datePart;
        }
      }

      // Normalizar valor (remover símbolos e converter vírgula para ponto)
      // Pode estar em "Entrada" ou "Saída" - usar o que tiver valor
      let cleanValue = valueStr
        .replace(/[^\d,.-]/g, '')
        .replace(/\./g, '') // Remover pontos (separadores de milhar)
        .replace(',', '.'); // Converter vírgula para ponto decimal
      
      // Se o valor estiver vazio, tentar a próxima coluna (pode ser "Entrada" ou "Saída")
      if (!cleanValue || parseFloat(cleanValue) === 0) {
        const nextValue = columns[3] || columns[4] || '0';
        cleanValue = nextValue
          .replace(/[^\d,.-]/g, '')
          .replace(/\./g, '')
          .replace(',', '.');
      }
      
      const value = parseFloat(cleanValue) || 0;

      // Tentar detectar parcelas na descrição
      let installments: number | undefined;
      const installmentMatch = description.match(/(\d+)\s*x\s*|\s*(\d+)\s*parcela/i);
      if (installmentMatch) {
        installments = parseInt(installmentMatch[1] || installmentMatch[2] || '1', 10);
      }

      // Encontrar categoria correspondente
      let categoryId: string | undefined;
      let finalCategoryName: string | undefined;
      
      // Prioridade 1: Se veio categoria do CSV, tentar usar ela
      if (categoryName) {
        // Tentar encontrar categoria exata
        const exactMatch = state.categories.find(
          (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        
        if (exactMatch) {
          categoryId = exactMatch.id;
          finalCategoryName = exactMatch.name;
        } else {
          // Tentar encontrar categoria parcial (ex: "Alimentação da empresa" -> "Alimentação")
          const partialMatch = state.categories.find((cat) => {
            const catNameLower = cat.name.toLowerCase();
            const csvCatLower = categoryName.toLowerCase();
            return csvCatLower.includes(catNameLower) || catNameLower.includes(csvCatLower);
          });
          
          if (partialMatch) {
            categoryId = partialMatch.id;
            finalCategoryName = partialMatch.name;
          }
        }
      }
      
      // Prioridade 2: Se não encontrou categoria do CSV, tentar identificar pela descrição
      if (!categoryId && description) {
        const identifiedCategory = identifyCategory(description);
        if (identifiedCategory) {
          categoryId = identifiedCategory.id;
          finalCategoryName = identifiedCategory.name;
        }
      }

      if (dateStr && value > 0) {
        rows.push({
          date: dateStr,
          description,
          value: Math.abs(value), // Garantir valor positivo
          installments,
          categoryId,
          categoryName: finalCategoryName,
        });
      }
    });

    return rows;
  };

  const handlePreview = () => {
    if (!csvText.trim()) {
      alert('Por favor, cole o conteúdo do CSV.');
      return;
    }

    const parsed = parseCSV(csvText);
    if (parsed.length === 0) {
      alert('Não foi possível processar o CSV. Verifique o formato.');
      return;
    }

    setPreview(parsed);
  };

  const handleCategoryChange = (index: number, categoryId: string) => {
    const updatedPreview = [...preview];
    const category = state.categories.find((c) => c.id === categoryId);
    if (category) {
      updatedPreview[index] = {
        ...updatedPreview[index],
        categoryId: category.id,
        categoryName: category.name,
      };
      setPreview(updatedPreview);
    }
  };

  const handleImport = () => {
    if (preview.length === 0) {
      alert('Por favor, visualize o preview antes de importar.');
      return;
    }

    if (!cardId) {
      alert('Erro: Cartão não encontrado. Por favor, tente novamente.');
      return;
    }

    setIsProcessing(true);

    try {
      let importedCount = 0;
      let errors: string[] = [];

      preview.forEach((row, index) => {
        try {
          // Garantir que a data está no formato correto
          let isoDate = row.date.split(' ')[0];
          if (!isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Tentar converter se não estiver no formato ISO
            isoDate = formatDateToISO(isoDate) || isoDate;
          }

          if (!isoDate || !isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            errors.push(`Linha ${index + 1}: Data inválida (${row.date})`);
            return;
          }

          if (!row.value || row.value <= 0) {
            errors.push(`Linha ${index + 1}: Valor inválido (${row.value})`);
            return;
          }

          // Usar categoria do CSV se disponível, senão usar "Outros"
          let categoryId = row.categoryId;
          if (!categoryId) {
            // Se não encontrou categoria no CSV, usar "Outros" como padrão
            categoryId = outrosCategory?.id || state.categories[0]?.id;
          }
          
          if (!categoryId) {
            errors.push(`Linha ${index + 1}: Categoria não encontrada`);
            return;
          }

          addTransaction({
            value: row.value,
            type: 'expense_variable',
            categoryId: categoryId,
            cardId: cardId,
            date: isoDate,
            notes: row.description,
            installments: row.installments
              ? { current: 1, total: row.installments }
              : null,
          });

          importedCount++;
        } catch (error) {
          console.error(`Erro ao importar linha ${index + 1}:`, error);
          errors.push(`Linha ${index + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      });

      if (errors.length > 0) {
        console.warn('Erros durante importação:', errors);
        alert(`${importedCount} transação(ões) importada(s) com sucesso!\n\n${errors.length} erro(s) encontrado(s). Verifique o console para detalhes.`);
      } else {
        alert(`${importedCount} transação(ões) importada(s) com sucesso!\n\nAs transações aparecerão na fatura correspondente baseada na data e no dia de fechamento do cartão.`);
      }

      setCsvText('');
      setPreview([]);
      
      // Aguardar um pouco antes de fechar para garantir que o estado foi atualizado
      setTimeout(() => {
        onClose();
        // Recarregar a página para atualizar a visualização
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Erro ao importar:', error);
      alert('Erro ao importar transações. Verifique o console para mais detalhes.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-t-2xl p-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Importar Extrato
        </h2>

        <div className="space-y-4">
          {/* Método de importação */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setImportMethod('file');
                fileInputRef.current?.click();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              <Upload size={18} />
              Upload Arquivo
            </button>
            <button
              type="button"
              onClick={() => setImportMethod('paste')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all shadow-sm ${
                importMethod === 'paste'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <FileText size={18} />
              Colar Texto
            </button>
          </div>

          {/* Input de arquivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.pdf,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Área de upload de arquivo */}
          {importMethod === 'file' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-900/50"
            >
              <Upload size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Clique para selecionar arquivo
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Formatos suportados: CSV, TXT, PDF, XLSX
              </p>
              {selectedFileName && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Arquivo selecionado: {selectedFileName}
                </p>
              )}
            </div>
          )}

          {/* Área de colar texto */}
          {importMethod === 'paste' && (
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">
                Cole o conteúdo do extrato (CSV ou texto)
              </label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                rows={8}
                placeholder="Data,Descrição,Valor&#10;01/01/2024,Compra no mercado,150.00&#10;02/01/2024,Restaurante,80.50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Formato esperado: Data | Descrição | Valor (separado por vírgula ou ponto e vírgula)
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePreview}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm"
            >
              Visualizar Preview
            </button>
            {preview.length > 0 && (
              <button
                type="button"
                onClick={handleImport}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Importando...' : `Importar ${preview.length} transação(ões)`}
              </button>
            )}
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Preview ({preview.length} transações)
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="grid grid-cols-12 gap-2 py-2 px-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="col-span-2">Data</div>
                  <div className="col-span-3">Descrição</div>
                  <div className="col-span-4">Categoria</div>
                  <div className="col-span-2 text-center">Parcela</div>
                  <div className="col-span-1 text-right">Valor</div>
                </div>
                {preview.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 last:border-b-0 items-center"
                  >
                    <div className="col-span-2 text-gray-600 dark:text-gray-400">
                      {(() => {
                        // Converter diretamente de ISO (YYYY-MM-DD) para BR (DD/MM/YYYY) sem usar Date
                        const dateStr = typeof row.date === 'string' ? row.date.split(' ')[0] : row.date;
                        if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                          const [year, month, day] = dateStr.split('-');
                          return `${day}/${month}/${year}`;
                        }
                        return dateStr || '';
                      })()}
                    </div>
                    <div className="col-span-3 text-gray-900 dark:text-white truncate" title={row.description}>
                      {row.description}
                    </div>
                    <div className="col-span-4">
                      <select
                        value={row.categoryId || outrosCategory?.id || ''}
                        onChange={(e) => handleCategoryChange(index, e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-xs text-gray-900 dark:text-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all hover:border-gray-300 dark:hover:border-gray-500"
                      >
                        {state.categories
                          .filter((c) => c.name !== 'Ganhos')
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="col-span-2 text-center text-gray-600 dark:text-gray-400">
                      {row.installments ? `${row.installments}x` : '-'}
                    </div>
                    <div className="col-span-1 text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(row.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

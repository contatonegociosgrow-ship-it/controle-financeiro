'use client';

import { useState, useRef } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { formatDateToISO } from '@/lib/goalUtils';
import { Upload, FileText } from 'lucide-react';

type ImportExtractSheetVariaveisProps = {
  isOpen: boolean;
  onClose: () => void;
};

type CSVRow = {
  date: string;
  description: string;
  value: number;
  installments?: number;
  categoryId?: string;
  categoryName?: string;
};

// Mapeamento de palavras-chave para categorias (baseado no sistema de voz)
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
  'cafeteria': 'Alimentação',
  'starbucks': 'Alimentação',
  'bebida': 'Alimentação',
  // Compras
  'compras': 'Compras',
  'compra': 'Compras',
  'shopping': 'Compras',
  'loja': 'Compras',
  'shopee': 'Compras',
  'shoppe': 'Compras',
  'magazine luiza': 'Compras',
  'magalu': 'Compras',
  'americanas': 'Compras',
  'casas bahia': 'Compras',
  'ricardo eletro': 'Compras',
  'pontofrio': 'Compras',
  'submarino': 'Compras',
  'mercadolivre': 'Compras',
  'mercado livre': 'Compras',
  'amazon': 'Compras',
  'renner': 'Compras',
  'riachuelo': 'Compras',
  'c&a': 'Compras',
  'zara': 'Compras',
  'h&m': 'Compras',
  'centauro': 'Compras',
  'nike': 'Compras',
  'adidas': 'Compras',
  'roupa': 'Compras',
  'roupas': 'Compras',
  'sapato': 'Compras',
  'sapatos': 'Compras',
  'eletrônico': 'Compras',
  'eletronico': 'Compras',
  'celular': 'Compras',
  'smartphone': 'Compras',
  'iphone': 'Compras',
  'samsung': 'Compras',
  'notebook': 'Compras',
  'computador': 'Compras',
  // Lazer
  'cinema': 'Lazer',
  'show': 'Lazer',
  'bar': 'Lazer',
  'balada': 'Lazer',
  'festival': 'Lazer',
  'parque': 'Lazer',
  'viagem': 'Lazer',
  'hotel': 'Lazer',
  'passeio': 'Lazer',
  'diversão': 'Lazer',
  'diversao': 'Lazer',
  // Saúde
  'farmácia': 'Saúde',
  'farmacia': 'Saúde',
  'médico': 'Saúde',
  'medico': 'Saúde',
  'dentista': 'Saúde',
  'hospital': 'Saúde',
  'plano': 'Saúde',
  'remédio': 'Saúde',
  'remedio': 'Saúde',
  'medicamento': 'Saúde',
  // Moradia
  'água': 'Moradia',
  'agua': 'Moradia',
  'luz': 'Moradia',
  'energia': 'Moradia',
  'aluguel': 'Moradia',
  'condomínio': 'Moradia',
  'condominio': 'Moradia',
  'iptu': 'Moradia',
  // Educação
  'curso': 'Educação',
  'faculdade': 'Educação',
  'escola': 'Educação',
  'livro': 'Educação',
  'livros': 'Educação',
  'material': 'Educação',
  // Trabalho
  'trabalho': 'Trabalho',
  'escritório': 'Trabalho',
  'escritorio': 'Trabalho',
};

/**
 * Identifica a categoria baseada na descrição da transação
 */
function identifyCategory(description: string, categories: Array<{ id: string; name: string }>): { id: string; name: string } | null {
  const normalizedDesc = description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Buscar palavra-chave na descrição
  for (const [keyword, categoryName] of Object.entries(CATEGORY_MAP)) {
    const normalizedKeyword = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalizedDesc.includes(normalizedKeyword)) {
      // Encontrar categoria correspondente
      const category = categories.find((c) => c.name === categoryName);
      if (category) {
        return category;
      }
    }
  }
  
  // Se não encontrou, retornar "Outros"
  const outrosCategory = categories.find((c) => c.name === 'Outros');
  return outrosCategory || categories[0] || null;
}

export function ImportExtractSheetVariaveis({ isOpen, onClose }: ImportExtractSheetVariaveisProps) {
  const { state, addTransaction, addCategory } = useFinanceStore();
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [importMethod, setImportMethod] = useState<'paste' | 'file'>('paste');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsePDF = async (file: File): Promise<string> => {
    // Para PDF, vamos tentar extrair texto básico
    // Nota: Para processamento completo de PDF, seria necessário usar pdf.js ou similar
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Tentar usar a API FileReader para ler como texto (funciona para PDFs simples)
          // Para PDFs complexos, seria necessário uma biblioteca como pdf.js
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // Por enquanto, vamos mostrar uma mensagem informativa
          // Em produção, você pode instalar pdf.js: npm install pdfjs-dist
          alert('Importação de PDF: Por favor, copie o texto do PDF e cole na área de texto, ou use um arquivo CSV.');
          reject(new Error('PDF parsing requires additional library'));
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
        try {
          await parsePDF(file);
        } catch (error) {
          // Se falhar, sugerir colar o texto
          console.log('PDF parsing not available, user should paste text');
        }
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
    if (lines.length < 1) return [];

    // Tentar detectar separador (vírgula ou ponto e vírgula)
    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';

    // Pular cabeçalho se existir (verificar se primeira linha parece ser cabeçalho)
    let startIndex = 0;
    if (lines.length > 1) {
      const firstLineLower = firstLine.toLowerCase();
      if (firstLineLower.includes('data') || firstLineLower.includes('descrição') || firstLineLower.includes('descricao') || firstLineLower.includes('valor')) {
        startIndex = 1;
      }
    }
    const dataLines = lines.slice(startIndex);

    const rows: CSVRow[] = [];

    dataLines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      const columns = trimmedLine.split(separator).map((col) => col.trim().replace(/^"|"$/g, ''));
      
      if (columns.length < 2) return;

      // Tentar diferentes formatos de data
      let dateStr = columns[0];
      const description = columns[1] || columns[2] || '';
      
      // Detectar valor - pode estar em "Entrada" (coluna 2) ou "Saída" (coluna 3)
      // Ou pode ser um formato simples: Data, Descrição, Valor
      let valueStr = '';
      if (columns.length >= 4) {
        // Formato com Entrada/Saída: usar o que tiver valor
        const entrada = columns[2] || '';
        const saida = columns[3] || '';
        valueStr = entrada || saida || '0';
      } else {
        // Formato simples: Data, Descrição, Valor
        valueStr = columns[2] || columns[3] || columns[1] || '0';
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
      let cleanValue = valueStr
        .replace(/[^\d,.-]/g, '')
        .replace(/\./g, '') // Remover pontos (separadores de milhar)
        .replace(',', '.'); // Converter vírgula para ponto decimal
      
      // Se o valor estiver vazio, tentar a próxima coluna
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

      if (dateStr && value > 0 && description) {
        // Identificar categoria automaticamente
        const category = identifyCategory(description, state.categories);
        
        rows.push({
          date: dateStr,
          description,
          value: Math.abs(value), // Garantir valor positivo
          installments,
          categoryId: category?.id,
          categoryName: category?.name,
        });
      }
    });

    return rows;
  };

  const handlePreview = () => {
    if (!csvText.trim()) {
      alert('Por favor, cole o conteúdo do extrato ou faça upload de um arquivo.');
      return;
    }

    const parsed = parseCSV(csvText);
    if (parsed.length === 0) {
      alert('Não foi possível processar o conteúdo. Verifique o formato.\n\nFormato esperado: Data, Descrição, Valor');
      return;
    }

    setPreview(parsed);
  };

  const handleImport = () => {
    if (preview.length === 0) {
      alert('Por favor, visualize o preview antes de importar.');
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

          // Usar categoria identificada ou criar/obter "Outros"
          let categoryId = row.categoryId;
          if (!categoryId) {
            const outrosCategory = state.categories.find((c) => c.name === 'Outros');
            if (outrosCategory) {
              categoryId = outrosCategory.id;
            } else {
              categoryId = addCategory('Outros', null, '#6b7280');
            }
          }

          addTransaction({
            value: row.value,
            type: 'expense_variable',
            categoryId: categoryId,
            cardId: null, // Despesas variáveis não precisam de cartão
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
        alert(`${importedCount} transação(ões) importada(s) com sucesso!`);
      }

      setCsvText('');
      setPreview([]);
      
      // Aguardar um pouco antes de fechar para garantir que o estado foi atualizado
      setTimeout(() => {
        onClose();
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
          Importar Extrato - Despesas Variáveis
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
            accept=".csv,.txt,.pdf"
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
                Formatos suportados: CSV, TXT, PDF
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
                <br />
                <span className="text-blue-600 dark:text-blue-400">As categorias serão identificadas automaticamente pela descrição!</span>
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
                  <div className="col-span-4">Descrição</div>
                  <div className="col-span-3">Categoria</div>
                  <div className="col-span-2 text-center">Parcela</div>
                  <div className="col-span-1 text-right">Valor</div>
                </div>
                {preview.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 last:border-b-0"
                  >
                    <div className="col-span-2 text-gray-600 dark:text-gray-400">
                      {(() => {
                        const dateStr = typeof row.date === 'string' ? row.date.split(' ')[0] : row.date;
                        if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                          const [year, month, day] = dateStr.split('-');
                          return `${day}/${month}/${year}`;
                        }
                        return dateStr || '';
                      })()}
                    </div>
                    <div className="col-span-4 text-gray-900 dark:text-white truncate" title={row.description}>
                      {row.description}
                    </div>
                    <div className="col-span-3">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                        {row.categoryName || 'Outros'}
                      </span>
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

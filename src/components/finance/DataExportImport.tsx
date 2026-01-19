'use client';

import { useState, useRef } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { exportToJSON, exportToCSV, importFromJSON } from '@/lib/dataExport';

export function DataExportImport() {
  const { state, importData } = useFinanceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const jsonData = exportToJSON(state);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `controle-financeiro-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvData = exportToCSV(state);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacoes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setImportError('Por favor, selecione um arquivo JSON válido.');
      return;
    }

    try {
      const text = await file.text();
      const importedState = importFromJSON(text);

      if (!importedState) {
        setImportError('Arquivo inválido. Verifique se é um backup válido do aplicativo.');
        return;
      }

      // Confirmar importação
      const confirmed = window.confirm(
        'Importar dados substituirá todos os dados atuais. Deseja continuar?'
      );

      if (confirmed) {
        const success = importData(text);
        if (success) {
          setImportSuccess(true);
          setTimeout(() => {
            setIsOpen(false);
            setImportSuccess(false);
            window.location.reload(); // Recarregar para aplicar mudanças
          }, 1500);
        } else {
          setImportError('Erro ao importar dados. Verifique o arquivo.');
        }
      }
    } catch (error) {
      setImportError('Erro ao ler arquivo. Verifique se o arquivo está correto.');
      console.error('Erro na importação:', error);
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
        title="Exportar/Importar dados"
      >
        💾 Dados
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-t-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Exportar/Importar Dados
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Exportar */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Exportar
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={handleExportJSON}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📄</span>
                    Exportar JSON (Backup Completo)
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📊</span>
                    Exportar CSV (Apenas Transações)
                  </button>
                </div>
              </div>

              {/* Importar */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Importar
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={handleImportClick}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  Importar JSON (Backup)
                </button>
                {importError && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                    {importError}
                  </div>
                )}
                {importSuccess && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
                    ✓ Dados importados com sucesso!
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>JSON:</strong> Backup completo de todos os dados (transações, categorias, metas, etc.)
                  <br />
                  <strong>CSV:</strong> Apenas transações para análise em planilhas
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

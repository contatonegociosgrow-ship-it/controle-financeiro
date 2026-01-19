'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PageHeader } from '@/components/finance/PageHeader';
import { ManualView } from '@/components/finance/ManualView';
import { CardUI } from '@/components/finance/CardUI';

export default function ManualPage() {
  const { isInitialized } = useFinanceStore();
  
  // Inicializar com o mês atual
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(lastDayOfMonth.toISOString().split('T')[0]);

  // Carregar preferências salvas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app:dateFilter:manual');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.startDate) setStartDate(parsed.startDate);
          if (parsed.endDate) setEndDate(parsed.endDate);
        } catch (e) {
          console.error('Erro ao carregar preferências:', e);
        }
      }
    }
  }, []);

  // Salvar preferências quando mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app:dateFilter:manual', JSON.stringify({ startDate, endDate }));
    }
  }, [startDate, endDate]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleMonthSelect = (monthsAgo: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <PageHeader
            title="Visão Manual"
            icon="🔍"
            onFilterChange={() => {}}
            hideSearch
          />
        </div>

        {/* Seletor de Período */}
        <div className="mb-8">
          <CardUI className="shadow-md">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Selecionar Período
              </h3>
              
              {/* Seletores Rápidos */}
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2 font-semibold">
                  Seleção Rápida:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickSelect(7)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Últimos 7 dias
                  </button>
                  <button
                    onClick={() => handleQuickSelect(15)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Últimos 15 dias
                  </button>
                  <button
                    onClick={() => handleQuickSelect(30)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Últimos 30 dias
                  </button>
                  <button
                    onClick={() => handleQuickSelect(60)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Últimos 60 dias
                  </button>
                  <button
                    onClick={() => handleQuickSelect(90)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Últimos 90 dias
                  </button>
                </div>
              </div>

              {/* Seletores de Mês */}
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2 font-semibold">
                  Por Mês:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleMonthSelect(0)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Este mês
                  </button>
                  <button
                    onClick={() => handleMonthSelect(1)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Mês passado
                  </button>
                  <button
                    onClick={() => handleMonthSelect(2)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    2 meses atrás
                  </button>
                  <button
                    onClick={() => handleMonthSelect(3)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    3 meses atrás
                  </button>
                </div>
              </div>

              {/* Seletores de Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-semibold">
                    Data Inicial:
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm hover:border-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-semibold">
                    Data Final:
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm hover:border-gray-400"
                  />
                </div>
              </div>
            </div>
          </CardUI>
        </div>

        {/* Validação de datas */}
        {startDate > endDate ? (
          <CardUI className="shadow-md border-red-200 bg-red-50">
            <div className="text-center py-4 text-red-600">
              <p className="font-semibold">Data inicial não pode ser maior que data final</p>
            </div>
          </CardUI>
        ) : (
          <ManualView startDate={startDate} endDate={endDate} />
        )}
      </div>
    </div>
  );
}

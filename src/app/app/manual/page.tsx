'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PageHeader } from '@/components/finance/PageHeader';
import { ManualView } from '@/components/finance/ManualView';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { FileText, Calendar, LayoutDashboard, CalendarDays, Layers, Tag, List } from 'lucide-react';

type TabType = 'overview' | 'byDay' | 'byType' | 'byCategory' | 'chronological';

export default function ManualPage() {
  const { isInitialized } = useFinanceStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isPeriodSelectorOpen, setIsPeriodSelectorOpen] = useState(false);
  
  // Inicializar com o mês atual (usando função para evitar problemas de SSR)
  const getInitialDates = () => {
    if (typeof window === 'undefined') {
      return { start: '', end: '' };
    }
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      start: firstDayOfMonth.toISOString().split('T')[0],
      end: lastDayOfMonth.toISOString().split('T')[0],
    };
  };
  
  const [startDate, setStartDate] = useState(() => getInitialDates().start);
  const [endDate, setEndDate] = useState(() => getInitialDates().end);

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
    setIsPeriodSelectorOpen(false); // Fechar após seleção
  };

  const handleMonthSelect = (monthsAgo: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
    setIsPeriodSelectorOpen(false); // Fechar após seleção
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <PageHeader
            title="Visão Manual"
            icon={FileText}
            onFilterChange={() => {}}
            hideSearch
          />
        </div>

        {/* Botão para mostrar/ocultar seletor de período */}
        <div className="mb-6">
          <button
            onClick={() => setIsPeriodSelectorOpen(!isPeriodSelectorOpen)}
            className="w-full flex items-center justify-between p-4 glassmorphism rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400/30 to-indigo-600/30 flex items-center justify-center neomorphic">
                <Calendar size={20} strokeWidth={2.5} className="text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white">
                  Período Selecionado
                </div>
                <div className="text-xs text-white/70">
                  {startDate && endDate 
                    ? `${new Date(startDate).toLocaleDateString('pt-BR')} até ${new Date(endDate).toLocaleDateString('pt-BR')}`
                    : 'Selecione um período'
                  }
                </div>
              </div>
            </div>
            <div className={`transition-transform duration-200 ${isPeriodSelectorOpen ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Seletor de Período - Oculto por padrão */}
        {isPeriodSelectorOpen && (
          <div className="mb-8 animate-in slide-in-from-top-2 duration-300">
            <div className="glassmorphism rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 sm:px-7 py-5 text-white relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Calendar size={18} strokeWidth={2.5} className="text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                    Selecionar Período
                  </h3>
                </div>
              </div>
              <div className="p-5 sm:p-6 bg-white rounded-b-2xl">
            <div className="mb-6">
              
              {/* Seletores Rápidos */}
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2 font-semibold">
                  Seleção Rápida:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickSelect(7)}
                    className="px-4 py-2 glassmorphism text-white rounded-lg text-sm font-medium transition-all hover:bg-white/20"
                  >
                    Últimos 7 dias
                  </button>
                  <button
                    onClick={() => handleQuickSelect(15)}
                    className="px-4 py-2 glassmorphism text-white rounded-lg text-sm font-medium transition-all hover:bg-white/20"
                  >
                    Últimos 15 dias
                  </button>
                  <button
                    onClick={() => handleQuickSelect(30)}
                    className="px-4 py-2 glassmorphism text-white rounded-lg text-sm font-medium transition-all hover:bg-white/20"
                  >
                    Últimos 30 dias
                  </button>
                  <button
                    onClick={() => handleQuickSelect(60)}
                    className="px-4 py-2 glassmorphism text-white rounded-lg text-sm font-medium transition-all hover:bg-white/20"
                  >
                    Últimos 60 dias
                  </button>
                  <button
                    onClick={() => handleQuickSelect(90)}
                    className="px-4 py-2 glassmorphism text-white rounded-lg text-sm font-medium transition-all hover:bg-white/20"
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
                    className="px-4 py-2 glassmorphism text-white rounded-lg text-sm font-medium transition-all hover:bg-white/20"
                  >
                    Este mês
                  </button>
                  <button
                    onClick={() => handleMonthSelect(1)}
                    className="px-4 py-2 glassmorphism text-white rounded-lg text-sm font-medium transition-all hover:bg-white/20"
                  >
                    Mês passado
                  </button>
                  <button
                    onClick={() => handleMonthSelect(2)}
                    className="px-4 py-2 glassmorphism text-white rounded-lg text-sm font-medium transition-all hover:bg-white/20"
                  >
                    2 meses atrás
                  </button>
                  <button
                    onClick={() => handleMonthSelect(3)}
                    className="px-4 py-2 glassmorphism text-white rounded-lg text-sm font-medium transition-all hover:bg-white/20"
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
              </div>
            </div>
          </div>
        )}

        {/* Validação de datas */}
        {startDate > endDate ? (
          <PremiumContentCard
            title="Erro de Validação"
            icon={FileText}
            gradientFrom="from-red-600"
            gradientTo="to-red-700"
          >
            <div className="text-center py-4 text-white">
              <p className="font-semibold">Data inicial não pode ser maior que data final</p>
            </div>
          </PremiumContentCard>
        ) : (
          <>
            {/* Sistema de Abas */}
            <div className="mb-6">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-1.5 border border-gray-200/60 dark:border-gray-700/40 shadow-lg">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'overview' as TabType, label: 'Visão Geral', icon: LayoutDashboard },
                    { id: 'byDay' as TabType, label: 'Por Dia', icon: CalendarDays },
                    { id: 'byType' as TabType, label: 'Por Tipo', icon: Layers },
                    { id: 'byCategory' as TabType, label: 'Por Categoria', icon: Tag },
                    { id: 'chronological' as TabType, label: 'Cronológica', icon: List },
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 scale-105'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Conteúdo das Abas */}
            <ManualView startDate={startDate} endDate={endDate} activeTab={activeTab} />
          </>
        )}
      </div>
    </div>
  );
}

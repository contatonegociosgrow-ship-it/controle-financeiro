'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PageHeader } from '@/components/finance/PageHeader';
import { MonthlyView } from '@/components/finance/MonthlyView';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { BarChart3, Calendar } from 'lucide-react';

export default function MensalPage() {
  const { isInitialized } = useFinanceStore();
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => {
    if (typeof window === 'undefined') return 2024;
    return new Date().getFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return new Date().getMonth();
  });

  // Carregar preferências salvas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app:dateFilter:mensal');
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          
          // Verificar se o mês salvo é anterior ao mês atual
          // Se o mês/ano salvos são anteriores ao atual, sempre usar o mês atual
          if (parsed.year !== undefined && parsed.month !== undefined) {
            const savedMonth = parsed.month;
            const savedYear = parsed.year;
            
            // Se o mês/ano salvos são anteriores ao atual, usar o mês atual
            if (savedYear < currentYear || 
                (savedYear === currentYear && savedMonth < currentMonth)) {
              setSelectedYear(currentYear);
              setSelectedMonth(currentMonth);
            } else {
              setSelectedYear(savedYear);
              setSelectedMonth(savedMonth);
            }
          } else {
            setSelectedYear(currentYear);
            setSelectedMonth(currentMonth);
          }
        } catch (e) {
          console.error('Erro ao carregar preferências:', e);
          setSelectedYear(currentYear);
          setSelectedMonth(currentMonth);
        }
      } else {
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);
      }
    }
  }, []);

  // Salvar preferências quando mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app:dateFilter:mensal', JSON.stringify({ year: selectedYear, month: selectedMonth }));
    }
  }, [selectedYear, selectedMonth]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Gerar lista de anos (últimos 5 anos e próximos 2)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <PageHeader
            title="Visão Mensal"
            icon={BarChart3}
            onFilterChange={() => {}}
            hideSearch
          />
        </div>

        {/* Seletor de Mês/Ano - Oculto por padrão */}
        <div className="mb-6">
          <button
            onClick={() => setIsMonthSelectorOpen(!isMonthSelectorOpen)}
            className="w-full flex items-center justify-between p-4 glassmorphism rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400/30 to-blue-600/30 flex items-center justify-center neomorphic">
                <Calendar size={20} strokeWidth={2.5} className="text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white">
                  Período Selecionado
                </div>
                <div className="text-xs text-white/70">
                  {monthNames[selectedMonth]} {selectedYear}
                </div>
              </div>
            </div>
            <div className={`transition-transform duration-200 ${isMonthSelectorOpen ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>

        {isMonthSelectorOpen && (
          <div className="mb-8 animate-in slide-in-from-top-2 duration-300">
            <PremiumContentCard
              title="Selecionar Período"
              icon={Calendar}
              gradientFrom="from-blue-600"
              gradientTo="to-blue-700"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1">
                  <label className="block text-sm text-gray-700 mb-2 font-semibold">Mês:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(Number(e.target.value));
                      setIsMonthSelectorOpen(false);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm hover:border-gray-400"
                  >
                    {monthNames.map((name, index) => (
                      <option key={index} value={index}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm text-gray-700 mb-2 font-semibold">Ano:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(Number(e.target.value));
                      setIsMonthSelectorOpen(false);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm hover:border-gray-400"
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </PremiumContentCard>
          </div>
        )}

        {/* Visão Mensal */}
        <MonthlyView year={selectedYear} month={selectedMonth} />
      </div>
    </div>
  );
}

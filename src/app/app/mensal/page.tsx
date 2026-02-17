'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PageHeader } from '@/components/finance/PageHeader';
import { MonthlyView } from '@/components/finance/MonthlyView';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { BarChart3, Calendar } from 'lucide-react';

export default function MensalPage() {
  const { isInitialized } = useFinanceStore();
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
    <div className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-900">
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

        {/* Seletor de Mês/Ano */}
        <div className="mb-8">
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
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
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
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
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

        {/* Visão Mensal */}
        <MonthlyView year={selectedYear} month={selectedMonth} />
      </div>
    </div>
  );
}

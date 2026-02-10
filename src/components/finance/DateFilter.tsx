'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { formatDateToBR, formatDateToISO, applyDateMask } from '@/lib/goalUtils';

type DateFilterType = 'today' | 'week' | 'month' | 'year' | 'lastWeek' | 'custom';

type DateFilterProps = {
  pageKey: string; // Chave única para salvar no localStorage por página
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
};

const STORAGE_PREFIX = 'app:dateFilter:';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function DateFilter({ pageKey, onDateRangeChange }: DateFilterProps) {
  const storageKey = `${STORAGE_PREFIX}${pageKey}`;
  
  const [filterType, setFilterType] = useState<DateFilterType>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Estado para controlar o mês/ano quando usar filtro de mês
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const now = new Date();
    return now.getMonth();
  });
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (typeof window === 'undefined') return new Date().getFullYear();
    const now = new Date();
    return now.getFullYear();
  });

  // Carregar preferências salvas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFilterType(parsed.filterType || 'month');
          if (parsed.customStartDate) setCustomStartDate(parsed.customStartDate);
          if (parsed.customEndDate) setCustomEndDate(parsed.customEndDate);
          
          // Verificar se o mês salvo é anterior ao mês atual
          // Se o mês/ano salvos são anteriores ao atual, sempre usar o mês atual
          if (parsed.selectedMonth !== undefined && parsed.selectedYear !== undefined) {
            const savedMonth = parsed.selectedMonth;
            const savedYear = parsed.selectedYear;
            
            // Se o mês/ano salvos são anteriores ao atual, usar o mês atual
            if (savedYear < currentYear || 
                (savedYear === currentYear && savedMonth < currentMonth)) {
              setSelectedMonth(currentMonth);
              setSelectedYear(currentYear);
            } else {
              setSelectedMonth(savedMonth);
              setSelectedYear(savedYear);
            }
          } else {
            setSelectedMonth(currentMonth);
            setSelectedYear(currentYear);
          }
        } catch (e) {
          console.error('Erro ao carregar filtro de data:', e);
          setSelectedMonth(currentMonth);
          setSelectedYear(currentYear);
        }
      } else {
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
      }
    }
  }, [storageKey]);

  // Salvar preferências quando mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const toSave = {
        filterType,
        customStartDate,
        customEndDate,
        selectedMonth,
        selectedYear,
      };
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    }
  }, [filterType, customStartDate, customEndDate, selectedMonth, selectedYear, storageKey]);

  // Calcular e aplicar filtro quando mudar
  useEffect(() => {
    const today = new Date();
    let startDate: string | null = null;
    let endDate: string | null = null;

    switch (filterType) {
      case 'today':
        const todayStr = today.toISOString().split('T')[0];
        startDate = todayStr;
        endDate = todayStr;
        break;
      
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Domingo
        startDate = weekStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      
      case 'month':
        // Usar o mês/ano selecionado ao invés do mês atual
        const monthStart = new Date(selectedYear, selectedMonth, 1);
        const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = monthEnd.toISOString().split('T')[0];
        break;
      
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31);
        startDate = yearStart.toISOString().split('T')[0];
        endDate = yearEnd.toISOString().split('T')[0];
        break;
      
      case 'lastWeek':
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1); // Sábado da semana passada
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6); // Domingo da semana passada
        startDate = lastWeekStart.toISOString().split('T')[0];
        endDate = lastWeekEnd.toISOString().split('T')[0];
        break;
      
      case 'custom':
        if (customStartDate && customEndDate) {
          const isoStart = formatDateToISO(customStartDate);
          const isoEnd = formatDateToISO(customEndDate);
          if (isoStart && isoEnd) {
            startDate = isoStart;
            endDate = isoEnd;
          }
        }
        break;
      
      default:
        // Se nenhum filtro válido, usar mês atual como padrão
        const defaultMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const defaultMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        startDate = defaultMonthStart.toISOString().split('T')[0];
        endDate = defaultMonthEnd.toISOString().split('T')[0];
        break;
    }

    onDateRangeChange(startDate, endDate);
  }, [filterType, customStartDate, customEndDate, selectedMonth, selectedYear, onDateRangeChange]);

  // Função para navegar entre meses
  const handleMonthChange = (direction: 'prev' | 'next' | 'current') => {
    if (direction === 'current') {
      const now = new Date();
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear());
      setFilterType('month');
      return;
    }
    
    let newMonth = selectedMonth;
    let newYear = selectedYear;
    
    if (direction === 'prev') {
      newMonth--;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      }
    } else if (direction === 'next') {
      newMonth++;
      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    setFilterType('month');
  };

  const isCurrentMonth = selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <label className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">
          Filtrar por Período
        </label>
      </div>
      
      {/* Botões de Período */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFilterType('today')}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            filterType === 'today'
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Hoje
        </button>
        <button
          type="button"
          onClick={() => setFilterType('week')}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            filterType === 'week'
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Esta Semana
        </button>
        <button
          type="button"
          onClick={() => setFilterType('lastWeek')}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            filterType === 'lastWeek'
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Semana Passada
        </button>
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            setSelectedMonth(now.getMonth());
            setSelectedYear(now.getFullYear());
            setFilterType('month');
          }}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            filterType === 'month'
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Este Mês
        </button>
        <button
          type="button"
          onClick={() => setFilterType('year')}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            filterType === 'year'
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Este Ano
        </button>
        <button
          type="button"
          onClick={() => setFilterType('custom')}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            filterType === 'custom'
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Personalizado
        </button>
      </div>

      {/* Navegação de Mês - quando o filtro for "month" */}
      {filterType === 'month' && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-md p-3">
            <button
              type="button"
              onClick={() => handleMonthChange('prev')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              aria-label="Mês anterior"
              title="Mês anterior"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-2.5 text-center">
              <svg 
                className="w-6 h-6 text-blue-600 dark:text-blue-400" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M4 11h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 2v3M16 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {monthNames[selectedMonth]} {selectedYear}
                </div>
                {!isCurrentMonth && (
                  <button
                    type="button"
                    onClick={() => handleMonthChange('current')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-0.5"
                  >
                    Mês atual
                  </button>
                )}
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => handleMonthChange('next')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              aria-label="Próximo mês"
              title="Próximo mês"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {filterType === 'custom' && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1 font-medium">
                Inicial
              </label>
              <input
                type="text"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(applyDateMask(e.target.value))}
                onBlur={(e) => {
                  const isoDate = formatDateToISO(e.target.value);
                  if (isoDate) {
                    setCustomStartDate(formatDateToBR(isoDate));
                  }
                }}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1.5 text-gray-900 dark:text-gray-200 text-xs focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 transition-all"
                placeholder="DD/MM/AAAA"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1 font-medium">
                Final
              </label>
              <input
                type="text"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(applyDateMask(e.target.value))}
                onBlur={(e) => {
                  const isoDate = formatDateToISO(e.target.value);
                  if (isoDate) {
                    setCustomEndDate(formatDateToBR(isoDate));
                  }
                }}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1.5 text-gray-900 dark:text-gray-200 text-xs focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 transition-all"
                placeholder="DD/MM/AAAA"
                maxLength={10}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

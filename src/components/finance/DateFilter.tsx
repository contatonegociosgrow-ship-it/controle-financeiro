'use client';

import { useState, useEffect } from 'react';
import { formatDateToBR, formatDateToISO, applyDateMask } from '@/lib/goalUtils';

type DateFilterType = 'today' | 'week' | 'month' | 'year' | 'lastWeek' | 'lastMonth' | 'custom';

type DateFilterProps = {
  pageKey: string; // Chave única para salvar no localStorage por página
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
};

const STORAGE_PREFIX = 'app:dateFilter:';

export function DateFilter({ pageKey, onDateRangeChange }: DateFilterProps) {
  const storageKey = `${STORAGE_PREFIX}${pageKey}`;
  
  const [filterType, setFilterType] = useState<DateFilterType>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Carregar preferências salvas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFilterType(parsed.filterType || 'month');
          if (parsed.customStartDate) setCustomStartDate(parsed.customStartDate);
          if (parsed.customEndDate) setCustomEndDate(parsed.customEndDate);
        } catch (e) {
          console.error('Erro ao carregar filtro de data:', e);
        }
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
      };
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    }
  }, [filterType, customStartDate, customEndDate, storageKey]);

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
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
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
      
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        startDate = lastMonth.toISOString().split('T')[0];
        endDate = lastMonthEnd.toISOString().split('T')[0];
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
  }, [filterType, customStartDate, customEndDate, onDateRangeChange]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="mb-3">
        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">
          Filtrar por Período
        </label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setFilterType('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'today'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setFilterType('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'week'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Esta Semana
          </button>
          <button
            type="button"
            onClick={() => setFilterType('lastWeek')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'lastWeek'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Semana Passada
          </button>
          <button
            type="button"
            onClick={() => setFilterType('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'month'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Este Mês
          </button>
          <button
            type="button"
            onClick={() => setFilterType('lastMonth')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'lastMonth'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Mês Passado
          </button>
          <button
            type="button"
            onClick={() => setFilterType('year')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'year'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Este Ano
          </button>
          <button
            type="button"
            onClick={() => setFilterType('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'custom'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Personalizado
          </button>
        </div>
      </div>

      {filterType === 'custom' && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
              Data Inicial
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
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="DD/MM/AAAA"
              maxLength={10}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
              Data Final
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
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="DD/MM/AAAA"
              maxLength={10}
            />
          </div>
        </div>
      )}
    </div>
  );
}

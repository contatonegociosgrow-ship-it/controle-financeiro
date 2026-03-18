'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { PageHeader } from '@/components/finance/PageHeader';
import { TransactionList } from '@/components/finance/TransactionList';
import { AddTransactionSheet } from '@/components/finance/AddTransactionSheet';
import { DateFilter } from '@/components/finance/DateFilter';
import { Wallet, List, Filter, Mic, Plus } from 'lucide-react';

export default function GanhosPage() {
  const { isInitialized } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const { state } = useFinanceStore();
  const [filter, setFilter] = useState('');
  const [personId, setPersonId] = useState<string | null>(null);
  const [dateStart, setDateStart] = useState<string | null>(null);
  const [dateEnd, setDateEnd] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <PageHeader
          title="Ganhos"
          icon={Wallet}
          headerAccent="green"
          walletPlacement="below"
          walletVariant="income"
          onFilterChange={setFilter}
        />

        {/* Botão para mostrar/ocultar filtros */}
        <div className="mb-6">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full flex items-center justify-between p-4 glassmorphism rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400/30 to-green-600/30 flex items-center justify-center neomorphic">
                <Filter size={20} strokeWidth={2.5} className="text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white">
                  Filtros
                </div>
                <div className="text-xs text-white/70">
                  {personId || dateStart || dateEnd 
                    ? `${personId ? 'Pessoa' : ''}${personId && (dateStart || dateEnd) ? ', ' : ''}${dateStart || dateEnd ? 'Período' : ''}`
                    : 'Nenhum filtro aplicado'
                  }
                </div>
              </div>
            </div>
            <div className={`transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Seção de Filtros - Oculto por padrão */}
        {isFiltersOpen && (
          <div className="mb-6 glassmorphism rounded-2xl p-5 sm:p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Filtro por Pessoa */}
              <div className="glassmorphism rounded-xl p-5">
                <label className="block text-sm font-semibold text-white mb-3">
                  Quem corresponde
                </label>
                <select
                  value={personId || ''}
                  onChange={(e) => setPersonId(e.target.value || null)}
                  className="w-full px-4 py-3 glassmorphism rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                >
                <option value="">Todas as pessoas</option>
                {state.people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Data */}
            <div>
              <DateFilter
                pageKey="ganhos"
                onDateRangeChange={(start, end) => {
                  setDateStart(start);
                  setDateEnd(end);
                }}
              />
            </div>
          </div>
          </div>
        )}

        <TransactionList
          type="income"
          filter={filter}
          personId={personId}
          startDate={dateStart}
          endDate={dateEnd}
          columns={5}
          onEdit={(id) => {
            setEditingId(id);
            setVoiceMode(false);
            setIsSheetOpen(true);
          }}
        />
      </div>

      {/* Botões flutuantes */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-3 z-40">
        {/* Botão Microfone */}
        <button
          onClick={() => {
            setVoiceMode(true);
            setIsSheetOpen(true);
          }}
          className="fab-blue w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white"
          aria-label="Falar e registrar"
          title="Falar e registrar transação"
        >
          <Mic size={22} strokeWidth={2.5} className="text-white" />
        </button>
        
        {/* Botão Adicionar */}
        <button
          onClick={() => {
            setEditingId(null);
            setVoiceMode(false);
            setIsSheetOpen(true);
          }}
          className="fab-blue w-16 h-16 rounded-full flex items-center justify-center text-3xl font-light text-white"
          aria-label="Adicionar transação"
          title="Adicionar transação manualmente"
        >
          <Plus size={26} strokeWidth={2.5} className="text-white" />
        </button>
      </div>

      <AddTransactionSheet 
        isOpen={isSheetOpen} 
        onClose={() => {
          setIsSheetOpen(false);
          setEditingId(null);
          setVoiceMode(false);
        }}
        defaultType="income"
        startWithVoice={voiceMode}
        editingId={editingId}
      />
    </div>
  );
}

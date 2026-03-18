'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  HeartPulse,
  Wallet,
  Receipt,
  ShoppingCart,
  Link as LinkIcon,
  PiggyBank,
  CreditCard,
  BarChart3,
  FileText,
  User,
  TrendingUp,
  Target,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from '@/components/Logo';

type TabType = 'gerais' | 'ganhos' | 'fixas' | 'variaveis' | 'dividas' | 'economias' | 'cartoes' | 'mensal' | 'manual' | 'perfil' | 'saude-financeira' | 'investimentos' | 'cofre';

type TabIcon = typeof LayoutDashboard;

const tabs: { id: TabType; label: string; path: string; Icon: TabIcon }[] = [
  { id: 'gerais', label: 'Gerais', path: '/app/gerais', Icon: LayoutDashboard },
  { id: 'saude-financeira', label: 'Saúde', path: '/app/saude-financeira', Icon: HeartPulse },
  { id: 'ganhos', label: 'Ganhos', path: '/app/ganhos', Icon: Wallet },
  { id: 'fixas', label: 'Fixas', path: '/app/fixas', Icon: Receipt },
  { id: 'variaveis', label: 'Variáveis', path: '/app/variaveis', Icon: ShoppingCart },
  { id: 'dividas', label: 'Dívidas', path: '/app/dividas', Icon: LinkIcon },
  { id: 'economias', label: 'Metas', path: '/app/economias', Icon: Target },
  { id: 'investimentos', label: 'Investimentos', path: '/app/investimentos', Icon: TrendingUp },
  { id: 'cofre', label: 'Cofre', path: '/app/cofre', Icon: PiggyBank },
  { id: 'cartoes', label: 'Cartões', path: '/app/cartoes', Icon: CreditCard },
  { id: 'mensal', label: 'Mensal', path: '/app/mensal', Icon: BarChart3 },
  { id: 'manual', label: 'Manual', path: '/app/manual', Icon: FileText },
  { id: 'perfil', label: 'Perfil', path: '/app/perfil', Icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fechar menu ao clicar fora ou ao navegar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  const isActive = (tab: typeof tabs[0]) => {
    return pathname === tab.path || 
      (pathname === '/app' && tab.id === 'gerais') ||
      (pathname?.startsWith('/app/cartoes') && tab.id === 'cartoes') ||
      (pathname?.startsWith('/app/saude-financeira') && tab.id === 'saude-financeira') ||
      (pathname?.startsWith('/app/investimentos') && tab.id === 'investimentos') ||
      (pathname?.startsWith('/app/cofre') && tab.id === 'cofre');
  };

  return (
    <>
      {/* Sidebar Desktop - oculta em mobile */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-24 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-800/50 shadow-xl z-30 flex-col items-center py-4 overflow-hidden">
        {/* Logo - Destaque no topo */}
        <div className="w-full flex justify-center py-4 border-b border-gray-200/50 dark:border-gray-800/50 mb-4">
          <Link 
            href="/app" 
            className="flex items-center justify-center group/logo transition-transform hover:scale-105 active:scale-95"
          >
            <div className="relative">
              <Logo
                width={64}
                height={64}
                className="rounded-xl relative z-10 shadow-md transition-all"
                priority
              />
            </div>
          </Link>
        </div>
        
        <div className="flex flex-col gap-0.5 w-full flex-1 justify-start pt-2 overflow-hidden">
          {tabs.map((tab) => {
            const active = isActive(tab);
            return (
              <Link
                key={tab.id}
                href={tab.path}
                className={`w-full flex flex-col items-center justify-center py-2 px-2 transition-all duration-200 relative group rounded-lg mx-1 ${
                  active
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/20 scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 hover:scale-[1.02]'
                }`}
                title={tab.label}
              >
                {/* Indicador ativo - Barra lateral */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-r-full shadow-lg shadow-primary/50" />
                )}
                
                {/* Ícone */}
                <tab.Icon 
                  size={22}
                  strokeWidth={active ? 2.5 : 2}
                  className={`mb-1.5 transition-all duration-200 ${
                    active 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 group-hover:scale-110'
                  }`}
                />
                
                {/* Label */}
                <span className={`text-[10px] font-semibold text-center leading-tight transition-all duration-200 ${
                  active 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                }`}>
                  {tab.label}
                </span>
                
                {/* Tooltip no hover (desktop) */}
                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-700/50">
                  {tab.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900/95 dark:border-r-gray-800/95" />
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Toggle de Tema */}
        <div className="mt-auto pt-3 pb-3 border-t border-gray-200/50 dark:border-gray-800/50 w-full flex justify-center">
          <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Botão Mobile - apenas em mobile */}
      <div className="md:hidden fixed top-3 left-3 z-40 mobile-menu-container">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
          className="p-3.5 rounded-2xl bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Menu"
        >
          <svg
            className={`w-6 h-6 text-gray-700 dark:text-gray-200 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Menu Dropdown Mobile */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 mt-3 w-80 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800/50 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300">
            {/* Logo no Mobile - Destaque */}
            <div className="px-6 py-5 border-b border-gray-200/60 dark:border-gray-800/50 bg-gradient-to-b from-gray-50/50 dark:from-gray-900/30 to-transparent flex items-center gap-4">
              <div className="relative">
                <Logo
                  width={56}
                  height={56}
                  className="rounded-xl relative z-10 shadow-lg"
                />
              </div>
              <div className="flex-1">
                <span className="font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent text-xl block">Meu Salário</span>
                <span className="font-semibold text-gray-600 dark:text-gray-400 text-sm block">em dia</span>
              </div>
            </div>
            
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {tabs.map((tab) => {
                const active = isActive(tab);
                return (
                  <Link
                    key={tab.id}
                    href={tab.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 relative group ${
                      active
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/20'
                        : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {/* Indicador ativo mobile */}
                    {active && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white rounded-r-full shadow-lg" />
                    )}
                    
                    <div className={`p-2 rounded-xl transition-all ${
                      active
                        ? 'bg-white/20'
                        : 'bg-gray-100 dark:bg-gray-800/50 group-hover:bg-gray-200 dark:group-hover:bg-gray-700/50'
                    }`}>
                      <tab.Icon 
                        size={22}
                        strokeWidth={active ? 2.5 : 2}
                        className={`transition-all ${
                          active
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                        }`}
                      />
                    </div>
                    <span className={`font-semibold flex-1 text-base ${
                      active
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                    }`}>
                      {tab.label}
                    </span>
                    {active && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md" />
                    )}
                  </Link>
                );
              })}
              
              {/* Separador */}
              <div className="border-t border-gray-200/60 dark:border-gray-800/50 my-2" />
              
              {/* Toggle de Tema no Mobile */}
              <div className="px-6 py-5 bg-gradient-to-t from-gray-50/50 dark:from-gray-900/30 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tema
                    </span>
                  </div>
                  <div className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all duration-200">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

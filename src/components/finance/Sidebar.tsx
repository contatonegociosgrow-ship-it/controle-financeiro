'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
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
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

type TabType = 'gerais' | 'ganhos' | 'fixas' | 'variaveis' | 'dividas' | 'economias' | 'cartoes' | 'mensal' | 'manual' | 'perfil' | 'saude-financeira';

type TabIcon = typeof LayoutDashboard;

const tabs: { id: TabType; label: string; path: string; Icon: TabIcon }[] = [
  { id: 'gerais', label: 'Gerais', path: '/app/gerais', Icon: LayoutDashboard },
  { id: 'saude-financeira', label: 'Saúde', path: '/app/saude-financeira', Icon: HeartPulse },
  { id: 'ganhos', label: 'Ganhos', path: '/app/ganhos', Icon: Wallet },
  { id: 'fixas', label: 'Fixas', path: '/app/fixas', Icon: Receipt },
  { id: 'variaveis', label: 'Variáveis', path: '/app/variaveis', Icon: ShoppingCart },
  { id: 'dividas', label: 'Dívidas', path: '/app/dividas', Icon: LinkIcon },
  { id: 'economias', label: 'Economias', path: '/app/economias', Icon: PiggyBank },
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
      (pathname?.startsWith('/app/saude-financeira') && tab.id === 'saude-financeira');
  };

  return (
    <>
      {/* Sidebar Desktop - oculta em mobile */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-[#0F172A] border-r border-gray-800 shadow-xl z-30 flex-col items-center py-2 overflow-hidden">
        {/* Logo */}
        <div className="w-full flex justify-center py-3 border-b border-gray-800 mb-2">
          <Link href="/app" className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Meu Salário em dia"
              width={80}
              height={80}
              className="rounded-lg"
              priority
            />
          </Link>
        </div>
        
        <div className="flex flex-col gap-0.5 w-full flex-1 justify-center">
          {tabs.map((tab) => {
            const active = isActive(tab);
            return (
              <Link
                key={tab.id}
                href={tab.path}
                className={`w-full flex flex-col items-center justify-center py-2 px-2 transition-all relative group ${
                  active
                    ? 'bg-[#22C55E] text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
                title={tab.label}
              >
                {/* Indicador ativo */}
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#22C55E] rounded-r-full shadow-lg" />
                )}
                
                {/* Ícone */}
                <tab.Icon 
                  size={21}
                  strokeWidth={2}
                  className={`mb-0.5 transition-colors ${
                    active 
                      ? 'text-white' 
                      : 'text-gray-400 group-hover:text-gray-200'
                  }`}
                />
                
                {/* Label */}
                <span className={`text-[9px] font-semibold text-center leading-tight transition-colors ${
                  active 
                    ? 'text-white' 
                    : 'text-gray-400'
                }`}>
                  {tab.label}
                </span>
                
                {/* Tooltip no hover (desktop) */}
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {tab.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Toggle de Tema */}
        <div className="mt-auto pt-2 pb-2 border-t border-gray-800 w-full flex justify-center">
          <ThemeToggle />
        </div>
      </aside>

      {/* Botão Mobile - apenas em mobile */}
      <div className="md:hidden fixed top-2 left-2 z-40 mobile-menu-container">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
          className="p-2 rounded-lg bg-[#0F172A] border border-gray-800 shadow-lg hover:bg-gray-800 transition-colors"
          aria-label="Menu"
        >
          <svg
            className="w-6 h-6 text-gray-200"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
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
          <div className="absolute top-full left-0 mt-2 w-64 bg-[#0F172A] border border-gray-800 rounded-lg shadow-xl overflow-hidden z-50">
            {/* Logo no Mobile */}
            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Meu Salário em dia"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="font-semibold text-gray-200">Meu Salário em dia</span>
            </div>
            
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
              {tabs.map((tab) => {
                const active = isActive(tab);
                return (
                  <Link
                    key={tab.id}
                    href={tab.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      active
                        ? 'bg-[#22C55E]'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    <tab.Icon 
                      size={20}
                      strokeWidth={2}
                      className={
                        active
                          ? 'text-white'
                          : 'text-gray-400'
                      }
                    />
                    <span className={`font-medium ${
                      active
                        ? 'text-white'
                        : 'text-gray-400'
                    }`}>
                      {tab.label}
                    </span>
                    {active && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-white" />
                    )}
                  </Link>
                );
              })}
              
              {/* Separador */}
              <div className="border-t border-gray-800 my-1" />
              
              {/* Toggle de Tema no Mobile */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">
                    Tema
                  </span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

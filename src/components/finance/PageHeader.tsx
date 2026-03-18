'use client';

import { LucideIcon } from 'lucide-react';
import { WalletCard } from './WalletCard';

type PageHeaderProps = {
  title: string;
  icon: LucideIcon;
  headerAccent?: 'green' | 'red' | 'orange' | 'blue' | 'purple';
  showFilter?: boolean;
  hideSearch?: boolean;
  hideWallet?: boolean;
  walletPlacement?: 'header' | 'below';
  walletVariant?: 'income' | 'expense';
  onFilterChange?: (filter: string) => void;
};

export function PageHeader({
  title,
  icon: Icon,
  headerAccent = 'blue',
  showFilter = true,
  hideSearch = false,
  hideWallet = false,
  walletPlacement = 'header',
  walletVariant = 'income',
  onFilterChange,
}: PageHeaderProps) {
  const accentGradient = (() => {
    switch (headerAccent) {
      case 'green':
        return { from: 'from-[#80c040]', to: 'to-[#90d040]' }; // Cores da logo
      case 'red':
        return { from: 'from-red-700', to: 'to-red-500' };
      case 'orange':
        return { from: 'from-orange-700', to: 'to-orange-500' };
      case 'purple':
        return { from: 'from-purple-700', to: 'to-purple-500' };
      case 'blue':
      default:
        return { from: 'from-[#80c040]', to: 'to-[#90d040]' }; // Verde da logo como padrão
    }
  })();

  return (
    <div className="mb-6 sm:mb-8">
      <div
        className={[
          'relative overflow-hidden rounded-3xl shadow-xl border border-white/10',
          'bg-gradient-to-br',
          accentGradient.from,
          accentGradient.to,
        ].join(' ')}
      >
        {/* glossy overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-5 sm:p-6">
          {/* Desktop Layout */}
          <div className="hidden sm:flex flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 min-w-0">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg shrink-0">
                <Icon size={32} strokeWidth={2} className="text-white" />
              </div>

              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight truncate">
                  {title}
                </h1>
                <p className="text-sm text-white/70 mt-1.5 font-medium">
                  {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {walletPlacement === 'header' && !hideWallet && <WalletCard variant={walletVariant} />}
          </div>

          {/* Wallet below - desktop */}
          {walletPlacement === 'below' && !hideWallet && (
            <div className="hidden sm:block mt-5">
              <WalletCard variant={walletVariant} />
            </div>
          )}

          {/* Mobile Layout */}
          <div className="sm:hidden">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg shrink-0">
                <Icon size={28} strokeWidth={2} className="text-white" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-white tracking-tight truncate">
                  {title}
                </h1>
                <p className="text-xs text-white/70 mt-1 font-medium">
                  {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>

            {(!hideWallet && (walletPlacement === 'below' || walletPlacement === 'header')) && (
              <div className="mt-4">
                <WalletCard variant={walletVariant} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

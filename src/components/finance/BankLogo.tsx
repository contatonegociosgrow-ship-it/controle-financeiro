'use client';

import { useState } from 'react';
import { getBankInfo } from '@/lib/bankColors';

type BankLogoProps = {
  bankName: string;
  size?: number;
  className?: string;
};

/**
 * Componente para renderizar o logo do banco usando SVGs do repositório
 * https://github.com/Tgentil/Bancos-em-SVG
 */
export function BankLogo({ bankName, size = 48, className = '' }: BankLogoProps) {
  const bankInfo = getBankInfo(bankName);
  const logoPath = bankInfo.logoPath;
  const [imageError, setImageError] = useState(false);

  // Se tiver logoPath e não houve erro, tenta renderizar o SVG
  if (logoPath && !imageError) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl shadow-sm overflow-hidden ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: `${bankInfo.color}15`,
          padding: '4px',
        }}
      >
        <img
          src={logoPath}
          alt={`Logo ${bankInfo.name}`}
          width={size - 8}
          height={size - 8}
          className="object-contain"
          onError={() => setImageError(true)}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        />
      </div>
    );
  }

  // Fallback para emoji se não tiver SVG ou se houver erro ao carregar
  return (
    <div
      className={`flex items-center justify-center rounded-xl text-2xl shadow-sm ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: `${bankInfo.color}20`,
      }}
      title={bankInfo.name}
    >
      {bankInfo.icon}
    </div>
  );
}

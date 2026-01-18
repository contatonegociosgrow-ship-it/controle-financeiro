import React from 'react';

type CardUIProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardUI({ children, className = '' }: CardUIProps) {
  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200/60 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

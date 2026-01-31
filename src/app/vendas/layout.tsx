import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meu Salário em Dia - Organize suas finanças em minutos',
  description: 'Controle seu salário, organize gastos e faça seu dinheiro render até o fim do mês. Acesso imediato por apenas R$ 37,90. Sem mensalidade.',
  openGraph: {
    title: 'Meu Salário em Dia - Organize suas finanças',
    description: 'Controle seu salário, organize gastos e faça seu dinheiro render até o fim do mês.',
    type: 'website',
  },
  keywords: ['controle financeiro', 'organizar salário', 'finanças pessoais', 'app financeiro', 'gestão de dinheiro'],
};

export default function VendasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

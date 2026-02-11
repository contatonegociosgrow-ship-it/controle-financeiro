import type { Metadata } from 'next';
import Script from 'next/script';

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
  return (
    <>
      <Script id="utmfy-tiktok-pixel" strategy="afterInteractive">
        {`
          window.tikTokPixelId = "697ff98168ff9aa3b26477ce";
          var a = document.createElement("script");
          a.setAttribute("async", "");
          a.setAttribute("defer", "");
          a.setAttribute("src", "https://cdn.utmfy.com.br/scripts/pixel/pixel-tiktok.js");
          document.head.appendChild(a);
        `}
      </Script>
      {children}
    </>
  );
}

'use client';

import { useState } from 'react';
import { Logo } from '@/components/Logo';

export default function VendasPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCta = () => {
    window.location.href = 'https://lastlink.com/p/C6BE6D172/checkout-payment/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 relative">
      {/* Header com Logo */}
      <header className="px-4 bg-gray-900 py-3">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <Logo
            useImgTag
            alt="Meu Salário em Dia"
            imgClassName="h-24 sm:h-28 md:h-36 lg:h-44 w-auto"
            width={176}
            height={176}
          />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Texto à esquerda */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Seu salário acaba antes do fim do mês?
              <br />
              <span className="text-blue-600">Organize tudo em minutos</span>
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-blue-500 font-extrabold tracking-tight">
                — até falando.
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
              Com o <strong>Meu Salário em Dia</strong>, você vê para onde seu dinheiro vai,
              controla gastos, organiza dívidas e faz seu salário render até o fim do mês.
            </p>

            <div className="flex flex-col items-center lg:items-start">
              <button
                onClick={handleCta}
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg sm:text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 mb-4"
              >
                Quero meu salário em dia
              </button>

              <p className="text-sm sm:text-base text-gray-500 font-medium">
                ✓ Acesso imediato • ✓ Sem mensalidade • ✓ Funciona no celular
              </p>
            </div>
          </div>

          {/* Imagem à direita */}
          <div className="flex justify-center lg:justify-center order-first lg:order-last">
            <div className="relative">
              <img 
                src="/inicio.webp" 
                alt="Organize suas finanças falando" 
                className="w-full max-w-lg xl:max-w-xl h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bloco da Dor */}
      <section className="px-4 py-8 sm:py-12 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="space-y-2">
            <p className="text-xl sm:text-2xl font-semibold text-gray-300">O salário cai.</p>
            <p className="text-xl sm:text-2xl font-semibold text-gray-300">As contas continuam.</p>
            <p className="text-xl sm:text-2xl font-semibold text-red-500">E o dinheiro some.</p>
          </div>

          <div className="h-px w-24 mx-auto bg-gray-700"></div>

          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-semibold text-gray-300">
              O problema não é falta de dinheiro.
            </p>
            <p className="text-xl sm:text-2xl font-semibold text-red-500">
              É falta de clareza.
            </p>
          </div>
        </div>
      </section>

      {/* Bloco do Ciclo Vicioso */}
      <section className="px-4 py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Texto */}
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  Você está vivendo{' '}
                  <span className="text-blue-600">um ciclo vicioso</span>{' '}
                  e talvez não tenha nem reparado.
                </h2>
                
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                  Você recebe o salário, paga as contas, quita o cartão, e antes do fim do mês já{' '}
                  <strong className="font-bold text-gray-900">está no cheque especial</strong>. 
                  E esse ciclo continua, mês após mês...
                </p>

                <button
                  onClick={handleCta}
                  className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Já chega, né?
                </button>
              </div>

              {/* Imagem */}
              <div>
                <img 
                  src="/ciclo.png" 
                  alt="Ciclo vicioso financeiro" 
                  className="w-full h-auto rounded-xl shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apresentação da Solução */}
      <section className="px-4 py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
            O que é o Meu Salário em Dia?
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-700 mb-12 leading-relaxed">
            É um aplicativo prático que mostra claramente
            para onde seu salário está indo
            e te ajuda a retomar o controle financeiro.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col items-center text-center">
              <svg className="w-16 h-16 mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-xl font-bold text-gray-900">Sem planilhas</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col items-center text-center">
              <svg className="w-16 h-16 mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-xl font-bold text-gray-900">Sem complicação</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col items-center text-center">
              <svg className="w-16 h-16 mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-xl font-bold text-gray-900">Sem termos difíceis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Diferencial - Falar e Registrar */}
      <section className="px-4 py-20 sm:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-12 text-center">
            Você pode simplesmente falar o que gastou
          </h2>

          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-blue-100">
            {/* Simulação de conversa */}
            <div className="mb-10">
              <div className="flex items-start space-x-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="flex-1 bg-gray-50 rounded-2xl p-6 border-l-4 border-blue-500">
                  <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">
                    "Hoje eu gastei 50 reais com Uber, 100 no supermercado e 100 no cinema"
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-base sm:text-lg text-gray-700 mb-6 font-medium">
                    O app entende, organiza e prepara tudo automaticamente:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-5 rounded-xl text-center border border-blue-100 flex flex-col items-center">
                      <svg className="w-10 h-10 mb-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-bold text-gray-900 mb-2 text-lg">Valor</p>
                      <p className="text-sm text-gray-600">Identificado automaticamente</p>
                    </div>
                    <div className="bg-blue-50 p-5 rounded-xl text-center border border-blue-100 flex flex-col items-center">
                      <svg className="w-10 h-10 mb-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <p className="font-bold text-gray-900 mb-2 text-lg">Categoria</p>
                      <p className="text-sm text-gray-600">Organizado por tipo</p>
                    </div>
                    <div className="bg-blue-50 p-5 rounded-xl text-center border border-blue-100 flex flex-col items-center">
                      <svg className="w-10 h-10 mb-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="font-bold text-gray-900 mb-2 text-lg">Data</p>
                      <p className="text-sm text-gray-600">Registrado no momento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Destaque de segurança */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center flex items-center justify-center gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-base sm:text-lg text-gray-800 font-semibold">
                Nada é salvo sem sua confirmação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades Principais */}
      <section className="px-4 py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-12 text-center">
            Funcionalidades Principais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all">
              <div className="text-5xl mb-5">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Controle do salário</h3>
              <p className="text-gray-600 leading-relaxed">Veja quanto entra, quanto sai e quanto sobra no mês.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all">
              <div className="text-5xl mb-5">💸</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Organização de gastos</h3>
              <p className="text-gray-600 leading-relaxed">Categorize seus gastos e veja para onde vai cada centavo.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all">
              <div className="text-5xl mb-5">💳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cartão de crédito e parcelas</h3>
              <p className="text-gray-600 leading-relaxed">Controle faturas, parcelas e vencimentos sem complicação.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all">
              <div className="text-5xl mb-5">🔐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cofre</h3>
              <p className="text-gray-600 leading-relaxed">Separe dinheiro para objetivos específicos sem misturar.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all">
              <div className="text-5xl mb-5">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Investimentos</h3>
              <p className="text-gray-600 leading-relaxed">Acompanhe seus investimentos junto com suas finanças.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios Emocionais */}
      <section className="px-4 py-16 sm:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-12 text-center">
            O que você ganha com isso
          </h2>

          <div className="space-y-5">
            <div className="flex items-start bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
              <span className="text-green-600 text-3xl mr-5 font-bold">✓</span>
              <p className="text-lg sm:text-xl text-gray-800 font-medium">Menos ansiedade no fim do mês</p>
            </div>

            <div className="flex items-start bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
              <span className="text-green-600 text-3xl mr-5 font-bold">✓</span>
              <p className="text-lg sm:text-xl text-gray-800 font-medium">Clareza total sobre seu dinheiro</p>
            </div>

            <div className="flex items-start bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
              <span className="text-green-600 text-3xl mr-5 font-bold">✓</span>
              <p className="text-lg sm:text-xl text-gray-800 font-medium">Decisões melhores no dia a dia</p>
            </div>

            <div className="flex items-start bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
              <span className="text-green-600 text-3xl mr-5 font-bold">✓</span>
              <p className="text-lg sm:text-xl text-gray-800 font-medium">Controle sem esforço</p>
            </div>

            <div className="flex items-start bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
              <span className="text-green-600 text-3xl mr-5 font-bold">✓</span>
              <p className="text-lg sm:text-xl text-gray-800 font-medium">Hábito simples de manter</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bloco Emocional Antes do Preço */}
      <section className="px-4 py-20 sm:py-24 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-12 text-gray-100">
            A maioria das pessoas só percebe tarde demais
          </h2>
          
          <div className="space-y-6 mb-12">
            <p className="text-xl sm:text-2xl text-gray-300 font-medium">
              O salário acaba.
            </p>
            <p className="text-xl sm:text-2xl text-gray-300 font-medium">
              O mês continua.
            </p>
            <p className="text-xl sm:text-2xl text-red-300 font-semibold">
              E a ansiedade vira rotina.
            </p>
          </div>

          <div className="pt-8 border-t border-gray-700">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
              Com clareza, você decide.
              <br />
              <span className="text-blue-400">Sem clareza, o salário decide por você.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Oferta */}
      <section className="px-4 py-20 sm:py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8">
            Tudo isso{' '}
            <span className="line-through text-red-300 opacity-80 mr-3">R$ 97,90</span>
            por apenas <span className="text-white">R$ 37,90</span>
          </h2>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 sm:p-10 mb-10 border border-white/20">
            <ul className="space-y-4 text-lg sm:text-xl mb-2">
              <li className="flex items-center justify-center">
                <span className="mr-4 text-2xl">✓</span>
                <span className="font-semibold">Pagamento único</span>
              </li>
              <li className="flex items-center justify-center">
                <span className="mr-4 text-2xl">✓</span>
                <span className="font-semibold">Sem mensalidade</span>
              </li>
              <li className="flex items-center justify-center">
                <span className="mr-4 text-2xl">✓</span>
                <span className="font-semibold">Sem cobrança escondida</span>
              </li>
              <li className="flex items-center justify-center">
                <span className="mr-4 text-2xl">✓</span>
                <span className="font-semibold">Acesso imediato</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleCta}
            className="w-full sm:w-auto px-12 py-6 bg-white text-blue-600 font-bold text-xl sm:text-2xl rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105 mb-6"
          >
            Quero meu salário em dia agora
          </button>

          <p className="text-blue-100 text-lg sm:text-xl font-medium">
            Menos que uma pizza. Pode mudar seu mês inteiro.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-12 text-center">
            Perguntas Frequentes
          </h2>

          <div className="space-y-5">
            {[
              {
                q: 'Preciso configurar algo?',
                a: 'Não. Você só precisa começar a usar. O app é simples e intuitivo desde o primeiro momento.',
              },
              {
                q: 'Funciona no celular?',
                a: 'Sim! O app funciona perfeitamente no celular, tablet e computador. Você pode usar onde e quando quiser.',
              },
              {
                q: 'Preciso entender de finanças?',
                a: 'De jeito nenhum. O app foi feito para pessoas que não entendem de finanças. Tudo é simples e direto.',
              },
              {
                q: 'Isso substitui planilha?',
                a: 'Sim, e de forma muito mais prática. Você não precisa criar fórmulas ou entender Excel. Tudo é automático.',
              },
              {
                q: 'E se eu não gostar?',
                a: 'Você não tem mensalidade nem compromisso. Se não fizer sentido, é só parar de usar.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 sm:px-8 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-900 text-base sm:text-lg pr-4">
                    {faq.q}
                  </span>
                  <span className="text-gray-500 text-2xl ml-4 flex-shrink-0">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 sm:px-8 py-5 border-t border-gray-100 bg-gray-50">
                    <p className="text-gray-700 leading-relaxed text-base sm:text-lg">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fechamento Final */}
      <section className="px-4 py-16 sm:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 mb-10 leading-relaxed">
            Você pode continuar sem saber para onde seu salário vai
            <br />
            <span className="font-bold text-gray-900">ou decidir assumir o controle hoje.</span>
          </p>

          <button
            onClick={handleCta}
            className="w-full sm:w-auto px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl sm:text-2xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Quero meu salário em dia
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-gray-900 text-gray-400 text-center text-sm">
        <p>© 2024 Meu Salário em Dia. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

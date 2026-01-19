'use client';

type CategoryExamplesProps = {
  type: 'expense_variable' | 'expense_fixed' | 'income' | 'debt' | 'savings';
  onExampleClick?: (description: string, category: string) => void;
};

const categoryExamples: Record<string, { description: string; category: string; emoji?: string }[]> = {
  expense_variable: [
    { description: 'Almoço', category: 'Restaurante', emoji: '🍽️' },
    { description: 'Jantar', category: 'Restaurante', emoji: '🍴' },
    { description: 'Lanche', category: 'Restaurante', emoji: '🍔' },
    { description: 'Café', category: 'Restaurante', emoji: '☕' },
    { description: 'Delivery', category: 'Restaurante', emoji: '🍕' },
    { description: 'Iphone', category: 'Compras', emoji: '📱' },
    { description: 'Notebook', category: 'Compras', emoji: '💻' },
    { description: 'Fone de ouvido', category: 'Compras', emoji: '🎧' },
    { description: 'Roupas', category: 'Compras', emoji: '👕' },
    { description: 'Sapatos', category: 'Compras', emoji: '👟' },
    { description: 'Perfume', category: 'Compras', emoji: '🧴' },
    { description: 'Cinema', category: 'Lazer', emoji: '🎬' },
    { description: 'Show', category: 'Lazer', emoji: '🎤' },
    { description: 'Parque', category: 'Lazer', emoji: '🎢' },
    { description: 'Viagem', category: 'Lazer', emoji: '✈️' },
    { description: 'Gasolina', category: 'Carro', emoji: '⛽' },
    { description: 'Estacionamento', category: 'Carro', emoji: '🅿️' },
    { description: 'Lavagem', category: 'Carro', emoji: '🚿' },
    { description: 'Material escolar', category: 'Educação', emoji: '📚' },
    { description: 'Curso', category: 'Educação', emoji: '📖' },
    { description: 'Livro', category: 'Educação', emoji: '📗' },
    { description: 'Consulta médica', category: 'Saúde', emoji: '🏥' },
    { description: 'Exame', category: 'Saúde', emoji: '🔬' },
    { description: 'Dentista', category: 'Saúde', emoji: '🦷' },
    { description: 'Remédio', category: 'Farmácia', emoji: '💊' },
    { description: 'Vitamina', category: 'Farmácia', emoji: '💉' },
    { description: 'Presente', category: 'Presente', emoji: '🎁' },
    { description: 'Aniversário', category: 'Presente', emoji: '🎂' },
    { description: 'Mercado', category: 'Mercado', emoji: '🛒' },
    { description: 'Supermercado', category: 'Mercado', emoji: '🛍️' },
    { description: 'Padaria', category: 'Mercado', emoji: '🥖' },
    { description: 'Açougue', category: 'Mercado', emoji: '🥩' },
  ],
  expense_fixed: [
    { description: 'Aluguel', category: 'Casa', emoji: '🏠' },
    { description: 'Condomínio', category: 'Casa', emoji: '🏢' },
    { description: 'Energia elétrica', category: 'Casa', emoji: '💡' },
    { description: 'Água', category: 'Casa', emoji: '💧' },
    { description: 'Gás', category: 'Casa', emoji: '🔥' },
    { description: 'Internet', category: 'Casa', emoji: '📶' },
    { description: 'Telefone', category: 'Casa', emoji: '📞' },
    { description: 'TV a cabo', category: 'Casa', emoji: '📺' },
    { description: 'Academia', category: 'Saúde', emoji: '💪' },
    { description: 'Plano de saúde', category: 'Saúde', emoji: '🏥' },
    { description: 'Seguro do carro', category: 'Carro', emoji: '🚗' },
    { description: 'IPVA', category: 'Carro', emoji: '🚙' },
    { description: 'Seguro de vida', category: 'Seguro', emoji: '🛡️' },
    { description: 'Netflix', category: 'Assinatura', emoji: '📺' },
    { description: 'Spotify', category: 'Assinatura', emoji: '🎵' },
    { description: 'Amazon Prime', category: 'Assinatura', emoji: '📦' },
    { description: 'Disney+', category: 'Assinatura', emoji: '🎬' },
    { description: 'YouTube Premium', category: 'Assinatura', emoji: '▶️' },
    { description: 'Farmácia', category: 'Farmácia', emoji: '💊' },
    { description: 'Mensalidade escola', category: 'Educação', emoji: '🎓' },
    { description: 'Faculdade', category: 'Educação', emoji: '🎓' },
    { description: 'Curso online', category: 'Educação', emoji: '💻' },
  ],
  income: [
    { description: 'Salário', category: 'Ganhos', emoji: '💰' },
    { description: '13º salário', category: 'Ganhos', emoji: '💵' },
    { description: 'Férias', category: 'Ganhos', emoji: '🏖️' },
    { description: 'Freelance', category: 'Ganhos', emoji: '💼' },
    { description: 'Projeto', category: 'Ganhos', emoji: '📋' },
    { description: 'Venda', category: 'Ganhos', emoji: '💵' },
    { description: 'Aluguel recebido', category: 'Ganhos', emoji: '🏠' },
    { description: 'Dividendos', category: 'Ganhos', emoji: '📈' },
    { description: 'Rendimento', category: 'Ganhos', emoji: '💹' },
    { description: 'Bônus', category: 'Ganhos', emoji: '🎁' },
    { description: 'Comissão', category: 'Ganhos', emoji: '💸' },
    { description: 'Presente recebido', category: 'Ganhos', emoji: '🎁' },
  ],
  debt: [
    { description: 'Parcela empréstimo', category: 'Dívidas', emoji: '💳' },
    { description: 'Cartão de crédito', category: 'Dívidas', emoji: '💳' },
    { description: 'Financiamento', category: 'Dívidas', emoji: '🏦' },
    { description: 'Cheque especial', category: 'Dívidas', emoji: '📝' },
    { description: 'Parcela carro', category: 'Dívidas', emoji: '🚗' },
    { description: 'Parcela casa', category: 'Dívidas', emoji: '🏠' },
    { description: 'Fatura cartão', category: 'Dívidas', emoji: '💳' },
    { description: 'Empréstimo pessoal', category: 'Dívidas', emoji: '💰' },
  ],
  savings: [
    { description: 'Reserva de emergência', category: 'Economias', emoji: '🏦' },
    { description: 'Investimento', category: 'Economias', emoji: '📈' },
    { description: 'Poupança', category: 'Economias', emoji: '🐷' },
    { description: 'CDB', category: 'Economias', emoji: '💎' },
    { description: 'Tesouro Direto', category: 'Economias', emoji: '📊' },
    { description: 'Ações', category: 'Economias', emoji: '📈' },
    { description: 'Fundo de investimento', category: 'Economias', emoji: '💼' },
  ],
};

export function CategoryExamples({ type, onExampleClick }: CategoryExamplesProps) {
  const examples = categoryExamples[type] || [];

  if (examples.length === 0) return null;

  const handleClick = (example: { description: string; category: string; emoji?: string }) => {
    if (onExampleClick) {
      const fullDescription = example.emoji 
        ? `${example.emoji} ${example.description}` 
        : example.description;
      onExampleClick(fullDescription, example.category);
    }
  };

  return (
    <div className="mt-1.5 p-2 bg-blue-50/50 border border-blue-100 rounded-lg">
      <p className="text-xs text-blue-700 font-semibold mb-1.5">💡 Exemplos:</p>
      <div className="flex flex-wrap gap-1.5">
        {examples.map((example, idx) => {
          const fullDescription = example.emoji 
            ? `${example.emoji} ${example.description}` 
            : example.description;
          
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleClick(example)}
              className="text-xs text-blue-600 leading-tight px-2 py-1 bg-blue-100/70 hover:bg-blue-200 border border-blue-200 rounded-md transition-colors cursor-pointer active:scale-95"
              title={`Clique para usar: ${fullDescription}`}
            >
              <span className="font-medium">
                {example.emoji && `${example.emoji} `}
                {example.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

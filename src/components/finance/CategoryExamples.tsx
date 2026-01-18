'use client';

type CategoryExamplesProps = {
  type: 'expense_variable' | 'expense_fixed' | 'income' | 'debt' | 'savings';
};

const categoryExamples: Record<string, { description: string; category: string; emoji?: string }[]> = {
  expense_variable: [
    { description: 'Almoço', category: 'Lazer', emoji: '🍽️' },
    { description: 'Iphone', category: 'Compras', emoji: '📱' },
    { description: 'Cinema', category: 'Lazer', emoji: '🎬' },
    { description: 'Gasolina', category: 'Carro', emoji: '⛽' },
    { description: 'Material escolar', category: 'Educação', emoji: '📚' },
    { description: 'Consulta médica', category: 'Saúde', emoji: '🏥' },
    { description: 'Presente', category: 'Presente', emoji: '🎁' },
    { description: 'Roupas', category: 'Compras', emoji: '👕' },
  ],
  expense_fixed: [
    { description: 'Aluguel', category: 'Casa', emoji: '🏠' },
    { description: 'Internet', category: 'Casa', emoji: '📶' },
    { description: 'Academia', category: 'Saúde', emoji: '💪' },
    { description: 'Seguro do carro', category: 'Carro', emoji: '🚗' },
    { description: 'Netflix', category: 'Assinatura', emoji: '📺' },
    { description: 'Farmácia', category: 'Farmácia', emoji: '💊' },
    { description: 'Mensalidade escola', category: 'Educação', emoji: '🎓' },
  ],
  income: [
    { description: 'Salário', category: 'Ganhos', emoji: '💰' },
    { description: 'Freelance', category: 'Ganhos', emoji: '💼' },
    { description: 'Venda', category: 'Ganhos', emoji: '💵' },
  ],
  debt: [
    { description: 'Parcela empréstimo', category: 'Dívidas', emoji: '💳' },
    { description: 'Cartão de crédito', category: 'Dívidas', emoji: '💳' },
  ],
  savings: [
    { description: 'Reserva de emergência', category: 'Economias', emoji: '🏦' },
    { description: 'Investimento', category: 'Economias', emoji: '📈' },
  ],
};

export function CategoryExamples({ type }: CategoryExamplesProps) {
  const examples = categoryExamples[type] || [];

  if (examples.length === 0) return null;

  return (
    <div className="mt-1.5 p-2 bg-blue-50/50 border border-blue-100 rounded-lg">
      <p className="text-xs text-blue-700 font-semibold mb-1">💡 Exemplos:</p>
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
        {examples.slice(0, 3).map((example, idx) => (
          <div key={idx} className="text-xs text-blue-600 leading-tight">
            <span className="font-medium">
              {example.emoji && `${example.emoji} `}
              {example.description}
            </span>
            {' → '}
            <span className="text-blue-500">{example.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

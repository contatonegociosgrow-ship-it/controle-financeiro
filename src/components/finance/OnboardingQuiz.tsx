'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { formatDateToBR, formatDateToISO, applyDateMask } from '@/lib/goalUtils';

type GoalInput = {
  title: string;
  targetValue: string;
  monthlyContribution: string;
  deadline: string;
};

export function OnboardingQuiz() {
  const { state, setProfile, setMonthlyIncome, addGoal, isInitialized } = useFinanceStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [monthlyIncome, setMonthlyIncomeValue] = useState('');
  const [goals, setGoals] = useState<GoalInput[]>([
    { title: '', targetValue: '', monthlyContribution: '', deadline: '' },
  ]);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      // Verificar se é primeiro acesso: nome vazio ou sem metas
      const isFirstAccess = !state.profile.name || state.profile.name === '' || state.goals.length === 0;
      setShowQuiz(isFirstAccess);
    }
  }, [isInitialized, state.profile.name, state.goals.length]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const handleAddGoal = () => {
    setGoals([...goals, { title: '', targetValue: '', monthlyContribution: '', deadline: '' }]);
  };

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleGoalChange = (index: number, field: keyof GoalInput, value: string) => {
    const updated = [...goals];
    if (field === 'deadline') {
      updated[index][field] = applyDateMask(value);
    } else {
      updated[index][field] = value;
    }
    setGoals(updated);
  };

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2 && monthlyIncome && parseFloat(monthlyIncome) > 0) {
      setStep(3);
    }
  };

  const handleFinish = () => {
    // Salvar nome
    if (name.trim()) {
      setProfile({ 
        name: name.trim(),
        currency: state.profile.currency || 'BRL',
        monthlyIncome: state.profile.monthlyIncome || 0,
        wallet: state.profile.wallet || 0,
      });
    }

    // Salvar salário mensal
    if (monthlyIncome && parseFloat(monthlyIncome) > 0) {
      setMonthlyIncome(parseFloat(monthlyIncome));
    }

    // Salvar metas válidas
    goals.forEach((goal) => {
      if (
        goal.title.trim() &&
        goal.targetValue &&
        parseFloat(goal.targetValue) > 0 &&
        goal.monthlyContribution &&
        parseFloat(goal.monthlyContribution) > 0 &&
        goal.deadline
      ) {
        const isoDeadline = formatDateToISO(goal.deadline);
        if (isoDeadline) {
          const today = new Date();
          const startDate = formatDateToBR(today.toISOString().split('T')[0]);
          addGoal({
            title: goal.title.trim(),
            targetValue: parseFloat(goal.targetValue),
            monthlyContribution: parseFloat(goal.monthlyContribution),
            startDate,
            deadline: isoDeadline,
          });
        }
      }
    });

    setShowQuiz(false);
  };

  const canProceedStep1 = name.trim().length > 0;
  const canProceedStep2 = monthlyIncome && parseFloat(monthlyIncome) > 0;
  const hasValidGoals = goals.some(
    (g) =>
      g.title.trim() &&
      g.targetValue &&
      parseFloat(g.targetValue) > 0 &&
      g.monthlyContribution &&
      parseFloat(g.monthlyContribution) > 0 &&
      g.deadline
  );

  if (!showQuiz) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">👋</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo ao Meu Salário em dia!
            </h2>
            <p className="text-gray-600">
              Vamos configurar seu perfil em poucos passos
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Passo {step} de 3
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((step / 3) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Nome */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Qual é o seu nome?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Digite seu nome"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canProceedStep1) {
                      handleNext();
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Salário */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Qual é o seu salário mensal?
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncomeValue(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="0,00"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canProceedStep2) {
                      handleNext();
                    }
                  }}
                />
                {monthlyIncome && parseFloat(monthlyIncome) > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {formatCurrency(parseFloat(monthlyIncome))} por mês
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Metas */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Quais são suas metas financeiras para 2026?
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Você pode adicionar quantas metas quiser. Não se preocupe, você pode editar depois.
                </p>

                <div className="space-y-4">
                  {goals.map((goal, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Meta {index + 1}
                        </span>
                        {goals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveGoal(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remover
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Título da meta
                        </label>
                        <input
                          type="text"
                          value={goal.title}
                          onChange={(e) =>
                            handleGoalChange(index, 'title', e.target.value)
                          }
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Ex: Viagem para Europa"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Valor total
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={goal.targetValue}
                            onChange={(e) =>
                              handleGoalChange(index, 'targetValue', e.target.value)
                            }
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="0,00"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Contribuição mensal
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={goal.monthlyContribution}
                            onChange={(e) =>
                              handleGoalChange(index, 'monthlyContribution', e.target.value)
                            }
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="0,00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Prazo (DD/MM/AAAA)
                        </label>
                        <input
                          type="text"
                          value={goal.deadline}
                          onChange={(e) =>
                            handleGoalChange(index, 'deadline', e.target.value)
                          }
                          onBlur={(e) => {
                            const isoDate = formatDateToISO(e.target.value);
                            if (isoDate) {
                              handleGoalChange(index, 'deadline', formatDateToBR(isoDate));
                            }
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="DD/MM/AAAA"
                          maxLength={10}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddGoal}
                  className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  + Adicionar outra meta
                </button>

                {goals.length === 0 && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Você pode pular esta etapa e adicionar metas depois
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2)
                }
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Finalizar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

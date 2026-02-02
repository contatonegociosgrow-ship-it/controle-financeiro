'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { formatDateToBR, formatDateToISO, applyDateMask, getTodayISO } from '@/lib/goalUtils';

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
  const [goals, setGoals] = useState<GoalInput[]>(() => {
    const todayBR = formatDateToBR(getTodayISO());
    return [{ title: '', targetValue: '', monthlyContribution: '', deadline: todayBR }];
  });
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      // Verificar no localStorage se o quiz já foi completado
      const quizCompleted = localStorage.getItem('onboarding_quiz_completed');
      
      if (quizCompleted === 'true') {
        // Quiz já foi completado, não mostrar
        setShowQuiz(false);
      } else {
        // Primeiro acesso - mostrar o quiz
        setShowQuiz(true);
      }
    }
  }, [isInitialized]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const handleAddGoal = () => {
    const todayBR = formatDateToBR(getTodayISO());
    setGoals([...goals, { title: '', targetValue: '', monthlyContribution: '', deadline: todayBR }]);
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
          const startDate = formatDateToBR(getTodayISO());
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

    // Marcar quiz como completado no localStorage
    localStorage.setItem('onboarding_quiz_completed', 'true');
    
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
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo SVG */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="quizGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#60A5FA"/>
                      <stop offset="1" stopColor="#4F46E5"/>
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="45" fill="url(#quizGradient)" opacity="0.1"/>
                  <circle cx="50" cy="50" r="40" fill="url(#quizGradient)"/>
                  <path d="M35 50 L45 60 L65 40" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {/* Emoji de boas-vindas */}
                <div className="absolute -bottom-2 -right-2 text-3xl animate-bounce">👋</div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Bem-vindo ao Meu Salário em Dia!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Vamos configurar seu perfil em poucos passos
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Passo {step} de 3
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {Math.round((step / 3) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
            {/* Step indicators */}
            <div className="flex justify-between mt-3">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                      s <= step
                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    {s < step ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      s
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Nome */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <label className="block text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Qual é o seu nome?
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vamos começar conhecendo você melhor
                </p>
              </div>
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-5 py-4 text-gray-900 dark:text-white text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm hover:shadow-md"
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
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <label className="block text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Qual é o seu salário mensal?
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Isso nos ajuda a calcular melhor seus gastos
                </p>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 font-semibold">
                    R$
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncomeValue(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl pl-12 pr-5 py-4 text-gray-900 dark:text-white text-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all shadow-sm hover:shadow-md"
                    placeholder="0,00"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canProceedStep2) {
                        handleNext();
                      }
                    }}
                  />
                </div>
                {monthlyIncome && parseFloat(monthlyIncome) > 0 && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                      ✓ {formatCurrency(parseFloat(monthlyIncome))} por mês
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Metas */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mb-4">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <label className="block text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Quais são suas metas financeiras?
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Você pode adicionar quantas metas quiser. Não se preocupe, você pode editar depois.
                </p>
              </div>
              <div>

                <div className="space-y-4">
                  {goals.map((goal, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Meta {index + 1}
                          </span>
                        </div>
                        {goals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveGoal(index)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center gap-1 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remover
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Título da meta
                        </label>
                        <input
                          type="text"
                          value={goal.title}
                          onChange={(e) =>
                            handleGoalChange(index, 'title', e.target.value)
                          }
                          className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          placeholder="Ex: Viagem para Europa"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Valor total
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs">
                              R$
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={goal.targetValue}
                              onChange={(e) =>
                                handleGoalChange(index, 'targetValue', e.target.value)
                              }
                              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg pl-10 pr-3 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                              placeholder="0,00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Contribuição mensal
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs">
                              R$
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={goal.monthlyContribution}
                              onChange={(e) =>
                                handleGoalChange(index, 'monthlyContribution', e.target.value)
                              }
                              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg pl-10 pr-3 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                              placeholder="0,00"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Prazo (DD/MM/AAAA)
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
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
                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg pl-11 pr-3 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            placeholder="DD/MM/AAAA"
                            maxLength={10}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddGoal}
                  className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-purple-500 hover:text-purple-600 dark:hover:border-purple-500 dark:hover:text-purple-400 transition-all text-sm font-semibold flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar outra meta
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
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
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
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Próximo
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Finalizar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

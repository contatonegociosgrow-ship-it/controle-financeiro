import { NextRequest, NextResponse } from 'next/server';

// Importar função de interpretação diretamente
async function callInterpretAPI(text: string) {
  // Em produção, usar URL absoluta; em dev, usar relativa
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  const response = await fetch(`${baseUrl}/api/ai/interpret`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao chamar interpretação: ${response.status}`);
  }

  return response.json();
}

/**
 * Endpoint para processar texto de voz e interpretar lançamentos financeiros
 * 
 * Este endpoint recebe o texto transcrito e repassa para o serviço de IA
 * para interpretação. Retorna dados estruturados para confirmação do usuário.
 * 
 * POST /api/voice/parse
 * Body: { "text": "Hoje eu gastei 50 reais com Uber e 100 no mercado" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    // Validação básica
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Texto não fornecido ou inválido' },
        { status: 400 }
      );
    }

    // Chamar endpoint de interpretação com IA
    try {
      const interpretData = await callInterpretAPI(text);
      
      // Verificar se a resposta tem transações válidas (com valor > 0)
      const validTransactions = (interpretData.transactions || []).filter((t: any) => t.value > 0);
      
      // Se não encontrou transações válidas, usar parsing básico como fallback
      if (validTransactions.length === 0) {
        console.log('[VOICE PARSE] IA não encontrou transações, usando parsing básico');
        const parsedTransactions = parseFinancialText(text);
        const basicValidTransactions = parsedTransactions.filter(t => t.value > 0);
        
        return NextResponse.json({
          success: true,
          originalText: text,
          transactions: basicValidTransactions,
          message: 'Texto processado com parsing básico (IA não encontrou transações)',
          aiEnabled: false,
        });
      }
      
      return NextResponse.json({
        success: true,
        originalText: text,
        transactions: validTransactions,
        message: interpretData.message || 'Texto processado com sucesso',
        aiEnabled: interpretData.aiEnabled || false,
      });
    } catch (error: any) {
      // Fallback para parsing básico se IA falhar
      console.warn('Erro ao chamar IA, usando parsing básico:', error?.message || error);
      const parsedTransactions = parseFinancialText(text);
      
      // Filtrar transações com valor > 0
      const validTransactions = parsedTransactions.filter(t => t.value > 0);

      return NextResponse.json({
        success: true,
        originalText: text,
        transactions: validTransactions,
        message: 'Texto processado com parsing básico (IA não configurada)',
        aiEnabled: false,
      });
    }

  } catch (error: any) {
    console.error('Erro ao processar voz:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar o texto',
        message: error.message || 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * Função temporária para parsing básico de texto financeiro
 * TODO: Substituir por chamada ao serviço de IA (OpenAI, Claude, etc.)
 */
function parseFinancialText(text: string): Array<{
  description: string;
  value: number;
  type: 'income' | 'expense_fixed' | 'expense_variable';
  category?: string;
  date?: string;
}> {
  const transactions: Array<{
    description: string;
    value: number;
    type: 'income' | 'expense_fixed' | 'expense_variable';
    category?: string;
    date?: string;
  }> = [];

  // Normalizar texto - remover aspas e normalizar
  const normalizedText = text.toLowerCase().trim().replace(/["'""]/g, '');
  
  // Debug: log do texto normalizado
  console.log('[VOICE PARSE] Texto recebido:', text);
  console.log('[VOICE PARSE] Texto normalizado:', normalizedText);

  // Mapear palavras numéricas para números
  const numberWords: Record<string, number> = {
    'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3,
    'quatro': 4, 'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9,
    'dez': 10, 'onze': 11, 'doze': 12, 'treze': 13, 'catorze': 14, 'quatorze': 14,
    'quinze': 15, 'dezesseis': 16, 'dezessete': 17, 'dezoito': 18, 'dezenove': 19,
    'vinte': 20, 'trinta': 30, 'quarenta': 40, 'cinquenta': 50, 'sessenta': 60,
    'setenta': 70, 'oitenta': 80, 'noventa': 90, 'cem': 100, 'cento': 100,
    'duzentos': 200, 'trezentos': 300, 'quatrocentos': 400, 'quinhentos': 500,
    'seiscentos': 600, 'setecentos': 700, 'oitocentos': 800, 'novecentos': 900,
    'meio': 0.5, 'meia': 0.5
  };

  // Função para converter texto numérico em número
  const parseTextNumber = (text: string): number | null => {
    // Primeiro tentar números diretos
    const directNumber = /(\d+(?:[.,]\d{1,3})*(?:[.,]\d{1,2})?)/.exec(text);
    if (directNumber) {
      return parseFloat(directNumber[1].replace(/\./g, '').replace(',', '.'));
    }

    // Tentar palavras numéricas
    const words = text.trim().split(/\s+/);
    let total = 0;
    let currentNumber = 0;
    let hasMillion = false;
    let hasThousand = false;
    let hasHalf = false;

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[.,]/g, '').toLowerCase();
      
      if (word === 'milhão' || word === 'milhões') {
        hasMillion = true;
        if (currentNumber === 0) currentNumber = 1;
        total += currentNumber * 1000000;
        currentNumber = 0;
      } else if (word === 'mil') {
        hasThousand = true;
        if (currentNumber === 0) currentNumber = 1;
        total += currentNumber * 1000;
        currentNumber = 0;
      } else if (word === 'meio' || word === 'meia') {
        hasHalf = true;
      } else if (word === 'e') {
        // Ignorar "e" por enquanto, será tratado depois
        continue;
      } else if (numberWords[word] !== undefined) {
        currentNumber = numberWords[word];
      }
    }

    // Adicionar número restante
    if (currentNumber > 0) {
      if (hasMillion) {
        total += currentNumber * 1000000;
      } else if (hasThousand) {
        total += currentNumber * 1000;
      } else {
        total += currentNumber;
      }
    }

    // Adicionar meio se sobrou (após processar tudo)
    if (hasHalf && hasMillion) {
      total += 500000;
    } else if (hasHalf && hasThousand) {
      total += 500;
    } else if (hasHalf) {
      total += 0.5;
    }

    return total > 0 ? total : null;
  };

  // Buscar padrões numéricos (números e palavras)
  const numericPatterns: Array<{ value: number; index: number; text: string }> = [];
  
  // Padrão 1: Números diretos
  const numberPattern = /(?:r\$\s*)?(\d+(?:[.,]\d{1,3})*(?:[.,]\d{1,2})?)\s*(?:mil(?:hão|ões)?|mil|reais?|r\$)?/gi;
  let match;
  while ((match = numberPattern.exec(normalizedText)) !== null) {
    const valueStr = match[1];
    const value = parseValue(valueStr);
    const afterText = normalizedText.substring(match.index + match[0].length, match.index + match[0].length + 20).toLowerCase();
    let multiplier = 1;
    if (afterText.includes('milhão') || afterText.includes('milhões')) {
      multiplier = 1000000;
    } else if (afterText.includes('mil')) {
      multiplier = 1000;
    }
    numericPatterns.push({
      value: value * multiplier,
      index: match.index || 0,
      text: match[0]
    });
  }

  // Padrão 2: "um milhão e meio", "dois milhões e meio", etc. (PRIORITÁRIO - mais específico)
  // Buscar também variações como "um milhão e meio", "1 milhão e meio"
  const halfMillionPattern = /\b(um|uma|dois|duas|três|tres|quatro|cinco|seis|sete|oito|nove|\d+)\s+milh(?:ão|ões)\s+e\s+meio/gi;
  while ((match = halfMillionPattern.exec(normalizedText)) !== null) {
    let baseNumber = numberWords[match[1].toLowerCase()] || 1;
    // Se for número direto
    if (!isNaN(parseInt(match[1]))) {
      baseNumber = parseInt(match[1]);
    }
    const value = baseNumber * 1000000 + 500000;
    numericPatterns.push({
      value,
      index: match.index || 0,
      text: match[0]
    });
  }

  // Padrão 3: Palavras numéricas com mil/milhão (sem "e meio")
  const wordPattern = /\b(um|uma|dois|duas|três|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quatorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|cento|duzentos|trezentos|quatrocentos|quinhentos|seiscentos|setecentos|oitocentos|novecentos)\s+(milhão|milhões|mil)\b/gi;
  while ((match = wordPattern.exec(normalizedText)) !== null) {
    // Verificar se não é parte de um padrão "e meio" já capturado
    const matchText = match[0];
    const matchIndex = match.index || 0;
    const isPartOfHalfPattern = numericPatterns.some(p => {
      const pEnd = p.index + p.text.length;
      return matchIndex >= p.index && matchIndex < pEnd;
    });
    
    if (!isPartOfHalfPattern) {
      console.log('[VOICE PARSE] Padrão 3 encontrado:', matchText);
      const value = parseTextNumber(matchText);
      console.log('[VOICE PARSE] Valor parseado:', value);
      if (value !== null && value > 0) {
        numericPatterns.push({
          value,
          index: matchIndex,
          text: matchText
        });
      }
    }
  }
  
  console.log('[VOICE PARSE] Total de padrões encontrados antes de filtrar:', numericPatterns.length);

  // Ordenar por posição no texto e remover duplicatas próximas
  numericPatterns.sort((a, b) => a.index - b.index);
  const allMatches = numericPatterns.filter((pattern, index, arr) => {
    if (index === 0) return true;
    const prev = arr[index - 1];
    // Remover se estiver muito próximo (menos de 10 caracteres de diferença)
    return pattern.index - (prev.index + prev.text.length) > 10;
  }).map(pattern => ({
    index: pattern.index,
    value: pattern.value,
    text: pattern.text
  }));
  
  // Processar matches - agora allMatches já tem os valores calculados
  const processedMatches = allMatches.map(match => ({
    value: match.value,
    index: match.index,
    text: match.text
  }));

  // Detectar palavras-chave de despesa/ganho
  const expenseKeywords = ['gastei', 'paguei', 'comprei', 'despesa', 'gasto', 'pago', 'gastar', 'pagar'];
  const incomeKeywords = ['ganhei', 'recebi', 'entrada', 'salário', 'renda', 'ganhar', 'receber'];
  
  const isExpense = expenseKeywords.some(keyword => normalizedText.includes(keyword));
  const isIncome = incomeKeywords.some(keyword => normalizedText.includes(keyword));

  // Detectar categorias comuns (ordenado por especificidade)
  const categoryMap: Record<string, string> = {
    // Transporte
    'uber': 'Transporte',
    '99': 'Transporte',
    'taxi': 'Transporte',
    'táxi': 'Transporte',
    'combustível': 'Transporte',
    'combustivel': 'Transporte',
    'gasolina': 'Transporte',
    'posto': 'Transporte',
    'estacionamento': 'Transporte',
    'pedágio': 'Transporte',
    'pedagio': 'Transporte',
    'ônibus': 'Transporte',
    'onibus': 'Transporte',
    'metrô': 'Transporte',
    'metro': 'Transporte',
    'transporte': 'Transporte',
    // Alimentação - Estabelecimentos
    'mercado': 'Alimentação',
    'supermercado': 'Alimentação',
    'sacolão': 'Alimentação',
    'sacolao': 'Alimentação',
    'atacadão': 'Alimentação',
    'atacadao': 'Alimentação',
    'atacado': 'Alimentação',
    'extra': 'Alimentação',
    'carrefour': 'Alimentação',
    'walmart': 'Alimentação',
    'pao de açúcar': 'Alimentação',
    'pao de acucar': 'Alimentação',
    'pão de açúcar': 'Alimentação',
    'assai': 'Alimentação',
    'sams': 'Alimentação',
    'costco': 'Alimentação',
    'big': 'Alimentação',
    'hipermercado': 'Alimentação',
    'hiper': 'Alimentação',
    'restaurante': 'Alimentação',
    'lanchonete': 'Alimentação',
    'lanche': 'Alimentação',
    'fast food': 'Alimentação',
    'mcdonalds': 'Alimentação',
    'burger king': 'Alimentação',
    'subway': 'Alimentação',
    'pizza': 'Alimentação',
    'pizzaria': 'Alimentação',
    'ifood': 'Alimentação',
    'rappi': 'Alimentação',
    'delivery': 'Alimentação',
    'padaria': 'Alimentação',
    'padaria são paulo': 'Alimentação',
    'açougue': 'Alimentação',
    'acougue': 'Alimentação',
    'peixaria': 'Alimentação',
    'peixe': 'Alimentação',
    'hortifruti': 'Alimentação',
    'feira': 'Alimentação',
    'feira livre': 'Alimentação',
    'comida': 'Alimentação',
    'almoço': 'Alimentação',
    'almoco': 'Alimentação',
    'jantar': 'Alimentação',
    'café': 'Alimentação',
    'cafe': 'Alimentação',
    'cafeteria': 'Alimentação',
    'starbucks': 'Alimentação',
    'bebida': 'Alimentação',
    // Compras - Estabelecimentos
    'compras': 'Compras',
    'compra': 'Compras',
    'shopping': 'Compras',
    'loja': 'Compras',
    'magazine luiza': 'Compras',
    'magalu': 'Compras',
    'americanas': 'Compras',
    'casas bahia': 'Compras',
    'ricardo eletro': 'Compras',
    'pontofrio': 'Compras',
    'submarino': 'Compras',
    'mercadolivre': 'Compras',
    'mercado livre': 'Compras',
    'amazon': 'Compras',
    'renner': 'Compras',
    'riachuelo': 'Compras',
    'c&a': 'Compras',
    'zara': 'Compras',
    'h&m': 'Compras',
    'centauro': 'Compras',
    'nike': 'Compras',
    'adidas': 'Compras',
    'roupa': 'Compras',
    'roupas': 'Compras',
    'sapato': 'Compras',
    'sapatos': 'Compras',
    'eletrônico': 'Compras',
    'eletronico': 'Compras',
    'celular': 'Compras',
    'smartphone': 'Compras',
    'iphone': 'Compras',
    'samsung': 'Compras',
    'notebook': 'Compras',
    'computador': 'Compras',
    // Lazer
    'cinema': 'Lazer',
    'show': 'Lazer',
    'bar': 'Lazer',
    'balada': 'Lazer',
    'festival': 'Lazer',
    'parque': 'Lazer',
    'viagem': 'Lazer',
    'hotel': 'Lazer',
    'passeio': 'Lazer',
    'diversão': 'Lazer',
    'diversao': 'Lazer',
    // Saúde
    'farmácia': 'Saúde',
    'farmacia': 'Saúde',
    'médico': 'Saúde',
    'medico': 'Saúde',
    'dentista': 'Saúde',
    'hospital': 'Saúde',
    'plano': 'Saúde',
    'remédio': 'Saúde',
    'remedio': 'Saúde',
    'medicamento': 'Saúde',
    // Moradia
    'água': 'Moradia',
    'agua': 'Moradia',
    'luz': 'Moradia',
    'energia': 'Moradia',
    'aluguel': 'Moradia',
    'condomínio': 'Moradia',
    'condominio': 'Moradia',
    'iptu': 'Moradia',
    // Assinaturas
    'internet': 'Assinaturas',
    'netflix': 'Assinaturas',
    'spotify': 'Assinaturas',
    'assinatura': 'Assinaturas',
    'streaming': 'Assinaturas',
    'prime': 'Assinaturas',
    'amazon prime': 'Assinaturas',
    'disney': 'Assinaturas',
    // Educação
    'curso': 'Educação',
    'faculdade': 'Educação',
    'escola': 'Educação',
    'livro': 'Educação',
    'livros': 'Educação',
    'material': 'Educação',
  };

  // Função para converter string de valor para número
  const parseValue = (valueStr: string): number => {
    // Remover espaços
    valueStr = valueStr.trim();
    
    // Verificar se tem ponto ou vírgula
    const hasDot = valueStr.includes('.');
    const hasComma = valueStr.includes(',');
    
    if (hasDot && hasComma) {
      // Formato brasileiro: 50.000,00 ou 50.000,5
      // O último separador é o decimal
      const lastDot = valueStr.lastIndexOf('.');
      const lastComma = valueStr.lastIndexOf(',');
      
      if (lastComma > lastDot) {
        // Vírgula é o separador decimal: 50.000,00
        const integerPart = valueStr.substring(0, lastComma).replace(/\./g, '');
        const decimalPart = valueStr.substring(lastComma + 1);
        return parseFloat(`${integerPart}.${decimalPart}`);
      } else {
        // Ponto é o separador decimal: 50,000.00
        const integerPart = valueStr.substring(0, lastDot).replace(/,/g, '');
        const decimalPart = valueStr.substring(lastDot + 1);
        return parseFloat(`${integerPart}.${decimalPart}`);
      }
    } else if (hasDot) {
      // Apenas ponto: verificar se é milhar ou decimal
      const parts = valueStr.split('.');
      const lastPart = parts[parts.length - 1];
      
      if (lastPart.length <= 2 && parts.length === 2) {
        // Decimal: 50.00 ou 50.5
        return parseFloat(valueStr);
      } else {
        // Milhar: 50.000 ou 1.500.000
        return parseFloat(valueStr.replace(/\./g, ''));
      }
    } else if (hasComma) {
      // Apenas vírgula: verificar se é milhar ou decimal
      const parts = valueStr.split(',');
      const lastPart = parts[parts.length - 1];
      
      if (lastPart.length <= 2 && parts.length === 2) {
        // Decimal: 50,00 ou 50,5
        return parseFloat(valueStr.replace(',', '.'));
      } else {
        // Milhar: 50,000 ou 1,500,000 (formato não comum no BR, mas possível)
        return parseFloat(valueStr.replace(/,/g, ''));
      }
    } else {
      // Sem separador: número inteiro
      return parseFloat(valueStr);
    }
  };

  // Processar cada valor encontrado
  processedMatches.forEach((processedMatch, matchIndex) => {
    const value = processedMatch.value;
    const valueIndex = processedMatch.index;
    const matchText = processedMatch.text;

    if (isNaN(value) || value <= 0) return;

    // Tentar encontrar descrição correspondente
    let description = 'Lançamento por voz';
    let category: string | undefined;
    
    // Buscar primeiro DEPOIS do valor (mais comum: "gastei 50 com Uber")
    // Se não encontrar, buscar antes
    const valueEndIndex = valueIndex + matchText.length;
    const afterContextStart = valueEndIndex;
    const afterContextEnd = Math.min(normalizedText.length, valueEndIndex + 50);
    const afterContextText = normalizedText.substring(afterContextStart, afterContextEnd);
    
    // Contexto antes (usar apenas se não encontrar depois)
    const beforeContextStart = Math.max(0, valueIndex - 30);
    const beforeContextEnd = valueIndex;
    const beforeContextText = normalizedText.substring(beforeContextStart, beforeContextEnd);
    
    // Procurar categoria conhecida - PRIORIZAR DEPOIS do valor
    let foundKeyword: { keyword: string; category: string } | null = null;
    
    // 1. Buscar primeiro DEPOIS do valor (mais comum em português)
    for (const [keyword, cat] of Object.entries(categoryMap)) {
      const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (keywordRegex.test(afterContextText)) {
        foundKeyword = { keyword, category: cat };
        break; // Usar a primeira encontrada depois do valor
      }
    }
    
    // 2. Se não encontrou depois, buscar ANTES do valor
    if (!foundKeyword) {
      for (const [keyword, cat] of Object.entries(categoryMap)) {
        const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (keywordRegex.test(beforeContextText)) {
          foundKeyword = { keyword, category: cat };
          break; // Usar a primeira encontrada antes do valor
        }
      }
    }
    
    // Se encontrou uma palavra-chave, usar ela
    if (foundKeyword) {
      description = foundKeyword.keyword.charAt(0).toUpperCase() + foundKeyword.keyword.slice(1);
      category = foundKeyword.category;
    }
    
    // Se não encontrou categoria, tentar extrair descrição do contexto
    if (description === 'Lançamento por voz') {
      // Procurar por padrões como "com X", "em X", "no X", "na X", "de X"
      // Buscar APENAS no contexto mais próximo (30 caracteres antes e depois)
      const nearContextStart = Math.max(0, valueIndex - 30);
      const nearContextEnd = Math.min(normalizedText.length, valueIndex + matchText.length + 30);
      const nearContextText = normalizedText.substring(nearContextStart, nearContextEnd);
      
      const contextPattern = /(?:com|em|no|na|de|do|da|para|por)\s+([a-záàâãéèêíïóôõöúç\s]{2,25}?)(?:\s+(?:também|tambem|e|ou)|,|\.|$)/gi;
      const contextMatches = Array.from(nearContextText.matchAll(contextPattern));
      
      // Pegar a descrição mais próxima do valor
      let closestMatch: RegExpMatchArray | null = null;
      let closestDistance = Infinity;
      
      for (const contextMatch of contextMatches) {
        const matchPos = (contextMatch.index || 0) + nearContextStart;
        const distance = Math.abs(matchPos - valueIndex);
        if (distance < closestDistance && distance < 40) {
          const extractedDesc = contextMatch[1].trim();
          // Filtrar palavras muito comuns
          const commonWords = ['reais', 'real', 'r$', 'hoje', 'ontem', 'também', 'tambem', 'e', 'ou', 'a', 'o'];
          if (extractedDesc.length > 0 && !commonWords.includes(extractedDesc.toLowerCase())) {
            closestMatch = contextMatch;
            closestDistance = distance;
          }
        }
      }
      
      if (closestMatch) {
        const extractedDesc = closestMatch[1].trim();
        description = extractedDesc.charAt(0).toUpperCase() + extractedDesc.slice(1);
        
        // Tentar mapear para categoria mesmo que não tenha encontrado antes
        for (const [keyword, cat] of Object.entries(categoryMap)) {
          if (extractedDesc.toLowerCase().includes(keyword) || keyword.includes(extractedDesc.toLowerCase())) {
            category = cat;
            break;
          }
        }
      }
    }

    // Determinar tipo
    let type: 'income' | 'expense_fixed' | 'expense_variable' = 'expense_variable';
    if (isIncome) {
      type = 'income';
      // Se for ganho, forçar categoria como "Ganhos"
      category = 'Ganhos';
    } else if (isExpense) {
      type = 'expense_variable';
    }

    transactions.push({
      description,
      value,
      type,
      category: category || categoryMap[description.toLowerCase()] || undefined,
    });
  });

  // NÃO criar transação com valor 0 se não encontrou nada
  // Retornar array vazio para que o frontend mostre a mensagem apropriada

  return transactions;
}

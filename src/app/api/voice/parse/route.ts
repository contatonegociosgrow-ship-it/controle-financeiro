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
        message: 'Texto processado com parsing básico',
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

  // Normalizar texto
  const normalizedText = text.toLowerCase().trim();

  // Melhorar regex para capturar valores monetários de várias formas
  // Ex: "r$ 50", "R$50", "50 reais", "50,00", "50.00", etc.
  const valuePattern = /(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:reais?|r\$)?/gi;
  const matches = Array.from(normalizedText.matchAll(valuePattern));

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
    'extra': 'Compras',
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
    'amazon': 'Assinaturas',
    'prime': 'Assinaturas',
    'disney': 'Assinaturas',
    // Educação
    'curso': 'Educação',
    'faculdade': 'Educação',
    'escola': 'Educação',
    'livro': 'Educação',
    'livros': 'Educação',
    'material': 'Educação',
  };

  // Processar cada valor encontrado
  matches.forEach((match, matchIndex) => {
    const valueStr = match[1].replace(',', '.');
    const value = parseFloat(valueStr);

    if (isNaN(value) || value <= 0) return;

    // Tentar encontrar descrição correspondente
    let description = 'Lançamento por voz';
    let category: string | undefined;
    const valueIndex = match.index || 0;
    
    // Buscar primeiro DEPOIS do valor (mais comum: "gastei 50 com Uber")
    // Se não encontrar, buscar antes
    const valueEndIndex = valueIndex + match[0].length;
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
      const nearContextEnd = Math.min(normalizedText.length, valueIndex + match[0].length + 30);
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

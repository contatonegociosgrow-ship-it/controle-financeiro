import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para interpretar texto financeiro usando IA
 * 
 * Este endpoint recebe uma frase em português e retorna
 * lançamentos financeiros estruturados usando IA.
 * 
 * POST /api/ai/interpret
 * Body: { "text": "Hoje eu gastei 50 reais com Uber e 100 no mercado" }
 */

// Tipo para o resultado da IA
type InterpretedItem = {
  valor: number;
  categoria: string;
  descricao: string;
  data: string; // "hoje" | "ontem" | "YYYY-MM-DD"
  necessita_confirmacao: boolean;
};

type InterpretedResponse = {
  tipo: 'gasto' | 'ganho' | 'cofre' | 'investimento' | 'misto';
  itens: InterpretedItem[];
};

/**
 * Prompt do sistema para a IA
 */
const SYSTEM_PROMPT = `Você é um assistente financeiro do aplicativo "Meu Salário em Dia".

Sua função é interpretar frases faladas pelo usuário e extrair
lançamentos financeiros de forma estruturada e segura.

REGRAS OBRIGATÓRIAS:
- Identifique se o texto contém: GASTOS, GANHOS, COFRE ou INVESTIMENTOS
- Extraia somente informações que estejam explícitas
- Nunca invente valores, datas ou categorias
- Se algo estiver ambíguo, marque como "necessita_confirmacao": true
- Use sempre números (ex: 50, 100.5)
- Não crie recorrência, parcelamento ou metas sem menção clara
- Não salve dados, apenas interprete

CATEGORIAS DISPONÍVEIS:
- Alimentação
- Transporte
- Moradia
- Lazer
- Saúde
- Educação
- Assinaturas
- Compras
- Dívidas
- Investimentos
- Cofre
- Outros

MAPEAMENTO INTELIGENTE:
- Uber, 99, táxi → Transporte
- Mercado, supermercado → Alimentação
- Cinema, show, bar → Lazer
- Salário, pagamento → Ganhos
- Guardar, reservar → Cofre
- Investir, aplicar → Investimentos

FORMATO DE SAÍDA (JSON VÁLIDO):
{
  "tipo": "gasto | ganho | cofre | investimento | misto",
  "itens": [
    {
      "valor": number,
      "categoria": string,
      "descricao": string,
      "data": "hoje | ontem | YYYY-MM-DD",
      "necessita_confirmacao": boolean
    }
  ]
}

Exemplo:

Entrada:
"Ganhei 200 reais com um freela e gastei 80 no mercado"

Saída:
{
  "tipo": "misto",
  "itens": [
    {
      "valor": 200,
      "categoria": "Ganhos",
      "descricao": "Freela",
      "data": "hoje",
      "necessita_confirmacao": false
    },
    {
      "valor": 80,
      "categoria": "Alimentação",
      "descricao": "Mercado",
      "data": "hoje",
      "necessita_confirmacao": false
    }
  ]
}

Agora interprete a seguinte frase do usuário:`;

/**
 * Chama a API da OpenAI para interpretar o texto
 */
async function interpretWithOpenAI(text: string): Promise<InterpretedResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada. Configure a variável de ambiente.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Modelo mais barato e rápido, adequado para esta tarefa
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3, // Baixa temperatura para respostas mais consistentes
      response_format: { type: 'json_object' }, // Força resposta em JSON
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erro na API OpenAI: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`
    );
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Resposta vazia da API OpenAI');
  }

  try {
    const parsed = JSON.parse(content) as InterpretedResponse;
    
    // Validar estrutura básica
    if (!parsed.tipo || !Array.isArray(parsed.itens)) {
      throw new Error('Resposta da IA em formato inválido');
    }

    return parsed;
  } catch (parseError) {
    console.error('Erro ao parsear resposta da IA:', content);
    throw new Error('Resposta da IA não é um JSON válido');
  }
}

/**
 * Converte resposta da IA para formato interno do sistema
 */
function convertToInternalFormat(
  interpreted: InterpretedResponse,
  originalText: string
): Array<{
  description: string;
  value: number;
  type: 'income' | 'expense_fixed' | 'expense_variable' | 'savings';
  category?: string;
  date?: string;
  needsConfirmation?: boolean;
}> {
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // Mapear tipo da IA para tipo interno
  const typeMap: Record<string, 'income' | 'expense_fixed' | 'expense_variable' | 'savings'> = {
    'ganho': 'income',
    'gasto': 'expense_variable',
    'cofre': 'savings',
    'investimento': 'expense_variable', // Investimentos são tratados como despesas variáveis por enquanto
    'misto': 'expense_variable', // Misto será tratado item por item
  };

  return interpreted.itens.map((item) => {
    // Determinar tipo baseado no item ou no tipo geral
    let itemType: 'income' | 'expense_fixed' | 'expense_variable' | 'savings' = typeMap[interpreted.tipo] || 'expense_variable';
    
    // Se for misto, determinar tipo pelo item
    if (interpreted.tipo === 'misto') {
      if (item.categoria.toLowerCase() === 'ganhos') {
        itemType = 'income';
      } else if (item.categoria.toLowerCase() === 'cofre') {
        itemType = 'savings';
      } else {
        itemType = 'expense_variable';
      }
    }

    // Converter data
    let dateISO = todayISO;
    if (item.data === 'ontem') {
      dateISO = yesterdayISO;
    } else if (item.data && item.data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      dateISO = item.data;
    }

    return {
      description: item.descricao || 'Lançamento por voz',
      value: item.valor,
      type: itemType,
      category: item.categoria !== 'Ganhos' ? item.categoria : undefined,
      date: dateISO,
      needsConfirmation: item.necessita_confirmacao || false,
    };
  });
}

export async function POST(request: NextRequest) {
  let text = '';
  
  try {
    const body = await request.json();
    text = body.text;

    // Validação
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Texto não fornecido ou inválido' },
        { status: 400 }
      );
    }

    // Verificar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      // Fallback para parsing básico se não houver API key
      console.warn('OPENAI_API_KEY não configurada. Usando parsing básico.');
      return NextResponse.json({
        success: true,
        originalText: text,
        transactions: parseBasicFallback(text),
        message: 'Texto processado com parsing básico (IA não configurada)',
        aiEnabled: false,
      });
    }

    // Chamar IA
    const interpreted = await interpretWithOpenAI(text);
    
    // Converter para formato interno
    const transactions = convertToInternalFormat(interpreted, text);

    return NextResponse.json({
      success: true,
      originalText: text,
      transactions,
      interpreted, // Incluir resposta original da IA para debug
      message: 'Texto interpretado com sucesso pela IA',
      aiEnabled: true,
    });

  } catch (error: any) {
    console.error('Erro ao interpretar texto com IA:', error);
    
    // Em caso de erro, tentar fallback básico
    // Usar a variável text que já foi parseada
    if (text && text.trim().length > 0) {
      return NextResponse.json({
        success: true,
        originalText: text,
        transactions: parseBasicFallback(text),
        message: 'Texto processado com parsing básico (erro na IA)',
        aiEnabled: false,
        error: error.message,
      });
    }
    
    return NextResponse.json(
      {
        error: 'Erro ao processar o texto',
        message: error.message || 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * Fallback básico quando IA não está disponível
 */
function parseBasicFallback(text: string): Array<{
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

  const normalizedText = text.toLowerCase().trim();
  
  // Melhorar regex para capturar valores monetários de várias formas
  // Ex: "r$ 50", "R$50", "50 reais", "50,00", "50.00", "50 mil", "50 milhão", etc.
  // Captura também quando "mil" ou "milhão" vem separado: "50 mil", "2 milhões"
  const valuePattern = /(?:r\$\s*)?(\d+(?:[.,]\d{1,3})*(?:[.,]\d{1,2})?)\s*(?:mil(?:hão|ões)?|mil|reais?|r\$)?/gi;
  const matches = Array.from(normalizedText.matchAll(valuePattern));
  
  // Também buscar padrões como "50 mil", "2 milhões" onde a palavra vem separada
  const separatedPattern = /(\d+(?:[.,]\d{1,3})*(?:[.,]\d{1,2})?)\s+(mil(?:hão|ões)?|mil)\b/gi;
  const separatedMatches = Array.from(normalizedText.matchAll(separatedPattern));
  
  // Combinar matches, priorizando os separados (mais específicos)
  const allMatches = [...separatedMatches, ...matches].filter((match, index, self) => {
    // Remover duplicatas baseadas na posição
    return index === self.findIndex(m => m.index === match.index);
  });
  
  // Processar matches para converter "mil" e "milhão" em valores numéricos
  const processedMatches = allMatches.map(match => {
    const fullMatch = match[0];
    const valueStr = match[1];
    const matchIndex = match.index || 0;
    
    // Buscar "mil" ou "milhão" no texto após o valor (até 20 caracteres)
    const afterValue = fullMatch.substring(match[0].indexOf(valueStr) + valueStr.length).trim().toLowerCase();
    
    // Também buscar no texto original próximo ao match (até 30 caracteres depois)
    const contextAfter = normalizedText.substring(matchIndex, matchIndex + match[0].length + 30).toLowerCase();
    
    let multiplier = 1;
    // Verificar primeiro "milhão" para evitar conflito com "mil"
    if (afterValue.includes('milhão') || afterValue.includes('milhões') || 
        contextAfter.includes('milhão') || contextAfter.includes('milhões')) {
      multiplier = 1000000;
    } else if (afterValue.includes('mil') || contextAfter.includes(' mil ')) {
      multiplier = 1000;
    }
    
    return {
      ...match,
      valueStr,
      multiplier,
      originalMatch: match
    };
  });

  const expenseKeywords = ['gastei', 'paguei', 'comprei', 'despesa', 'gasto', 'pago', 'gastar', 'pagar'];
  const incomeKeywords = ['ganhei', 'recebi', 'entrada', 'salário', 'renda', 'ganhar', 'receber'];
  
  const isExpense = expenseKeywords.some(keyword => normalizedText.includes(keyword));
  const isIncome = incomeKeywords.some(keyword => normalizedText.includes(keyword));

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

  processedMatches.forEach((processedMatch) => {
    const match = processedMatch.originalMatch;
    const valueStr = processedMatch.valueStr;
    const multiplier = processedMatch.multiplier;
    let value = parseValue(valueStr);
    
    // Aplicar multiplicador se houver "mil" ou "milhão"
    value = value * multiplier;

    if (isNaN(value) || value <= 0) return;

    let description = 'Lançamento por voz';
    const valueIndex = match.index || 0;
    const beforeText = normalizedText.substring(Math.max(0, valueIndex - 50), valueIndex);
    const afterText = normalizedText.substring(valueIndex + match[0].length, Math.min(normalizedText.length, valueIndex + match[0].length + 50));
    
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
    let foundCategory: string | undefined;
    
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
      foundCategory = foundKeyword.category;
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
            foundCategory = cat;
            break;
          }
        }
      }
    }

    let type: 'income' | 'expense_fixed' | 'expense_variable' = 'expense_variable';
    if (isIncome) {
      type = 'income';
      // Se for ganho, forçar categoria como "Ganhos"
      foundCategory = 'Ganhos';
    } else if (isExpense) {
      type = 'expense_variable';
    }

    transactions.push({
      description,
      value,
      type,
      category: foundCategory || categoryMap[description.toLowerCase()] || undefined,
    });
  });

  // NÃO criar transação com valor 0 se não encontrou nada
  // Retornar array vazio para que o frontend mostre a mensagem apropriada

  return transactions;
}

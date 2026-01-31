# Configuração da Interpretação com IA

## 🎯 Funcionalidade

O sistema agora utiliza **Inteligência Artificial** para interpretar frases faladas e transformá-las em lançamentos financeiros estruturados.

## 📋 Pré-requisitos

1. **Conta na OpenAI** (https://platform.openai.com)
2. **API Key da OpenAI** (https://platform.openai.com/api-keys)

## ⚙️ Configuração

### 1. Criar arquivo `.env.local`

Na raiz do projeto, crie um arquivo `.env.local` com:

```env
# OpenAI API Key para interpretação de voz
OPENAI_API_KEY=sk-your-openai-api-key-here

# URL base da aplicação (opcional, usado para chamadas internas)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Obter API Key da OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave e cole no arquivo `.env.local`

### 3. Reiniciar o servidor

Após adicionar a variável de ambiente:

```bash
npm run dev
```

## 🔄 Como Funciona

### Fluxo Completo:

1. **Usuário fala** → Web Speech API transcreve para texto
2. **Texto é enviado** → `/api/voice/parse`
3. **Endpoint chama IA** → `/api/ai/interpret`
4. **IA interpreta** → Retorna lançamentos estruturados
5. **Usuário confirma** → Lançamentos são salvos

### Endpoint de IA

**POST** `/api/ai/interpret`

**Payload:**
```json
{
  "text": "Hoje eu gastei 50 reais com Uber e 100 no mercado"
}
```

**Resposta:**
```json
{
  "success": true,
  "originalText": "Hoje eu gastei 50 reais com Uber e 100 no mercado",
  "transactions": [
    {
      "description": "Uber",
      "value": 50,
      "type": "expense_variable",
      "category": "Transporte",
      "date": "2024-01-15",
      "needsConfirmation": false
    },
    {
      "description": "Mercado",
      "value": 100,
      "type": "expense_variable",
      "category": "Alimentação",
      "date": "2024-01-15",
      "needsConfirmation": false
    }
  ],
  "aiEnabled": true,
  "message": "Texto interpretado com sucesso pela IA"
}
```

## 🛡️ Fallback Automático

Se a API Key não estiver configurada ou houver erro na IA:

- ✅ Sistema usa **parsing básico** automaticamente
- ✅ Funcionalidade continua funcionando
- ✅ Usuário não percebe interrupção

## 💰 Custos

O sistema usa o modelo **GPT-4o-mini** da OpenAI:

- **Custo aproximado**: ~$0.15 por 1 milhão de tokens de entrada
- **Custo aproximado**: ~$0.60 por 1 milhão de tokens de saída
- **Cada interpretação**: ~200-500 tokens (muito barato)

**Exemplo**: 1000 interpretações ≈ $0.10 - $0.30

## 🔧 Modelo Utilizado

- **Modelo**: `gpt-4o-mini`
- **Temperatura**: 0.3 (respostas consistentes)
- **Formato**: JSON obrigatório
- **Idioma**: Português (pt-BR)

## 📝 Prompt do Sistema

O sistema usa um prompt especializado que:

- ✅ Identifica gastos, ganhos, cofre e investimentos
- ✅ Extrai valores, categorias e descrições
- ✅ Mapeia palavras-chave para categorias
- ✅ Marca itens ambíguos para confirmação
- ✅ Nunca inventa dados

## 🚀 Próximos Passos

Para melhorar ainda mais:

1. **Adicionar cache** de interpretações similares
2. **Suporte a outras IAs** (Claude, Gemini)
3. **Aprendizado contínuo** com feedback do usuário
4. **Whisper API** para transcrição mais precisa

## ❓ Troubleshooting

### Erro: "OPENAI_API_KEY não configurada"

**Solução**: Adicione a variável no arquivo `.env.local`

### Erro: "Erro na API OpenAI: 401"

**Solução**: Verifique se a API Key está correta e ativa

### Erro: "Erro na API OpenAI: 429"

**Solução**: Você atingiu o limite de rate limit. Aguarde alguns minutos.

### Sistema usando parsing básico

**Solução**: Verifique os logs do servidor para ver o erro específico da IA.

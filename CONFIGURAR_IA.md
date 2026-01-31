# 🚀 Como Configurar a IA (Guia Rápido)

## ⚡ Opção 1: Usar SEM IA (Funciona Agora)

O sistema **já funciona** sem configurar nada! Ele usa um **parsing básico** que detecta:
- ✅ Valores monetários (R$ 50, 100 reais, etc.)
- ✅ Categorias comuns (Uber → Transporte, Mercado → Alimentação)
- ✅ Tipos de transação (gastei → despesa, ganhei → receita)

**Teste agora mesmo**: Fale "hoje eu gastei 50 reais com Uber" e veja funcionar!

---

## 🎯 Opção 2: Configurar IA (Mais Preciso)

Para ter interpretação **muito mais inteligente**, configure a API da OpenAI:

### Passo 1: Obter Chave da API

1. Acesse: https://platform.openai.com/api-keys
2. Faça login (ou crie conta grátis - ganha créditos iniciais)
3. Clique em **"Create new secret key"**
4. **Copie a chave** (ela só aparece uma vez!)

### Passo 2: Criar Arquivo de Configuração

Na **raiz do projeto**, crie um arquivo chamado `.env.local`:

```env
OPENAI_API_KEY=sk-sua-chave-aqui
```

**Exemplo:**
```env
OPENAI_API_KEY=sk-proj-abc123xyz789...
```

### Passo 3: Reiniciar o Servidor

Pare o servidor (Ctrl+C) e inicie novamente:

```bash
npm run dev
```

### Pronto! 🎉

Agora o sistema usará IA para interpretar suas frases com muito mais precisão!

---

## 💰 Quanto Custa?

- **Modelo usado**: GPT-4o-mini (o mais barato)
- **Custo**: ~$0.10 - $0.30 por **1000 interpretações**
- **Créditos grátis**: OpenAI dá créditos iniciais para testar

**Exemplo prático**: Se você usar 10 vezes por dia = ~$0.10 por mês

---

## 🔍 Como Saber se Está Funcionando?

1. **Com IA**: Interpretação muito precisa, entende contextos complexos
2. **Sem IA (fallback)**: Funciona, mas pode não entender frases muito complexas

Você pode verificar nos logs do servidor se está usando IA ou fallback.

---

## ❓ Problemas?

### "Erro ao processar o texto"
- Verifique se a chave está correta no `.env.local`
- Reinicie o servidor após adicionar a chave

### "Não identifiquei lançamentos"
- Tente frases mais claras: "gastei 50 reais com Uber"
- O fallback básico funciona melhor com frases simples

### Quer testar sem configurar?
- **Não precisa fazer nada!** O sistema já funciona com parsing básico
- Configure a IA apenas se quiser mais precisão

---

## 📝 Exemplos de Frases que Funcionam

### Com ou Sem IA:
- ✅ "Hoje eu gastei 50 reais com Uber"
- ✅ "Ganhei 200 reais com freela"
- ✅ "Paguei 100 no mercado e 50 no cinema"

### Melhor com IA:
- ✅ "Ontem gastei uns 50 reais com transporte e depois mais 30 no almoço"
- ✅ "Recebi 500 de salário e guardei 200 no cofre"
- ✅ "Comprei remédio na farmácia por 45 reais"

---

**Dica**: Comece testando sem configurar. Se funcionar bem para você, pode não precisar da IA! 🚀

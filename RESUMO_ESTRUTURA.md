# Resumo da Estrutura do Aplicativo de Controle Financeiro

## 📋 Visão Geral

Aplicativo PWA (Progressive Web App) de controle financeiro pessoal desenvolvido em **Next.js 14** com **TypeScript** e **Tailwind CSS**. Funciona completamente offline usando `localStorage` para persistência de dados.

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14.2.35 (App Router)
- **Linguagem**: TypeScript 5.0
- **UI**: React 18.2 + Tailwind CSS 3.3.5
- **Persistência**: localStorage (offline-first)
- **PWA**: Service Worker + Manifest.json

## 📁 Estrutura de Diretórios

```
src/
├── app/                          # Rotas Next.js (App Router)
│   ├── layout.tsx               # Layout raiz com FinanceProvider e PWA config
│   ├── page.tsx                 # Página inicial (redirect para /app)
│   ├── globals.css              # Estilos globais
│   └── app/                     # Área principal da aplicação
│       ├── page.tsx             # Dashboard principal (redirect para /gerais)
│       ├── gerais/              # Visão geral de todas transações
│       ├── ganhos/              # Página de ganhos/rendimentos
│       ├── fixas/               # Despesas fixas
│       ├── variaveis/           # Despesas variáveis
│       ├── dividas/             # Dívidas e parcelamentos
│       ├── economias/           # Economias e investimentos
│       ├── mensal/              # Visão mensal detalhada com gráficos
│       └── manual/              # Visão manual com período customizado e gráficos
│
├── components/finance/          # Componentes financeiros
│   ├── FinanceDashboard.tsx    # Dashboard principal (grid 2x2)
│   ├── AddTransactionSheet.tsx # Modal/sheet para adicionar transações
│   ├── TransactionList.tsx      # Lista de transações com filtros
│   ├── TabNavigation.tsx         # Navegação por abas
│   ├── PageHeader.tsx           # Cabeçalho de páginas
│   ├── CardUI.tsx              # Componente base de card
│   ├── CategoryExamples.tsx    # Exemplos clicáveis de categorias
│   ├── PieChart.tsx            # Gráfico de pizza (categorias)
│   ├── BarChart.tsx            # Gráficos de barras (vertical/horizontal)
│   ├── MonthlyView.tsx         # Componente de visão mensal
│   ├── ManualView.tsx          # Componente de visão manual
│   └── Card*.tsx               # Cards específicos por tipo (Ganhos, Dívidas, etc)
│
└── lib/                        # Lógica de negócio
    ├── FinanceProvider.tsx     # Context Provider com estado global
    ├── storage.ts              # Funções de persistência (localStorage)
    └── seedData.ts             # Dados iniciais e categorias padrão
```

## 🗄️ Modelo de Dados

### FinanceState (Estado Principal)
```typescript
{
  meta: {
    schemaVersion: number;      // Versionamento do schema
    updatedAt: number;          // Timestamp da última atualização
  },
  profile: {
    name: string;
    currency: 'BRL' | 'USD' | 'EUR';
  },
  categories: Array<{
    id: string;
    name: string;
    limit?: number | null;      // Limite opcional por categoria
  }>,
  people: Array<{
    id: string;
    name: string;
  }>,
  cards: Array<{
    id: string;
    name: string;
    closingDay: number;         // Dia de fechamento
    dueDay: number;             // Dia de vencimento
  }>,
  transactions: Array<{
    id: string;
    value: number;
    type: 'income' | 'expense_fixed' | 'expense_variable' | 'debt' | 'savings';
    categoryId: string;
    cardId?: string | null;
    personId?: string | null;
    date: string;               // YYYY-MM-DD
    dueDate?: string;           // Para despesas fixas e dívidas
    notes?: string;
    createdAt: number;           // Timestamp
    installments?: {             // Para despesas variáveis parceladas
      current: number;
      total: number;
    } | null;
    status?: 'paid' | 'pending' | 'overdue';  // Para despesas fixas e dívidas
    monthlyPaymentDate?: number; // Dia do mês para pagamentos mensais
  }>,
  settings: {
    theme: 'dark' | 'light';
  }
}
```

## 🔑 Funcionalidades Principais

### 1. Gestão de Transações
- **5 tipos de transações**:
  - `income`: Ganhos/rendimentos
  - `expense_fixed`: Despesas fixas (com vencimento e status)
  - `expense_variable`: Despesas variáveis (com parcelas opcionais)
  - `debt`: Dívidas (pagamentos mensais)
  - `savings`: Economias/investimentos

### 2. Categorização
- Categorias pré-definidas (Compras, Educação, Saúde, Carro, etc.)
- Limites opcionais por categoria
- Exemplos clicáveis que preenchem automaticamente descrição e categoria

### 3. Pessoas e Cartões
- Gestão de pessoas (para associar a ganhos)
- Gestão de cartões de crédito (com dias de fechamento e vencimento)

### 4. Visualizações

#### Dashboard Principal (`/app/gerais`)
- Cards de resumo por tipo (Ganhos, Fixas, Variáveis, Dívidas, Economias)
- Gráfico de pizza por categoria
- Lista completa de transações com filtros

#### Visão Mensal (`/app/mensal`)
- Seletor de mês/ano
- Resumo financeiro do mês
- **Gráficos**:
  - Pizza: Distribuição por categoria
  - Barras: Por tipo de transação
  - Barras: Evolução diária (saldo positivo/negativo)
  - Barras horizontal: Top categorias de despesas
- Agrupamentos: Por tipo, por categoria, cronológico

#### Visão Manual (`/app/manual`)
- Seleção de período customizado (data inicial e final)
- Seletores rápidos (7, 15, 30, 60, 90 dias)
- Seletores por mês (este mês, mês passado, etc.)
- **Gráficos** (mesmos da visão mensal, adaptados ao período)
- Agrupamentos: Por dia, por tipo, por categoria, cronológico

### 5. Persistência Offline
- Todos os dados salvos em `localStorage` com key `app:finance:v1`
- Debounce de 250ms no save automático
- Versionamento de schema para migrações futuras
- Safe parse com fallback para estado padrão

## 🎨 Design e UX

- **Estilo**: Design moderno com gradientes e cards
- **Cores**: 
  - Verde: Ganhos
  - Vermelho: Despesas
  - Azul: Economias
  - Cores específicas por categoria nos gráficos
- **Responsivo**: Layout adaptável para mobile e desktop
- **PWA**: Instalável, funciona offline após primeira visita

## 🔧 Arquitetura de Estado

### FinanceProvider (Context API)
- Estado global gerenciado via React Context
- Hook `useFinanceStore()` para acessar estado e ações
- Inicialização automática com categorias padrão
- Save automático após mudanças no estado

### Ações Disponíveis
- `setProfile()`: Atualizar perfil do usuário
- `addCategory()`: Criar nova categoria
- `addPerson()`: Adicionar pessoa (retorna ID)
- `addCard()`: Adicionar cartão de crédito
- `addTransaction()`: Criar nova transação
- `updateTransaction()`: Atualizar transação existente
- `removeTransaction()`: Remover transação
- `resetState()`: Resetar todos os dados

## 📊 Componentes de Gráficos

### PieChart
- Gráfico de pizza circular
- Cores por categoria
- Legenda com porcentagens
- Centro mostra quantidade de categorias

### BarChart
- Gráfico de barras vertical
- Tooltips ao hover
- Formatação customizável de valores
- Cores por tipo de dado

### HorizontalBarChart
- Gráfico de barras horizontal
- Top N itens (configurável)
- Barras proporcionais com porcentagem
- Valores formatados em moeda

## 🚀 Funcionalidades Especiais

1. **Exemplos Clicáveis**: Ao clicar em um exemplo de categoria, preenche automaticamente descrição e seleciona categoria
2. **Filtros**: Por tipo, por texto (categoria/notas)
3. **Agrupamentos**: Múltiplas formas de visualizar dados
4. **Formatação**: Valores em moeda (BRL/USD/EUR) conforme perfil
5. **Datas**: Formato brasileiro (DD/MM/YYYY) com máscara automática

## 📱 PWA Features

- Service Worker registrado automaticamente
- Manifest.json configurado
- Ícones PWA (192x192 e 512x512)
- Funciona completamente offline
- Cache de rotas principais

## 🔄 Fluxo de Dados

1. Usuário interage com UI
2. Componente chama ação do `useFinanceStore()`
3. Estado é atualizado no Context
4. `useEffect` detecta mudança e salva em `localStorage`
5. Debounce de 250ms otimiza saves
6. Componentes re-renderizam com novo estado

## 📝 Notas Técnicas

- **TypeScript estrito**: Tipagem completa em todo o código
- **Client Components**: Todos os componentes são `'use client'` (Next.js App Router)
- **Sem dependências externas**: Apenas React, Next.js e Tailwind
- **Performance**: Uso de `useMemo` para cálculos pesados
- **Acessibilidade**: Labels e aria-labels onde necessário

## 🎯 Próximas Melhorias Possíveis

- Exportação de dados (JSON/CSV)
- Importação de dados
- Gráficos adicionais (linha temporal, comparação mensal)
- Notificações de vencimentos
- Backup em nuvem (opcional)
- Modo escuro/claro
- Relatórios PDF

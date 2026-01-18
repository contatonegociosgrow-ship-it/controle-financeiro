# Controle Financeiro - PWA Offline-First

PWA de controle financeiro com persistência em localStorage e design inspirado em pedrogridio.com.

## Estrutura do Projeto

```
controle-financeiro/
├── src/
│   ├── app/
│   │   ├── app/
│   │   │   └── page.tsx          # Página principal /app
│   │   ├── layout.tsx            # Layout raiz com PWA config
│   │   ├── page.tsx              # Redirect para /app
│   │   └── globals.css           # Estilos globais (gradiente escuro)
│   ├── components/
│   │   └── finance/
│   │       ├── FinanceDashboard.tsx    # Dashboard principal
│   │       ├── AddTransactionSheet.tsx # Modal de adicionar transação
│   │       └── CardUI.tsx              # Componente base de card
│   └── lib/
│       ├── storage.ts            # Módulo de persistência (localStorage)
│       └── useFinanceStore.ts    # Store/hook de estado
├── public/
│   ├── manifest.json             # Manifest PWA
│   ├── service-worker.js         # Service Worker para offline
│   ├── icon-192.png              # Ícone PWA 192x192 (criar)
│   └── icon-512.png              # Ícone PWA 512x512 (criar)
├── package.json
├── tsconfig.json
└── next.config.js
```

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000/app

## Build e Produção

```bash
npm run build
npm start
```

## Funcionalidades

### Persistência
- Todos os dados salvos em `localStorage` com key `app:finance:v1`
- Debounce de 250ms no save
- Versionamento de schema (meta.schemaVersion)
- Safe parse com fallback para estado padrão

### Store
- Hook `useFinanceStore()` com estado reativo
- Ações: `setProfile`, `addCategory`, `addPerson`, `addCard`, `addTransaction`, `removeTransaction`
- IDs gerados com `crypto.randomUUID()`

### UI
- Dashboard com 4 cards principais:
  1. Quanto sobrou no mês (saldo = receitas - despesas)
  2. Gastos do mês (total despesas)
  3. Categorias (com barras de progresso)
  4. Últimos lançamentos (6 mais recentes)
- Botão flutuante "+" para adicionar transação
- Modal/sheet para adicionar transação (campos opcionais escondidos)

### PWA
- Manifest.json configurado
- Service Worker com cache de rotas principais
- Funciona offline após primeira visita

## Modelo de Dados

```typescript
type FinanceState = {
  meta: { schemaVersion: 1; updatedAt: number };
  profile: { name: string; currency: 'BRL'|'USD'|'EUR' };
  categories: { id: string; name: string; limit?: number|null }[];
  people: { id: string; name: string }[];
  cards: { id: string; name: string; closingDay: number; dueDay: number }[];
  transactions: {
    id: string;
    value: number;
    type: 'expense'|'income';
    categoryId: string;
    cardId?: string|null;
    personId?: string|null;
    date: string; // YYYY-MM-DD
    notes?: string;
    createdAt: number;
  }[];
  settings: { theme: 'dark'|'light' };
};
```

## Próximos Passos

1. Criar ícones PWA (icon-192.png e icon-512.png)
2. Adicionar funcionalidade de criar categorias/pessoas/cartões
3. Adicionar filtros e busca
4. Adicionar gráficos/visualizações

## Notas

- O projeto usa Next.js 14 com App Router
- TypeScript estrito
- Estilos com Tailwind CSS (classes inline) - pode ser migrado para CSS modules se preferir
- Service Worker registrado apenas no browser (verificação `typeof window !== 'undefined'`)

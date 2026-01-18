# Instruções de Teste

## 1. Instalação

```bash
npm install
```

## 2. Criar Ícones PWA (Opcional mas Recomendado)

Crie dois arquivos na pasta `public/`:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

Você pode usar qualquer gerador de ícones PWA online ou criar manualmente.

## 3. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000/app

## 4. Testar Funcionalidades

### Adicionar Categorias (via Console do Browser)

Abra o console do navegador (F12) e execute:

```javascript
// Adicionar categorias de exemplo
const store = window.__FINANCE_STORE__; // Não disponível diretamente, mas você pode usar o React DevTools

// Ou adicione manualmente via UI quando implementar essa funcionalidade
```

**Nota:** Por enquanto, você precisa adicionar categorias manualmente. Para facilitar o teste, você pode:

1. Abrir o DevTools
2. Ir em Application > Local Storage
3. Editar o JSON em `app:finance:v1`
4. Adicionar categorias manualmente:

```json
{
  "categories": [
    { "id": "cat-1", "name": "Alimentação", "limit": 1000 },
    { "id": "cat-2", "name": "Transporte", "limit": 500 },
    { "id": "cat-3", "name": "Lazer", "limit": 300 }
  ]
}
```

### Adicionar Transação

1. Clique no botão "+" flutuante
2. Preencha:
   - Valor: ex: 50.00
   - Tipo: Despesa ou Receita
   - Categoria: Selecione uma categoria
   - Data: Use a data de hoje ou escolha outra
3. Clique em "Salvar"

### Verificar Persistência

1. Adicione algumas transações
2. Recarregue a página (F5)
3. Verifique se os dados persistiram

### Testar Offline (PWA)

1. Abra o DevTools > Application > Service Workers
2. Verifique se o service worker está registrado
3. Vá em Network > Offline (checkbox)
4. Recarregue a página
5. A aplicação deve continuar funcionando

## 5. Build de Produção

```bash
npm run build
npm start
```

## 6. Verificar localStorage

No DevTools > Application > Local Storage, você verá:
- Key: `app:finance:v1`
- Value: JSON com todos os dados

## Problemas Comuns

### Service Worker não registra
- Verifique se está acessando via `http://localhost:3000` (não `file://`)
- HTTPS é necessário em produção

### Estilos não aparecem
- Verifique se o Tailwind está instalado: `npm install`
- Verifique se `globals.css` está importado no layout

### Categorias não aparecem no select
- Adicione categorias manualmente via localStorage ou implemente a UI de criação

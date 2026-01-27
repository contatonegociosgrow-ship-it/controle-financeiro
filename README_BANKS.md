# Logos de Bancos

Este projeto utiliza os logos de bancos do repositório [Bancos-em-SVG](https://github.com/Tgentil/Bancos-em-SVG).

## Como adicionar logos

1. Baixe os SVGs do repositório: https://github.com/Tgentil/Bancos-em-SVG
2. Coloque os arquivos SVG na pasta `public/banks/[Nome do Banco]/logo.svg`
3. Atualize o arquivo `src/lib/bankColors.ts` adicionando o `logoPath` para o banco correspondente

## Estrutura de pastas

```
public/
  banks/
    Nu Pagamentos S.A/
      logo.svg
    Itaú Unibanco S.A/
      logo.svg
    Bradesco S.A/
      logo.svg
    Banco do Brasil S.A/
      logo.svg
    ...
```

## Mapeamento de nomes

Os nomes das pastas devem corresponder aos nomes exatos das pastas no repositório GitHub. Alguns exemplos:

- `Nu Pagamentos S.A` → `/banks/Nu Pagamentos S.A/logo.svg`
- `Itaú Unibanco S.A` → `/banks/Itaú Unibanco S.A/logo.svg`
- `Bradesco S.A` → `/banks/Bradesco S.A/logo.svg`
- `Banco do Brasil S.A` → `/banks/Banco do Brasil S.A/logo.svg`
- `Banco Santander Brasil S.A` → `/banks/Banco Santander Brasil S.A/logo.svg`
- `Caixa Econômica Federal` → `/banks/Caixa Econômica Federal/logo.svg`
- `Banco Inter S.A` → `/banks/Banco Inter S.A/logo.svg`
- `Banco C6 S.A` → `/banks/Banco C6 S.A/logo.svg`
- `PicPay` → `/banks/PicPay/logo.svg`
- `Mercado Pago` → `/banks/Mercado Pago/logo.svg`
- `PagSeguro Internet S.A` → `/banks/PagSeguro Internet S.A/logo.svg`
- `Neon` → `/banks/Neon/logo.svg`
- `Banco Original S.A` → `/banks/Banco Original S.A/logo.svg`
- `XP Investimentos` → `/banks/XP Investimentos/logo.svg`
- `Banco BTG Pacutal` → `/banks/Banco BTG Pacutal/logo.svg`

## Nota

Os arquivos SVG devem ser baixados manualmente do repositório GitHub e colocados na estrutura de pastas correta. O componente `BankLogo` automaticamente usa o SVG se disponível, caso contrário, usa o emoji como fallback.

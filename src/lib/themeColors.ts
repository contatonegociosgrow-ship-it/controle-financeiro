/**
 * Cores do tema baseadas no logo da aplicação
 * 
 * Para extrair as cores do logo:
 * 1. Abra o logo em um editor de imagens
 * 2. Use a ferramenta de conta-gotas para identificar as cores principais
 * 3. Atualize os valores abaixo com as cores hexadecimais encontradas
 */

export const themeColors = {
  // Cor primária (cor principal do logo) - Extraída do logo
  primary: '#80c040', // Verde claro do logo
  
  // Cor secundária (cor de destaque do logo)
  secondary: '#90d040', // Verde mais claro do logo
  
  // Cor de fundo escuro (do logo)
  dark: '#202020', // Cinza escuro/preto do logo
  
  // Cores de gradiente (baseadas nas cores do logo)
  gradient: {
    from: '#f0f8e8', // Verde muito claro (baseado no primary)
    via: '#e0f0d0', // Verde claro médio
    to: '#d0e8c0', // Verde claro
  },
  
  // Cores para modo escuro (baseadas no fundo escuro do logo)
  darkMode: {
    gradient: {
      from: '#202020', // Cor escura do logo
      via: '#252525', // Tom médio escuro
      to: '#2a2a2a', // Tom um pouco mais claro
    },
  },
  
  // Cores de hover e estados (baseadas no verde do logo)
  hover: '#90d040', // Verde mais claro para hover
  active: '#70b030', // Verde mais escuro para estado ativo
  
  // Cores de fundo e bordas
  background: {
    light: '#FFFFFF',
    dark: '#0F172A',
  },
  
  // Cores de texto
  text: {
    light: '#1A202C',
    dark: '#F9FAFB',
  },
};

/**
 * Função auxiliar para obter cores do tema
 */
export function getThemeColor(colorKey: keyof typeof themeColors): string {
  return themeColors[colorKey] as string;
}

/**
 * Função para obter gradiente do tema
 */
export function getThemeGradient(dark: boolean = false): string {
  const gradient = dark ? themeColors.darkMode.gradient : themeColors.gradient;
  return `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.via} 50%, ${gradient.to} 100%)`;
}

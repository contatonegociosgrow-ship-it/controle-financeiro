/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
        normal: '0',
      },
      colors: {
        // Cores do tema baseadas no logo (extraídas automaticamente)
        primary: {
          DEFAULT: '#80c040', // Cor primária do logo (verde claro)
          dark: '#70b030',    // Versão escura
          darker: '#309060',  // Versão mais escura
          light: '#90d040',   // Versão clara
          lighter: '#a0c020', // Versão mais clara
        },
        brand: {
          dark: '#202020',    // Cor escura do logo (fundo)
          green: '#80c040',   // Verde principal
          'green-light': '#90d040', // Verde claro
        },
      },
    },
  },
  plugins: [],
}

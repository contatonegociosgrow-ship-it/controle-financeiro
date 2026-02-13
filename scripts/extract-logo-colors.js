/**
 * Script para extrair cores dominantes do logo
 * 
 * Para usar:
 * 1. Instale a dependência: npm install --save-dev sharp
 * 2. Execute: node scripts/extract-logo-colors.js
 * 
 * O script irá analisar o logo e sugerir as cores principais
 */

const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '..', 'public', 'logonovo.png');

console.log('📸 Analisando logo:', logoPath);
console.log('');

if (!fs.existsSync(logoPath)) {
  console.error('❌ Logo não encontrado em:', logoPath);
  process.exit(1);
}

// Verifica se sharp está instalado
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Biblioteca "sharp" não encontrada.');
  console.log('');
  console.log('Para extrair cores automaticamente, instale:');
  console.log('  npm install --save-dev sharp');
  console.log('');
  console.log('Ou informe manualmente as cores principais do logo:');
  console.log('  1. Abra o logo em um editor de imagens');
  console.log('  2. Use a ferramenta de conta-gotas para identificar as cores');
  console.log('  3. Atualize o arquivo src/lib/themeColors.ts com as cores hexadecimais');
  process.exit(0);
}

async function extractColors() {
  try {
    const image = sharp(logoPath);
    const metadata = await image.metadata();
    
    console.log('📊 Dimensões:', metadata.width, 'x', metadata.height);
    console.log('🎨 Formato:', metadata.format);
    console.log('');
    
    // Redimensiona para análise mais rápida
    const resized = await image
      .resize(100, 100, { fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const pixels = resized.data;
    const width = resized.info.width;
    const height = resized.info.height;
    
    // Conta frequência de cores (agrupadas)
    const colorMap = new Map();
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = Math.round(pixels[i] / 16) * 16;
      const g = Math.round(pixels[i + 1] / 16) * 16;
      const b = Math.round(pixels[i + 2] / 16) * 16;
      const a = pixels[i + 3];
      
      // Ignora pixels transparentes ou muito claros
      if (a < 128) continue;
      
      const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }
    
    // Ordena por frequência
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    console.log('🎨 Cores dominantes encontradas:');
    console.log('');
    
    sortedColors.forEach(([color, count], index) => {
      const percentage = ((count / (width * height)) * 100).toFixed(2);
      console.log(`  ${index + 1}. ${color} (${percentage}%)`);
    });
    
    console.log('');
    console.log('💡 Sugestão de cores principais:');
    console.log('');
    console.log('  Primary (cor mais dominante):', sortedColors[0]?.[0] || '#000000');
    console.log('  Secondary (segunda cor):', sortedColors[1]?.[0] || '#000000');
    console.log('');
    console.log('📝 Atualize o arquivo src/lib/themeColors.ts com essas cores');
    
  } catch (error) {
    console.error('❌ Erro ao processar imagem:', error.message);
    process.exit(1);
  }
}

extractColors();

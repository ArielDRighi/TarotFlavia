#!/usr/bin/env node
// Reemplaza todas las imageUrl de cartas en los data files del seeder
// apuntando a /images/tarot/{slug}.webp en lugar de Wikimedia Commons.

const fs = require('fs');
const path = require('path');

const FILES = [
  path.resolve(__dirname, '../backend/tarot-app/src/modules/encyclopedia/data/major-arcana.data.ts'),
  path.resolve(__dirname, '../backend/tarot-app/src/modules/encyclopedia/data/minor-arcana.data.ts'),
];

function updateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let currentSlug = null;
  let updated = 0;
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Capturar slug del objeto actual
    const slugMatch = line.match(/^\s+slug:\s+'([^']+)'/);
    if (slugMatch) {
      currentSlug = slugMatch[1];
    }

    // Reemplazar imageUrl — maneja dos formatos:
    //   imageUrl: 'https://...',          (una línea)
    //   imageUrl:\n      'https://...',   (dos líneas)
    if (currentSlug && /^\s+imageUrl:/.test(line)) {
      const localUrl = `/images/tarot/${currentSlug}.webp`;

      if (line.includes("'")) {
        // Formato de una línea: imageUrl: 'url',
        result.push(line.replace(/'[^']*'/, `'${localUrl}'`));
        updated++;
      } else {
        // Formato de dos líneas: imageUrl:\n      'url',
        result.push(line); // la línea con `imageUrl:`
        i++;               // avanzar a la línea con la URL
        const urlLine = lines[i];
        result.push(urlLine.replace(/'[^']*'/, `'${localUrl}'`));
        updated++;
      }
      continue;
    }

    result.push(line);
  }

  fs.writeFileSync(filePath, result.join('\n'), 'utf-8');
  console.log(`✓  ${path.basename(filePath)} — ${updated} imageUrl actualizadas`);
}

FILES.forEach(updateFile);
console.log('\nListo. Ahora ejecutar: npm run db:seed:all (en backend/tarot-app)');

#!/usr/bin/env node

/**
 * Script para agregar los campos faltantes (dailyCardCount, dailyCardLimit,
 * tarotReadingsCount, tarotReadingsLimit) a todos los mocks de AuthUser en tests
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FIELDS = [
  'dailyCardCount',
  'dailyCardLimit',
  'tarotReadingsCount',
  'tarotReadingsLimit',
];

/**
 * Busca objetos que parecen ser mocks de AuthUser (tienen email, planType, etc.)
 * y les agrega los campos faltantes
 */
function fixAuthUserMock(content) {
  let modified = content;
  let changesMade = 0;

  // Patrón para encontrar objetos que parecen ser AuthUser
  // Busca objetos que tengan al menos 'email' y 'planType' (o dailyReadingsCount)
  const mockPattern =
    /(\{[^{}]*(?:email|planType)[^{}]*dailyReadingsCount[^{}]*dailyReadingsLimit[^{}]*\})/g;

  modified = modified.replace(mockPattern, (match) => {
    // Verificar si ya tiene los campos nuevos
    const hasAllFields = REQUIRED_FIELDS.every((field) => match.includes(field));

    if (hasAllFields) {
      return match; // Ya está actualizado
    }

    // Insertar los campos faltantes antes del último '}'
    const fields = REQUIRED_FIELDS.filter((field) => !match.includes(field))
      .map((field) => {
        // dailyCardCount y tarotReadingsCount empiezan en 0
        // dailyCardLimit y tarotReadingsLimit dependen del plan, por defecto 1
        const value = field.includes('Count') ? 0 : 1;
        return `${field}: ${value}`;
      })
      .join(',\n      ');

    if (fields) {
      // Encontrar el último '}' y agregar los campos antes
      const lastBrace = match.lastIndexOf('}');
      const updated =
        match.slice(0, lastBrace) + `,\n      ${fields}\n    ${match.slice(lastBrace)}`;
      changesMade++;
      return updated;
    }

    return match;
  });

  return { content: modified, changes: changesMade };
}

/**
 * Procesa un archivo de test
 */
function processFile(filePath) {
  console.log(`Procesando: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf8');
  const result = fixAuthUserMock(content);

  if (result.changes > 0) {
    fs.writeFileSync(filePath, result.content, 'utf8');
    console.log(`  ✅ ${result.changes} mock(s) actualizado(s)`);
    return true;
  } else {
    console.log(`  ⏭️  Sin cambios`);
    return false;
  }
}

/**
 * Encuentra todos los archivos de test
 */
function findTestFiles(dir) {
  const files = [];

  function traverse(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Ignorar node_modules, coverage, etc.
        if (!['node_modules', 'coverage', 'dist', '.next'].includes(entry.name)) {
          traverse(fullPath);
        }
      } else if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// Main
const srcDir = path.join(__dirname, '..', 'src');
console.log('🔍 Buscando archivos de test...\n');

const testFiles = findTestFiles(srcDir);
console.log(`Encontrados ${testFiles.length} archivos de test\n`);

let filesModified = 0;
for (const file of testFiles) {
  if (processFile(file)) {
    filesModified++;
  }
}

console.log(`\n✨ Completado! ${filesModified} archivo(s) modificado(s)`);

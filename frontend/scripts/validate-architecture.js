#!/usr/bin/env node

/**
 * Validador de Arquitectura Frontend - TarotFlavia
 *
 * Valida que el código siga la arquitectura feature-based definida en ARCHITECTURE.md
 *
 * Validaciones:
 * 1. Separation of Concerns (app/, components/, hooks/, stores/, lib/)
 * 2. Nomenclatura de archivos (PascalCase componentes, camelCase hooks)
 * 3. Importaciones correctas (no relativas largas, usar @/ alias)
 * 4. No 'any' en TypeScript
 * 5. No eslint-disable o ts-ignore
 * 6. Componentes en features/ organizados por dominio
 * 7. No lógica de negocio en app/ (solo rutas)
 *
 * Uso: node scripts/validate-architecture.js
 */

const fs = require('fs');
const path = require('path');

// Configuración
const SRC_DIR = path.join(__dirname, '../src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components/features');
const APP_DIR = path.join(SRC_DIR, 'app');
const HOOKS_DIR = path.join(SRC_DIR, 'hooks');
const STORES_DIR = path.join(SRC_DIR, 'stores');

let exitCode = 0;
let errors = [];
let warnings = [];

// =============================================================================
// UTILIDADES
// =============================================================================

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir, { withFileTypes: true });

  files.forEach((file) => {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (
      (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) &&
      !file.name.endsWith('.test.ts') &&
      !file.name.endsWith('.test.tsx') &&
      !file.name.endsWith('.d.ts')
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    return null;
  }
}

function getRelativePath(filePath) {
  return path.relative(SRC_DIR, filePath);
}

// =============================================================================
// VALIDACIÓN 1: NOMENCLATURA DE ARCHIVOS
// =============================================================================

function validateFileNaming() {
  console.log('\n📝 Validando nomenclatura de archivos...\n');

  const allFiles = getAllFiles(SRC_DIR);

  allFiles.forEach((filePath) => {
    const fileName = path.basename(filePath);
    const relativePath = getRelativePath(filePath);
    const dir = path.dirname(filePath);

    // Componentes React (.tsx) deben ser PascalCase
    // Excepción: components/ui/ usa convención shadcn/ui (lowercase/kebab-case)
    if (fileName.endsWith('.tsx')) {
      const isUiComponent = dir.includes('components') && dir.includes('ui');
      if (
        dir.includes('components') &&
        !isUiComponent &&
        !fileName.match(/^[A-Z][a-zA-Z0-9]*\.tsx$/)
      ) {
        errors.push({
          file: relativePath,
          message: `Component file must be PascalCase: ${fileName}`,
          rule: 'NOMENCLATURE',
        });
      }
    }

    // Hooks deben empezar con 'use' y ser camelCase
    if (dir.includes('hooks') && fileName.endsWith('.ts')) {
      if (!fileName.match(/^use[A-Z][a-zA-Z0-9]*\.ts$/)) {
        errors.push({
          file: relativePath,
          message: `Hook file must start with 'use' and be camelCase: ${fileName}`,
          rule: 'NOMENCLATURE',
        });
      }
    }

    // Stores deben terminar en 'Store.ts' y ser camelCase
    if (dir.includes('stores') && fileName.endsWith('.ts')) {
      if (!fileName.match(/^[a-z][a-zA-Z0-9]*Store\.ts$/)) {
        errors.push({
          file: relativePath,
          message: `Store file must end with 'Store.ts' and be camelCase: ${fileName}`,
          rule: 'NOMENCLATURE',
        });
      }
    }
  });

  if (errors.filter((e) => e.rule === 'NOMENCLATURE').length === 0) {
    console.log('   ✅ Nomenclatura correcta');
  }
}

// =============================================================================
// VALIDACIÓN 2: NO 'ANY' EN TYPESCRIPT
// =============================================================================

function validateNoAny() {
  console.log('\n🔍 Validando uso de "any" en TypeScript...\n');

  const allFiles = getAllFiles(SRC_DIR);
  let anyCount = 0;

  allFiles.forEach((filePath) => {
    const content = readFileContent(filePath);
    if (!content) return;

    const relativePath = getRelativePath(filePath);
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Detectar ': any' o '<any>' pero ignorar comentarios
      if ((line.includes(': any') || line.includes('<any>')) && !line.trim().startsWith('//')) {
        anyCount++;
        errors.push({
          file: relativePath,
          line: index + 1,
          message: `Usage of 'any' type detected. Use specific types or 'unknown'.`,
          rule: 'NO_ANY',
          code: line.trim(),
        });
      }
    });
  });

  if (anyCount === 0) {
    console.log('   ✅ No se detectó uso de "any"');
  } else {
    console.log(`   ❌ ${anyCount} usos de "any" detectados`);
  }
}

// =============================================================================
// VALIDACIÓN 3: NO ESLINT-DISABLE O TS-IGNORE
// =============================================================================

function validateNoDisables() {
  console.log('\n🚫 Validando eslint-disable y ts-ignore...\n');

  const allFiles = getAllFiles(SRC_DIR);
  let disableCount = 0;

  allFiles.forEach((filePath) => {
    const content = readFileContent(filePath);
    if (!content) return;

    const relativePath = getRelativePath(filePath);
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Detectar eslint-disable, @ts-ignore, @ts-nocheck
      if (
        line.includes('eslint-disable') ||
        line.includes('@ts-ignore') ||
        line.includes('@ts-nocheck')
      ) {
        disableCount++;
        errors.push({
          file: relativePath,
          line: index + 1,
          message: `Disable directive detected. Fix the actual problem instead.`,
          rule: 'NO_DISABLE',
          code: line.trim(),
        });
      }
    });
  });

  if (disableCount === 0) {
    console.log('   ✅ No se detectaron disable directives');
  } else {
    console.log(`   ❌ ${disableCount} disable directives detectados`);
  }
}

// =============================================================================
// VALIDACIÓN 4: IMPORTACIONES CORRECTAS (@ ALIAS)
// =============================================================================

function validateImports() {
  console.log('\n📦 Validando importaciones...\n');

  const allFiles = getAllFiles(SRC_DIR);
  let relativeImportsCount = 0;

  allFiles.forEach((filePath) => {
    const content = readFileContent(filePath);
    if (!content) return;

    const relativePath = getRelativePath(filePath);
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Detectar imports relativos largos (más de 2 niveles)
      const match = line.match(/import .* from ['"](\.\.[/\\].+)['"]/);
      if (match) {
        const importPath = match[1];
        const levels = (importPath.match(/\.\./g) || []).length;

        if (levels >= 2) {
          relativeImportsCount++;
          warnings.push({
            file: relativePath,
            line: index + 1,
            message: `Long relative import detected. Consider using '@/' alias.`,
            rule: 'IMPORT_ALIAS',
            code: line.trim(),
          });
        }
      }
    });
  });

  if (relativeImportsCount === 0) {
    console.log('   ✅ Importaciones correctas');
  } else {
    console.log(
      `   ⚠️  ${relativeImportsCount} importaciones relativas largas (considerar @/ alias)`
    );
  }
}

// =============================================================================
// VALIDACIÓN 5: NO LÓGICA DE NEGOCIO EN APP/
// =============================================================================

function validateAppDirectory() {
  console.log('\n📁 Validando directorio app/...\n');

  if (!fs.existsSync(APP_DIR)) {
    console.log('   ⏭️  Directorio app/ no existe (aún no inicializado)');
    return;
  }

  const appFiles = getAllFiles(APP_DIR);
  let businessLogicCount = 0;

  appFiles.forEach((filePath) => {
    const content = readFileContent(filePath);
    if (!content) return;

    const relativePath = getRelativePath(filePath);
    const fileName = path.basename(filePath);

    // Ignorar archivos de configuración Next.js
    if (
      fileName === 'layout.tsx' ||
      fileName === 'loading.tsx' ||
      fileName === 'error.tsx' ||
      fileName === 'not-found.tsx'
    ) {
      return;
    }

    // Detectar lógica de negocio en page.tsx
    if (fileName === 'page.tsx') {
      const lines = content.split('\n');
      let hasBusinessLogic = false;

      lines.forEach((line, index) => {
        // Detectar hooks de data fetching
        if (
          line.includes('useState') ||
          line.includes('useEffect') ||
          line.includes('useQuery') ||
          line.includes('useMutation')
        ) {
          hasBusinessLogic = true;
          businessLogicCount++;
          warnings.push({
            file: relativePath,
            line: index + 1,
            message: `Business logic detected in page component. Move to feature components.`,
            rule: 'APP_LOGIC',
            code: line.trim(),
          });
        }
      });
    }
  });

  if (businessLogicCount === 0) {
    console.log('   ✅ No se detectó lógica de negocio en app/');
  } else {
    console.log(
      `   ⚠️  ${businessLogicCount} líneas de lógica detectadas en app/ (mover a components/features/)`
    );
  }
}

// =============================================================================
// VALIDACIÓN 6: COMPONENTES ORGANIZADOS POR FEATURE
// =============================================================================

function validateFeatureStructure() {
  console.log('\n🎯 Validando estructura feature-based...\n');

  if (!fs.existsSync(COMPONENTS_DIR)) {
    console.log('   ⏭️  Directorio components/features/ no existe (aún no inicializado)');
    return;
  }

  const features = fs
    .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  if (features.length === 0) {
    warnings.push({
      message: `No features found in components/features/. Create feature folders (readings, auth, marketplace, admin).`,
      rule: 'FEATURE_STRUCTURE',
    });
  } else {
    console.log(`   ✅ ${features.length} features detectadas: ${features.join(', ')}`);
  }

  // Verificar que no haya componentes sueltos en components/
  const componentsRoot = path.join(SRC_DIR, 'components');
  if (fs.existsSync(componentsRoot)) {
    const items = fs
      .readdirSync(componentsRoot, { withFileTypes: true })
      .filter(
        (item) => item.name.endsWith('.tsx') && item.name !== 'index.tsx' && !item.isDirectory()
      );

    if (items.length > 0) {
      warnings.push({
        message: `Components found in components/ root. Move to components/features/ or components/ui/.`,
        rule: 'FEATURE_STRUCTURE',
        files: items.map((i) => i.name),
      });
    }
  }
}

// =============================================================================
// VALIDACIÓN 7: HOOKS EN hooks/api/ USAN REACT QUERY
// =============================================================================

function validateHooksStructure() {
  console.log('\n🪝 Validando estructura de hooks...\n');

  const hooksApiDir = path.join(HOOKS_DIR, 'api');

  if (!fs.existsSync(hooksApiDir)) {
    console.log('   ⏭️  Directorio hooks/api/ no existe (aún no inicializado)');
    return;
  }

  const apiHooks = getAllFiles(hooksApiDir);

  apiHooks.forEach((filePath) => {
    const content = readFileContent(filePath);
    if (!content) return;

    const relativePath = getRelativePath(filePath);

    // Verificar que use React Query
    const hasQuery = content.includes('useQuery') || content.includes('useMutation');
    const hasFetch = content.includes('fetch(') || content.includes('axios.');

    if (!hasQuery && hasFetch) {
      errors.push({
        file: relativePath,
        message: `API hook should use React Query (useQuery/useMutation), not direct fetch.`,
        rule: 'HOOKS_QUERY',
      });
    }
  });

  if (errors.filter((e) => e.rule === 'HOOKS_QUERY').length === 0) {
    console.log('   ✅ Hooks API usan React Query correctamente');
  }
}

// =============================================================================
// REPORTE FINAL
// =============================================================================

function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 REPORTE DE VALIDACIÓN DE ARQUITECTURA');
  console.log('='.repeat(80) + '\n');

  // Errores críticos
  if (errors.length > 0) {
    console.log(`❌ ERRORES CRÍTICOS (${errors.length}):\n`);

    errors.forEach((error, index) => {
      console.log(`${index + 1}. [${error.rule}] ${error.file || ''}`);
      if (error.line) console.log(`   Línea ${error.line}`);
      console.log(`   ${error.message}`);
      if (error.code) console.log(`   > ${error.code}`);
      console.log('');
    });

    exitCode = 1;
  }

  // Warnings
  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length}):\n`);

    warnings.forEach((warning, index) => {
      console.log(`${index + 1}. [${warning.rule}] ${warning.file || ''}`);
      if (warning.line) console.log(`   Línea ${warning.line}`);
      console.log(`   ${warning.message}`);
      if (warning.code) console.log(`   > ${warning.code}`);
      if (warning.files) console.log(`   Archivos: ${warning.files.join(', ')}`);
      console.log('');
    });
  }

  // Resumen
  console.log('='.repeat(80));

  if (exitCode === 0 && warnings.length === 0) {
    console.log('✅ VALIDACIÓN EXITOSA - Arquitectura correcta');
  } else if (exitCode === 0 && warnings.length > 0) {
    console.log('⚠️  VALIDACIÓN CON WARNINGS - Revisar recomendaciones');
  } else {
    console.log('❌ VALIDACIÓN FALLIDA - Corregir errores antes de commit');
  }

  console.log('='.repeat(80) + '\n');
}

// =============================================================================
// MAIN
// =============================================================================

function main() {
  console.log('🏗️  Validador de Arquitectura Frontend - TarotFlavia\n');

  // Verificar que existe src/
  if (!fs.existsSync(SRC_DIR)) {
    console.log(
      '⏭️  Directorio src/ no existe. Proyecto aún no inicializado (ejecutar TAREA 0.1).\n'
    );
    console.log('✅ Validación omitida - Setup pendiente\n');
    process.exit(0);
  }

  // Ejecutar validaciones
  validateFileNaming();
  validateNoAny();
  validateNoDisables();
  validateImports();
  validateAppDirectory();
  validateFeatureStructure();
  validateHooksStructure();

  // Reporte final
  printReport();

  process.exit(exitCode);
}

// Ejecutar
main();

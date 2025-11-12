#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '../src/modules');
const THRESHOLD_FILES = 10;
const THRESHOLD_LINES = 1000;

let exitCode = 0;

/**
 * Cuenta archivos .ts recursivamente (excluyendo specs)
 */
function countFiles(dir) {
  if (!fs.existsSync(dir)) {
    return 0;
  }

  const files = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;

  files.forEach((file) => {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      count += countFiles(fullPath);
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.spec.ts')) {
      count++;
    }
  });

  return count;
}

/**
 * Cuenta líneas de código recursivamente (excluyendo specs)
 */
function countLines(dir) {
  if (!fs.existsSync(dir)) {
    return 0;
  }

  const files = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;

  files.forEach((file) => {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      count += countLines(fullPath);
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.spec.ts')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      count += content.split('\n').length;
    }
  });

  return count;
}

/**
 * Verifica si tiene estructura por capas (domain/application/infrastructure)
 */
function hasLayeredStructure(dir) {
  if (!fs.existsSync(dir)) {
    return false;
  }

  const contents = fs.readdirSync(dir);
  return (
    contents.includes('domain') &&
    contents.includes('application') &&
    contents.includes('infrastructure')
  );
}

/**
 * Valida un módulo individual
 */
function validateModule(moduleName, modulePath) {
  const fileCount = countFiles(modulePath);
  const lineCount = countLines(modulePath);
  const hasLayers = hasLayeredStructure(modulePath);

  console.log(`\n📦 Validating ${moduleName}:`);
  console.log(`   Files: ${fileCount}`);
  console.log(`   Lines: ${lineCount}`);
  console.log(`   Has layers: ${hasLayers ? '✅' : '❌'}`);

  // Si cumple criterio de complejidad pero NO tiene capas
  if (
    (fileCount >= THRESHOLD_FILES || lineCount >= THRESHOLD_LINES) &&
    !hasLayers
  ) {
    console.log(
      `   ⚠️  WARNING: Module meets complexity threshold but lacks layered structure`,
    );
    console.log(
      `   Recommendation: Consider applying domain/application/infrastructure layers`,
    );
    console.log(
      `   See: docs/architecture/decisions/ADR-002-layered-architecture-criteria.md`,
    );
    exitCode = 1;
  }

  // Si tiene capas pero NO cumple criterio
  if (hasLayers && fileCount < THRESHOLD_FILES && lineCount < THRESHOLD_LINES) {
    console.log(
      `   ℹ️  INFO: Module has layers but is below complexity threshold`,
    );
    console.log(`   This is OK if module is expected to grow`);
  }

  // Si no cumple criterio y no tiene capas (OK)
  if (
    !hasLayers &&
    fileCount < THRESHOLD_FILES &&
    lineCount < THRESHOLD_LINES
  ) {
    console.log(`   ✅ Flat structure OK (below threshold)`);
  }

  // Si tiene capas y cumple criterio (OK)
  if (
    hasLayers &&
    (fileCount >= THRESHOLD_FILES || lineCount >= THRESHOLD_LINES)
  ) {
    console.log(`   ✅ Layered structure OK (meets threshold)`);
  }

  // Validar que domain/ no tenga dependencias de infrastructure/
  if (hasLayers) {
    validateLayerDependencies(moduleName, modulePath);
  }
}

/**
 * Valida que domain/ no importe de infrastructure/
 */
function validateLayerDependencies(moduleName, modulePath) {
  const domainPath = path.join(modulePath, 'domain');

  if (!fs.existsSync(domainPath)) {
    console.log(
      `   ℹ️  INFO: Domain layer not found for module "${moduleName}". This may indicate a misconfiguration.`,
    );
    return;
  }

  const domainFiles = getAllTsFiles(domainPath);

  domainFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Skip comments (single-line and JSDoc)
      if (
        trimmedLine.startsWith('//') ||
        trimmedLine.startsWith('*') ||
        trimmedLine.startsWith('/*')
      ) {
        return;
      }

      // Detectar imports de infrastructure/ desde domain/ (regex más preciso)
      if (/from\s+['"][^'"]*infrastructure/.test(line)) {
        console.log(`   ❌ ERROR: Domain layer importing from infrastructure`);
        console.log(
          `      File: ${path.relative(modulePath, file)}:${index + 1}`,
        );
        console.log(`      Line: ${line.trim()}`);
        exitCode = 1;
      }

      // Detectar @InjectRepository en domain/ (debería estar solo en infrastructure/)
      if (line.includes('@InjectRepository')) {
        console.log(`   ❌ ERROR: @InjectRepository found in domain layer`);
        console.log(
          `      File: ${path.relative(modulePath, file)}:${index + 1}`,
        );
        console.log(
          `      This should only be in infrastructure/repositories/`,
        );
        exitCode = 1;
      }
    });
  });
}

/**
 * Obtiene todos los archivos .ts recursivamente
 */
function getAllTsFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir, { withFileTypes: true });
  let tsFiles = [];

  files.forEach((file) => {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      tsFiles = tsFiles.concat(getAllTsFiles(fullPath));
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.spec.ts')) {
      tsFiles.push(fullPath);
    }
  });

  return tsFiles;
}

/**
 * Valida todos los módulos
 */
function validateModules() {
  console.log('🏗️  Architecture Validation\n');
  console.log(`Thresholds:`);
  console.log(`  Files: ${THRESHOLD_FILES}`);
  console.log(`  Lines: ${THRESHOLD_LINES}`);
  console.log(`---`);

  if (!fs.existsSync(MODULES_DIR)) {
    console.log(`❌ ERROR: Modules directory not found: ${MODULES_DIR}`);
    process.exit(1);
  }

  const modules = fs.readdirSync(MODULES_DIR, { withFileTypes: true });

  modules.forEach((module) => {
    if (!module.isDirectory()) {
      return;
    }

    const modulePath = path.join(MODULES_DIR, module.name);

    // Si es un módulo con submódulos (ej: tarot/), validar cada submódulo
    const subModules = fs.readdirSync(modulePath, { withFileTypes: true });
    const LAYER_DIRS = ['domain', 'application', 'infrastructure'];
    const hasSubModules = subModules.some(
      (sub) =>
        sub.isDirectory() &&
        !sub.name.startsWith('.') &&
        !LAYER_DIRS.includes(sub.name),
    );

    if (hasSubModules) {
      subModules.forEach((subModule) => {
        if (subModule.isDirectory() && !subModule.name.startsWith('.')) {
          const subModulePath = path.join(modulePath, subModule.name);
          validateModule(`${module.name}/${subModule.name}`, subModulePath);
        }
      });
    } else {
      validateModule(module.name, modulePath);
    }
  });

  console.log('\n---');

  if (exitCode === 0) {
    console.log('✅ Architecture validation passed!');
  } else {
    console.log('❌ Architecture validation failed!');
    console.log('See warnings/errors above.');
  }

  process.exit(exitCode);
}

// Ejecutar validación
validateModules();

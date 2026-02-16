const fs = require('fs');
const path = require('path');

// Definir aspectos imposibles según la tarea T-CA-051
const IMPOSSIBLE_ASPECTS = [
  // Sol-Mercurio (elongación máxima ~28°)
  { planet1: 'sun', planet2: 'mercury', aspects: ['sextile', 'square', 'trine', 'opposition'] },
  { planet1: 'mercury', planet2: 'sun', aspects: ['sextile', 'square', 'trine', 'opposition'] },
  
  // Sol-Venus (elongación máxima ~47°)
  { planet1: 'sun', planet2: 'venus', aspects: ['square', 'trine', 'opposition'] },
  { planet1: 'venus', planet2: 'sun', aspects: ['square', 'trine', 'opposition'] },
  
  // Mercurio-Venus
  { planet1: 'mercury', planet2: 'venus', aspects: ['trine', 'opposition'] },
  { planet1: 'venus', planet2: 'mercury', aspects: ['trine', 'opposition'] },
];

// Leer archivo de aspectos
const aspectsPath = path.join(__dirname, '../src/database/seeds/birth-chart/05-aspects.md');
const aspectsContent = fs.readFileSync(aspectsPath, 'utf-8');
const aspectsData = JSON.parse(aspectsContent);

// Buscar aspectos imposibles
const impossibleAspects = [];

aspectsData.aspects.forEach((aspect, index) => {
  const { planet1, planet2, aspect: aspectType } = aspect;
  
  IMPOSSIBLE_ASPECTS.forEach(impossible => {
    if (impossible.planet1 === planet1 && 
        impossible.planet2 === planet2 && 
        impossible.aspects.includes(aspectType)) {
      impossibleAspects.push({
        index,
        planet1,
        planet2,
        aspect: aspectType,
        line: `Line ~${index * 6 + 3}` // Estimación de línea
      });
    }
  });
});

// Reportar resultados
console.log('\n🔍 ANÁLISIS DE ASPECTOS IMPOSIBLES EN 05-aspects.md');
console.log('='.repeat(60));

if (impossibleAspects.length === 0) {
  console.log('✅ No se encontraron aspectos astronómicamente imposibles.');
  console.log('   El archivo ya está limpio.');
} else {
  console.log(`❌ Se encontraron ${impossibleAspects.length} aspectos imposibles:\n`);
  
  impossibleAspects.forEach(asp => {
    console.log(`   • ${asp.planet1}-${asp.planet2} ${asp.aspect} (índice: ${asp.index})`);
  });
  
  console.log('\n⚠️  ACCIÓN REQUERIDA:');
  console.log('   Estos aspectos deben ser eliminados del archivo 05-aspects.md');
}

console.log('='.repeat(60));
console.log(`\nTotal de aspectos en archivo: ${aspectsData.aspects.length}`);
console.log(`Aspectos válidos: ${aspectsData.aspects.length - impossibleAspects.length}\n`);

process.exit(impossibleAspects.length > 0 ? 1 : 0);

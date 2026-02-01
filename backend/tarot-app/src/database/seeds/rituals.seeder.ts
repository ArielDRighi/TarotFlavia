import { DataSource } from 'typeorm';
import { Ritual } from '../../modules/rituals/entities/ritual.entity';
import { RitualStep } from '../../modules/rituals/entities/ritual-step.entity';
import { RitualMaterial } from '../../modules/rituals/entities/ritual-material.entity';
import { RITUALS_SEED_DATA } from './data/rituals-seed.data';

/**
 * Seed Rituals - Rituales Espirituales Completos
 * Puebla la base de datos con rituales iniciales incluyendo pasos y materiales
 *
 * Features:
 * - Idempotente: Se puede ejecutar múltiples veces sin duplicar
 * - Rituales completos con pasos detallados y materiales necesarios
 * - Validación de calidad de contenido
 * - Incluye rituales lunares, limpieza energética y tarot
 */
export async function seedRituals(dataSource: DataSource): Promise<void> {
  console.log('🌙 Iniciando seed de rituales...');

  const ritualRepository = dataSource.getRepository(Ritual);
  const stepRepository = dataSource.getRepository(RitualStep);
  const materialRepository = dataSource.getRepository(RitualMaterial);

  // Verificar si ya existen rituales (idempotencia)
  const existingRitualsCount = await ritualRepository.count();
  if (existingRitualsCount > 0) {
    console.log(
      `✅ Rituales ya poblados (${existingRitualsCount} rituales encontrados). Saltando...`,
    );
    return;
  }

  console.log(`📦 Insertando ${RITUALS_SEED_DATA.length} rituales...`);

  // Insertar rituales con sus materiales y pasos
  for (const ritualData of RITUALS_SEED_DATA) {
    const { materials, steps, ...ritualFields } = ritualData;

    // Validar contenido del ritual
    validateRitualContent(ritualData);

    // Crear ritual
    const ritual = ritualRepository.create({
      ...ritualFields,
      isActive: true,
      isFeatured: ritualData.isFeatured || false,
      completionCount: 0,
      viewCount: 0,
    });

    const savedRitual = await ritualRepository.save(ritual);

    // Crear materiales
    for (const materialData of materials) {
      const material = materialRepository.create({
        ...materialData,
        ritualId: savedRitual.id,
        quantity: materialData.quantity || 1,
      });
      await materialRepository.save(material);
    }

    // Crear pasos
    for (const stepData of steps) {
      const step = stepRepository.create({
        ...stepData,
        ritualId: savedRitual.id,
      });
      await stepRepository.save(step);
    }

    console.log(
      `  ✓ ${ritual.title} (${materials.length} materiales, ${steps.length} pasos)`,
    );
  }

  // Estadísticas finales
  const totalRituals = await ritualRepository.count();
  const totalMaterials = await materialRepository.count();
  const totalSteps = await stepRepository.count();

  // Contar por categoría
  const ritualsByCategory = await ritualRepository
    .createQueryBuilder('ritual')
    .select('ritual.category', 'category')
    .addSelect('COUNT(ritual.id)', 'count')
    .groupBy('ritual.category')
    .getRawMany();

  console.log('\n✅ Seed de rituales completado exitosamente!');
  console.log(`   Total rituales: ${totalRituals}`);
  console.log(`   Total materiales: ${totalMaterials}`);
  console.log(`   Total pasos: ${totalSteps}`);
  console.log('\n   Distribución por categoría:');
  ritualsByCategory.forEach(({ category, count }) => {
    console.log(`     - ${category}: ${count} ritual(es)`);
  });
}

/**
 * Valida que un ritual tenga contenido completo y de calidad
 * Lanza error si falta información crítica
 */
interface StepWithNumber {
  stepNumber: number;
}

interface StepWithContent {
  title?: string;
  description?: string;
}

interface MaterialData {
  name: string;
  type: string;
}

function validateRitualContent(ritualData: {
  title: string;
  description: string;
  purpose: string;
  materials: MaterialData[];
  steps: unknown[];
  slug: string;
}): void {
  const errors: string[] = [];

  // Validar campos requeridos
  if (!ritualData.title || ritualData.title.trim().length < 5) {
    errors.push(
      `Título faltante o muy corto (mín 5 chars, actual: ${ritualData.title?.length || 0})`,
    );
  }

  if (!ritualData.description || ritualData.description.trim().length < 50) {
    errors.push(
      `Descripción faltante o muy corta (mín 50 chars, actual: ${ritualData.description?.length || 0})`,
    );
  }

  if (!ritualData.purpose || ritualData.purpose.trim().length < 30) {
    errors.push(
      `Propósito faltante o muy corto (mín 30 chars, actual: ${ritualData.purpose?.length || 0})`,
    );
  }

  // Validar materiales
  if (!ritualData.materials || ritualData.materials.length === 0) {
    errors.push('No hay materiales definidos');
  }

  // Validar pasos
  if (!ritualData.steps || ritualData.steps.length === 0) {
    errors.push('No hay pasos definidos');
  } else {
    // Validar que los pasos estén numerados secuencialmente
    const stepNumbers = ritualData.steps
      .map((s) => (s as StepWithNumber).stepNumber)
      .sort();
    for (let i = 0; i < stepNumbers.length; i++) {
      if (stepNumbers[i] !== i + 1) {
        errors.push(
          `Numeración de pasos incorrecta: esperado ${i + 1}, encontrado ${stepNumbers[i]}`,
        );
        break;
      }
    }

    // Validar que cada paso tenga título y descripción
    ritualData.steps.forEach((step, index) => {
      const typedStep = step as StepWithContent;

      if (!typedStep.title || typedStep.title.trim().length < 3) {
        errors.push(
          `Paso ${index + 1}: título faltante o muy corto (mín 3 chars)`,
        );
      }
      if (!typedStep.description || typedStep.description.trim().length < 20) {
        errors.push(
          `Paso ${index + 1}: descripción faltante o muy corta (mín 20 chars)`,
        );
      }
    });
  }

  // Validar slug
  if (!ritualData.slug || !/^[a-z0-9-]+$/.test(ritualData.slug)) {
    errors.push(
      `Slug inválido: debe contener solo letras minúsculas, números y guiones (actual: "${ritualData.slug}")`,
    );
  }

  // Si hay errores, lanzar excepción
  if (errors.length > 0) {
    throw new Error(
      `Ritual "${ritualData.title}" tiene contenido incompleto:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }
}

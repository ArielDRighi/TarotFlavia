import { Repository } from 'typeorm';
import { ReadingCategory } from '../../modules/categories/entities/reading-category.entity';

/**
 * Reading Categories Data
 * Defines the 6 predefined categories for tarot readings
 */
const READING_CATEGORIES_DATA = [
  {
    name: 'Amor y Relaciones',
    slug: 'amor-relaciones',
    description:
      'Consultas sobre amor, relaciones de pareja, vínculos afectivos y conexiones románticas. Descubre el camino de tu corazón.',
    icon: '❤️',
    color: '#FF6B9D',
    order: 1,
    isActive: true,
  },
  {
    name: 'Carrera y Trabajo',
    slug: 'carrera-trabajo',
    description:
      'Guía sobre tu carrera profesional, oportunidades laborales, proyectos y desarrollo en el ámbito del trabajo.',
    icon: '💼',
    color: '#4A90E2',
    order: 2,
    isActive: true,
  },
  {
    name: 'Dinero y Finanzas',
    slug: 'dinero-finanzas',
    description:
      'Orientación sobre dinero, finanzas personales, inversiones y abundancia material. Claridad en tus decisiones económicas.',
    icon: '💰',
    color: '#F5A623',
    order: 3,
    isActive: true,
  },
  {
    name: 'Energía y Bienestar',
    slug: 'salud-bienestar',
    description:
      'Consultas sobre energía, bienestar emocional y equilibrio en tu vida. El tarot como guía para tu bienestar integral.',
    // T-SEO-013: el ícono de hospital era la misma señal YMYL que el nombre.
    icon: '🌿',
    color: '#7ED321',
    order: 4,
    isActive: true,
  },
  {
    name: 'Crecimiento Espiritual',
    slug: 'crecimiento-espiritual',
    description:
      'Exploración espiritual, autoconocimiento, propósito de vida y desarrollo personal. Descubre tu camino interior.',
    icon: '✨',
    color: '#9013FE',
    order: 5,
    isActive: true,
  },
  {
    name: 'Consulta General',
    slug: 'consulta-general',
    description:
      'Lectura general para obtener orientación sobre múltiples aspectos de tu vida. Ideal cuando buscas una visión amplia.',
    icon: '🌟',
    color: '#50E3C2',
    order: 6,
    isActive: true,
  },
];

/**
 * Seed Reading Categories
 * This seeder populates the database with the 6 predefined reading categories
 *
 * Features:
 * - Idempotent: Can be run multiple times without duplicating data
 * - Each category includes icon, color, description, and display order
 * - All categories start as active (isActive: true)
 */
export async function seedReadingCategories(
  categoryRepository: Repository<ReadingCategory>,
): Promise<void> {
  console.log('📚 Starting Reading Categories seeding process...');

  // Check if categories already exist (idempotency)
  const existingCategoriesCount = await categoryRepository.count();
  if (existingCategoriesCount > 0) {
    console.log(
      `✅ Categories already seeded (found ${existingCategoriesCount} category/categories). Skipping...`,
    );
    return;
  }

  // Create category entities from data
  const categories = READING_CATEGORIES_DATA.map((data) => {
    const category = new ReadingCategory();
    category.name = data.name;
    category.slug = data.slug;
    category.description = data.description;
    category.icon = data.icon;
    category.color = data.color;
    category.order = data.order;
    category.isActive = data.isActive;
    return category;
  });

  // Save all categories
  console.log(`💾 Saving ${categories.length} categories...`);
  await categoryRepository.save(categories);

  console.log('✅ Successfully seeded 6 categories!');
  console.log('   Categories:');
  READING_CATEGORIES_DATA.forEach((cat) => {
    console.log(`   ${cat.icon} ${cat.name} (order: ${cat.order})`);
  });
}

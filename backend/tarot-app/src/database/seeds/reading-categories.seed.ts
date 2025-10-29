import { DataSource } from 'typeorm';
import { ReadingCategory } from '../../modules/categories/entities/reading-category.entity';

export async function seedReadingCategories(
  dataSource: DataSource,
): Promise<void> {
  const categoryRepository = dataSource.getRepository(ReadingCategory);

  // Verificar si ya existen categorías
  const existingCount = await categoryRepository.count();
  if (existingCount > 0) {
    console.log('✅ Reading categories already seeded');
    return;
  }

  const categories = [
    {
      name: 'Amor y Relaciones',
      slug: 'amor',
      description:
        'Consultas sobre amor, relaciones de pareja, vínculos afectivos y compatibilidad sentimental',
      icon: '❤️',
      color: '#FF6B9D',
      order: 1,
      isActive: true,
    },
    {
      name: 'Trabajo y Carrera',
      slug: 'trabajo',
      description:
        'Orientación profesional, oportunidades laborales, desarrollo de carrera y decisiones de negocios',
      icon: '💼',
      color: '#4A90E2',
      order: 2,
      isActive: true,
    },
    {
      name: 'Dinero y Finanzas',
      slug: 'dinero',
      description:
        'Situación financiera, inversiones, abundancia económica y prosperidad material',
      icon: '💰',
      color: '#F5A623',
      order: 3,
      isActive: true,
    },
    {
      name: 'Salud y Bienestar',
      slug: 'salud',
      description:
        'Bienestar físico, salud emocional, energía vital y equilibrio personal',
      icon: '🌿',
      color: '#7ED321',
      order: 4,
      isActive: true,
    },
    {
      name: 'Espiritual y Crecimiento',
      slug: 'espiritual',
      description:
        'Desarrollo espiritual, propósito de vida, autoconocimiento y evolución personal',
      icon: '✨',
      color: '#9013FE',
      order: 5,
      isActive: true,
    },
    {
      name: 'General',
      slug: 'general',
      description:
        'Consultas generales, orientación sobre situaciones cotidianas y perspectiva amplia',
      icon: '🔮',
      color: '#50E3C2',
      order: 6,
      isActive: true,
    },
  ];

  await categoryRepository.save(categories);
  console.log('✅ Reading categories seeded successfully');
}

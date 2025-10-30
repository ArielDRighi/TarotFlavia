import { Repository } from 'typeorm';
import { PredefinedQuestion } from '../../modules/predefined-questions/entities/predefined-question.entity';
import { ReadingCategory } from '../../modules/categories/entities/reading-category.entity';
import { ALL_PREDEFINED_QUESTIONS } from './data/predefined-questions.data';

/**
 * Seed Predefined Questions - 42 Questions Across 6 Categories
 * This seeder populates the database with curated predefined questions
 * for each reading category to facilitate user experience for free tier users.
 *
 * Distribution:
 * - Amor y Relaciones: 8 questions
 * - Trabajo y Carrera: 8 questions
 * - Dinero y Finanzas: 7 questions
 * - Salud y Bienestar: 6 questions
 * - Espiritual y Crecimiento: 7 questions
 * - General: 6 questions
 *
 * Features:
 * - Idempotent: Can be run multiple times without duplicating data
 * - Validates category existence before seeding
 * - All questions start with isActive: true
 * - Proper ordering within each category (general to specific)
 */
export async function seedPredefinedQuestions(
  questionRepository: Repository<PredefinedQuestion>,
  categoryRepository: Repository<ReadingCategory>,
): Promise<void> {
  console.log('💬 Starting Predefined Questions seeding process...');

  // Check if categories exist
  const categoryCount = await categoryRepository.count();
  if (categoryCount === 0) {
    throw new Error(
      'Cannot seed predefined questions: no categories exist. Please run category seeder first.',
    );
  }

  // Check if questions already exist (idempotency)
  const existingQuestionsCount = await questionRepository.count();
  if (existingQuestionsCount > 0) {
    console.log(
      `✅ Predefined questions already seeded (found ${existingQuestionsCount} questions). Skipping...`,
    );
    return;
  }

  // Load all categories with their IDs
  const categories = await categoryRepository.find();
  const categoryMap = new Map<string, number>();
  categories.forEach((cat) => {
    categoryMap.set(cat.slug, cat.id);
  });

  console.log(`📦 Found ${categories.length} categories`);

  // Prepare questions data
  const questionsToSeed: PredefinedQuestion[] = [];

  for (const questionData of ALL_PREDEFINED_QUESTIONS) {
    const categoryId = categoryMap.get(questionData.categorySlug);

    if (!categoryId) {
      console.warn(
        `⚠️  Skipping question: category '${questionData.categorySlug}' not found`,
      );
      continue;
    }

    const question = new PredefinedQuestion();
    question.categoryId = categoryId;
    question.questionText = questionData.questionText;
    question.order = questionData.order;
    question.isActive = true;
    question.usageCount = 0;

    questionsToSeed.push(question);
  }

  // Validate minimum question count
  if (questionsToSeed.length < 30) {
    throw new Error(
      `Invalid question count: expected at least 30, got ${questionsToSeed.length}`,
    );
  }

  // Count questions per category for logging
  const questionsPerCategory: { [key: string]: number } = {};
  categories.forEach((cat) => {
    const count = questionsToSeed.filter((q) => q.categoryId === cat.id).length;
    questionsPerCategory[cat.name] = count;
  });

  console.log('📊 Question distribution:');
  Object.entries(questionsPerCategory).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} questions`);
  });
  console.log(`   • TOTAL: ${questionsToSeed.length} questions`);

  // Save all questions in a single transaction
  console.log('💾 Saving questions to database...');
  await questionRepository.save(questionsToSeed);

  console.log(
    `✅ Successfully seeded ${questionsToSeed.length} predefined questions!`,
  );
}

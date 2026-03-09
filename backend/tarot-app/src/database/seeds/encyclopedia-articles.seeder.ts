import { DataSource } from 'typeorm';
import { EncyclopediaArticle } from '../../modules/encyclopedia/entities/encyclopedia-article.entity';
import {
  ALL_ARTICLES_DATA,
  ArticleSeedData,
  TOTAL_ARTICLES,
} from '../../modules/encyclopedia/data/articles-seed.data';

/**
 * Seed Artículos de la Enciclopedia Mística
 *
 * Puebla la base de datos con todos los artículos de la enciclopedia:
 * - 12 Signos zodiacales
 * - 10 Planetas
 * - 12 Casas astrológicas
 *  -  4 Elementos
 *  -  3 Modalidades
 *  -  6 Guías de actividades
 *
 * Features:
 * - Idempotente: se puede ejecutar múltiples veces sin duplicar datos
 * - Validación de contenido mínimo por artículo
 */
export async function seedEncyclopediaArticles(
  dataSource: DataSource,
): Promise<void> {
  console.log('📚 Iniciando seed de artículos de la Enciclopedia Mística...');

  const articleRepository = dataSource.getRepository(EncyclopediaArticle);

  // Verificar si ya existen artículos (idempotencia)
  const existingCount = await articleRepository.count();
  if (existingCount > 0) {
    console.log(
      `✅ Artículos de la enciclopedia ya poblados (${existingCount} artículos encontrados). Saltando...`,
    );
    return;
  }

  console.log(
    `📦 Insertando ${TOTAL_ARTICLES} artículos de la enciclopedia...`,
  );

  // Validar y construir entidades
  const articles = ALL_ARTICLES_DATA.map((articleData: ArticleSeedData) => {
    validateArticleContent(articleData);
    return articleRepository.create({
      slug: articleData.slug,
      nameEs: articleData.nameEs,
      nameEn: articleData.nameEn ?? null,
      category: articleData.category,
      snippet: articleData.snippet,
      content: articleData.content,
      metadata: articleData.metadata ?? null,
      relatedArticles: articleData.relatedArticles ?? null,
      relatedTarotCards: articleData.relatedTarotCards ?? null,
      imageUrl: null,
      sortOrder: articleData.sortOrder,
      viewCount: 0,
    });
  });

  await articleRepository.save(articles);

  const totalInserted = await articleRepository.count();
  console.log(
    '\n✅ Seed de artículos de la enciclopedia completado exitosamente!',
  );
  console.log(`   Total artículos insertados: ${TOTAL_ARTICLES}`);
  console.log(`   Total artículos en BD: ${totalInserted}`);
}

/**
 * Valida que un artículo tenga contenido mínimo requerido.
 * Lanza error si falta información crítica.
 */
function validateArticleContent(articleData: ArticleSeedData): void {
  const errors: string[] = [];

  if (!articleData.slug || !/^[a-z0-9-]+$/.test(articleData.slug)) {
    errors.push(
      `Slug inválido: debe contener solo letras minúsculas, números y guiones (actual: "${articleData.slug}")`,
    );
  }

  if (!articleData.nameEs || articleData.nameEs.trim().length < 2) {
    errors.push('Nombre en español faltante o muy corto');
  }

  if (!articleData.snippet || articleData.snippet.trim().length === 0) {
    errors.push('Snippet faltante o vacío');
  }

  if (articleData.snippet && articleData.snippet.length > 400) {
    errors.push(
      `Snippet demasiado largo (máx 400 chars, actual: ${articleData.snippet.length})`,
    );
  }

  if (!articleData.content || articleData.content.trim().length === 0) {
    errors.push('Contenido (content) faltante o vacío');
  }

  if (errors.length > 0) {
    throw new Error(
      `Artículo "${articleData.nameEs}" (slug: ${articleData.slug}) tiene contenido incompleto:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }
}

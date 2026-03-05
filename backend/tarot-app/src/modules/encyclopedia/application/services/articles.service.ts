import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EncyclopediaArticle } from '../../entities/encyclopedia-article.entity';
import { ArticleCategory } from '../../enums/article.enums';
import {
  ArticleDetailDto,
  ArticleSnippetDto,
  ArticleSummaryDto,
} from '../dto/article-response.dto';

/**
 * Servicio de Artículos de la Enciclopedia Mística
 *
 * Gestiona la consulta de artículos de contenido no-tarot: signos zodiacales,
 * planetas, casas astrales, elementos, modalidades y guías de actividades.
 *
 * Patrón fire-and-forget para incrementViewCount: no bloquea la respuesta.
 *
 * Acceso público — sin restricciones de plan de usuario.
 */
@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(EncyclopediaArticle)
    private readonly articleRepository: Repository<EncyclopediaArticle>,
  ) {}

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Retorna el snippet de un artículo sin incluir el campo `content`.
   * Optimizado para el widget "Ver más" de los módulos.
   * @throws NotFoundException si el slug no existe
   */
  async getSnippetBySlug(slug: string): Promise<ArticleSnippetDto> {
    const article = await this.articleRepository
      .createQueryBuilder('article')
      .select([
        'article.id',
        'article.slug',
        'article.nameEs',
        'article.category',
        'article.snippet',
      ])
      .andWhere('article.slug = :slug', { slug })
      .getOne();

    if (!article) {
      throw new NotFoundException(`Artículo "${slug}" no encontrado`);
    }

    return this.toSnippetDto(article);
  }

  /**
   * Retorna el detalle completo de un artículo por su slug.
   * Incluye el campo `content` (Markdown) y resuelve los artículos relacionados.
   * Incrementa el contador de vistas (fire-and-forget).
   * @throws NotFoundException si el slug no existe
   */
  async findBySlug(slug: string): Promise<ArticleDetailDto> {
    const article = await this.articleRepository.findOne({ where: { slug } });

    if (!article) {
      throw new NotFoundException(`Artículo "${slug}" no encontrado`);
    }

    this.incrementViewCount(article.id);

    const relatedArticles = await this.findRelated(
      article.relatedArticles ?? [],
    );

    return this.toDetailDto(article, relatedArticles);
  }

  /**
   * Retorna todos los artículos de una categoría ordenados por sortOrder.
   */
  async findByCategory(
    category: ArticleCategory,
  ): Promise<ArticleSummaryDto[]> {
    const articles = await this.articleRepository
      .createQueryBuilder('article')
      .select([
        'article.id',
        'article.slug',
        'article.nameEs',
        'article.category',
        'article.snippet',
        'article.imageUrl',
        'article.sortOrder',
      ])
      .andWhere('article.category = :category', { category })
      .orderBy('article.sortOrder', 'ASC')
      .getMany();

    return articles.map((a) => this.toSummaryDto(a));
  }

  /**
   * Busca artículos por término en nombre español y snippet (case-insensitive).
   * Retorna array vacío si el término tiene menos de 2 caracteres.
   */
  async search(term: string): Promise<ArticleSummaryDto[]> {
    if (!term || term.length < 2) {
      return [];
    }

    const articles = await this.articleRepository
      .createQueryBuilder('article')
      .select([
        'article.id',
        'article.slug',
        'article.nameEs',
        'article.category',
        'article.snippet',
        'article.imageUrl',
        'article.sortOrder',
      ])
      .andWhere('(article.nameEs ILIKE :term OR article.snippet ILIKE :term)', {
        term: `%${term}%`,
      })
      .orderBy('article.sortOrder', 'ASC')
      .getMany();

    return articles.map((a) => this.toSummaryDto(a));
  }

  /**
   * Resuelve un array de slugs a ArticleSummaryDto.
   * Retorna array vacío si no se proveen slugs.
   * Usado internamente para resolver relatedArticles en findBySlug.
   */
  async findRelated(slugs: string[]): Promise<ArticleSummaryDto[]> {
    if (!slugs || slugs.length === 0) {
      return [];
    }

    const articles = await this.articleRepository.find({
      where: { slug: In(slugs) },
    });

    return articles.map((a) => this.toSummaryDto(a));
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  /**
   * Incrementa el view_count del artículo sin bloquear la respuesta.
   * Fire-and-forget: los errores se silencian intencionalmente.
   */
  private incrementViewCount(id: number): void {
    this.articleRepository.increment({ id }, 'viewCount', 1).catch(() => {
      /* silencioso — no bloquea la respuesta al usuario */
    });
  }

  /**
   * Mapea una entidad parcial a ArticleSnippetDto (sin content)
   */
  private toSnippetDto(article: EncyclopediaArticle): ArticleSnippetDto {
    return {
      id: article.id,
      slug: article.slug,
      nameEs: article.nameEs,
      category: article.category,
      snippet: article.snippet,
    };
  }

  /**
   * Mapea una entidad parcial a ArticleSummaryDto (sin content)
   */
  private toSummaryDto(article: EncyclopediaArticle): ArticleSummaryDto {
    return {
      id: article.id,
      slug: article.slug,
      nameEs: article.nameEs,
      category: article.category,
      snippet: article.snippet,
      imageUrl: article.imageUrl,
      sortOrder: article.sortOrder,
    };
  }

  /**
   * Mapea una entidad completa a ArticleDetailDto (incluye content y relaciones)
   */
  private toDetailDto(
    article: EncyclopediaArticle,
    relatedArticles: ArticleSummaryDto[],
  ): ArticleDetailDto {
    return {
      ...this.toSummaryDto(article),
      nameEn: article.nameEn,
      content: article.content,
      metadata: article.metadata,
      relatedArticles,
      relatedTarotCards: article.relatedTarotCards,
    };
  }
}

import { ChineseHoroscope } from '../../entities/chinese-horoscope.entity';
import { ChineseZodiacAnimal } from '../../../../common/utils/chinese-zodiac.utils';

/**
 * Repository interface for ChineseHoroscope entity.
 * Defines the contract for data persistence operations.
 *
 * Note: This interface will be implemented in TASK-113 (ChineseHoroscopeService)
 * when the repository layer is added to the infrastructure layer.
 */
export interface IChineseHoroscopeRepository {
  /**
   * Finds a horoscope by animal and year.
   * @param animal - The Chinese zodiac animal
   * @param year - The year (e.g., 2026)
   * @returns The horoscope if found, null otherwise
   */
  findByAnimalAndYear(
    animal: ChineseZodiacAnimal,
    year: number,
  ): Promise<ChineseHoroscope | null>;

  /**
   * Finds all horoscopes for a specific year.
   * @param year - The year (e.g., 2026)
   * @returns Array of horoscopes for the year
   */
  findByYear(year: number): Promise<ChineseHoroscope[]>;

  /**
   * Creates a new horoscope.
   * @param horoscope - Partial horoscope data
   * @returns The created horoscope
   */
  create(horoscope: Partial<ChineseHoroscope>): Promise<ChineseHoroscope>;

  /**
   * Updates an existing horoscope.
   * @param id - The horoscope ID
   * @param horoscope - Partial horoscope data to update
   * @returns The updated horoscope
   */
  update(
    id: number,
    horoscope: Partial<ChineseHoroscope>,
  ): Promise<ChineseHoroscope>;

  /**
   * Increments the view count for a horoscope.
   * @param id - The horoscope ID
   */
  incrementViewCount(id: number): Promise<void>;
}

import { Injectable } from '@nestjs/common';

/**
 * Servicio para validar contenido de preguntas al péndulo
 *
 * Responsabilidades:
 * - Detectar contenido prohibido en preguntas escritas
 * - Categorizar el tipo de contenido bloqueado
 * - Proteger a usuarios de tomar decisiones riesgosas basadas en el péndulo
 *
 * Solo aplica a usuarios Premium que pueden escribir preguntas.
 */
@Injectable()
export class PendulumContentValidatorService {
  private readonly blockedTerms: string[] = [
    // Salud
    'enfermedad',
    'cáncer',
    'cancer',
    'muerte',
    'morir',
    'muero',
    'muere',
    'suicidio',
    'suicidar',
    'suicida',
    'suicid',
    'diagnóstico',
    'diagnostico',
    'tratamiento',
    'medicamento',
    'medicina',
    'tumor',
    'terminal',
    'aborto',
    // Legal
    'juicio',
    'demanda',
    'cárcel',
    'carcel',
    'arresto',
    'arrestar',
    'arrest',
    'sentencia',
    'abogado',
    'prisión',
    'prision',
    'delito',
    'crimen',
    // Financiero
    'inversión',
    'inversion',
    'criptomoneda',
    'bitcoin',
    'crypto',
    'apuesta',
    'apostar',
    'lotería',
    'loteria',
    'casino',
    'trading',
    // Violencia
    'matar',
    'herir',
    'dañar',
    'danar',
    'venganza',
    'violencia',
    'golpear',
  ];

  /**
   * Valida si una pregunta contiene contenido prohibido
   * @param question - Pregunta del usuario (puede ser null/undefined)
   * @returns Objeto con isValid y blockedCategory (si aplica)
   */
  validateQuestion(question: string | null | undefined): {
    isValid: boolean;
    blockedCategory?: string;
  } {
    // Preguntas vacías o nulas son válidas (consulta mental)
    if (!question) {
      return { isValid: true };
    }

    // Normalizar: lowercase y remover acentos
    const normalizedQuestion = question
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Verificar cada término bloqueado
    for (const term of this.blockedTerms) {
      const normalizedTerm = term
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (normalizedQuestion.includes(normalizedTerm)) {
        return {
          isValid: false,
          blockedCategory: this.getCategoryForTerm(term),
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Determina la categoría de un término bloqueado
   * @param term - Término bloqueado encontrado
   * @returns Categoría del término
   * @private
   */
  private getCategoryForTerm(term: string): string {
    const healthTerms = [
      'enfermedad',
      'cáncer',
      'cancer',
      'muerte',
      'morir',
      'muero',
      'muere',
      'suicidio',
      'suicidar',
      'suicida',
      'suicid',
      'diagnóstico',
      'diagnostico',
      'tratamiento',
      'medicamento',
      'medicina',
      'tumor',
      'terminal',
      'aborto',
    ];
    const legalTerms = [
      'juicio',
      'demanda',
      'cárcel',
      'carcel',
      'arresto',
      'arrestar',
      'arrest',
      'sentencia',
      'abogado',
      'prisión',
      'prision',
      'delito',
      'crimen',
    ];
    const financialTerms = [
      'inversión',
      'inversion',
      'criptomoneda',
      'bitcoin',
      'crypto',
      'apuesta',
      'apostar',
      'lotería',
      'loteria',
      'casino',
      'trading',
    ];

    // Buscar coincidencia exacta o parcial en cada categoría
    for (const t of healthTerms) {
      if (term.includes(t) || t.includes(term)) {
        return 'salud';
      }
    }
    for (const t of legalTerms) {
      if (term.includes(t) || t.includes(term)) {
        return 'legal';
      }
    }
    for (const t of financialTerms) {
      if (term.includes(t) || t.includes(term)) {
        return 'financiero';
      }
    }
    return 'contenido sensible';
  }
}

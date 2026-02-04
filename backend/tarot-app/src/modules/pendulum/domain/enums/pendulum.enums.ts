/**
 * Enums del módulo Péndulo Digital
 */

/**
 * Tipos de respuesta del péndulo
 */
export enum PendulumResponse {
  YES = 'yes',
  NO = 'no',
  MAYBE = 'maybe',
}

/**
 * Tipos de movimiento del péndulo (para animaciones frontend)
 */
export enum PendulumMovement {
  VERTICAL = 'vertical', // Adelante-atrás (Sí)
  HORIZONTAL = 'horizontal', // Izquierda-derecha (No)
  CIRCULAR = 'circular', // Movimiento circular (Quizás)
}

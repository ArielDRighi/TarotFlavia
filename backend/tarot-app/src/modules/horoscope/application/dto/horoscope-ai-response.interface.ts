/**
 * Interfaz para el resultado parseado de la respuesta de la IA
 * Representa la estructura JSON que esperamos recibir del modelo
 */
export interface HoroscopeAIResponse {
  generalContent: string;
  areas: {
    love: {
      content: string;
      score: number;
    };
    wellness: {
      content: string;
      score: number;
    };
    money: {
      content: string;
      score: number;
    };
  };
  luckyNumber: number;
  luckyColor: string;
  luckyTime: string;
}

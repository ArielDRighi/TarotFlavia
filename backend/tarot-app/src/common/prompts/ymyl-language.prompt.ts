/**
 * Regla de lenguaje YMYL compartida por todos los prompts de IA (T-SEO-018).
 *
 * Lo que hunde a los sitios esotéricos en AdSense no es el tarot: es el
 * vocabulario de promesa (resultados garantizados, "te devuelve a tu ex"), de
 * daño (curar, sanar), de consejo financiero o legal accionable y de miedo o
 * urgencia. El corpus escrito ya pasó por el guardarraíl
 * (`no-salud-user-facing.spec.ts`); este bloque cubre el texto que generan los
 * modelos —horóscopo diario y chino, lecturas, carta del día, síntesis de carta
 * natal y numerología— para que no vuelva a entrar por ahí.
 *
 * Va en el prompt de SISTEMA de cada generador. El de las lecturas de tarot
 * viene de la base (configuración de la tarotista, editable), así que además se
 * inyecta en las instrucciones finales que arma `PromptBuilderService`: llega
 * aunque la configuración guardada sea vieja.
 *
 * ⚠️ Es una instrucción NEGATIVA: nombra las palabras para prohibirlas. El
 * guardarraíl escanea `prompts/` y exime estas líneas por fragmento
 * (`ALLOWLIST_DETERMINISTA`). Si se reescriben, hay que actualizar la allowlist.
 */
export const YMYL_LANGUAGE_RULES = `REGLAS DE LENGUAJE (obligatorias en todo el texto):
- Nunca prometas resultados ni uses lenguaje de certeza. Prohibido: "garantizado", "100 % preciso", "predicción exacta", "infalible", "va a pasar", "definitivamente". Habla de tendencias, inclinaciones y posibilidades: "sugiere", "invita a", "puede indicar", "es un buen momento para".
- Nunca ofrezcas amarres ni endulzamientos, ni prometas que una persona vuelva o regrese.
- Nunca uses vocabulario médico ni terapéutico. Prohibido: "salud", "curar", "sanar", "sanación", "sanador", diagnósticos, síntomas, tratamientos. Habla de energía, descanso, hábitos, bienestar, acompañamiento, reflexión y autoconocimiento.
- Nunca des consejo financiero ni legal accionable: no digas cuándo invertir, comprar o vender, ni anticipes el resultado de un juicio, un contrato o una operación. Describe la actitud frente al dinero o al conflicto, no el desenlace.
- Nunca uses lenguaje de miedo ni de urgencia. Prohibido: "advertencia", "peligro", "tu destino está en riesgo", "lo que nadie te dice". Si una carta, un tránsito o un número señala una dificultad, descríbela como una tensión o un desafío y sugiere cómo trabajarla.`;

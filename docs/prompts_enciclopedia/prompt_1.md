export const MAJOR_ARCANA_RELATIONS: Record<string, number[]> = {
'the-fool': [2, 13, 17, 22],
// 2: El Mago (potencial vs. acción encarnada), 13: El Colgado (movimiento libre vs. suspensión mística), 17: La Torre (el salto al vacío y el caos), 22: El Mundo (el Alfa y el Omega del viaje).

'the-magician': [1, 3, 6, 22],
// 1: El Loco (de la nada a la voluntad), 3: La Sacerdotisa (polaridad activo-masculina vs. pasivo-femenina), 6: El Hierofante (magia oculta vs. ortodoxia), 22: El Mundo (el dominio absoluto de los elementos).

'the-high-priestess': [2, 4, 6, 19],
// 2: El Mago (polaridad), 4: La Emperatriz (madre divina/celestial vs. madre terrenal), 6: El Hierofante (sabiduría esotérica vs. exotérica), 19: La Luna (el dominio del subconsciente y la intuición).

'the-empress': [3, 5, 18, 20],
// 3: La Sacerdotisa (arquetipos femeninos), 5: El Emperador (pareja creadora, naturaleza vs. estructura), 18: La Estrella (nutrición terrenal vs. cósmica), 20: El Sol (vitalidad, fertilidad y abundancia).

'the-emperor': [4, 6, 8, 17],
// 4: La Emperatriz (polaridad), 6: El Hierofante (poder temporal/material vs. poder espiritual), 8: El Carro (control, disciplina y conquista), 17: La Torre (la estructura rígida que puede desmoronarse).

'the-hierophant': [2, 3, 5, 16],
// 2: El Mago (magia divina vs personal), 3: La Sacerdotisa (ley revelada vs oculta), 5: El Emperador (autoridad), 16: El Diablo (dogma ciego vs. liberación tabú/esclavitud).

'the-lovers': [8, 15, 16, 20],
// 8: El Carro (armonía interna antes de la acción externa), 15: La Templanza (la mezcla perfecta de opuestos), 16: El Diablo (el amor divino/libre albedrío vs. tentación/apego), 20: El Sol (la unión iluminada).

'the-chariot': [5, 7, 9, 11, 17],
// 5: El Emperador (expansión del imperio), 7: Los Enamorados (decisión tomada, movimiento), 9: La Fuerza (control externo vs. dominio interno), 11: La Rueda (avance direccional vs. ciclos del destino), 17: La Torre (el triunfo desmedido que lleva a la caída).

'strength': [8, 10, 12, 16],
// 8: El Carro (fuerza moral vs. fuerza bélica), 10: El Ermitaño (vitalidad interior vs. retiro introspectivo), 12: La Justicia (balance compasivo vs. rigor kármico), 16: El Diablo (domar a la bestia interior vs. sucumbir a ella).

'the-hermit': [9, 11, 19, 21],
// 9: La Fuerza (fuerza interior), 11: La Rueda (el eje inmóvil en el centro del karma), 19: La Luna (buscar la luz en la oscuridad interior), 21: El Juicio (la evaluación solitaria antes del despertar).

'wheel-of-fortune': [8, 10, 12, 22],
// 8: El Carro (destino), 10: El Ermitaño (contemplación del ciclo), 12: La Justicia (causa y efecto, karma), 22: El Mundo (los ciclos universales y cósmicos).

'justice': [9, 11, 15, 21],
// 9: La Fuerza (ley moral), 11: La Rueda (equilibrio del karma), 15: La Templanza (la medida exacta vs. el equilibrio de los flujos), 21: El Juicio (la justicia terrenal vs. el veredicto divino/absoluto).

'the-hanged-man': [1, 14, 15, 21],
// 1: El Loco (caos vs. estancamiento), 14: La Muerte (rendición antes de la transformación), 15: La Templanza (el cambio de perspectiva que sana), 21: El Juicio (esperar la llamada de la redención).

'death': [13, 15, 16, 17],
// 13: El Colgado (sacrificio previo al fin), 15: La Templanza (la renovación que sigue a la poda), 16: El Diablo (la mortalidad y la prisión material), 17: La Torre (destrucción natural e inevitable vs. destrucción súbita y violenta).

'temperance': [7, 12, 13, 14, 18],
// 7: Los Enamorados (unión), 12: La Justicia (equilibrio de opuestos), 13: El Colgado (visión alterada), 14: La Muerte (sanación tras el luto), 18: La Estrella (purificación del agua, flujo de energía).

'the-devil': [6, 7, 9, 14, 17],
// 6: El Hierofante (falsa religión/materialismo), 7: Los Enamorados (esclavitud vs. elección), 9: La Fuerza (instinto desbocado), 14: La Muerte (putrefacción material), 17: La Torre (la cadena que requiere una crisis para romperse).

'the-tower': [1, 5, 8, 14, 16],
// 1: El Loco (liberación abrupta), 5: El Emperador (colapso de estructuras), 8: El Carro (ego derrumbado), 14: La Muerte (destrucción), 16: El Diablo (ruptura de las cadenas materiales).

'the-star': [4, 15, 19, 20],
// 4: La Emperatriz (madre naturaleza celestial), 15: La Templanza (el vertido de aguas puras), 19: La Luna (la esperanza consciente vs. los temores subconscientes), 20: El Sol (progresión astrológica de la luz).

'the-moon': [3, 10, 18, 20],
// 3: La Sacerdotisa (inconsciente profundo), 10: El Ermitaño (camino en las sombras), 18: La Estrella (intuición), 20: El Sol (polaridad noche/día, ilusión vs. claridad absoluta).

'the-sun': [4, 7, 18, 19, 22],
// 4: La Emperatriz (vida), 7: Los Enamorados (gemelos/almas afines bajo la gracia), 18: La Estrella (luz cósmica), 19: La Luna (luz consciente vs luz refleja), 22: El Mundo (conciencia total antes de la integración).

'judgement': [10, 12, 13, 22],
// 10: El Ermitaño (despertar de la cueva interior), 12: La Justicia (el juicio final/cósmico), 13: El Colgado (renacer tras la suspensión), 22: El Mundo (la resurrección paso previo a la coronación cósmica).

'the-world': [1, 2, 11, 20, 21]
// 1: El Loco (el Ouroboros, fin y nuevo inicio), 2: El Mago (voluntad materializada por completo), 11: La Rueda (el ciclo cerrado y trascendido), 20: El Sol (gloria suprema), 21: El Juicio (consecuencia de la resurrección).
};

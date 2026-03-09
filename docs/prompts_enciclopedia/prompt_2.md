export const MINOR_ARCANA_RELATIONS: Record<string, number[]> = {
// --- BASTOS (Fuego / Voluntad / Acción) --- Regidos temáticamente por El Sol (20) y La Fuerza (9)
'ace-of-wands': [24, 37, 2, 20], // 24 (progresión), 37 (As de Copas: polaridad fuego/agua), 2 (Mago: chispa creadora), 20 (Sol: energía elemental pura).
'two-of-wands': [25, 66, 3, 22], // 25 (progresión), 66 (2 de Oros: malabarismo material), 3 (Sacerdotisa: espera), 22 (Mundo: contemplación global).
'three-of-wands': [26, 53, 4, 8], // 26 (progresión), 53 (3 de Espadas: contraste creación/destrucción), 4 (Emperatriz: gestación), 8 (Carro: movimiento hacia adelante).
'four-of-wands': [27, 68, 6, 20], // 27 (progresión), 68 (4 de Oros: estabilidad vs retención), 6 (Hierofante: rito/matrimonio), 20 (Sol: celebración).
'five-of-wands': [28, 55, 16, 17], // 28 (progresión), 55 (5 de Espadas: conflicto), 16 (Diablo: caos instintivo), 17 (Torre: choque de egos).
'six-of-wands': [29, 70, 7, 8], // 29 (progresión al desafío), 70 (6 de Oros: éxito material), 7 (Enamorados: alineación), 8 (Carro: victoria pública).
'seven-of-wands': [30, 57, 8, 10], // 30 (progresión al vuelo), 57 (7 de Espadas: táctica defensiva), 8 (Carro: control), 10 (Ermitaño: resistencia solitaria).
'eight-of-wands': [31, 58, 1, 11], // 31 (progresión al agotamiento), 58 (8 de Espadas: bloqueo vs rapidez), 1 (Loco: descenso rápido/aire), 11 (Rueda: eventos acelerados).
'nine-of-wands': [32, 59, 10, 17], // 32 (progresión a la carga final), 59 (9 de Espadas: paranoia), 10 (Ermitaño: heridas pasadas), 17 (Torre: actitud defensiva).
'ten-of-wands': [33, 60, 11, 16], // 33 (salto al Paje), 60 (10 de Espadas: ruina vs sobrecarga), 11 (Rueda: fin de ciclo), 16 (Diablo: opresión material).
'page-of-wands': [34, 47, 1, 20], // 34 (progresión), 47 (Paje de Copas: emociones incipientes), 1 (Loco: curiosidad explosiva), 20 (Sol: entusiasmo).
'knight-of-wands': [35, 62, 8, 17], // 35 (progresión), 62 (Caballo de Espadas: impulso aire/fuego), 8 (Carro: avance), 17 (Torre: energía temeraria).
'queen-of-wands': [36, 49, 4, 9], // 36 (progresión), 49 (Reina de Copas: intuición agua/fuego), 4 (Emperatriz: magnetismo), 9 (Fuerza: coraje felino).
'king-of-wands': [23, 50, 5, 20], // 23 (retorno al As), 50 (Rey de Copas: maestría agua/fuego), 5 (Emperador: liderazgo), 20 (Sol: carisma absoluto).

// --- COPAS (Agua / Emoción / Psique) --- Regidos temáticamente por La Luna (19) y La Sacerdotisa (3)
'ace-of-cups': [38, 23, 2, 19], // 38 (progresión), 23 (As de Bastos), 2 (Mago: canal psíquico), 19 (Luna: subconsciente puro).
'two-of-cups': [39, 24, 7, 15], // 39 (progresión), 24 (2 de Bastos: elección), 7 (Enamorados: unión afín), 15 (Templanza: alquimia de dos almas).
'three-of-cups': [40, 67, 4, 20], // 40 (progresión al hartazgo), 67 (3 de Oros: grupo de trabajo vs fiesta), 4 (Emperatriz: gracia), 20 (Sol: alegría compartida).
'four-of-cups': [41, 54, 10, 13], // 41 (progresión a la pérdida), 54 (4 de Espadas: reposo mental vs apatía), 10 (Ermitaño: introversión), 13 (Colgado: estancamiento).
'five-of-cups': [42, 55, 14, 19], // 42 (progresión a la nostalgia), 55 (5 de Espadas: derrota), 14 (Muerte: duelo/pérdida), 19 (Luna: melancolía profunda).
'six-of-cups': [43, 70, 20, 18], // 43 (progresión a la ilusión), 70 (6 de Oros: dar y recibir), 20 (Sol: infancia), 18 (Estrella: sanación y raíces).
'seven-of-cups': [44, 57, 19, 16], // 44 (progresión al abandono), 57 (7 de Espadas: astucia vs engaño), 19 (Luna: espejismos), 16 (Diablo: tentaciones múltiples).
'eight-of-cups': [45, 58, 10, 19], // 45 (progresión), 58 (8 de Espadas: atrape vs escape consciente), 10 (Ermitaño: viaje en solitario), 19 (Luna: búsqueda nocturna).
'nine-of-cups': [46, 73, 20, 11], // 46 (progresión), 73 (9 de Oros: independencia plena), 20 (Sol: satisfacción de deseos), 11 (Rueda: la suerte a favor).
'ten-of-cups': [47, 74, 22, 20], // 47 (salto al Paje), 74 (10 de Oros: familia emocional vs material), 22 (Mundo: plenitud total), 20 (Sol: arcoíris/bendición).
'page-of-cups': [48, 33, 19, 13], // 48 (progresión), 33 (Paje de Bastos), 19 (Luna: ensoñación), 13 (Colgado: mirada poética/mística).
'knight-of-cups': [49, 62, 7, 12], // 49 (progresión), 62 (Caballo de Espadas: cruzada emocional vs mental), 7 (Enamorados: romanticismo), 12 (Justicia: idealismo ciego).
'queen-of-cups': [50, 35, 3, 19], // 50 (progresión), 35 (Reina de Bastos), 3 (Sacerdotisa: profundidad intuitiva), 19 (Luna: empatía receptiva).
'king-of-cups': [37, 36, 5, 15], // 37 (retorno al As), 36 (Rey de Bastos), 5 (Emperador: contención estructural), 15 (Templanza: emociones moderadas y sabias).

// --- ESPADAS (Aire / Intelecto / Conflicto) --- Regidos temáticamente por La Justicia (12) y La Muerte (14)
'ace-of-swords': [52, 23, 2, 12], // 52 (progresión), 23 (As de Bastos: intelecto/acción), 2 (Mago: enfoque), 12 (Justicia: espada de la verdad).
'two-of-swords': [53, 38, 3, 12], // 53 (progresión al dolor), 38 (2 de Copas: armonía vs bloqueo), 3 (Sacerdotisa: ceguera voluntaria), 12 (Justicia: equilibrio tenso).
'three-of-swords': [54, 41, 17, 14],// 54 (progresión al reposo), 41 (5 de Copas: dolor emocional), 17 (Torre: herida súbita), 14 (Muerte: fin doloroso).
'four-of-swords': [55, 40, 10, 13], // 55 (progresión), 40 (4 de Copas: aburrimiento vs descanso), 10 (Ermitaño: retiro mental), 13 (Colgado: coma/pausa forzada).
'five-of-swords': [56, 27, 16, 17], // 56 (progresión a la huida), 27 (5 de Bastos: juego rudo vs traición), 16 (Diablo: victoria sin ética), 17 (Torre: humillación).
'six-of-swords': [57, 42, 18, 14], // 57 (progresión), 42 (6 de Copas: pasado vs futuro), 18 (Estrella: transición guiada), 14 (Muerte: dejar atrás la orilla).
'seven-of-swords': [58, 29, 2, 19], // 58 (progresión), 29 (7 de Bastos: frente abierto vs táctica evasiva), 2 (Mago: prestidigitación), 19 (Luna: robo en la noche).
'eight-of-swords': [59, 44, 16, 13],// 59 (progresión a la angustia), 44 (8 de Copas: partir vs quedar atrapado), 16 (Diablo: autoesclavitud), 13 (Colgado: inmovilidad).
'nine-of-swords': [60, 31, 19, 16], // 60 (progresión a la ruina), 31 (9 de Bastos: paranoia), 19 (Luna: terrores nocturnos), 16 (Diablo: desesperación mental).
'ten-of-swords': [61, 32, 14, 17], // 61 (salto al Paje), 32 (10 de Bastos: peso vs traición final), 14 (Muerte: tocar fondo definitivo), 17 (Torre: aniquilación del ego).
'page-of-swords': [62, 33, 12, 1], // 62 (progresión), 33 (Paje de Bastos), 12 (Justicia: vigilancia/espionaje), 1 (Loco: curiosidad afilada y errática).
'knight-of-swords': [63, 48, 8, 17],// 63 (progresión), 48 (Caballo de Copas: agresión vs romanticismo), 8 (Carro: velocidad pura), 17 (Torre: ataque sin previo aviso).
'queen-of-swords': [64, 49, 12, 3], // 64 (progresión), 49 (Reina de Copas: mente vs corazón), 12 (Justicia: rigor e independencia), 3 (Sacerdotisa: verdad cortante).
'king-of-swords': [51, 36, 5, 12], // 51 (retorno al As), 36 (Rey de Bastos), 5 (Emperador: ley), 12 (Justicia: el juez definitivo).

// --- OROS (Tierra / Materia / Cuerpo) --- Regidos temáticamente por El Mundo (22) y El Emperador (5)
'ace-of-pentacles': [66, 37, 2, 22], // 66 (progresión), 37 (As de Copas: semilla material/emocional), 2 (Mago: recursos), 22 (Mundo: manifestación física).
'two-of-pentacles': [67, 24, 11, 15], // 67 (progresión), 24 (2 de Bastos), 11 (Rueda: fluctuaciones de mercado/energía), 15 (Templanza: adaptación continua).
'three-of-pentacles': [68, 39, 6, 4], // 68 (progresión al ahorro), 39 (3 de Copas: colaboración material vs festiva), 6 (Hierofante: maestría institucional), 4 (Emperatriz: obra).
'four-of-pentacles': [69, 26, 5, 16], // 69 (progresión a la pérdida), 26 (4 de Bastos: rigidez vs hogar abierto), 5 (Emperador: conservación), 16 (Diablo: avaricia/apego).
'five-of-pentacles': [70, 41, 6, 10], // 70 (progresión al alivio), 41 (5 de Copas: miseria material vs emocional), 6 (Hierofante: auxilio/iglesia), 10 (Ermitaño: frío y exclusión).
'six-of-pentacles': [71, 28, 12, 7], // 71 (progresión), 28 (6 de Bastos: dar vs recibir aplausos), 12 (Justicia: balanza de la caridad), 7 (Enamorados: transacciones equitativas).
'seven-of-pentacles': [72, 43, 10, 13],// 72 (progresión al trabajo), 43 (7 de Copas: evaluación real vs fantástica), 10 (Ermitaño: paciencia), 13 (Colgado: maduración lenta).
'eight-of-pentacles': [73, 30, 2, 9], // 73 (progresión al disfrute), 30 (8 de Bastos: artesanía vs rapidez), 2 (Mago: habilidad manual), 9 (Fuerza: repetición y disciplina).
'nine-of-pentacles': [74, 31, 4, 18], // 74 (progresión a la familia), 31 (9 de Bastos: confort vs trinchera), 4 (Emperatriz: lujo terrenal), 18 (Estrella: gracia y autosuficiencia).
'ten-of-pentacles': [75, 32, 22, 6], // 75 (salto al Paje), 32 (10 de Bastos: dinastía vs carga insostenible), 22 (Mundo: éxito absoluto terrenal), 6 (Hierofante: tradiciones y legado).
'page-of-pentacles': [76, 47, 22, 4], // 76 (progresión), 47 (Paje de Copas: estudiante material vs soñador), 22 (Mundo: el cuerpo físico), 4 (Emperatriz: respeto a la naturaleza).
'knight-of-pentacles': [77, 34, 10, 5],// 77 (progresión), 34 (Caballo de Bastos: paso firme vs carrera), 10 (Ermitaño: paso lento y seguro), 5 (Emperador: construcción).
'queen-of-pentacles': [78, 35, 4, 11], // 78 (progresión), 35 (Reina de Bastos: madre tierra vs madre fuego), 4 (Emperatriz: fertilidad física), 11 (Rueda: providencia económica y ciclos de abundancia).
'king-of-pentacles': [65, 50, 5, 22] // 65 (retorno al As), 50 (Rey de Copas: soberano material vs emocional), 5 (Emperador: magnate de la estructura), 22 (Mundo: la cima material).
};

Realice un teteo manual sobre usuarios anonimos y gratuitos y hasta ahora encontre lo siguiente:

Usuario ANONIMO:

- http://localhost:3001/
- “Probar sin registro” NO FUNCIONA, intenta ir a carta del dia http://localhost:3001/carta-del-dia, pero inmediatamente se dirige a http://localhost:3001/login

Usuario FREE:

- http://localhost:3001/
- “Comenzar Gratis” lleva correctamente a “Registrarse”
- Al crear el usuario, dirige inmediatamente al perfil del usuario, deberia dar un mensaje de bienvenida y dirigir al home con las configuraciones o landing page o home preparado para el usuario free con registro.
- Tengo la sensacion de que “la carta del dia” utilizo ia, ya que en lugar de traer la descripcion de la carta desde la DB, devolvio (y en ese formato tipo .md cuando deberia ser texto plano):

## **Energía del Día** ⚡

La Tres de Bastos trae una energía de creatividad espiritual y liderazgo, indicando que hoy es un día ideal para planificar y tomar decisiones con una visión clara y meditada. La energía del día está llena de oportunidades para el crecimiento y el éxito, siempre y cuando se aborden con paciencia y conciencia.

## **Ventajas** ✨

- Oportunidad para planificar y iniciar proyectos con una base sólida
- Aumento de la creatividad y la inspiración espiritual para encontrar soluciones innovadoras
- Momento favorable para establecer alianzas y sociedades que puedan beneficiar a todos los involucrados

## **Cuidados** ⚠️

- Evitar la impaciencia y precipitación en la toma de decisiones
- No descuidar la importancia de la planificación y la meditación en el proceso de creación
- Cuidado con dejar que la perfección sea el enemigo del progreso, encontrando un equilibrio saludable

## **Consejo del Día** 💫

Aprovecha el día para reflexionar sobre tus objetivos y planes, y toma decisiones con una mente clara y una visión espiritual. La paciencia y la meditación serán tus aliadas para encontrar el camino correcto y avanzar hacia el éxito de manera segura y consciente.

- La “carta del dia” no se sumo en “estadisticas de uso que dice 0/2
- Luego al iniciar una lectura de tarot, me lleva a categorias, luego a preguntas, luego al tipo de tirada para finalmente terminar en error: “Error al crear la lectura. Por favor, intenta de nuevo.” Lo cual es esperable ya que el usuario Free (con registro) NO debe hacer uso de la IA, su tirada de tarot debe ser solo seleccionar entre una tirada de 1 y 3 cartas, elegir las cartas y obtener el resultado de la o las cartas que le salieron mas su informacion en en la DB SIN interpretacion ni uso de IA
- Sacar de toda la web referencias a Tarot Flavia, a partir de hoy la web se llama: Auguria, y corregir tambien todos los textos que hacen referencia al uso de la IA para interpretaciones (no es necesario aclarar que son con IA)

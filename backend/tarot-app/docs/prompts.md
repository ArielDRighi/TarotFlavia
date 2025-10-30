# Creacion de nueva tarea:

OK, vamos a iniciar esta tarea.

Tarea: TASK-00x: [Pega aquí la descripción detallada de la tarea]

Workflow de Ejecución:

Autonomía Total: Ejecuta la tarea de principio a fin sin solicitar confirmaciones.

Rama: Estás en develop. Crea la rama feature/TASK-00x-descripcion (usa la nomenclatura de las ramas existentes nombradas segun gitflow) y trabaja en ella.

Metodología (TDD Estricto): Sigue un ciclo TDD riguroso: _ Escribe un test (debe fallar). _ Escribe el código mínimo para que el test pase. \* Refactoriza.

Si la tarea incluye crear migraciones, evaluar agregarla al archivo de migracion existente 1761655973524-InitialSchema, ya que aun la aplicacion no se encuentra en produccion y esto ayuda a mantener un historial de migraciones limpio.

Ciclo de Calidad (Pre-Commit): Al finalizar la implementación, ejecuta los scripts de lint, format y build del proyecto. Corrige todos los errores y warnings que surjan.

Esta terminantemente prohibido agregar eslint disable, debes solucionar los problemas de forma real.

Actualiza el documento backlog con la tarea completada, marcándola como finalizada.

Validación Final: Asegúrate de que todos los tests (nuevos y existentes) pasen limpiamente.

Entregable: Proporcióname el diff de cambios y un borrador del mensaje para la Pull Request.

# Pull Request

Tengo el siguiente feedback del PR para la rama feature/TASK-00x.

Feedback Recibido: [Pega aquí el feedback completo del revisor]

Tu Tarea (Análisis Senior):

Analiza y Valida: Lee críticamente cada punto del feedback.

Aplica Correcciones: Implementa los cambios para todo el feedback que consideres válido y correcto.

Justifica (Pushback): Si no estás de acuerdo con algún comentario (porque el revisor malinterpretó algo, o tu solución es preferible por una razón X), no lo apliques. En su lugar, prepara una respuesta técnica y educada para el PR explicando tu razonamiento.

Calidad y TDD: Si las correcciones implican cambios de lógica, deben reflejarse en los tests (actualizándolos o creando nuevos). Vuelve a pasar el ciclo de lint, format, build y test para asegurar que todo sigue limpio.

Estrategia de Commits: Crea un NUEVO commit con las correcciones usando el mensaje: "fix: apply PR feedback - [descripción breve de los cambios]". NUNCA uses --amend para correcciones de PR, ya que complica el historial y requiere force push.

Entregable: Muéstrame el código actualizado y las respuestas que prepararías para los comentarios del PR (especialmente los que estés rechazando).

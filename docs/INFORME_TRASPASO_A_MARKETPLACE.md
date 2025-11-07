INFORME EJECUTIVO - PROYECTO TAROTFLAVIA
Fecha: 5 de Noviembre, 2025
Estado: En desarrollo - Backend MVP
Visión futura: Plataforma marketplace multi-tarotista

1. DESCRIPCIÓN DEL PROYECTO
   Concepto Actual (Fase MVP)
   TarotFlavia es una aplicación web de tarot digital que ofrece interpretaciones personalizadas mediante inteligencia artificial. Actualmente está diseñada como un servicio de una sola tarotista (Flavia), ofreciendo lecturas de tarot con diferentes tipos de tiradas, consultas al oráculo, y contenido educativo sobre rituales.
   Visión Futura (Fase Marketplace)
   Evolucionar hacia una plataforma marketplace donde múltiples tarotistas puedan registrarse, personalizar sus interpretaciones mediante IA, y ofrecer sus servicios. Los usuarios podrán elegir entre diferentes tarotistas según especialidad, estilo y preferencias personales.

2. ARQUITECTURA Y TECNOLOGÍAS
   Stack Tecnológico

Backend: NestJS con TypeScript
Base de datos: PostgreSQL con TypeORM
IA: Groq (Llama 3.1 70B) como proveedor principal, con OpenAI y DeepSeek como fallback
Autenticación: JWT con refresh tokens
Infraestructura: Arquitectura modular con separación clara de responsabilidades

Arquitectura Actual
El sistema está construido con una arquitectura modular bien organizada que separa responsabilidades en módulos independientes: autenticación, usuarios, tarot (cartas, mazos, tiradas, lecturas), límites de uso, registro de IA, y emails.

3. FUNCIONALIDADES IMPLEMENTADAS
   Sistema de Usuarios

Registro y autenticación con JWT
Sistema de planes: Free (3-5 lecturas diarias) y Premium (ilimitadas)
Recuperación de contraseña
Gestión de sesiones con refresh tokens

Sistema de Tarot

Base de datos completa de 78 cartas del Rider-Waite con significados derecho e invertido
Cuatro tipos de tiradas: 1 carta, 3 cartas, 5 cartas y Cruz Celta (10 cartas)
Seis categorías de consulta: Amor, Trabajo, Dinero, Salud, Espiritual y General
Sistema de lecturas con historial personal
Capacidad de compartir lecturas mediante tokens únicos
Regeneración de interpretaciones para usuarios premium

Sistema de IA

Generación de interpretaciones personalizadas mediante prompts estructurados
Sistema de cache para optimizar costos y velocidad
Logging detallado de uso con tracking de tokens y costos
Múltiples proveedores de IA con sistema de fallback

Características Adicionales

42 preguntas predefinidas organizadas por categoría
Control de límites de uso diferenciado por plan
Sistema de soft-delete para lecturas
Contador de visualizaciones en lecturas públicas

4. ESTADO DEL DESARROLLO
   Completado (Backend)

Arquitectura modular funcional
Todos los módulos core implementados
Sistema de autenticación robusto
CRUD completo de lecturas
Integración con IA operativa
Sistema de cache funcionando
Límites de uso implementados

Pendiente

Frontend (interfaz de usuario)
Sistema de pagos con Stripe
Módulo de rituales y amuletos
Oráculo (consultas abiertas)
Panel de administración
Sistema de suscripciones

5. ANÁLISIS DE ESCALABILIDAD
   Fortalezas del Diseño Actual
   La arquitectura modular facilita la extensión futura. El sistema de IA ya tiene abstracción de proveedores. La base de datos está bien normalizada. Los límites de uso son configurables por plan.
   Limitaciones Identificadas para Marketplace
   Dependencia de Identidad Única
   Los prompts de IA están hardcodeados con la identidad "Flavia" en archivos de configuración estáticos. Esto impide que múltiples tarotistas tengan su propia voz y estilo de interpretación.
   Significados de Cartas Globales
   Las 78 cartas tienen significados fijos en la base de datos que se usan para todos los usuarios. No existe mecanismo para que diferentes tarotistas aporten sus propias interpretaciones personalizadas de cada carta.
   Ausencia de Entidad Tarotista
   No existe tabla ni concepto de "tarotista" en el sistema. Las lecturas no están vinculadas a ningún proveedor específico. No hay perfiles públicos ni información de tarotistas.
   Sistema de Cache Compartido
   El cache de interpretaciones no distingue entre tarotistas. Si dos tarotistas hipotéticos interpretaran las mismas cartas, obtendrían el mismo resultado cacheado.
   Sin Tracking de Uso por Proveedor
   No existe infraestructura para medir qué tarotista genera qué lecturas, imposibilitando cualquier modelo de revenue sharing futuro.
   Sistema de Roles Binario
   Los usuarios solo pueden ser admin o no-admin. No existe concepto de múltiples roles ni de usuario que sea simultáneamente consumidor y proveedor.

6. CAMBIOS FUNDAMENTALES RECOMENDADOS AHORA
   Cambios Estructurales en Base de Datos
   Agregar Concepto de Tarotista
   Crear tabla de tarotistas con perfil básico (nombre, biografía, especialidades). Relacionar con tabla de usuarios mediante foreign key. Establecer relación uno-a-uno inicialmente.
   Vincular Lecturas a Tarotista
   Agregar columna tarotista_id a la tabla de lecturas. Esto permite tracking histórico desde el inicio. Migrar lecturas existentes a "Flavia" como tarotista por defecto.
   Preparar Personalización de Cartas
   Aunque no se use inmediatamente, crear tabla para permitir que tarotistas personalicen significados de cartas en el futuro. Usar patrón de herencia: significados personalizados override significados base.
   Modificar Sistema de Cache
   Incluir identificador de tarotista en las claves de cache. Esto evita que futuras interpretaciones personalizadas compartan cache incorrectamente.
   Cambios en Lógica de Aplicación
   Abstraer Configuración de Prompts
   Mover prompts de archivos estáticos a configuración en base de datos. Crear tabla de configuración de IA por tarotista con campos para system prompt, temperatura, estilo, palabras clave.
   Servicio de Construcción de Prompts
   Transformar la clase estática de prompts en un servicio inyectable que reciba contexto de tarotista. Permitir que el servicio obtenga configuración dinámica de base de datos.
   Inyectar Contexto en Servicios
   Modificar servicios de interpretación y lecturas para recibir y propagar identificador de tarotista. Esto debe hacerse de forma transparente sin romper funcionalidad actual.
   Sistema de Roles Extensible
   Migrar de campo booleano isAdmin a array de roles. Preparar para usuarios con múltiples roles (consumidor, tarotista, admin). Mantener compatibilidad con lógica actual mediante guards actualizados.
   Cambios Menores pero Importantes
   Modificar Logs de IA
   Agregar columna opcional tarotista_id a logs de uso de IA. Permite tracking de costos por proveedor en el futuro.
   Actualizar Límites de Uso
   Agregar columna opcional tarotista_id a tabla de límites. Permite limitar uso por tarotista específico en planes futuros.

7. ESTRATEGIA DE IMPLEMENTACIÓN
   Principio de Migración Transparente
   Todos los cambios deben ser retrocompatibles. La aplicación actual debe seguir funcionando exactamente igual durante y después de los cambios. Las nuevas columnas deben ser opcionales (nullable) inicialmente.
   Enfoque de Migración de Datos
   Crear registro de tarotista para Flavia vinculado a usuario admin existente. Configurar prompts actuales en tabla de configuración. Actualizar todas las lecturas existentes para referenciar a Flavia. El sistema sigue operando con un solo tarotista pero preparado para múltiples.
   Momento de Implementación
   Estos cambios deben realizarse AHORA mientras el sistema está en desarrollo y no hay usuarios reales. Hacerlo más tarde implica migración de datos en producción, posible downtime, y mayor complejidad. El costo de implementación actual es mínimo comparado con refactorización futura.
   Activación Gradual
   Los cambios se implementan en código pero no se exponen en interfaz de usuario. El sistema opera internamente con concepto de tarotistas pero externamente sigue siendo aplicación de Flavia. Cuando se decida activar marketplace, solo se necesita desarrollar frontend y flujos de negocio.

8. IMPACTO EN DESARROLLO ACTUAL
   En Funcionalidad
   Ningún impacto. Todas las features planificadas (rituales, oráculo, pagos, frontend) funcionan exactamente igual. Solo cambia la estructura interna de datos.
   En Complejidad
   Aumento moderado de complejidad en servicios de interpretación (deben recibir un parámetro adicional). Creación de nuevos servicios auxiliares para gestión de configuración. Este es el momento más barato para hacer estos cambios.
   En Tiempo de Desarrollo
   Estimado de dos a tres semanas adicionales para implementar cambios fundamentales. Esto incluye modificaciones de schema, refactorización de servicios, migración de prompts, y testing completo.
   En Testing
   Necesidad de actualizar tests existentes para incluir contexto de tarotista. Creación de tests nuevos para validar que sistema funciona igual con uno o múltiples tarotistas. Esto es inversión que se recupera al evitar bugs futuros.

9. BENEFICIOS DE IMPLEMENTAR AHORA
   Técnicos
   Arquitectura preparada para escalamiento sin refactorización mayor. Code base más limpio y mantenible. Separación clara entre datos compartidos y datos específicos de proveedor. Sistema de cache más robusto y correcto.
   De Negocio
   Flexibilidad para pivotar a marketplace cuando se desee. Capacidad de agregar tarotistas sin reescribir sistema. Tracking de métricas desde el inicio permite análisis históricos. Menor riesgo de bugs al escalar.
   De Costos
   Evita refactorización costosa en producción. Previene migración de datos con usuarios activos. Reduce deuda técnica significativamente. Permite estimar costos de IA por proveedor desde el inicio.

10. RIESGOS DE NO IMPLEMENTAR AHORA
    Deuda Técnica
    Acumulación de dependencias a estructura single-tarotista. Prompts hardcodeados en múltiples lugares del código. Cache compartido genera bugs difíciles de detectar. Sistema de roles inflexible requiere rediseño completo.
    Complejidad Futura
    Migración de base de datos en producción es arriesgada. Actualización de miles de registros existentes. Posible downtime durante migración. Testing exhaustivo con datos reales es costoso.
    Impacto en Usuarios
    Posibles inconsistencias durante migración. Riesgo de pérdida de datos o corrupción. Experiencia de usuario afectada por cambios. Necesidad de comunicar cambios a usuarios activos.
    Multiplicador de Esfuerzo
    Cambios que ahora toman dos semanas tomarán ocho a doce semanas después. Testing que ahora es simple se vuelve complejo con datos reales. Coordinación de despliegue se vuelve crítica. Rollback en caso de problemas es complicado.

11. RECOMENDACIÓN FINAL
    Implementar los cambios fundamentales ahora durante la fase de desarrollo del MVP, antes del lanzamiento público. Esto requiere una inversión adicional de dos a tres semanas pero previene meses de refactorización futura.
    La aplicación seguirá siendo TarotFlavia con un solo tarotista visible para usuarios, pero internamente estará preparada para marketplace. Esta preparación es invisible para el usuario final pero crítica para escalabilidad técnica.
    El momento óptimo es ahora porque el sistema está en desarrollo activo, no hay usuarios reales afectados, no hay datos de producción que migrar, y el equipo tiene contexto completo del código.
    El retorno de inversión es claro: evitar seis a doce meses de refactorización futura, eliminar riesgo de migración en producción, y mantener flexibilidad estratégica de negocio sin compromiso técnico.

Conclusión: Los cambios propuestos son modificaciones de arquitectura interna que no afectan la experiencia de usuario actual pero son fundamentales para permitir evolución futura. Se recomienda implementación inmediata aprovechando que el proyecto está en fase de desarrollo.

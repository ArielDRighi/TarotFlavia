import * as fs from 'fs';
import * as path from 'path';

/**
 * T-DEUDA-001 — los decoradores tienen que decir lo que la base ya hace.
 *
 * `migration:generate` no compara la base contra las migraciones: compara la
 * base contra **los decoradores**. Todo lo que un decorador calla, el generador
 * lo lee como "la base está mal" y propone corregirla al revés. Medido el
 * 27-ago-2026: **78 sentencias** de ruido, entre ellas cuatro pares
 * `DROP COLUMN` + `ADD COLUMN` sobre los timestamps de la enciclopedia que
 * **borran los datos** en vez de convertir el tipo.
 *
 * La regla que ordena todo el archivo es una sola: **el decorador dice lo que
 * la base tiene**, verificado contra `pg_constraint` y `pg_indexes`, no lo que
 * sería lindo que tuviera. Unificar nombres en la base es cambiar el esquema y
 * eso queda fuera del alcance de la tarea.
 *
 * Este spec es estático a propósito: lee el texto de las entidades, no habla
 * con Postgres. La verificación contra la base real (el archivo vacío) es la
 * puerta de salida del backlog y se corre a mano; esto es la red que evita que
 * el drift vuelva a entrar decorador por decorador.
 *
 * Las tablas de abajo **no son valores esperados inventados**: salen de cruzar
 * cada relación contra `pg_constraint` y cada índice contra `pg_indexes` en la
 * base de desarrollo (27-ago-2026, 52/52 relaciones sin discrepancia). Si algún
 * día la base cambia a propósito, se corrige acá y se deja escrito por qué.
 *
 * Vive en `database/` y NO en `database/migrations/` por la misma razón que
 * `entity-index-migration-sync.spec.ts`: el glob de TypeORM carga todo lo que
 * haya en esa carpeta y un `.spec.ts` ahí adentro rompe el CLI y el arranque.
 */

const SRC = path.join(__dirname, '..');

interface EntityFile {
  relative: string;
  source: string;
}

interface Relacion {
  archivo: string;
  propiedad: string;
  onDelete: string;
}

function listFiles(dir: string, suffix: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full, suffix);
    return entry.isFile() && entry.name.endsWith(suffix) ? [full] : [];
  });
}

/**
 * Saca comentarios de bloque y de línea, igual que el spec de índices: un
 * decorador comentado no cuenta.
 *
 * El `(?<!:)` es necesario, no decorativo: sin él, el `//` de una URL en un
 * `@ApiProperty({ example: 'https://...' })` se come el resto de la línea. Hoy
 * hay seis URLs así en las entidades y ninguna tiene paréntesis, con lo cual el
 * daño sería invisible — hasta que alguien escriba una que sí los tenga y
 * `extraerArgumentos` empiece a contar paréntesis desbalanceados y a leer
 * basura, probablemente en verde.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!:)\/\/.*$/gm, '');
}

function readEntities(): EntityFile[] {
  return listFiles(SRC, '.entity.ts').map((file) => ({
    relative: path.relative(SRC, file),
    source: stripComments(fs.readFileSync(file, 'utf8')),
  }));
}

/**
 * Devuelve el texto entre los paréntesis del decorador que arranca en `start`,
 * más la posición del paréntesis que lo cierra, contando anidamiento. Un
 * `indexOf(')')` no sirve: casi todos los decoradores de relación abren con
 * `() => Entidad`, así que el primer `)` es el de la arrow function.
 */
function extraerArgumentos(
  source: string,
  start: number,
): { args: string; fin: number } {
  const abre = source.indexOf('(', start);
  if (abre === -1) return { args: '', fin: start };

  let profundidad = 0;
  for (let i = abre; i < source.length; i++) {
    if (source[i] === '(') profundidad++;
    else if (source[i] === ')') {
      profundidad--;
      if (profundidad === 0) return { args: source.slice(abre + 1, i), fin: i };
    }
  }
  return { args: '', fin: start };
}

/** Salta los decoradores que siguen a uno dado y devuelve dónde arranca la propiedad. */
function saltarDecoradores(source: string, desde: number): number {
  let pos = desde;
  for (;;) {
    const match = /^\s*@[A-Za-z]+/.exec(source.slice(pos));
    if (!match) return pos;

    const fin = pos + match[0].length;
    if (source[fin] !== '(') {
      pos = fin;
      continue;
    }
    pos = extraerArgumentos(source, fin).fin + 1;
  }
}

const RELACION_CON_FK = /@(?:ManyToOne|OneToOne)\s*\(/g;

/**
 * `@Index(` que no arranca con un string literal: tanto el pelado `@Index()`
 * como el compuesto `@Index(['a', 'b'])`. Los dos le dejan el nombre a TypeORM.
 */
const INDICE_SIN_NOMBRE = /@Index\(\s*(?!')/g;

const entities = readEntities();

function entidad(relative: string): string {
  const found = entities.find((entity) => entity.relative === relative);
  if (!found) throw new Error(`No se encontró la entidad ${relative}`);
  return found.source;
}

/**
 * Todas las relaciones que crean una FK, con la propiedad que decoran y el
 * `ON DELETE` que la base tiene de verdad.
 *
 * Que la lista sea exacta (`toEqual`, no `toContain`) es el punto: agarra las
 * tres formas de romperlo —una relación nueva sin `onDelete`, una relación
 * borrada, y un `onDelete` cambiado a un valor que no es el de la base—. Esta
 * última es la peligrosa: es silenciosa hasta que alguien borra una fila.
 *
 * `NO ACTION` es un valor tan verificado como los demás: es la diferencia entre
 * "acá nadie lo pensó" y "acá se miró `pg_constraint` y da NO ACTION".
 */
const RELACIONES: ReadonlyArray<readonly [string, string, string]> = [
  ['modules/ai-usage/entities/ai-usage-log.entity.ts', 'reading', 'SET NULL'],
  ['modules/ai-usage/entities/ai-usage-log.entity.ts', 'user', 'SET NULL'],
  ['modules/audit/entities/audit-log.entity.ts', 'targetUser', 'SET NULL'],
  ['modules/audit/entities/audit-log.entity.ts', 'user', 'SET NULL'],
  ['modules/auth/entities/password-reset-token.entity.ts', 'user', 'CASCADE'],
  ['modules/auth/entities/refresh-token.entity.ts', 'user', 'CASCADE'],
  ['modules/birth-chart/entities/birth-chart.entity.ts', 'user', 'CASCADE'],
  [
    'modules/holistic-services/entities/service-purchase.entity.ts',
    'holisticService',
    'RESTRICT',
  ],
  [
    'modules/holistic-services/entities/service-purchase.entity.ts',
    'session',
    'SET NULL',
  ],
  [
    'modules/holistic-services/entities/service-purchase.entity.ts',
    'user',
    'CASCADE',
  ],
  [
    'modules/notifications/entities/user-notification.entity.ts',
    'user',
    'CASCADE',
  ],
  [
    'modules/numerology/entities/numerology-interpretation.entity.ts',
    'user',
    'CASCADE',
  ],
  ['modules/pendulum/entities/pendulum-query.entity.ts', 'user', 'CASCADE'],
  [
    'modules/predefined-questions/entities/predefined-question.entity.ts',
    'category',
    'CASCADE',
  ],
  ['modules/rituals/entities/ritual-material.entity.ts', 'ritual', 'CASCADE'],
  ['modules/rituals/entities/ritual-step.entity.ts', 'ritual', 'CASCADE'],
  [
    'modules/rituals/entities/user-ritual-history.entity.ts',
    'ritual',
    'CASCADE',
  ],
  ['modules/rituals/entities/user-ritual-history.entity.ts', 'user', 'CASCADE'],
  [
    'modules/rituals/entities/user-sacred-event-notification.entity.ts',
    'event',
    'CASCADE',
  ],
  [
    'modules/rituals/entities/user-sacred-event-notification.entity.ts',
    'user',
    'CASCADE',
  ],
  ['modules/scheduling/entities/session.entity.ts', 'tarotista', 'CASCADE'],
  ['modules/scheduling/entities/session.entity.ts', 'user', 'CASCADE'],
  [
    'modules/scheduling/entities/tarotist-availability.entity.ts',
    'tarotista',
    'CASCADE',
  ],
  [
    'modules/scheduling/entities/tarotist-exception.entity.ts',
    'tarotista',
    'CASCADE',
  ],
  ['modules/security/entities/security-event.entity.ts', 'user', 'SET NULL'],
  [
    'modules/tarot/cards/entities/card-free-interpretation.entity.ts',
    'card',
    'CASCADE',
  ],
  [
    'modules/tarot/cards/entities/card-free-interpretation.entity.ts',
    'category',
    'RESTRICT',
  ],
  ['modules/tarot/cards/entities/tarot-card.entity.ts', 'deck', 'NO ACTION'],
  [
    'modules/tarot/daily-reading/entities/daily-reading.entity.ts',
    'card',
    'NO ACTION',
  ],
  [
    'modules/tarot/daily-reading/entities/daily-reading.entity.ts',
    'tarotista',
    'CASCADE',
  ],
  [
    'modules/tarot/daily-reading/entities/daily-reading.entity.ts',
    'user',
    'CASCADE',
  ],
  [
    'modules/tarot/interpretations/entities/tarot-interpretation.entity.ts',
    'reading',
    'NO ACTION',
  ],
  [
    'modules/tarot/readings/entities/tarot-reading.entity.ts',
    'category',
    'SET NULL',
  ],
  [
    'modules/tarot/readings/entities/tarot-reading.entity.ts',
    'deck',
    'NO ACTION',
  ],
  [
    'modules/tarot/readings/entities/tarot-reading.entity.ts',
    'predefinedQuestion',
    'SET NULL',
  ],
  [
    'modules/tarot/readings/entities/tarot-reading.entity.ts',
    'tarotista',
    'SET NULL',
  ],
  [
    'modules/tarot/readings/entities/tarot-reading.entity.ts',
    'user',
    'NO ACTION',
  ],
  [
    'modules/tarotistas/entities/tarotista-application.entity.ts',
    'reviewedBy',
    'SET NULL',
  ],
  [
    'modules/tarotistas/entities/tarotista-application.entity.ts',
    'user',
    'CASCADE',
  ],
  [
    'modules/tarotistas/entities/tarotista-card-meaning.entity.ts',
    'card',
    'CASCADE',
  ],
  [
    'modules/tarotistas/entities/tarotista-card-meaning.entity.ts',
    'tarotista',
    'CASCADE',
  ],
  [
    'modules/tarotistas/entities/tarotista-config.entity.ts',
    'tarotista',
    'CASCADE',
  ],
  [
    'modules/tarotistas/entities/tarotista-revenue-metrics.entity.ts',
    'reading',
    'SET NULL',
  ],
  [
    'modules/tarotistas/entities/tarotista-revenue-metrics.entity.ts',
    'tarotista',
    'CASCADE',
  ],
  [
    'modules/tarotistas/entities/tarotista-revenue-metrics.entity.ts',
    'user',
    'CASCADE',
  ],
  [
    'modules/tarotistas/entities/tarotista-review.entity.ts',
    'reading',
    'SET NULL',
  ],
  [
    'modules/tarotistas/entities/tarotista-review.entity.ts',
    'tarotista',
    'CASCADE',
  ],
  ['modules/tarotistas/entities/tarotista-review.entity.ts', 'user', 'CASCADE'],
  ['modules/tarotistas/entities/tarotista.entity.ts', 'user', 'CASCADE'],
  [
    'modules/tarotistas/entities/user-tarotista-subscription.entity.ts',
    'tarotista',
    'CASCADE',
  ],
  [
    'modules/tarotistas/entities/user-tarotista-subscription.entity.ts',
    'user',
    'CASCADE',
  ],
  ['modules/usage-limits/entities/usage-limit.entity.ts', 'user', 'CASCADE'],
];

/**
 * Canario contra un escaneo roto: si el regex deja de matchear, la lista queda
 * vacía y `toEqual` lo grita, pero este número protege el caso más tonto —que
 * `listFiles` no encuentre las entidades—. Medido el 27-ago-2026: 51.
 */
const ENTIDADES_ESPERADAS = 51;

function relacionesDeclaradas(): Relacion[] {
  return entities
    .flatMap((entity) =>
      [...entity.source.matchAll(RELACION_CON_FK)].map((match) => {
        const { args, fin } = extraerArgumentos(
          entity.source,
          match.index ?? 0,
        );
        const propiedad = /^\s*([A-Za-z_$][\w$]*)/.exec(
          entity.source.slice(saltarDecoradores(entity.source, fin + 1)),
        );
        const onDelete = /onDelete:\s*'([^']+)'/.exec(args);

        return {
          archivo: entity.relative,
          propiedad: propiedad ? propiedad[1] : '(sin propiedad)',
          onDelete: onDelete ? onDelete[1] : '(sin onDelete)',
        };
      }),
    )
    .sort((a, b) =>
      `${a.archivo}#${a.propiedad}`.localeCompare(
        `${b.archivo}#${b.propiedad}`,
      ),
    );
}

describe('Sincronía entre los decoradores y el esquema real (T-DEUDA-001)', () => {
  it('encuentra todas las entidades del repo', () => {
    expect(entities.length).toBeGreaterThanOrEqual(ENTIDADES_ESPERADAS);
  });

  /**
   * ⚠️ Sólo aplica al lado **dueño** de la relación. El lado inverso de un
   * `@OneToOne` no crea FK y TypeORM ignora su `onDelete`; hoy no hay ninguno
   * (el único `@OneToOne` del repo, `tarotista.user`, es el dueño), y si mañana
   * aparece uno hay que excluirlo de la tabla, no ponerle un `onDelete` de
   * mentira.
   */
  it('declara el onDelete que la base tiene en cada relación con FK', () => {
    const esperadas: Relacion[] = RELACIONES.map(
      ([archivo, propiedad, onDelete]) => ({ archivo, propiedad, onDelete }),
    );

    expect(relacionesDeclaradas()).toEqual(esperadas);
  });
});

/**
 * Un `@Index` sin nombre le deja el nombre a TypeORM, que genera un hash
 * (`IDX_a1de5c775bfe9f7621ff9df64c`). Está bien **sólo** cuando la base ya
 * tiene ese hash. Donde la migración le puso un nombre legible, el decorador
 * sin nombre hace que el generador proponga borrar el legible y crear el hash:
 * un renombre puro que además esconde el drift de verdad.
 *
 * Los conteos salen de `pg_indexes` (27-ago-2026): en estas 14 entidades los
 * índices están con hash **en la base**, así que el decorador dice la verdad.
 * Agregar un `@Index` sin nombre en cualquier otra entidad —o uno de más en
 * éstas— rompe el test a propósito: hay que ir a mirar la base primero.
 */
const INDICES_CON_HASH_EN_LA_BASE: Readonly<Record<string, number>> = {
  'modules/ai-usage/entities/ai-provider-usage.entity.ts': 1,
  'modules/ai-usage/entities/ai-usage-log.entity.ts': 2,
  'modules/audit/entities/audit-log.entity.ts': 4,
  'modules/auth/entities/refresh-token.entity.ts': 3,
  'modules/birth-chart/entities/birth-chart.entity.ts': 1,
  'modules/cache/infrastructure/entities/cache-metrics.entity.ts': 2,
  'modules/cache/infrastructure/entities/cached-interpretation.entity.ts': 4,
  'modules/predefined-questions/entities/predefined-question.entity.ts': 1,
  'modules/security/entities/security-event.entity.ts': 4,
  'modules/tarot/daily-reading/entities/daily-reading.entity.ts': 2,
  'modules/tarotistas/entities/tarotista-card-meaning.entity.ts': 1,
  'modules/tarotistas/entities/tarotista-revenue-metrics.entity.ts': 2,
  'modules/tarotistas/entities/tarotista-review.entity.ts': 1,
  'modules/usage-limits/entities/anonymous-usage.entity.ts': 1,
};

/**
 * Índices que las migraciones crearon con nombre legible sobre columnas que una
 * entidad mapea: `[archivo, nombre, propiedad que decora]`.
 *
 * La propiedad no es decorativa. Sin ella bastaría con que el string apareciera
 * en cualquier parte del archivo, y **intercambiar** `IDX_ip_blocks_ip` con
 * `IDX_ip_blocks_blocked_until` pasaría el test con el drift reintroducido.
 *
 * El otro extremo del lazo lo ata `entity-index-migration-sync.spec.ts`: todo
 * `@Index` con nombre exige una migración que lo cree.
 */
const INDICES_LEGIBLES_EN_LA_BASE: ReadonlyArray<
  readonly [string, string, string]
> = [
  ['common/entities/ip-block.entity.ts', 'IDX_ip_blocks_ip', 'ip'],
  [
    'common/entities/ip-block.entity.ts',
    'IDX_ip_blocks_blocked_until',
    'blockedUntil',
  ],
  [
    'modules/users/entities/user.entity.ts',
    'IDX_user_mp_preapproval_id',
    'mpPreapprovalId',
  ],
  [
    'modules/tarot/cards/entities/card-free-interpretation.entity.ts',
    'IDX_card_free_interpretation_cardId',
    'cardId',
  ],
  [
    'modules/tarot/cards/entities/card-free-interpretation.entity.ts',
    'IDX_card_free_interpretation_categoryId',
    'categoryId',
  ],
  [
    'modules/holistic-services/entities/service-purchase.entity.ts',
    'idx_service_purchases_mp_payment_id',
    'mercadoPagoPaymentId',
  ],
];

/**
 * FKs que las migraciones crearon con nombre legible:
 * `[archivo, columna del JoinColumn, nombre del constraint]`.
 *
 * La columna ata el nombre a **su** relación: sin ella, intercambiar
 * `FK_service_purchases_user` con `FK_service_purchases_session` entre sus dos
 * `@JoinColumn` pasaría el test.
 *
 * Son 5 sobre las 54 FKs de la base; las otras 49 tienen hash de TypeORM.
 * Unificarlas sería cambiar el esquema, que está fuera del alcance de
 * T-DEUDA-001. La convención para lo nuevo es el hash.
 */
const FKS_LEGIBLES_EN_LA_BASE: ReadonlyArray<
  readonly [string, string, string]
> = [
  [
    'modules/tarot/cards/entities/card-free-interpretation.entity.ts',
    'cardId',
    'FK_card_free_interpretation_card',
  ],
  [
    'modules/tarot/cards/entities/card-free-interpretation.entity.ts',
    'categoryId',
    'FK_card_free_interpretation_category',
  ],
  [
    'modules/holistic-services/entities/service-purchase.entity.ts',
    'user_id',
    'FK_service_purchases_user',
  ],
  [
    'modules/holistic-services/entities/service-purchase.entity.ts',
    'holistic_service_id',
    'FK_service_purchases_holistic_service',
  ],
  [
    'modules/holistic-services/entities/service-purchase.entity.ts',
    'session_id',
    'FK_service_purchases_session',
  ],
];

describe('Nombres de índices y constraints (T-DEUDA-001)', () => {
  it('deja @Index sin nombre sólo donde la base guarda el hash', () => {
    const inesperados = entities
      .map((entity) => ({
        archivo: entity.relative,
        sinNombre: [...entity.source.matchAll(INDICE_SIN_NOMBRE)].length,
        permitidos: INDICES_CON_HASH_EN_LA_BASE[entity.relative] ?? 0,
      }))
      .filter(({ sinNombre, permitidos }) => sinNombre !== permitidos)
      .map(
        ({ archivo, sinNombre, permitidos }) =>
          `${archivo}: ${sinNombre} @Index sin nombre, se esperaban ${permitidos}`,
      );

    expect(inesperados).toEqual([]);
  });

  it.each(INDICES_LEGIBLES_EN_LA_BASE)(
    '%s nombra %s sobre la propiedad %s',
    (relative, nombre, propiedad) => {
      const decorador = entidad(relative).indexOf(`@Index('${nombre}'`);
      expect(decorador).toBeGreaterThanOrEqual(0);

      const source = entidad(relative);
      const { fin } = extraerArgumentos(source, decorador);
      const declarada = /^\s*([A-Za-z_$][\w$]*)/.exec(
        source.slice(saltarDecoradores(source, fin + 1)),
      );

      expect(declarada?.[1]).toBe(propiedad);
    },
  );

  it.each(FKS_LEGIBLES_EN_LA_BASE)(
    '%s fija el constraint de la columna %s como %s',
    (relative, columna, nombre) => {
      const joinColumns = [
        ...entidad(relative).matchAll(/@JoinColumn\(\s*\{([\s\S]*?)\}\s*\)/g),
      ].map((match) => match[1]);
      const propia = joinColumns.find((args) =>
        new RegExp(`name:\\s*'${columna}'`).test(args),
      );

      expect(propia).toBeDefined();
      expect(propia).toMatch(
        new RegExp(`foreignKeyConstraintName:\\s*'${nombre}'`),
      );
    },
  );

  /**
   * El `UNIQUE` de `card_free_interpretation` también tiene nombre legible en
   * la base. Se verifican las columnas además del nombre porque `@Unique` las
   * lleva en el mismo decorador: un reordenamiento cambiaría el índice.
   */
  it('fija el nombre y las columnas del UNIQUE de card_free_interpretation', () => {
    const source = entidad(
      'modules/tarot/cards/entities/card-free-interpretation.entity.ts',
    );
    const unique = /@Unique\(([\s\S]*?)\)\s*export class/.exec(source);

    expect(unique?.[1]).toContain(
      "'UQ_card_free_interpretation_card_category_orientation'",
    );
    expect(unique?.[1].match(/'(cardId|categoryId|orientation)'/g)).toEqual([
      "'cardId'",
      "'categoryId'",
      "'orientation'",
    ]);
  });
});

describe('Tipos y defaults verificados contra la base (T-DEUDA-001)', () => {
  /**
   * `encyclopedia_tarot_cards` y `encyclopedia_articles` tienen los timestamps
   * en `timestamptz` (lo puso la migración original). Sin `type`, TypeORM asume
   * `timestamp` sin zona y el generador propone DROP + ADD: no convierte, borra
   * las fechas de la enciclopedia entera.
   */
  it.each([
    'modules/encyclopedia/entities/encyclopedia-tarot-card.entity.ts',
    'modules/encyclopedia/entities/encyclopedia-article.entity.ts',
  ])('declara timestamptz en los timestamps de %s', (relative) => {
    const columnas = [
      ...entidad(relative).matchAll(/@(?:Create|Update)DateColumn\(([^)]*)\)/g),
    ].map((match) => match[1]);

    expect(columnas).toHaveLength(2);
    columnas.forEach((args) => {
      expect(args).toMatch(/type:\s*'timestamptz'/);
    });
  });

  /**
   * `holistic_services.session_type` reusa el tipo `sessions_session_type_enum`
   * que creó la tabla `sessions`. Sin `enumName`, TypeORM lo bautiza
   * `holistic_services_session_type_enum` y el generador propone renombrar el
   * tipo en producción — cuatro sentencias para no ganar nada.
   */
  it('fija el enumName de holistic_services.session_type', () => {
    expect(
      entidad('modules/holistic-services/entities/holistic-service.entity.ts'),
    ).toMatch(/enumName:\s*'sessions_session_type_enum'/);
  });

  /**
   * `temperature` y `top_p` son `numeric(3,2)` con default `0.7` / `0.9`.
   *
   * `PostgresDriver.normalizeDefault` envuelve en comillas **tanto** los
   * defaults numéricos como los string (`0.7` y `'0.7'` dan los dos `'0.7'`),
   * pero `pg` devuelve el default de la columna sin comillas: `0.7`. O sea que
   * ninguna de las dos formas literales puede coincidir nunca, y el generador
   * repite el `SET DEFAULT` para siempre.
   *
   * La única forma que matchea es la de expresión SQL, `() => '0.7'`, que
   * `normalizeDefault` pasa tal cual. Que es además lo que se quiere decir: el
   * default es la expresión `0.7`, no el string `"0.7"`.
   */
  it('escribe los defaults decimales de tarotista_config como expresión SQL', () => {
    const source = entidad(
      'modules/tarotistas/entities/tarotista-config.entity.ts',
    );

    expect(source).toMatch(/default:\s*\(\)\s*=>\s*'0\.7'/);
    expect(source).toMatch(/default:\s*\(\)\s*=>\s*'0\.9'/);
  });
});

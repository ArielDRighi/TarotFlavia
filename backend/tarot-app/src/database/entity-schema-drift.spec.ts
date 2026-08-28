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
 * Vive en `database/` y NO en `database/migrations/` por la misma razón que
 * `entity-index-migration-sync.spec.ts`: el glob de TypeORM carga todo lo que
 * haya en esa carpeta y un `.spec.ts` ahí adentro rompe el CLI y el arranque.
 */

const SRC = path.join(__dirname, '..');

interface EntityFile {
  relative: string;
  source: string;
}

function listFiles(dir: string, suffix: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full, suffix);
    return entry.isFile() && entry.name.endsWith(suffix) ? [full] : [];
  });
}

/** Mismo criterio que el spec de índices: un decorador comentado no cuenta. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function readEntities(): EntityFile[] {
  return listFiles(SRC, '.entity.ts').map((file) => ({
    relative: path.relative(SRC, file),
    source: stripComments(fs.readFileSync(file, 'utf8')),
  }));
}

/**
 * Devuelve el texto entre los paréntesis del decorador que arranca en `start`,
 * contando anidamiento. Un `indexOf(')')` no sirve: casi todos los decoradores
 * de relación abren con `() => Entidad`, así que el primer `)` es el de la
 * arrow function y no el del decorador.
 */
function extraerArgumentos(source: string, start: number): string {
  const abre = source.indexOf('(', start);
  if (abre === -1) return '';

  let profundidad = 0;
  for (let i = abre; i < source.length; i++) {
    if (source[i] === '(') profundidad++;
    else if (source[i] === ')') {
      profundidad--;
      if (profundidad === 0) return source.slice(abre + 1, i);
    }
  }
  return '';
}

function ocurrencias(source: string, regex: RegExp): number[] {
  return [...source.matchAll(regex)].map((match) => match.index ?? 0);
}

const RELACION_CON_FK = /@(?:ManyToOne|OneToOne)\s*\(/g;
const INDICE_SIN_NOMBRE = /@Index\(\s*\)/g;

const entities = readEntities();

function entidad(relative: string): string {
  const found = entities.find((entity) => entity.relative === relative);
  if (!found) throw new Error(`No se encontró la entidad ${relative}`);
  return found.source;
}

/**
 * Canarios contra un escaneo roto. Sin ellos, un regex que no matchea nada
 * dejaría todo en verde sin haber verificado nada. Medidos el 27-ago-2026.
 */
const RELACIONES_ESPERADAS = 52;
const ENTIDADES_ESPERADAS = 40;

describe('Sincronía entre los decoradores y el esquema real (T-DEUDA-001)', () => {
  it('encuentra las entidades y las relaciones que tiene que revisar', () => {
    const relaciones = entities.reduce(
      (total, entity) =>
        total + ocurrencias(entity.source, RELACION_CON_FK).length,
      0,
    );

    expect(entities.length).toBeGreaterThanOrEqual(ENTIDADES_ESPERADAS);
    expect(relaciones).toBeGreaterThanOrEqual(RELACIONES_ESPERADAS);
  });

  /**
   * La base tiene `ON DELETE` distinto de `NO ACTION` en 30 de sus 54 FKs
   * (`pg_constraint`, verificado el 27-ago-2026: CASCADE, SET NULL y RESTRICT).
   * El default de TypeORM es `NO ACTION`, así que toda relación que no lo
   * declara le miente al generador y se gana un `DROP CONSTRAINT` +
   * `ADD CONSTRAINT`.
   *
   * Declararlo también cuando la base dice `NO ACTION` no es ceremonia: es la
   * diferencia entre "acá nadie lo pensó" y "acá se verificó y da NO ACTION".
   */
  it('declara onDelete en todas las relaciones que crean una FK', () => {
    const huerfanas = entities.flatMap((entity) =>
      ocurrencias(entity.source, RELACION_CON_FK)
        .map((start) => extraerArgumentos(entity.source, start))
        .filter((args) => !/onDelete\s*:/.test(args))
        .map(
          (args) =>
            `${entity.relative}: @Relation(${args.replace(/\s+/g, ' ').trim().slice(0, 80)})`,
        ),
    );

    expect(huerfanas).toEqual([]);
  });
});

/**
 * Un `@Index()` pelado le deja el nombre a TypeORM, que genera un hash
 * (`IDX_a1de5c775bfe9f7621ff9df64c`). Está bien **sólo** cuando la base ya
 * tiene ese hash. Donde la migración le puso un nombre legible, el decorador
 * pelado hace que el generador proponga borrar el legible y crear el hash: un
 * renombre puro que además esconde el drift de verdad.
 *
 * Allowlist verificada contra `pg_indexes` el 27-ago-2026. Estas tres tablas
 * tienen los índices con hash **en la base**, así que el decorador pelado dice
 * la verdad y hay que dejarlo como está.
 */
const INDICES_CON_HASH_EN_LA_BASE: Record<string, number> = {
  'modules/auth/entities/refresh-token.entity.ts': 2,
  'modules/cache/infrastructure/entities/cached-interpretation.entity.ts': 2,
  'modules/cache/infrastructure/entities/cache-metrics.entity.ts': 1,
};

/**
 * Índices que las migraciones crearon con nombre legible sobre columnas que una
 * entidad mapea. El decorador tiene que fijar ese nombre; si no, el generador
 * propone el renombre a hash.
 *
 * El otro extremo del lazo lo ata `entity-index-migration-sync.spec.ts`: todo
 * `@Index` con nombre exige una migración que lo cree. Los dos juntos hacen que
 * el nombre legible no se pueda romper de ningún lado.
 */
const INDICES_LEGIBLES_EN_LA_BASE: ReadonlyArray<[string, string]> = [
  ['common/entities/ip-block.entity.ts', 'IDX_ip_blocks_ip'],
  ['common/entities/ip-block.entity.ts', 'IDX_ip_blocks_blocked_until'],
  ['modules/users/entities/user.entity.ts', 'IDX_user_mp_preapproval_id'],
  [
    'modules/tarot/cards/entities/card-free-interpretation.entity.ts',
    'IDX_card_free_interpretation_cardId',
  ],
  [
    'modules/tarot/cards/entities/card-free-interpretation.entity.ts',
    'IDX_card_free_interpretation_categoryId',
  ],
  [
    'modules/holistic-services/entities/service-purchase.entity.ts',
    'idx_service_purchases_mp_payment_id',
  ],
];

/**
 * Constraints que las migraciones crearon con nombre legible. TypeORM las
 * renombraría a hash salvo que la entidad fije el nombre con
 * `foreignKeyConstraintName` (FKs) o el primer argumento de `@Unique`.
 *
 * Son 6 sobre 54: la base es mayoritariamente hash y unificarla sería cambiar
 * el esquema, que está fuera del alcance de T-DEUDA-001. La convención para lo
 * nuevo es el hash de TypeORM; estas seis se fijan porque ya existen.
 */
const CONSTRAINTS_LEGIBLES_EN_LA_BASE: ReadonlyArray<[string, string]> = [
  [
    'modules/tarot/cards/entities/card-free-interpretation.entity.ts',
    'FK_card_free_interpretation_card',
  ],
  [
    'modules/tarot/cards/entities/card-free-interpretation.entity.ts',
    'FK_card_free_interpretation_category',
  ],
  [
    'modules/tarot/cards/entities/card-free-interpretation.entity.ts',
    'UQ_card_free_interpretation_card_category_orientation',
  ],
  [
    'modules/holistic-services/entities/service-purchase.entity.ts',
    'FK_service_purchases_user',
  ],
  [
    'modules/holistic-services/entities/service-purchase.entity.ts',
    'FK_service_purchases_holistic_service',
  ],
  [
    'modules/holistic-services/entities/service-purchase.entity.ts',
    'FK_service_purchases_session',
  ],
];

describe('Nombres de índices y constraints (T-DEUDA-001)', () => {
  it('deja @Index() sin nombre sólo donde la base guarda el hash', () => {
    const inesperados = entities
      .map((entity) => ({
        archivo: entity.relative,
        pelados: ocurrencias(entity.source, INDICE_SIN_NOMBRE).length,
        permitidos: INDICES_CON_HASH_EN_LA_BASE[entity.relative] ?? 0,
      }))
      .filter(({ pelados, permitidos }) => pelados !== permitidos)
      .map(
        ({ archivo, pelados, permitidos }) =>
          `${archivo}: ${pelados} @Index() pelados, se esperaban ${permitidos}`,
      );

    expect(inesperados).toEqual([]);
  });

  it.each(INDICES_LEGIBLES_EN_LA_BASE)(
    '%s fija el nombre del índice %s',
    (relative, nombre) => {
      expect(entidad(relative)).toContain(`@Index('${nombre}'`);
    },
  );

  it.each(CONSTRAINTS_LEGIBLES_EN_LA_BASE)(
    '%s fija el nombre del constraint %s',
    (relative, nombre) => {
      expect(entidad(relative)).toContain(`'${nombre}'`);
    },
  );
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

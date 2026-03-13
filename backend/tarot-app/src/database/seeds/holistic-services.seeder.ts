import { Repository } from 'typeorm';
import { HolisticService } from '../../modules/holistic-services/entities/holistic-service.entity';
import { SessionType } from '../../modules/scheduling/domain/enums/session-type.enum';

/**
 * Datos de los 3 servicios holísticos de Flavia.
 * Los precios se dejan en 0 — el admin los configura después.
 * El whatsappNumber y mercadoPagoLink también son placeholders configurables desde admin.
 */
const holisticServicesData = [
  {
    slug: 'arbol-genealogico',
    name: 'Trabajo con el Árbol Genealógico',
    shortDescription:
      '¿Qué heredamos del árbol familiar? (y qué hacer con ello)',
    longDescription: `¿Qué hereda tu alma de tu árbol familiar? Nuestra alma hereda más de lo que imaginamos, además de rasgos, color de piel, enfermedades también emociones, lealtades y destinos no vividos.

Cada uno de nosotros somos la continuación de nuestro árbol, y por ello viven las historias no resultas de quienes vinieron antes. Sanar no es romper con la familia, es liberar tu línea y tu propósito.

Atrás de cada síntoma, miedo o bloqueo, puede haber un antepasado no reconocido, una historia de dolor, exilio, silencio o pérdida que tu alma intenta integrar.

Al mirar tu árbol con amor y conciencia, dejás de cargar su peso: comenzás a recibir su fuerza. Ahí nace el verdadero poder del linaje.

Te ayudo a:
- Identificar lealtades invisibles y cargas heredadas.
- Detectar repeticiones, secretos y dinámicas ocultas.
- Entre muchas otras para poder integrar una nueva mirada y empezar un verdadero camino de sanación.`,
    priceArs: 0,
    durationMinutes: 60,
    sessionType: SessionType.FAMILY_TREE,
    whatsappNumber: '',
    mercadoPagoLink: '',
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
  },
  {
    slug: 'pendulo-hebreo',
    name: 'Péndulo Hebreo',
    shortDescription: 'Sanación y transformación energética con letras hebreas',
    longDescription: `Tiene por objeto tratar, sanar y transformar la energía, en todos los niveles y manifestaciones, llevando armonía y sanación allí donde son necesarias.

No se sabe a ciencia cierta el origen del Péndulo Hebreo. Fuentes indican que fue transmitido en Europa por los soldados templarios, quienes incorporaron este conocimiento de los más destacados kabalistas hebreos mientras cohabitaron en los tiempos de las Cruzadas.

Las letras hebreas son lo más importante de este método. El idioma hebreo es extremadamente potente. En la Torá está escrito que hasta el famoso incidente de la Torre de Babel, toda la humanidad hablaba el mismo idioma: el hebreo bíblico, el lenguaje de la creación. En el libro del Génesis, que narra la forma en que Dios creó el mundo: Dios dijo: "Sea la luz, y fue la Luz". Estas palabras contenían la Energía Divina que creó la luz. Todo lo que existe fue creado por la energía contenida en esas palabras hebreas.`,
    priceArs: 0,
    durationMinutes: 60,
    sessionType: SessionType.HEBREW_PENDULUM,
    whatsappNumber: '',
    mercadoPagoLink: '',
    imageUrl: null,
    displayOrder: 2,
    isActive: true,
  },
  {
    slug: 'limpiezas-energeticas',
    name: 'Limpiezas Energéticas',
    shortDescription: 'Armonización de espacios, personas y caminos',
    longDescription: `De espacios físicos tanto laborales como del hogar, armonizaciones energéticas de personas, de espacios, canalizaciones de energías estancadas, aperturas de caminos, limpiezas de negocios y emprendimientos.`,
    priceArs: 0,
    durationMinutes: 60,
    sessionType: SessionType.ENERGY_CLEANING,
    whatsappNumber: '',
    mercadoPagoLink: '',
    imageUrl: null,
    displayOrder: 3,
    isActive: true,
  },
];

/**
 * Seeds the 3 holistic services offered by Flavia.
 * Idempotent: uses slug as unique key — will not duplicate on re-run.
 *
 * @param holisticServiceRepository - TypeORM repository for HolisticService entity
 */
export async function seedHolisticServices(
  holisticServiceRepository: Repository<HolisticService>,
): Promise<void> {
  console.log('🔍 Checking holistic services...');

  for (const serviceData of holisticServicesData) {
    const existing = await holisticServiceRepository.findOne({
      where: { slug: serviceData.slug },
    });

    if (existing) {
      console.log(
        `   ✅ Service already exists: "${serviceData.name}" (slug: ${serviceData.slug})`,
      );
      continue;
    }

    const service = holisticServiceRepository.create(serviceData);
    await holisticServiceRepository.save(service);
    console.log(`   🌱 Created service: "${serviceData.name}"`);
  }

  console.log('✅ Holistic services seed completed');
}

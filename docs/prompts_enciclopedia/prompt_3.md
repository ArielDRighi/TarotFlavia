export const ARTICLE_RELATIONS: Record<string, string[]> = {
// --- SIGNOS ZODIACALES (Regente, Elemento, Modalidad, Casa, Afines) ---
'aries': ['marte', 'fuego', 'cardinal', 'casa-1', 'leo', 'sagitario'],
'tauro': ['venus', 'tierra', 'fija', 'casa-2', 'virgo', 'capricornio'],
'geminis': ['mercurio', 'aire', 'mutable', 'casa-3', 'libra', 'acuario'],
'cancer': ['luna', 'agua', 'cardinal', 'casa-4', 'escorpio', 'piscis'],
'leo': ['sol', 'fuego', 'fija', 'casa-5', 'aries', 'sagitario'],
'virgo': ['mercurio', 'tierra', 'mutable', 'casa-6', 'tauro', 'capricornio'],
'libra': ['venus', 'aire', 'cardinal', 'casa-7', 'geminis', 'acuario'],
'escorpio': ['pluton', 'agua', 'fija', 'casa-8', 'cancer', 'piscis'],
'sagitario': ['jupiter', 'fuego', 'mutable', 'casa-9', 'aries', 'leo'],
'capricornio': ['saturno', 'tierra', 'cardinal', 'casa-10', 'tauro', 'virgo'],
'acuario': ['urano', 'aire', 'fija', 'casa-11', 'geminis', 'libra'],
'piscis': ['neptuno', 'agua', 'mutable', 'casa-12', 'cancer', 'escorpio'],

// --- PLANETAS (Signos que rigen, dignidades elementales, y herramientas) ---
'sol': ['leo', 'fuego', 'casa-5', 'guia-carta-astral', 'guia-horoscopo'],
'luna': ['cancer', 'agua', 'casa-4', 'guia-carta-astral', 'guia-ritual'],
'mercurio': ['geminis', 'virgo', 'aire', 'tierra', 'guia-carta-astral'],
'venus': ['tauro', 'libra', 'tierra', 'aire', 'guia-carta-astral'],
'marte': ['aries', 'escorpio', 'fuego', 'guia-carta-astral'],
'jupiter': ['sagitario', 'piscis', 'fuego', 'guia-carta-astral'],
'saturno': ['capricornio', 'acuario', 'tierra', 'guia-carta-astral'],
'urano': ['acuario', 'aire', 'guia-carta-astral'],
'neptuno': ['piscis', 'agua', 'guia-carta-astral'],
'pluton': ['escorpio', 'agua', 'guia-carta-astral'],

// --- CASAS ASTROLÓGICAS (Signo natural, planeta natural, modalidades, guías) ---
'casa-1': ['aries', 'marte', 'cardinal', 'guia-carta-astral'],
'casa-2': ['tauro', 'venus', 'fija', 'guia-carta-astral'],
'casa-3': ['geminis', 'mercurio', 'mutable', 'guia-carta-astral'],
'casa-4': ['cancer', 'luna', 'cardinal', 'guia-carta-astral'],
'casa-5': ['leo', 'sol', 'fija', 'guia-carta-astral'],
'casa-6': ['virgo', 'mercurio', 'mutable', 'guia-carta-astral'],
'casa-7': ['libra', 'venus', 'cardinal', 'guia-carta-astral'],
'casa-8': ['escorpio', 'pluton', 'fija', 'guia-carta-astral'],
'casa-9': ['sagitario', 'jupiter', 'mutable', 'guia-carta-astral'],
'casa-10': ['capricornio', 'saturno', 'cardinal', 'guia-carta-astral'],
'casa-11': ['acuario', 'urano', 'fija', 'guia-carta-astral'],
'casa-12': ['piscis', 'neptuno', 'mutable', 'guia-carta-astral'],

// --- ELEMENTOS (Signos que los componen y resonancia esotérica) ---
'fuego': ['aries', 'leo', 'sagitario', 'marte', 'sol'],
'tierra': ['tauro', 'virgo', 'capricornio', 'venus', 'saturno'],
'aire': ['geminis', 'libra', 'acuario', 'mercurio', 'urano'],
'agua': ['cancer', 'escorpio', 'piscis', 'luna', 'neptuno'],

// --- MODALIDADES (Signos que comparten ritmo energético) ---
'cardinal': ['aries', 'cancer', 'libra', 'capricornio'], // Inicios
'fija': ['tauro', 'leo', 'escorpio', 'acuario'], // Sostenimiento
'mutable': ['geminis', 'virgo', 'sagitario', 'piscis'], // Transición

// --- GUÍAS PRÁCTICAS Y ESOTÉRICAS (Interconexiones temáticas) ---
'guia-numerologia': ['guia-carta-astral', 'sol', 'luna', 'saturno', 'guia-horoscopo'],
'guia-pendulo': ['guia-ritual', 'agua', 'luna', 'neptuno'], // Adivinación y subconsciente
'guia-carta-astral': ['sol', 'luna', 'casa-1', 'guia-horoscopo'], // Los "Big 3" y base de predicción
'guia-ritual': ['luna', 'fuego', 'agua', 'guia-pendulo'], // Magia natural y ciclos lunares
'guia-horoscopo': ['sol', 'guia-carta-astral', 'guia-horoscopo-chino', 'aries', 'piscis'], // Alfa/Omega del zodiaco y afines
'guia-horoscopo-chino': ['guia-horoscopo', 'jupiter', 'luna', 'tierra'] // Júpiter rige los ciclos de 12 años, astrología lunar
};

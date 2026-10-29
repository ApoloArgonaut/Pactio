import { randomBytes, timingSafeEqual } from 'crypto';

/**
 * Alfabeto canónico Crockford Base32 (32 caracteres).
 * Excluye explícitamente:
 * - 'I', 'L' para evitar confusión visual con '1'.
 * - 'O' para evitar confusión visual con '0'.
 * - 'U' para prevenir formación accidental de palabras altisonantes en inglés/español.
 */
export const CROCKFORD_BASE32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const DEFAULT_CODE_PREFIX = 'PACT-';
export const DEFAULT_RANDOM_LENGTH = 5;

/**
 * Entropía en bits por carácter en Crockford Base32 (log2(32) = 5 bits).
 */
export const BITS_PER_CROCKFORD_CHAR = 5;

/**
 * Expresión regular para validar formato PACT-XXXXX (de 5 a 8 caracteres Crockford).
 */
export const CONTRACT_CODE_REGEX = /^PACT-[0-9A-HJKMNP-TV-Z]{5,8}$/;

/**
 * Genera un identificador humano único en Crockford Base32 sin sesgo de módulo.
 * Debido a que el alfabeto tiene exactamente 32 caracteres (2^5 = 32),
 * cada índice se extrae utilizando una máscara de 5 bits (0x1F) sobre bytes aleatorios CSPRNG,
 * garantizando una distribución perfectamente uniforme y criptográficamente segura.
 * 
 * @param length Longitud de la secuencia aleatoria (por defecto 5, produciendo 'PACT-XXXXX')
 * @param prefix Prefijo nemotécnico (por defecto 'PACT-')
 * @returns Código único legible (ej. 'PACT-8X9K2')
 */
export function generateContractCode(
  length: number = DEFAULT_RANDOM_LENGTH,
  prefix: string = DEFAULT_CODE_PREFIX
): string {
  if (length < 4 || length > 12) {
    throw new Error('La longitud del código aleatorio debe ubicarse entre 4 y 12 caracteres.');
  }

  // Obtenemos bytes aleatorios de alta entropía (CSPRNG)
  const bytes = randomBytes(length);
  let code = '';

  for (let i = 0; i < length; i++) {
    // Máscara 0x1F (0001 1111 en binario = 31 en decimal)
    // Extrae exactamente 5 bits, mapeando de forma uniforme al rango 0..31
    const index = bytes[i] & 0x1f;
    code += CROCKFORD_BASE32_ALPHABET[index];
  }

  return `${prefix}${code}`;
}

/**
 * Normaliza un código ingresado manualmente por un usuario:
 * - Convierte a mayúsculas y retira espacios en blanco.
 * - Sustituye 'I' y 'L' por '1'.
 * - Sustituye 'O' por '0'.
 * - Añade el prefijo 'PACT-' si el usuario solo ingresó el sufijo.
 */
export function normalizeContractCode(input: string): string {
  let cleaned = input.trim().toUpperCase();

  // Si no incluye el prefijo, se lo añade
  if (!cleaned.startsWith(DEFAULT_CODE_PREFIX)) {
    // Si tiene un guión huérfano al inicio
    cleaned = cleaned.replace(/^-+/, '');
    cleaned = `${DEFAULT_CODE_PREFIX}${cleaned}`;
  }

  const prefixPart = cleaned.slice(0, DEFAULT_CODE_PREFIX.length);
  let suffixPart = cleaned.slice(DEFAULT_CODE_PREFIX.length);

  // Mapeo Crockford de caracteres equívocos
  suffixPart = suffixPart
    .replace(/[IL]/g, '1')
    .replace(/O/g, '0');

  return `${prefixPart}${suffixPart}`;
}

/**
 * Valida si un código cumple con la especificación de Pactio en Crockford Base32.
 */
export function isValidContractCode(code: string): boolean {
  return CONTRACT_CODE_REGEX.test(code);
}

/**
 * Calcula la probabilidad teórica de colisión mediante la aproximación de la Paradoja del Cumpleaños.
 * Fórmula: P(colisión) ≈ 1 - exp(- (k^2) / (2 * N))
 * 
 * @param numberOfContracts Número de contratos generados (k)
 * @param codeLength Longitud de caracteres aleatorios (por defecto 5)
 * @returns Probabilidad decimal entre 0.0 y 1.0
 */
export function calculateCollisionProbability(
  numberOfContracts: number,
  codeLength: number = DEFAULT_RANDOM_LENGTH
): number {
  const totalCombinations = Math.pow(32, codeLength);
  const exponent = -Math.pow(numberOfContracts, 2) / (2 * totalCombinations);
  return 1 - Math.exp(exponent);
}

/**
 * Comparación de cadenas en tiempo constante para mitigar ataques de temporización (Timing Attacks).
 * Previene la fuga de información mediante diferencias en microsegundos durante la verificación de
 * códigos, firmas, hashes o tokens sensibles.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  if (bufA.length !== bufB.length) {
    // Para mitigar ataques basados en longitud, realizamos una comparación ficticia en tiempo constante
    timingSafeEqual(bufA, bufA);
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

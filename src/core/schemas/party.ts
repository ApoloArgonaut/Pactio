import { z } from 'zod';

/**
 * Expresión regular oficial del Servicio de Administración Tributaria (SAT) para RFC en México:
 * - Personas Morales: 3 caracteres alfabéticos + 6 dígitos de fecha + 3 caracteres de homoclave (12 chars).
 * - Personas Físicas: 4 caracteres alfabéticos + 6 dígitos de fecha + 3 caracteres de homoclave (13 chars).
 */
export const SAT_RFC_REGEX = /^[A-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]$/;

/**
 * Tabla canónica de valores de caracteres para el algoritmo Módulo 11 del SAT.
 */
const SAT_CHAR_VALUES: Record<string, number> = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 18,
  'J': 19, 'K': 20, 'L': 21, 'M': 22, 'N': 23, '&': 24, 'O': 25, 'P': 26, 'Q': 27,
  'R': 28, 'S': 29, 'T': 30, 'U': 31, 'V': 32, 'W': 33, 'X': 34, 'Y': 35, 'Z': 36,
  ' ': 37, 'Ñ': 38
};

/**
 * Validador algorítmico del dígito verificador Módulo 11 del SAT.
 */
export function validateSatRfcChecksum(rfcInput: string): boolean {
  const rfc = rfcInput.trim().toUpperCase();
  if (!SAT_RFC_REGEX.test(rfc)) {
    return false;
  }

  // Si es persona moral (12 caracteres), se antepone un espacio para normalizar a 13 posiciones
  const normalizedRfc = rfc.length === 12 ? ` ${rfc}` : rfc;
  const baseChars = normalizedRfc.slice(0, 12);
  const expectedCheckDigit = normalizedRfc.slice(12, 13);

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const char = baseChars[i];
    const value = SAT_CHAR_VALUES[char];
    if (value === undefined) return false;
    // Ponderación descendente de 13 a 2
    sum += value * (13 - i);
  }

  const remainder = sum % 11;
  let computedDigit = '';

  if (remainder === 0) {
    computedDigit = '0';
  } else {
    const diff = 11 - remainder;
    if (diff === 10) {
      computedDigit = 'A';
    } else if (diff === 11) {
      computedDigit = '0';
    } else {
      computedDigit = diff.toString();
    }
  }

  return computedDigit === expectedCheckDigit;
}

/**
 * Esquema de validación para dirección física en México.
 */
export const AddressSchema = z.object({
  street: z.string().min(2, 'La calle es requerida').max(100),
  exteriorNumber: z.string().min(1, 'Número exterior requerido').max(20),
  interiorNumber: z.string().max(20).optional(),
  neighborhood: z.string().min(2, 'Colonia requerida').max(100),
  municipality: z.string().min(2, 'Municipio o Alcaldía requerida').max(100),
  state: z.string().min(2, 'Estado requerido').max(50),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'El código postal debe constar de 5 dígitos numéricos'),
  country: z.string().default('México')
});

/**
 * Esquema de datos bancarios con validación de CLABE interbancaria (18 dígitos).
 */
export const BankAccountSchema = z.object({
  bankName: z.string().min(2, 'Nombre de la entidad bancaria requerido'),
  clabe: z.string().regex(/^[0-9]{18}$/, 'La CLABE interbancaria debe tener exactamente 18 dígitos numéricos'),
  accountHolder: z.string().min(2, 'Nombre del titular de la cuenta requerido')
});

/**
 * Esquema de Representante Legal para personas morales.
 */
export const LegalRepresentativeSchema = z.object({
  fullName: z.string().min(3, 'Nombre del representante legal requerido'),
  rfc: z.string().regex(SAT_RFC_REGEX, 'RFC de representante legal inválido'),
  notarialDeedNumber: z.string().min(1, 'Número de instrumento notarial / poder requerido')
});

/**
 * Esquema exhaustivo de Parte Contractual (Creador o Cliente).
 */
export const PartySchema = z.object({
  id: z.string().uuid().optional(),
  role: z.enum(['creator', 'client']),
  personType: z.enum(['physical', 'moral']),
  legalName: z.string().min(2, 'La razón social o nombre legal es obligatorio').max(150),
  commercialName: z.string().max(100).optional(),
  rfc: z.string()
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => SAT_RFC_REGEX.test(val), {
      message: 'Formato de RFC inválido ante el SAT (debe tener 12 o 13 caracteres).'
    }),
  taxRegime: z.string().max(80).optional(), // ej. "626 - Régimen Simplificado de Confianza (RESICO)"
  email: z.string().email('Dirección de correo electrónico inválida'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Número de teléfono inválido (de 10 a 15 dígitos)').optional(),
  address: AddressSchema,
  bankAccount: BankAccountSchema.optional(),
  legalRepresentative: LegalRepresentativeSchema.optional()
});

/**
 * Validador Zod de RFC con verificación estricta de estructura y Módulo 11 del SAT.
 */
export const StrictSatRfcSchema = z.string()
  .transform((val) => val.trim().toUpperCase())
  .refine((val) => SAT_RFC_REGEX.test(val), {
    message: 'Formato de RFC inválido ante el SAT (debe tener 12 o 13 caracteres).'
  })
  .refine((val) => validateSatRfcChecksum(val), {
    message: 'El RFC no coincide con el dígito verificador oficial del SAT (Módulo 11).'
  });

/**
 * Esquema estricto de Parte Contractual que exige RFC con dígito verificador válido ante el SAT.
 */
export const StrictPartySchema = PartySchema.extend({
  rfc: StrictSatRfcSchema
});

export type Party = z.infer<typeof PartySchema>;
export type StrictParty = z.infer<typeof StrictPartySchema>;
export type Address = z.infer<typeof AddressSchema>;
export type BankAccount = z.infer<typeof BankAccountSchema>;
export type LegalRepresentative = z.infer<typeof LegalRepresentativeSchema>;

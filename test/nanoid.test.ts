import { describe, it, expect } from 'vitest';
import {
  generateContractCode,
  normalizeContractCode,
  isValidContractCode,
  calculateCollisionProbability,
  CROCKFORD_BASE32_ALPHABET,
  DEFAULT_CODE_PREFIX,
  DEFAULT_RANDOM_LENGTH,
  CONTRACT_CODE_REGEX
} from '../src/core/crypto/nanoid.js';

describe('Suite de Pruebas: Generador y Validador NanoID Crockford Base32', () => {

  describe('1. Alfabeto Canónico Crockford Base32 (32 caracteres)', () => {
    it('posee exactamente 32 caracteres para coincidir con potencias binarias (2^5 = 32)', () => {
      expect(CROCKFORD_BASE32_ALPHABET).toHaveLength(32);
      expect(CROCKFORD_BASE32_ALPHABET).toBe('0123456789ABCDEFGHJKMNPQRSTVWXYZ');
    });

    it('excluye rigurosamente caracteres visualmente ambiguos (I, L, O)', () => {
      expect(CROCKFORD_BASE32_ALPHABET).not.toContain('I'); // Confusión con 1
      expect(CROCKFORD_BASE32_ALPHABET).not.toContain('L'); // Confusión con 1
      expect(CROCKFORD_BASE32_ALPHABET).not.toContain('O'); // Confusión con 0
    });

    it('excluye deliberadamente la letra "U" para evitar formación accidental de palabras altisonantes', () => {
      expect(CROCKFORD_BASE32_ALPHABET).not.toContain('U');
    });

    it('valida que todos los caracteres generados pertenezcan exclusivamente al alfabeto permitido', () => {
      for (let i = 0; i < 100; i++) {
        const code = generateContractCode(6);
        const suffix = code.replace(DEFAULT_CODE_PREFIX, '');
        for (const char of suffix) {
          expect(CROCKFORD_BASE32_ALPHABET).toContain(char);
        }
      }
    });
  });

  describe('2. Generación Criptográfica y Unicidad (CSPRNG)', () => {
    it('genera códigos con el prefijo por defecto "PACT-" y longitud de 5 caracteres aleatorios', () => {
      const code = generateContractCode();
      expect(code.startsWith('PACT-')).toBe(true);
      expect(code).toHaveLength(10); // 'PACT-' (5) + 'XXXXX' (5)
      expect(code).toMatch(/^PACT-[0-9A-HJKMNP-TV-Z]{5}$/);
    });

    it('soporta longitudes personalizadas entre 4 y 12 caracteres', () => {
      expect(generateContractCode(4)).toMatch(/^PACT-[0-9A-HJKMNP-TV-Z]{4}$/);
      expect(generateContractCode(8)).toMatch(/^PACT-[0-9A-HJKMNP-TV-Z]{8}$/);
      expect(generateContractCode(12)).toMatch(/^PACT-[0-9A-HJKMNP-TV-Z]{12}$/);
    });

    it('permite personalizar el prefijo del contrato', () => {
      const customPrefix = generateContractCode(5, 'PROP-');
      expect(customPrefix.startsWith('PROP-')).toBe(true);
      expect(customPrefix).toMatch(/^PROP-[0-9A-HJKMNP-TV-Z]{5}$/);
    });

    it('lanza un error si la longitud del código es menor a 4 o mayor a 12 caracteres', () => {
      expect(() => generateContractCode(3)).toThrowError(/entre 4 y 12/);
      expect(() => generateContractCode(13)).toThrowError(/entre 4 y 12/);
    });

    it('demuestra alta entropía y cero colisiones en una muestra representativa de identificadores consecutivos', () => {
      const sampleSize = 500;
      const generatedCodes = new Set<string>();

      for (let i = 0; i < sampleSize; i++) {
        const code = generateContractCode(5);
        expect(generatedCodes.has(code)).toBe(false); // Cero colisiones
        generatedCodes.add(code);
      }

      expect(generatedCodes.size).toBe(sampleSize);
    });

    it('presenta distribución uniforme en los 32 símbolos sin sesgo de módulo (bitmask 0x1F)', () => {
      const frequencies: Record<string, number> = {};
      for (const char of CROCKFORD_BASE32_ALPHABET) {
        frequencies[char] = 0;
      }

      // Generar 16,000 caracteres (promedio esperado: 500 apariciones por símbolo)
      const iterations = 3200;
      for (let i = 0; i < iterations; i++) {
        const code = generateContractCode(5);
        const suffix = code.replace(DEFAULT_CODE_PREFIX, '');
        for (const char of suffix) {
          frequencies[char]++;
        }
      }

      // Validar que cada uno de los 32 caracteres haya sido utilizado
      for (const char of CROCKFORD_BASE32_ALPHABET) {
        expect(frequencies[char]).toBeGreaterThan(300);
        expect(frequencies[char]).toBeLessThan(700);
      }
    });
  });

  describe('3. Normalización e Insensibilidad a Mayúsculas/Minúsculas', () => {
    it('normaliza entradas con minúsculas y espacios en blanco al formato canónico', () => {
      expect(normalizeContractCode('  pact-8x9k2  ')).toBe('PACT-8X9K2');
      expect(normalizeContractCode('pact-4m7q1')).toBe('PACT-4M7Q1');
    });

    it('agrega automáticamente el prefijo PACT- si el usuario solo ingresa los 5 caracteres', () => {
      expect(normalizeContractCode('8x9k2')).toBe('PACT-8X9K2');
      expect(normalizeContractCode('4M7Q1')).toBe('PACT-4M7Q1');
    });

    it('elimina guiones huérfanos al inicio del texto ingresado', () => {
      expect(normalizeContractCode('-8x9k2')).toBe('PACT-8X9K2');
      expect(normalizeContractCode('--8X9K2')).toBe('PACT-8X9K2');
    });

    it('sustituye caracteres equívocos "I" y "L" por "1" según especificación Crockford', () => {
      // 'pact-8ilo0': I->1, L->1, O->0
      expect(normalizeContractCode('pact-8ilo0')).toBe('PACT-81100');
      expect(normalizeContractCode('ilil')).toBe('PACT-1111');
    });

    it('sustituye el carácter equívoco "O" por el dígito numérico "0"', () => {
      expect(normalizeContractCode('pact-ooooo')).toBe('PACT-00000');
      expect(normalizeContractCode('8O9K2')).toBe('PACT-809K2');
    });

    it('permite búsqueda determinista O(1) con normalización en tiempo real (QA-SRCH-01, QA-SRCH-02)', () => {
      const mockDatabase = new Map<string, string>();
      const canonicalKey = 'PACT-8X9K2';
      mockDatabase.set(canonicalKey, 'Contrato Sofía & NovaTech');

      const userQueries = [
        'PACT-8X9K2',
        'pact-8x9k2',
        '  pact-8x9k2  ',
        '8x9k2',
        '8X9K2'
      ];

      for (const query of userQueries) {
        const normalized = normalizeContractCode(query);
        expect(mockDatabase.get(normalized)).toBe('Contrato Sofía & NovaTech');
      }
    });
  });

  describe('4. Validación de Código de Contrato (isValidContractCode)', () => {
    it('retorna true para códigos en formato canónico PACT-XXXXX válido', () => {
      expect(isValidContractCode('PACT-8X9K2')).toBe(true);
      expect(isValidContractCode('PACT-00000')).toBe(true);
      expect(isValidContractCode('PACT-ZZZZZ')).toBe(true);
      expect(isValidContractCode('PACT-12345678')).toBe(true); // 8 caracteres
    });

    it('retorna false para códigos que contengan caracteres prohibidos (I, L, O, U)', () => {
      expect(isValidContractCode('PACT-8I9K2')).toBe(false);
      expect(isValidContractCode('PACT-8L9K2')).toBe(false);
      expect(isValidContractCode('PACT-8O9K2')).toBe(false);
      expect(isValidContractCode('PACT-8U9K2')).toBe(false);
    });

    it('retorna false si la longitud no se ubica entre 5 y 8 caracteres Crockford', () => {
      expect(isValidContractCode('PACT-1234')).toBe(false);        // 4 chars (muy corto)
      expect(isValidContractCode('PACT-123456789')).toBe(false);   // 9 chars (muy largo)
    });

    it('retorna false si no contiene el prefijo PACT-', () => {
      expect(isValidContractCode('8X9K2')).toBe(false);
      expect(isValidContractCode('PROP-8X9K2')).toBe(false);
    });
  });

  describe('5. Cálculo de Probabilidad Matemática de Colisión (Paradoja del Cumpleaños)', () => {
    it('calcula la probabilidad teórica para 1,000 contratos (~1.48% en 33.5M de combinaciones)', () => {
      const prob = calculateCollisionProbability(1000, 5);
      // Espacio total N = 32^5 = 33,554,432
      // P ≈ 1 - exp(- 1000^2 / (2 * 33,554,432)) ≈ 0.01479 (1.48%)
      expect(prob).toBeGreaterThan(0.014);
      expect(prob).toBeLessThan(0.016);
    });

    it('demuestra probabilidad de colisión ínfima (< 0.02%) para un creador con 100 contratos', () => {
      const prob100 = calculateCollisionProbability(100, 5);
      expect(prob100).toBeLessThan(0.0002);
    });

    it('demuestra que aumentar la longitud a 8 caracteres reduce la probabilidad de colisión a cero práctico', () => {
      // Para 10,000 contratos con longitud 8 (32^8 ≈ 1.09 billones de combinaciones)
      const probLong = calculateCollisionProbability(10000, 8);
      expect(probLong).toBeLessThan(0.0001); // Menor al 0.01%
    });
  });

});

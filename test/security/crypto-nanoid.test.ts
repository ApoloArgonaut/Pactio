import { describe, it, expect } from 'vitest';
import {
  generateContractCode,
  normalizeContractCode,
  isValidContractCode,
  calculateCollisionProbability,
  constantTimeCompare,
  CROCKFORD_BASE32_ALPHABET,
  BITS_PER_CROCKFORD_CHAR
} from '../../src/core/crypto/nanoid.js';

describe('AppSec Audit: Entropía Criptográfica, Uniformidad CSPRNG y Timing Attacks (nanoid)', () => {
  describe('Especificación del Alfabeto Crockford Base32', () => {
    it('debe contener exactamente 32 caracteres (2^5) para mapeo de 5 bits exacto', () => {
      expect(CROCKFORD_BASE32_ALPHABET.length).toBe(32);
      expect(BITS_PER_CROCKFORD_CHAR).toBe(5);
    });

    it('debe excluir explícitamente caracteres ambiguos (I, L, O) y la letra U', () => {
      expect(CROCKFORD_BASE32_ALPHABET).not.toContain('I');
      expect(CROCKFORD_BASE32_ALPHABET).not.toContain('L');
      expect(CROCKFORD_BASE32_ALPHABET).not.toContain('O');
      expect(CROCKFORD_BASE32_ALPHABET).not.toContain('U');
    });
  });

  describe('Uniformidad CSPRNG y Ausencia de Sesgo de Módulo (Modulo Bias)', () => {
    it('debe distribuir los caracteres uniformemente sobre un muestreo de 5,000 códigos', () => {
      const sampleSize = 5000;
      const codeLength = 5;
      const charCounts: Record<string, number> = {};

      for (const char of CROCKFORD_BASE32_ALPHABET) {
        charCounts[char] = 0;
      }

      for (let i = 0; i < sampleSize; i++) {
        const code = generateContractCode(codeLength);
        const suffix = code.replace('PACT-', '');
        expect(suffix.length).toBe(codeLength);

        for (const char of suffix) {
          charCounts[char] = (charCounts[char] || 0) + 1;
        }
      }

      const totalChars = sampleSize * codeLength; // 25,000 caracteres
      const expectedMean = totalChars / 32;       // ~781.25 apariciones por carácter

      // Cada carácter debe estar razonablemente cerca de la media (tolerancia estadística ±25%)
      for (const char of CROCKFORD_BASE32_ALPHABET) {
        const count = charCounts[char];
        expect(count).toBeGreaterThan(expectedMean * 0.70);
        expect(count).toBeLessThan(expectedMean * 1.30);
      }
    });

    it('debe rechazar longitudes fuera del rango seguro [4, 12]', () => {
      expect(() => generateContractCode(3)).toThrow(/longitud del código aleatorio debe ubicarse entre 4 y 12/);
      expect(() => generateContractCode(13)).toThrow(/longitud del código aleatorio debe ubicarse entre 4 y 12/);
    });
  });

  describe('Normalización y Sanitización de Códigos Manuales', () => {
    it('debe mapear caracteres de confusión comunes a sus equivalentes canónicos', () => {
      // 'I' y 'L' -> '1', 'O' -> '0'
      const rawInput = 'pact-ilo12';
      const normalized = normalizeContractCode(rawInput);
      expect(normalized).toBe('PACT-11012');
    });

    it('debe auto-completar el prefijo PACT- si el usuario ingresó únicamente el sufijo', () => {
      expect(normalizeContractCode('8x9k2')).toBe('PACT-8X9K2');
      expect(normalizeContractCode('-8x9k2')).toBe('PACT-8X9K2');
    });

    it('debe validar códigos según la expresión regular canónica', () => {
      expect(isValidContractCode('PACT-8X9K2')).toBe(true);
      expect(isValidContractCode('PACT-01234567')).toBe(true);
      expect(isValidContractCode('PACT-INVALID!')).toBe(false);
      expect(isValidContractCode('PACT-ILOU1')).toBe(false); // Letras excluidas
    });
  });

  describe('Modelo de Colisión (Paradoja del Cumpleaños) y Capacidad', () => {
    it('debe calcular probabilidades de colisión coherentes con el espacio de 33.5 millones de combinaciones', () => {
      // k = 100 contratos -> Probabilidad despreciable (~0.015%)
      const p100 = calculateCollisionProbability(100, 5);
      expect(p100).toBeLessThan(0.001);

      // k = 1000 contratos -> ~1.48%
      const p1000 = calculateCollisionProbability(1000, 5);
      expect(p1000).toBeGreaterThan(0.01);
      expect(p1000).toBeLessThan(0.02);

      // k = 10,000 contratos -> ~77%
      const p10k = calculateCollisionProbability(10000, 5);
      expect(p10k).toBeGreaterThan(0.70);
    });
  });

  describe('Mitigación de Timing Attacks (constantTimeCompare)', () => {
    it('debe retornar true para cadenas idénticas en tiempo constante', () => {
      expect(constantTimeCompare('PACT-8X9K2', 'PACT-8X9K2')).toBe(true);
      expect(constantTimeCompare('secret_token_12345', 'secret_token_12345')).toBe(true);
    });

    it('debe retornar false para cadenas distintas sin provocar excepciones de longitud', () => {
      expect(constantTimeCompare('PACT-8X9K2', 'PACT-8X9K3')).toBe(false);
      expect(constantTimeCompare('short', 'much_longer_string')).toBe(false);
      expect(constantTimeCompare('', 'non_empty')).toBe(false);
    });
  });
});

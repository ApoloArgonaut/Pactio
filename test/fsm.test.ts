import { describe, it, expect } from 'vitest';
import {
  ALLOWED_TRANSITIONS,
  FROZEN_STATES,
  canTransition,
  assertCanTransition,
  isDocumentFrozen
} from '../src/core/fsm/contract-fsm.js';
import type { ContractStatus } from '../src/core/schemas/contract.js';

describe('Suite de Pruebas: Máquina de Estados Finita (FSM) de Pactio', () => {

  describe('1. Flujo Feliz y Ciclo de Vida Estándar', () => {
    it('permite el flujo de firma donde el creador firma primero', () => {
      // DRAFT -> PENDING_CLIENT_REVIEW -> PENDING_SIGNATURE -> SIGNED_CREATOR -> SIGNED_BOTH_PENDING_PSC -> COMPLETED_NOM151
      expect(canTransition('DRAFT', 'PENDING_CLIENT_REVIEW')).toBe(true);
      expect(canTransition('PENDING_CLIENT_REVIEW', 'PENDING_SIGNATURE')).toBe(true);
      expect(canTransition('PENDING_SIGNATURE', 'SIGNED_CREATOR')).toBe(true);
      expect(canTransition('SIGNED_CREATOR', 'SIGNED_BOTH_PENDING_PSC')).toBe(true);
      expect(canTransition('SIGNED_BOTH_PENDING_PSC', 'COMPLETED_NOM151')).toBe(true);
    });

    it('permite el flujo de firma donde el cliente firma primero', () => {
      // PENDING_SIGNATURE -> SIGNED_CLIENT -> SIGNED_BOTH_PENDING_PSC -> COMPLETED_NOM151
      expect(canTransition('PENDING_SIGNATURE', 'SIGNED_CLIENT')).toBe(true);
      expect(canTransition('SIGNED_CLIENT', 'SIGNED_BOTH_PENDING_PSC')).toBe(true);
      expect(canTransition('SIGNED_BOTH_PENDING_PSC', 'COMPLETED_NOM151')).toBe(true);
    });
  });

  describe('2. Ciclo de Negociación Paramétrica (Redlining) y Retorno a PENDING_CLIENT_REVIEW', () => {
    it('permite al cliente solicitar ajustes desde PENDING_CLIENT_REVIEW', () => {
      expect(canTransition('PENDING_CLIENT_REVIEW', 'ADJUSTMENT_REQUESTED')).toBe(true);
    });

    it('permite al creador emitir una contrapropuesta desde ADJUSTMENT_REQUESTED', () => {
      expect(canTransition('ADJUSTMENT_REQUESTED', 'COUNTER_PROPOSED')).toBe(true);
    });

    it('garantiza que el ciclo de contrapropuesta retorne formalmente a PENDING_CLIENT_REVIEW', () => {
      // Regla de paridad: Toda contrapropuesta emitida por el creador debe volver a revisión del cliente
      expect(canTransition('COUNTER_PROPOSED', 'PENDING_CLIENT_REVIEW')).toBe(true);
      expect(() => assertCanTransition('COUNTER_PROPOSED', 'PENDING_CLIENT_REVIEW')).not.toThrow();
    });

    it('permite al creador aceptar los ajustes del cliente y retornar a PENDING_CLIENT_REVIEW', () => {
      expect(canTransition('ADJUSTMENT_REQUESTED', 'PENDING_CLIENT_REVIEW')).toBe(true);
      expect(() => assertCanTransition('ADJUSTMENT_REQUESTED', 'PENDING_CLIENT_REVIEW')).not.toThrow();
    });

    it('soporta rondas sucesivas de negociación antes del acuerdo mutuo', () => {
      // Ronda 1: Cliente ajusta -> Creador contrapropone -> Cliente solicita segundo ajuste
      expect(canTransition('PENDING_CLIENT_REVIEW', 'ADJUSTMENT_REQUESTED')).toBe(true);
      expect(canTransition('ADJUSTMENT_REQUESTED', 'COUNTER_PROPOSED')).toBe(true);
      expect(canTransition('COUNTER_PROPOSED', 'ADJUSTMENT_REQUESTED')).toBe(true);

      // Ronda 2: Creador contrapropone -> Retorna a revisión -> Aprobado para firma
      expect(canTransition('ADJUSTMENT_REQUESTED', 'COUNTER_PROPOSED')).toBe(true);
      expect(canTransition('COUNTER_PROPOSED', 'PENDING_CLIENT_REVIEW')).toBe(true);
      expect(canTransition('PENDING_CLIENT_REVIEW', 'PENDING_SIGNATURE')).toBe(true);
    });

    it('permite la aprobación bilateral directa a PENDING_SIGNATURE desde estados de ajuste', () => {
      expect(canTransition('ADJUSTMENT_REQUESTED', 'PENDING_SIGNATURE')).toBe(true);
      expect(canTransition('COUNTER_PROPOSED', 'PENDING_SIGNATURE')).toBe(true);
    });

    it('permite regresar a DRAFT para reestructuración profunda si el ajuste lo amerita', () => {
      expect(canTransition('ADJUSTMENT_REQUESTED', 'DRAFT')).toBe(true);
    });
  });

  describe('3. Bloqueo Estricto de Saltos Ilegales de Estado', () => {
    it('bloquea saltos ilegales desde DRAFT', () => {
      expect(canTransition('DRAFT', 'COMPLETED_NOM151')).toBe(false);
      expect(canTransition('DRAFT', 'PENDING_SIGNATURE')).toBe(false);
      expect(canTransition('DRAFT', 'SIGNED_CREATOR')).toBe(false);
      expect(canTransition('DRAFT', 'SIGNED_CLIENT')).toBe(false);
      expect(canTransition('DRAFT', 'SIGNED_BOTH_PENDING_PSC')).toBe(false);
      expect(canTransition('DRAFT', 'ADJUSTMENT_REQUESTED')).toBe(false);
    });

    it('bloquea saltos ilegales desde PENDING_CLIENT_REVIEW', () => {
      expect(canTransition('PENDING_CLIENT_REVIEW', 'COMPLETED_NOM151')).toBe(false);
      expect(canTransition('PENDING_CLIENT_REVIEW', 'SIGNED_CREATOR')).toBe(false);
      expect(canTransition('PENDING_CLIENT_REVIEW', 'SIGNED_CLIENT')).toBe(false);
      expect(canTransition('PENDING_CLIENT_REVIEW', 'SIGNED_BOTH_PENDING_PSC')).toBe(false);
      expect(canTransition('PENDING_CLIENT_REVIEW', 'DRAFT')).toBe(false);
    });

    it('bloquea firmas directas sin previa aprobación bilateral (PENDING_SIGNATURE)', () => {
      expect(canTransition('ADJUSTMENT_REQUESTED', 'SIGNED_CREATOR')).toBe(false);
      expect(canTransition('COUNTER_PROPOSED', 'SIGNED_CLIENT')).toBe(false);
    });

    it('bloquea saltos directos al sellado NOM-151 sin contar con ambas firmas', () => {
      expect(canTransition('PENDING_SIGNATURE', 'COMPLETED_NOM151')).toBe(false);
      expect(canTransition('SIGNED_CREATOR', 'COMPLETED_NOM151')).toBe(false);
      expect(canTransition('SIGNED_CLIENT', 'COMPLETED_NOM151')).toBe(false);
    });

    it('assertCanTransition lanza excepciones explícitas y detalladas ante transiciones inválidas', () => {
      expect(() => assertCanTransition('DRAFT', 'COMPLETED_NOM151')).toThrowError(
        /Transición de estado ilegal: No es posible cambiar de 'DRAFT' a 'COMPLETED_NOM151'/
      );
      expect(() => assertCanTransition('PENDING_CLIENT_REVIEW', 'SIGNED_CREATOR')).toThrowError(
        /Transición de estado ilegal/
      );
    });

    it('retorna false para estados inexistentes o no mapeados', () => {
      expect(canTransition('UNKNOWN' as any, 'DRAFT')).toBe(false);
    });
  });

  describe('4. Estados Terminales e Inmutabilidad', () => {
    it('COMPLETED_NOM151 es un estado terminal absoluto sin transiciones salientes', () => {
      expect(ALLOWED_TRANSITIONS.COMPLETED_NOM151).toEqual([]);
      expect(canTransition('COMPLETED_NOM151', 'DRAFT')).toBe(false);
      expect(canTransition('COMPLETED_NOM151', 'PENDING_CLIENT_REVIEW')).toBe(false);
      expect(canTransition('COMPLETED_NOM151', 'CANCELLED')).toBe(false);
      expect(() => assertCanTransition('COMPLETED_NOM151', 'DRAFT')).toThrowError();
    });

    it('CANCELLED es un estado terminal sin transiciones salientes', () => {
      expect(ALLOWED_TRANSITIONS.CANCELLED).toEqual([]);
      expect(canTransition('CANCELLED', 'DRAFT')).toBe(false);
      expect(canTransition('CANCELLED', 'PENDING_SIGNATURE')).toBe(false);
    });

    it('EXPIRED es un estado terminal sin transiciones salientes', () => {
      expect(ALLOWED_TRANSITIONS.EXPIRED).toEqual([]);
      expect(canTransition('EXPIRED', 'PENDING_CLIENT_REVIEW')).toBe(false);
      expect(canTransition('EXPIRED', 'DRAFT')).toBe(false);
    });

    it('permite la cancelación en etapas pre-firma legítimas', () => {
      expect(canTransition('DRAFT', 'CANCELLED')).toBe(true);
      expect(canTransition('PENDING_CLIENT_REVIEW', 'CANCELLED')).toBe(true);
      expect(canTransition('ADJUSTMENT_REQUESTED', 'CANCELLED')).toBe(true);
      expect(canTransition('COUNTER_PROPOSED', 'CANCELLED')).toBe(true);
      expect(canTransition('PENDING_SIGNATURE', 'CANCELLED')).toBe(true);
      expect(canTransition('SIGNED_CREATOR', 'CANCELLED')).toBe(true);
      expect(canTransition('SIGNED_CLIENT', 'CANCELLED')).toBe(true);
    });

    it('permite expiración por caducidad en revisión del cliente (72h sin acción)', () => {
      expect(canTransition('PENDING_CLIENT_REVIEW', 'EXPIRED')).toBe(true);
    });
  });

  describe('5. Congelamiento Criptográfico del Documento (FROZEN_STATES)', () => {
    it('mantiene el documento editable en fases de borrador y negociación', () => {
      expect(isDocumentFrozen('DRAFT')).toBe(false);
      expect(isDocumentFrozen('PENDING_CLIENT_REVIEW')).toBe(false);
      expect(isDocumentFrozen('ADJUSTMENT_REQUESTED')).toBe(false);
      expect(isDocumentFrozen('COUNTER_PROPOSED')).toBe(false);
      expect(isDocumentFrozen('CANCELLED')).toBe(false);
      expect(isDocumentFrozen('EXPIRED')).toBe(false);
    });

    it('congela estrictamente el documento una vez aprobado bilateralmente y durante la firma', () => {
      expect(isDocumentFrozen('PENDING_SIGNATURE')).toBe(true);
      expect(isDocumentFrozen('SIGNED_CREATOR')).toBe(true);
      expect(isDocumentFrozen('SIGNED_CLIENT')).toBe(true);
      expect(isDocumentFrozen('SIGNED_BOTH_PENDING_PSC')).toBe(true);
      expect(isDocumentFrozen('COMPLETED_NOM151')).toBe(true);
    });

    it('verifica que FROZEN_STATES contenga exactamente los 5 estados protegidos', () => {
      expect(FROZEN_STATES.size).toBe(5);
      expect(FROZEN_STATES.has('PENDING_SIGNATURE')).toBe(true);
      expect(FROZEN_STATES.has('SIGNED_CREATOR')).toBe(true);
      expect(FROZEN_STATES.has('SIGNED_CLIENT')).toBe(true);
      expect(FROZEN_STATES.has('SIGNED_BOTH_PENDING_PSC')).toBe(true);
      expect(FROZEN_STATES.has('COMPLETED_NOM151')).toBe(true);
    });
  });

});

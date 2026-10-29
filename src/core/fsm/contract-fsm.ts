import type { ContractStatus } from '../schemas/contract.js';

/**
 * Matriz estricta de transiciones de estado permitidas en la FSM de Pactio.
 */
export const ALLOWED_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  DRAFT: ['PENDING_CLIENT_REVIEW', 'CANCELLED'],
  PENDING_CLIENT_REVIEW: ['ADJUSTMENT_REQUESTED', 'PENDING_SIGNATURE', 'CANCELLED', 'EXPIRED'],
  ADJUSTMENT_REQUESTED: ['COUNTER_PROPOSED', 'PENDING_CLIENT_REVIEW', 'PENDING_SIGNATURE', 'DRAFT', 'CANCELLED'],
  COUNTER_PROPOSED: ['PENDING_CLIENT_REVIEW', 'ADJUSTMENT_REQUESTED', 'PENDING_SIGNATURE', 'CANCELLED'],
  PENDING_SIGNATURE: ['SIGNED_CREATOR', 'SIGNED_CLIENT', 'CANCELLED'],
  SIGNED_CREATOR: ['SIGNED_BOTH_PENDING_PSC', 'CANCELLED'],
  SIGNED_CLIENT: ['SIGNED_BOTH_PENDING_PSC', 'CANCELLED'],
  SIGNED_BOTH_PENDING_PSC: ['COMPLETED_NOM151'],
  COMPLETED_NOM151: [], // Estado terminal inmutable
  CANCELLED: [],         // Estado terminal
  EXPIRED: []           // Estado terminal
};

/**
 * Conjunto de estados donde el texto canónico y el hash del contrato quedan ESTRICTAMENTE CONGELADOS.
 * Ninguna parte ni proceso interno puede alterar un solo carácter o parámetro.
 */
export const FROZEN_STATES: ReadonlySet<ContractStatus> = new Set([
  'PENDING_SIGNATURE',
  'SIGNED_CREATOR',
  'SIGNED_CLIENT',
  'SIGNED_BOTH_PENDING_PSC',
  'COMPLETED_NOM151'
]);

/**
 * Valida si una transición de estado es válida según las reglas del ciclo de vida.
 */
export function canTransition(from: ContractStatus, to: ContractStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Lanza una excepción formal si la transición intentada es ilegal.
 */
export function assertCanTransition(from: ContractStatus, to: ContractStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Transición de estado ilegal: No es posible cambiar de '${from}' a '${to}'. Estados válidos: [${ALLOWED_TRANSITIONS[from].join(', ')}]`
    );
  }
}

/**
 * Comprueba si el contrato se encuentra en un estado inmutable / congelado.
 */
export function isDocumentFrozen(status: ContractStatus): boolean {
  return FROZEN_STATES.has(status);
}

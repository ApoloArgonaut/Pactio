import { z } from 'zod';

/**
 * Patrones conocidos de vectores de inyección Cross-Site Scripting (XSS).
 * Basado en OWASP ASVS v4.0 y modelo STRIDE.
 */
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<script\b[^>]*>/gi,
  /<\/script>/gi,
  /javascript:[^\s"'>]*/gi,
  /data:text\/html[^\s"'>]*/gi,
  /vbscript:[^\s"'>]*/gi,
  /on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi,
  /<(iframe|object|embed|svg|img|link|style|base|meta|form|input|button)\b[^>]*>/gi,
  /<\/(iframe|object|embed|svg|img|link|style|base|meta|form|input|button)>/gi
];

/**
 * Detecta si una cadena contiene algún patrón o vector ejecutable de inyección XSS.
 */
export function containsXSSPayload(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return XSS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Sanitiza una cadena de texto para neutralizar cualquier vector de inyección XSS.
 * - Elimina etiquetas ejecutables (<script>, <img> con onerror, <svg> con onload, etc.)
 * - Elimina atributos inline de eventos (onload, onerror, onmouseover, onclick, etc.)
 * - Neutraliza esquemas de pseudo-protocolo como javascript: o data:text/html
 * - Preserva caracteres legítimos en español (acentos, ñ, signos de puntuación, &, $, comillas tipográficas).
 */
export function sanitizeAntiXSS(input: string): string {
  if (!input || typeof input !== 'string') return input;

  let sanitized = input;

  // 1. Eliminar bloques de script completos y etiquetas script huérfanas
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<script\b[^>]*>/gi, '');
  sanitized = sanitized.replace(/<\/script>/gi, '');

  // 2. Eliminar pseudo-protocolos javascript: y data:text/html
  sanitized = sanitized.replace(/javascript:\s*/gi, '');
  sanitized = sanitized.replace(/data:text\/html[^\s"'>]*/gi, '');
  sanitized = sanitized.replace(/vbscript:\s*/gi, '');

  // 3. Eliminar manejadores de eventos inline (onerror=, onload=, onmouseover=, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, '');

  // 4. Eliminar o neutralizar etiquetas HTML peligrosas (<img...>, <svg...>, <iframe...>)
  sanitized = sanitized.replace(/<(iframe|object|embed|svg|img|link|style|base|meta|form|input|button)\b[^>]*\/?>/gi, '');
  sanitized = sanitized.replace(/<\/(iframe|object|embed|svg|img|link|style|base|meta|form|input|button)>/gi, '');

  // 5. Neutralizar ángulos huérfanos residuales que intenten inyectar etiquetas personalizadas
  sanitized = sanitized.replace(/<(?=[a-zA-Z/!])/g, '&lt;').replace(/(?<=[a-zA-Z0-9"'])\s*>/g, '&gt;');

  return sanitized.trim();
}

/**
 * Helper de Zod que aplica automáticamente sanitización anti-XSS antes de validar longitud y formato.
 */
export function sanitizedStringSchema(min: number = 0, max: number = 5000) {
  let schema = z.string().transform(sanitizeAntiXSS);
  return schema.pipe(z.string().min(min).max(max));
}

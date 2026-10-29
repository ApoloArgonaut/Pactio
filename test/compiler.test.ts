import { describe, it, expect } from 'vitest';
import {
  formatCurrencyAmount,
  canonicalizeText,
  generateDocumentHash,
  compileToCanonicalMarkdown,
  compileToCanonicalPlainText,
  compileToHumanMarkdown
} from '../src/core/compiler/dual-compiler.js';
import type { ContractData } from '../src/core/schemas/contract.js';

describe('Suite de Pruebas: Compilador Canónico Dual y Hashing SHA-256', () => {

  const sampleContract: ContractData = {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    contractCode: 'PACT-8X9K2',
    status: 'DRAFT',
    versionMajor: 1,
    versionMinor: 0,
    parties: {
      creator: {
        role: 'creator',
        personType: 'physical',
        legalName: 'Sofía Valenzuela Mendoza',
        commercialName: 'Estudio UX Creativo',
        rfc: 'VAMS9005128D1',
        taxRegime: '626 - RESICO',
        email: 'sofia@uxstudio.mx',
        phone: '+525512345678',
        address: {
          street: 'Av. Álvaro Obregón',
          exteriorNumber: '151',
          interiorNumber: '4B',
          neighborhood: 'Roma Norte',
          municipality: 'Cuauhtémoc',
          state: 'Ciudad de México',
          postalCode: '06700',
          country: 'México'
        }
      },
      client: {
        role: 'client',
        personType: 'moral',
        legalName: 'Innovaciones Digitales del Norte S.A. de C.V.',
        commercialName: 'NovaTech',
        rfc: 'IDN180620TX6',
        email: 'contacto@novatech.mx',
        address: {
          street: 'Av. Constitución',
          exteriorNumber: '2000',
          neighborhood: 'Obispado',
          municipality: 'Monterrey',
          state: 'Nuevo León',
          postalCode: '64060',
          country: 'México'
        }
      }
    },
    scope: {
      projectTitle: 'Rediseño de Experiencia de Usuario y UI para App Móvil',
      serviceCategory: 'ux_ui_design',
      description: 'Diseño integral de experiencia de usuario, flujos de navegación y Design System en Figma.',
      deliverablesSummary: [
        'Mapa de navegación y arquitectura de información',
        'Design System con tokens en Figma',
        'Flujos principales de onboarding y checkout'
      ],
      requiredClientInputs: [
        'Manual de identidad y assets de marca',
        'Credenciales de acceso a entornos analíticos',
        'Validación de requerimientos técnicos con equipo de TI'
      ],
      outOfScope: [
        'Desarrollo de código frontend o backend',
        'Compra de suscripciones tipográficas comerciales',
        'Creación de contenidos multimedia o redacción de copys'
      ],
      startDateTrigger: 'upon_inputs_received'
    },
    payments: {
      currency: 'MXN',
      totalAmountCents: 3000000, // $30,000.00 MXN
      model: 'fixed_50_50',
      milestones: [
        {
          id: 'm1-discovery',
          order: 1,
          title: 'Descubrimiento y Arquitectura de Información',
          percentage: 50,
          amountCents: 1500000, // $15,000.00 MXN
          deliverables: ['Benchmark competitivo', 'User Personas', 'Mapa de arquitectura'],
          status: 'pending'
        },
        {
          id: 'm2-delivery',
          order: 2,
          title: 'UI Kit y Prototipo Final Interactivo',
          percentage: 50,
          amountCents: 1500000, // $15,000.00 MXN
          deliverables: ['Librería de componentes Figma', 'Prototipo navegable', 'Guía de handoff'],
          status: 'pending'
        }
      ],
      latePaymentInterestRateMonthly: 3.0,
      gracePeriodDays: 5,
      suspensionThresholdDays: 5
    },
    intellectualProperty: {
      transferTiming: 'upon_final_payment',
      moralRightsRetention: true,
      creatorPortfolioRights: true,
      confidentialityDurationYears: 3,
      retainCreatorBackgroundIP: true,
      nonExclusiveServices: true
    },
    governance: {
      includedRevisionRounds: 2,
      additionalRevisionFeeCents: 150000,
      tacitApprovalWindowDays: 5,
      killFeePercentage: 50,
      liabilityCap: 'fees_paid_to_date',
      jurisdiction: {
        city: 'Ciudad de México',
        state: 'CDMX',
        country: 'México'
      },
      disputeResolutionMethod: 'amicable_negotiation'
    },
    adjustments: [],
    signatures: {},
    canonicalMarkdown: '',
    canonicalPlainText: '',
    documentHash: '0'.repeat(64),
    auditTrail: [],
    createdAt: '2026-10-29T10:00:00.000Z',
    updatedAt: '2026-10-29T10:00:00.000Z',
    deletedAt: null
  };

  describe('1. Formato de Moneda y Normalización Canónica', () => {
    it('convierte montos en centavos enteros a cadenas monetarias formateadas (es-MX / es-ES / en-US)', () => {
      expect(formatCurrencyAmount(3000000, 'MXN')).toBe('$30,000.00 MXN');
      expect(formatCurrencyAmount(150000, 'MXN')).toBe('$1,500.00 MXN');
      expect(formatCurrencyAmount(500000, 'USD')).toBe('$5,000.00 USD');
      expect(formatCurrencyAmount(450000, 'EUR')).toBe('€4,500.00 EUR');
      expect(formatCurrencyAmount(0, 'MXN')).toBe('$0.00 MXN');
      expect(formatCurrencyAmount(99, 'MXN')).toBe('$0.99 MXN');
    });

    it('canonicalizeText normaliza saltos de línea Windows (CRLF) a estándar Unix (LF)', () => {
      const windowsText = 'Línea 1\r\nLínea 2\r\nLínea 3';
      const canonical = canonicalizeText(windowsText);
      expect(canonical).toBe('Línea 1\nLínea 2\nLínea 3');
      expect(canonical).not.toContain('\r');
    });

    it('canonicalizeText recorta espacios residuales al final de cada línea', () => {
      const dirtyText = 'Línea con espacios al final    \nSegunda línea con tabs\t\t\n';
      const canonical = canonicalizeText(dirtyText);
      expect(canonical).toBe('Línea con espacios al final\nSegunda línea con tabs');
    });

    it('canonicalizeText normaliza secuencias Unicode a forma canónica NFC', () => {
      // Carácter 'é' en NFD (descompuesto: 'e' + combining acute accent) vs NFC
      const decomposed = 'Disen\u0303o de Sofi\u0301a';
      const canonical = canonicalizeText(decomposed);
      expect(canonical).toBe('Diseño de Sofía');
    });
  });

  describe('2. Generación Criptográfica de Digest SHA-256 (NOM-151 / SAT)', () => {
    it('produce un hash SHA-256 en formato hexadecimal de exactamente 64 caracteres', () => {
      const hash = generateDocumentHash('Contrato Pactio Canónico');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('es perfectamente determinista para entradas de texto idénticas', () => {
      const text = 'Texto legal idéntico para verificación de firma';
      const hash1 = generateDocumentHash(text);
      const hash2 = generateDocumentHash(text);
      expect(hash1).toBe(hash2);
    });

    it('produce el mismo hash sin importar si la entrada contiene CRLF o espacios residuales', () => {
      const textUnix = 'Cláusula Primera.\nEl Prestador se obliga a diseñar.';
      const textWindows = 'Cláusula Primera.  \r\nEl Prestador se obliga a diseñar.   \r\n';

      const hashUnix = generateDocumentHash(textUnix);
      const hashWindows = generateDocumentHash(textWindows);
      expect(hashUnix).toBe(hashWindows);
    });

    it('demuestra el Efecto Avalancha: una alteración de un solo carácter altera drásticamente el digest', () => {
      const originalText = 'El monto total a pagar es $30,000.00 MXN';
      const tamperedText = 'El monto total a pagar es $30,001.00 MXN';

      const originalHash = generateDocumentHash(originalText);
      const tamperedHash = generateDocumentHash(tamperedText);

      expect(originalHash).not.toBe(tamperedHash);
      // Validar que difieran en la gran mayoría de los caracteres
      let matchingChars = 0;
      for (let i = 0; i < originalHash.length; i++) {
        if (originalHash[i] === tamperedHash[i]) matchingChars++;
      }
      expect(matchingChars).toBeLessThan(15);
    });
  });

  describe('3. Compilación a Markdown Canónico Formal (compileToCanonicalMarkdown)', () => {
    it('incluye encabezado institucional con clave NanoID, versión y fecha', () => {
      const md = compileToCanonicalMarkdown(sampleContract);
      expect(md).toContain('# CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES INDEPENDIENTES');
      expect(md).toContain('**Código de Referencia Único:** `PACT-8X9K2`');
      expect(md).toContain('**Versión Vigente:** `v1.0`');
      expect(md).toContain('**Fecha de Emisión:** 2026-10-29');
    });

    it('renderiza con fidelidad las DECLARACIONES de ambas partes', () => {
      const md = compileToCanonicalMarkdown(sampleContract);

      // Creador
      expect(md).toContain('**I. DECLARA "EL PRESTADOR":**');
      expect(md).toContain('persona física');
      expect(md).toContain('**Sofía Valenzuela Mendoza**');
      expect(md).toContain('(conocida comercialmente como "Estudio UX Creativo")');
      expect(md).toContain('**`VAMS9005128D1`**');
      expect(md).toContain('Av. Álvaro Obregón #151, Int. 4B, Col. Roma Norte, C.P. 06700');
      expect(md).toContain('`sofia@uxstudio.mx`');

      // Cliente
      expect(md).toContain('**II. DECLARA "EL CLIENTE":**');
      expect(md).toContain('persona moral');
      expect(md).toContain('**Innovaciones Digitales del Norte S.A. de C.V.**');
      expect(md).toContain('(conocida comercialmente como "NovaTech")');
      expect(md).toContain('**`IDN180620TX6`**');
      expect(md).toContain('Av. Constitución #2000, Col. Obispado, C.P. 64060');
      expect(md).toContain('`contacto@novatech.mx`');
    });

    it('renderiza las 9 CLÁUSULAS esenciales con todos sus términos operativos', () => {
      const md = compileToCanonicalMarkdown(sampleContract);

      // Cláusula 1: Objeto y Alcance
      expect(md).toContain('**PRIMERA. OBJETO DEL CONTRATO Y ALCANCE**');
      expect(md).toContain('Rediseño de Experiencia de Usuario y UI para App Móvil');
      expect(md).toContain('ux_ui_design');

      // Cláusula 2: Insumos requeridos del cliente
      expect(md).toContain('**SEGUNDA. INSUMOS DEL CLIENTE Y CÓMPUTO DE PLAZOS**');
      expect(md).toContain('Manual de identidad y assets de marca');

      // Cláusula 3: Fuera de alcance
      expect(md).toContain('**TERCERA. LÍMITES EXPLÍCITOS DEL SERVICIO (FUERA DE ALCANCE)**');
      expect(md).toContain('Desarrollo de código frontend o backend');

      // Cláusula 4: Contraprestación, Hitos e Interés Moratorio
      expect(md).toContain('**CUARTA. CONTRAPRESTACIÓN, HITOS Y CONDICIONES DE PAGO**');
      expect(md).toContain('**$30,000.00 MXN**');
      expect(md).toContain('Hito 1: Descubrimiento y Arquitectura de Información');
      expect(md).toContain('Hito 2: UI Kit y Prototipo Final Interactivo');
      expect(md).toContain('3% mensual');
      expect(md).toContain('5 días naturales');

      // Cláusula 5: Propiedad Intelectual LFDA Art. 83
      expect(md).toContain('**QUINTA. DERECHOS DE PROPIEDAD INTELECTUAL Y CONDICIÓN SUSPENSIVA**');
      expect(md).toContain('Artículo 83 de la Ley Federal del Derecho de Autor (LFDA)');
      expect(md).toContain('condición suspensiva de la liquidación íntegra del 100%');

      // Cláusula 6: Gobernanza y Silencio Tácito
      expect(md).toContain('**SEXTA. GOBERNANZA DE REVISIONES Y ACEPTACIÓN TÁCITA POR SILENCIO**');
      expect(md).toContain('2 rondas de revisión técnica y de diseño');
      expect(md).toContain('$1,500.00 MXN');
      expect(md).toContain('5 días hábiles');

      // Cláusula 7: Kill Fee
      expect(md).toContain('**SÉPTIMA. CANCELACIÓN ANTICIPADA Y SALIDA AMISTOSA (KILL FEE)**');
      expect(md).toContain('50%');

      // Cláusula 8: Confidencialidad y Límite de Responsabilidad
      expect(md).toContain('**OCTAVA. CONFIDENCIALIDAD Y LÍMITE DE RESPONSABILIDAD**');
      expect(md).toContain('3 años');

      // Cláusula 9: NOM-151 y Jurisdicción
      expect(md).toContain('**NOVENA. LEGISLACIÓN APLICABLE, JURISDICCIÓN Y VALIDEZ ELECTRÓNICA**');
      expect(md).toContain('NOM-151-SCFI-2016');
      expect(md).toContain('Ciudad de México, CDMX');
    });
  });

  describe('4. Compilación a Texto Plano Canónico (compileToCanonicalPlainText)', () => {
    it('elimina todo formato de Markdown (encabezados, asteriscos, backticks)', () => {
      const plain = compileToCanonicalPlainText(sampleContract);

      expect(plain).not.toContain('#');     // Sin símbolos de encabezado (#) ni numeral
      expect(plain).not.toContain('**');    // Sin asteriscos de negrita
      expect(plain).not.toContain('`');     // Sin backticks
      expect(plain).toContain('----------------------------------------'); // Separador formal en texto plano

      // Preserva el contenido legal íntegro
      expect(plain).toContain('CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES INDEPENDIENTES');
      expect(plain).toContain('Código de Referencia Único: PACT-8X9K2');
      expect(plain).toContain('PRIMERA. OBJETO DEL CONTRATO Y ALCANCE');
      expect(plain).toContain('Artículo 83 de la Ley Federal del Derecho de Autor');
    });

    it('genera un digest SHA-256 criptográfico canónico a partir del texto plano', () => {
      const plain = compileToCanonicalPlainText(sampleContract);
      const hash = generateDocumentHash(plain);

      expect(hash).toHaveLength(64);
      // Validar consistencia con hash generado en otra invocación
      const plain2 = compileToCanonicalPlainText(sampleContract);
      expect(generateDocumentHash(plain2)).toBe(hash);
    });
  });

  describe('5. Compilación a Vista Humana Didáctica (compileToHumanMarkdown)', () => {
    it('traduce el lenguaje legal a conceptos accesibles con analogías y encabezados claros', () => {
      const human = compileToHumanMarkdown(sampleContract);

      expect(human).toContain('🤝 Resumen Claro del Acuerdo (Vista Humana)');
      expect(human).toContain('**Pacto:** `PACT-8X9K2`');
      expect(human).toContain('### 1. ¿Quiénes colaboran?');
      expect(human).toContain('### 2. ¿Qué se va a construir?');
      expect(human).toContain('### 3. ¿Cómo y cuándo se paga?');
      expect(human).toContain('### 4. ¿De quién es el trabajo terminado? (Regla de Oro)');
      expect(human).toContain('### 5. ¿Qué pasa si algo no sale según lo planeado?');

      // Analogías de protección
      expect(human).toContain('Como las llaves de un auto');
      expect(human).toContain('Regla de gasolina');
      expect(human).toContain('El que calla otorga');
      expect(human).toContain('Salida limpia');
    });

    it('refleja con precisión los importes y parámetros financieros en la vista humana', () => {
      const human = compileToHumanMarkdown(sampleContract);

      expect(human).toContain('**Inversión Total:** **$30,000.00 MXN**');
      expect(human).toContain('Paso 1: Descubrimiento y Arquitectura de Información');
      expect(human).toContain('($15,000.00 MXN)');
      expect(human).toContain('Paso 2: UI Kit y Prototipo Final Interactivo');
      expect(human).toContain('2 rondas de cambios');
      expect(human).toContain('5 días hábiles');
      expect(human).toContain('50%');
    });
  });

});

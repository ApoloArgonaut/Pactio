import { sha256 } from 'js-sha256';
import type { ContractData } from '../schemas/contract.js';

/**
 * Convierte un importe en centavos a texto formal monetario.
 * ej. 3000000 -> "$30,000.00 MXN"
 */
export function formatCurrencyAmount(cents: number, currency: 'MXN' | 'USD' | 'EUR' = 'MXN'): string {
  const symbol = currency === 'EUR' ? '€' : '$';
  const units = (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${symbol}${units} ${currency}`;
}

/**
 * Escapa caracteres HTML críticos para prevenir Cross-Site Scripting (XSS),
 * Server-Side Template Injection (SSTI) y ataques de inyección en renderizadores Markdown y PDF.
 */
export function escapeHtml(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitiza texto de entrada de partes contractuales y cláusulas:
 * 1. Filtra caracteres de control ASCII (0x00-0x08, 0x0B-0x0C, 0x0E-0x1F, 0x7F).
 * 2. Escapa etiquetas HTML y scripts para evitar Stored XSS y explotación en PDF.
 */
export function sanitizeLegalText(raw: string): string {
  if (!raw) return '';
  const filtered = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return escapeHtml(filtered);
}

/**
 * Normaliza cualquier texto a UTF-8 canónico (NFC), eliminando retornos de carro \r
 * y recortando espacios residuales al final de cada línea.
 */
export function canonicalizeText(raw: string): string {
  return raw
    .normalize('NFC')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Genera el digest SHA-256 de una cadena de texto normalizada.
 * Este hash constituye la huella digital criptográfica inmutable para NOM-151 y SAT.
 */
export function generateDocumentHash(canonicalText: string): string {
  const normalized = canonicalizeText(canonicalText);
  return sha256(normalized);
}

/**
 * Compilador Canónico: Produce el documento legal formal en Markdown estructurado.
 * Diseñado para conversión fidedigna a PDF mediante CSS Paged Media (@page { size: letter; }).
 * Aplica sanitización y escapado contra inyección XSS/SSTI en todos los campos ingresados por usuarios.
 */
export function compileToCanonicalMarkdown(contract: ContractData): string {
  const c = contract;
  const p = c.parties;
  const s = c.scope;
  const pay = c.payments;
  const ip = c.intellectualProperty;
  const gov = c.governance;

  const totalFormatted = formatCurrencyAmount(pay.totalAmountCents, pay.currency);

  const creatorLegalName = sanitizeLegalText(p.creator.legalName);
  const creatorCommercialName = p.creator.commercialName ? sanitizeLegalText(p.creator.commercialName) : '';
  const clientLegalName = sanitizeLegalText(p.client.legalName);
  const clientCommercialName = p.client.commercialName ? sanitizeLegalText(p.client.commercialName) : '';

  const creatorAddressStr = `${sanitizeLegalText(p.creator.address.street)} #${sanitizeLegalText(p.creator.address.exteriorNumber)}${p.creator.address.interiorNumber ? `, Int. ${sanitizeLegalText(p.creator.address.interiorNumber)}` : ''}, Col. ${sanitizeLegalText(p.creator.address.neighborhood)}, C.P. ${sanitizeLegalText(p.creator.address.postalCode)}, ${sanitizeLegalText(p.creator.address.municipality)}, ${sanitizeLegalText(p.creator.address.state)}, ${sanitizeLegalText(p.creator.address.country)}`;
  const clientAddressStr = `${sanitizeLegalText(p.client.address.street)} #${sanitizeLegalText(p.client.address.exteriorNumber)}${p.client.address.interiorNumber ? `, Int. ${sanitizeLegalText(p.client.address.interiorNumber)}` : ''}, Col. ${sanitizeLegalText(p.client.address.neighborhood)}, C.P. ${sanitizeLegalText(p.client.address.postalCode)}, ${sanitizeLegalText(p.client.address.municipality)}, ${sanitizeLegalText(p.client.address.state)}, ${sanitizeLegalText(p.client.address.country)}`;

  const milestonesMd = pay.milestones.map((m) => {
    const amountStr = formatCurrencyAmount(m.amountCents, pay.currency);
    const deliverablesList = m.deliverables.map(d => `      * ${sanitizeLegalText(d)}`).join('\n');
    return `* **Hito ${m.order}: ${sanitizeLegalText(m.title)}** (${m.percentage}% - ${amountStr})
    * Entregables vinculados:
${deliverablesList}`;
  }).join('\n');

  const requiredInputsMd = s.requiredClientInputs.map(item => `* ${sanitizeLegalText(item)}`).join('\n');
  const outOfScopeMd = s.outOfScope.map(item => `* ${sanitizeLegalText(item)}`).join('\n');

  const rawMd = `
# CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES INDEPENDIENTES
**Código de Referencia Único:** \`${c.contractCode}\`  
**Versión Vigente:** \`v${c.versionMajor}.${c.versionMinor}\`  
**Fecha de Emisión:** ${c.createdAt.split('T')[0]}  

---

### DECLARACIONES

**I. DECLARA "EL PRESTADOR":**
1. Que es una persona ${p.creator.personType === 'physical' ? 'física' : 'moral'}, denominada legalmente **${creatorLegalName}**${creatorCommercialName ? ` (conocida comercialmente como "${creatorCommercialName}")` : ''}.
2. Con Registro Federal de Contribuyentes oficial: **\`${p.creator.rfc}\`**.
3. Con domicilio legal ubicado en: ${creatorAddressStr}.
4. Con correo electrónico de notificación fehaciente: \`${sanitizeLegalText(p.creator.email)}\`.

**II. DECLARA "EL CLIENTE":**
1. Que es una persona ${p.client.personType === 'physical' ? 'física' : 'moral'}, denominada legalmente **${clientLegalName}**${clientCommercialName ? ` (conocida comercialmente como "${clientCommercialName}")` : ''}.
2. Con Registro Federal de Contribuyentes oficial: **\`${p.client.rfc}\`**.
3. Con domicilio legal ubicado en: ${clientAddressStr}.
4. Con correo electrónico de contacto: \`${sanitizeLegalText(p.client.email)}\`.

---

### CLÁUSULAS

**PRIMERA. OBJETO DEL CONTRATO Y ALCANCE**  
El Prestador se obliga a ejecutar en favor del Cliente los servicios profesionales de **"${sanitizeLegalText(s.projectTitle)}"**, en la categoría de **${sanitizeLegalText(s.serviceCategory)}**, descritos a continuación:  
${sanitizeLegalText(s.description)}

**SEGUNDA. INSUMOS DEL CLIENTE Y CÓMPUTO DE PLAZOS**  
Las partes convienen expresamente que los plazos de entrega pactados para cada hito no comenzarán a computarse sino hasta que el Cliente haya puesto a disposición del Prestador la totalidad de los insumos requeridos:
${requiredInputsMd}

Cualquier retraso imputable al Cliente en la entrega de insumos diferirá proporcionalmente la fecha límite de entrega sin responsabilidad para el Prestador.

**TERCERA. LÍMITES EXPLÍCITOS DEL SERVICIO (FUERA DE ALCANCE)**  
Para evitar ambigüedades, las partes reconocen que los siguientes conceptos quedan expresamente excluidos de la contraprestación ordinaria:
${outOfScopeMd}

**CUARTA. CONTRAPRESTACIÓN, HITOS Y CONDICIONES DE PAGO**  
El Cliente pagará al Prestador por la prestación íntegra de los servicios la cantidad total de **${totalFormatted}**, distribuidos conforme al siguiente calendario de hitos vinculantes:

${milestonesMd}

En caso de que el Cliente incurra en mora en el pago de cualquiera de los hitos transcurridos **${pay.gracePeriodDays} días naturales**, se causará un interés moratorio preventivo del **${pay.latePaymentInterestRateMonthly}% mensual** sobre saldos insolutos. Si la mora supera **${pay.suspensionThresholdDays} días**, el Prestador podrá suspender legítimamente las labores sin penalización.

**QUINTA. DERECHOS DE PROPIEDAD INTELECTUAL Y CONDICIÓN SUSPENSIVA**  
De conformidad con el Artículo 83 de la Ley Federal del Derecho de Autor (LFDA), la transmisión definitiva de los derechos patrimoniales sobre los entregables y obras derivadas queda sujeta a la **condición suspensiva de la liquidación íntegra del 100% de la contraprestación pactada**. Hasta en tanto no se acredite el pago total, la titularidad patrimonial pertenece exclusivamente al Prestador.  
El Prestador conserva en todo momento sus derechos morales inalienables e irrenunciables, así como la autorización expresa para exhibir el proyecto en su portafolio profesional y casos de estudio.

**SEXTA. GOBERNANZA DE REVISIONES Y ACEPTACIÓN TÁCITA POR SILENCIO**  
El servicio incluye hasta **${gov.includedRevisionRounds} rondas de revisión técnica y de diseño**. Toda solicitud de ajuste que exceda dicho límite tendrá un costo unitario de **${formatCurrencyAmount(gov.additionalRevisionFeeCents, pay.currency)}**.  
Una vez remitido formalmente un entregable, el Cliente dispondrá de una ventana de **${gov.tacitApprovalWindowDays} días hábiles** para emitir objeciones fundadas. Transcurrido dicho plazo sin observaciones formales, operará la **aceptación tácita plena** del hito.

**SÉPTIMA. CANCELACIÓN ANTICIPADA Y SALIDA AMISTOSA (KILL FEE)**  
Si el Cliente decide cancelar o rescindir el contrato unilateralmente sin causa grave imputable al Prestador, el Prestador retendrá el anticipo recibido y el Cliente se obliga a abonar una compensación de salida del **${gov.killFeePercentage}%** sobre el saldo insoluto de los trabajos ejecutados hasta dicha fecha.

**OCTAVA. CONFIDENCIALIDAD Y LÍMITE DE RESPONSABILIDAD**  
Las partes se obligan a mantener estricta reserva sobre la información sensible intercambiada durante un periodo de **${ip.confidentialityDurationYears} años**. La responsabilidad civil patrimonial total del Prestador ante cualquier controversia queda expresamente topada al **monto efectivamente pagado por el Cliente hasta la fecha de la reclamación**.

**NOVENA. LEGISLACIÓN APLICABLE, JURISDICCIÓN Y VALIDEZ ELECTRÓNICA**  
El presente contrato se rige por las leyes mercantiles de los Estados Unidos Mexicanos, en especial los Artículos 89 a 95 del Código de Comercio y la NOM-151-SCFI-2016. Para la interpretación y cumplimiento, las partes se someten a la jurisdicción de los tribunales competentes en **${sanitizeLegalText(gov.jurisdiction.city)}, ${sanitizeLegalText(gov.jurisdiction.state)}**, renunciando a cualquier otro fuero que pudiere corresponderles por razón de sus domicilios presentes o futuros.
`;

  return canonicalizeText(rawMd);
}

/**
 * Compilador a Texto Plano Canónico Normalizado (Sin formato Markdown ni adornos).
 * Es la base matemática para la generación de huellas digitales SHA-256 de alta certeza legal.
 */
export function compileToCanonicalPlainText(contract: ContractData): string {
  const md = compileToCanonicalMarkdown(contract);
  // Elimina encabezados (#), asteriscos de negrita/cursiva, backticks y separadores
  const plainText = md
    .replace(/^#+\s+/gm, '')
    .replace(/#/g, 'No. ')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '-')
    .replace(/`/g, '')
    .replace(/---/g, '----------------------------------------');

  return canonicalizeText(plainText);
}

/**
 * Compilador a "Vista Humana" (Coloquial y Didáctica).
 * Traduce el rigor jurídico a conceptos de comprensión inmediata con analogías prácticas.
 * Aplica sanitización y escapado contra XSS.
 */
export function compileToHumanMarkdown(contract: ContractData): string {
  const c = contract;
  const p = c.parties;
  const s = c.scope;
  const pay = c.payments;
  const gov = c.governance;

  const totalFormatted = formatCurrencyAmount(pay.totalAmountCents, pay.currency);

  const humanMilestones = pay.milestones.map((m) => {
    const amountStr = formatCurrencyAmount(m.amountCents, pay.currency);
    return `  * **Paso ${m.order}: ${sanitizeLegalText(m.title)}** (${amountStr}) -> *Se abona al aprobar este bloque.*`;
  }).join('\n');

  return canonicalizeText(`
# 🤝 Resumen Claro del Acuerdo (Vista Humana)
**Pacto:** \`${c.contractCode}\` | **Proyecto:** ${sanitizeLegalText(s.projectTitle)}

---

### 1. ¿Quiénes colaboran?
* **Creador(a):** ${sanitizeLegalText(p.creator.legalName)} (\`${sanitizeLegalText(p.creator.email)}\`)
* **Cliente:** ${sanitizeLegalText(p.client.legalName)} (\`${sanitizeLegalText(p.client.email)}\`)

---

### 2. ¿Qué se va a construir?
${sanitizeLegalText(s.description)}

* 🧱 **Condición indispensable:** El tiempo de entrega empieza a correr cuando el cliente entregue logos, accesos y textos definitivos.
* 🛡️ **Lo que NO incluye este precio:** Licencias de terceros, soporte indefinido posterior o tareas fuera de esta lista.

---

### 3. ¿Cómo y cuándo se paga?
* **Inversión Total:** **${totalFormatted}**
${humanMilestones}
* ⛽ **Regla de gasolina:** Si un pago se retrasa más de ${pay.gracePeriodDays} días, el proyecto se pone en pausa sin penalizaciones para el creador.

---

### 4. ¿De quién es el trabajo terminado? (Regla de Oro)
* 🔑 **Como las llaves de un auto:** El cliente obtiene todos los derechos para explotar el diseño/código **únicamente tras pagar el 100% de la cuenta**.
* 🎨 El creador siempre podrá mostrar este proyecto en su portafolio público para conseguir nuevos clientes.

---

### 5. ¿Qué pasa si algo no sale según lo planeado?
* ✏️ **Revisiones:** Se incluyen **${gov.includedRevisionRounds} rondas de cambios**. Las adicionales tienen un costo de ${formatCurrencyAmount(gov.additionalRevisionFeeCents, pay.currency)}.
* ⏰ **El que calla otorga:** Tienes **${gov.tacitApprovalWindowDays} días hábiles** para revisar un entregable; si no hay comentarios, se da por aprobado automáticamente.
* 🚪 **Salida limpia:** Si el cliente cancela el proyecto a la mitad, se retiene el anticipo y se cobra el ${gov.killFeePercentage}% del trabajo pendiente realizado.
`);
}

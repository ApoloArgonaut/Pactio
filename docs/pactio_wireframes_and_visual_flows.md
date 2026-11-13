# Arquitectura Visual, Wireframes y Especificación de Interacción: Pactio

> **Documento Canónico de Diseño Visual, Flujos de Pantalla y Wireframes de Alta Fidelidad (v2.0)**  
> **Rol:** Lead Visual Designer & Wireframe Architect  
> **Destinatarios:** PM, Fullstack Engineering, Frontend Specialists, LegalTech & Quality Assurance  
> **Estándares:** WCAG 2.1 AAA, Legal Design (Margaret Hagan / Stanford), Apple HIG, Material Design 3, NOM-151-SCFI-2016  
> **Tokens Vinculados:** [`figma_design_tokens.json`](figma_design_tokens.json)

---

## 1. Manifiesto de Arquitectura Visual y Principios de Diseño

Pactio nace para erradicar el miedo relacional y la burocracia intimidante de los contratos tradicionales entre profesionistas independientes y sus clientes en Iberoamérica. La interfaz no se concibe como un procesador de textos genérico, sino como un **asistente bilateral de certeza operativa y fiscal**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        LOS 4 PILARES DE LA ARQUITECTURA VISUAL                         │
├─────────────────────┬──────────────────────────┬───────────────────────┬───────────────┤
│ 1. Simetría Paritaria│ 2. Dual-Engine DOM       │ 3. Comprensión Dual   │ 4. Certeza NOM│
│ Visualización 50/50 │ React DOM (<16ms) para   │ [👁️ Humano] <->       │ Hash SHA-256, │
│ de deberes y derechos│ preview; PDF canónico    │ [⚖️ Jurídico] sin     │ sello TSA y   │
│ sin asimetría legal │ solo al timbrar / bajar  │ salto visual (CLS=0)  │ ZIP fiscal CFF│
└─────────────────────┴──────────────────────────┴───────────────────────┴───────────────┘
```

### 1.1. Principios Ergonómicos y Psicológicos Aplicados
* **Ley de Bringhurst (Tipografía Ergonómica):** El ancho de lectura de párrafos nunca supera los **75 caracteres por línea** (máximo 640px), evitando la desorientación en monitores panorámicos.
* **Ley de Miller (7 ± 2 Chunks):** El proceso de redacción se acota a **5 módulos temáticos autocontenidos**, evitando el abandono por sobrecarga cognitiva.
* **Ley de Fitts & Zonas de Pulgar (Mobile First):** Objetivos táctiles mínimos de **48px**, con las acciones principales (`[Aprobar y Firmar]`, `[Solicitar Ajuste]`) ancladas en la mitad inferior de la pantalla.
* **Accesibilidad Universal WCAG 2.1 AAA:** Contraste tipográfico superior a **7:1** en texto normal y **4.5:1** en componentes grandes en sus 3 paletas oficiales (`Midnight Slate`, `Warm Paper` y `High-Contrast`).
* **Estabilidad Visual (CLS = 0.000):** Reservas de altura calculadas para evitar brincos en la conmutación de lenguaje o carga de fuentes.

---

## 2. Catálogo Maestro de Pantallas y Estados del Sistema

A continuación se detalla la anatomía visual de los **10 estados y pantallas críticas del ciclo de vida contractual**.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                            MAPEO DEL CICLO DE VIDA DE PANTALLAS                              │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
 [1. Empty State] ──(Crear)──► [2. Wizard v1.0] ──(Generar)──► [4. Client Landing v1.0]
        ▲                             │                                │           │
        │                       (Auto-Save)                            │           │
        │                             ▼                                ▼           ▼
 [10. Bóveda Dashboard]        [3. Loading / Save]             [5. Negotiation  [7. Signature Hub]
        ▲                                                          Drawer]         │
        │                                                              │           ▼
 [9. Kit Fiscal ZIP] ◄── [8. Stamping NOM-151] ◄── [6. Diff v1.1] ◄────┘           │
        │                                                                          │
        └──────────────────────────────────────────────────────────────────────────┘
                                (En caso de fallas: Error States)
```

---

### 2.1. Estado 1: Empty State (Bóveda Virgen / Primer Onboarding)

Se presenta cuando un creador inicia sesión por primera vez o ha completado/archivado todos sus contratos anteriores. El objetivo UX es activar al usuario en menos de 60 segundos sin abrumarlo con formularios vacíos.

```
+----------------------------------------------------------------------------------------------------+
|  PACTIO   Bóveda de Acuerdos                                          [ 👁️ Temas ]  [ Sofía R. 👤 ] |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|                                     ┌─────────────────────────┐                                    |
|                                     │      ┌───────────┐      │                                    |
|                                     │      │  🤝 📄 ✨ │      │                                    |
|                                     │      └───────────┘      │                                    |
|                                     │   ¡Bienvenida, Sofía!   │                                    |
|                                     │                         │                                    |
|                                     │ Tu bóveda está lista    │                                    |
|                                     │ para proteger tu primer │                                    |
|                                     │ proyecto profesional.   │                                    |
|                                     └─────────────────────────┘                                    |
|                                                                                                    |
|                         [ + Crear Mi Primer Acuerdo Protegido (4 min) ]                            |
|                                                                                                    |
|  ────────────────────────────────────────────────────────────────────────────────────────────────  |
|  O empieza al instante con una plantilla preconfigurada con estándares SAT y NOM-151:              |
|                                                                                                    |
|  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐             |
|  │ 🎨 Diseño UI/UX y Web   │  │ 💻 Desarrollo de Software│  │ 🎬 Video y Creatividad  │             |
|  ├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤             |
|  │ • Anticipo del 50%      │  │ • 3 Hitos (Dev/QA/Live) │  │ • Kill fee por llamado  │             |
|  │ • 2 Rondas de cambios   │  │ • Retención de código   │  │ • Cesión a 12 meses     │             |
|  │ • Cesión de IP al 100%  │  │ • Silencio tácito 5 días│  │ • Gastos de producción  │             |
|  │                         │  │                         │  │                         │             |
|  │ [ Usar Plantilla → ]    │  │ [ Usar Plantilla → ]    │  │ [ Usar Plantilla → ]    │             |
|  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘             |
|                                                                                                    |
|  🔒 Todos tus acuerdos cuentan con fecha cierta NOM-151, hash SHA-256 y materialidad fiscal Art. 69-B|
+----------------------------------------------------------------------------------------------------+
```

---

### 2.2. Estado 2: Loading State (Skeletons & Progressive Hydration)

Diseñado con el principio de **Feedback Visual Activo**. Evita la pantalla en blanco y los spinners giratorios que generan incertidumbre. Se utilizan bloques pulsantes (*skeleton screens*) con microcopias contextuales que informan qué proceso seguro se está realizando en segundo plano.

```
+----------------------------------------------------------------------------------------------------+
|  PACTIO   Cargando Documento Seguro...                     [ Código: PACT-····· ]   [ ⌛ Guardando ]|
+----------------------------------------------------------------------------------------------------+
|  [████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 35% Sincronizando datos|
+----------------------------------------------------------------------------------------------------+
|   ASISTENTE WIZARD (Cargando datos)                     |  VISTA PREVIA CONTRACTUAL (Verificando)  |
|                                                         |                                          |
|   ┌──────────────────────────────────────────────────┐  |  ┌────────────────────────────────────┐  |
|   │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                    │  |  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │  |
|   │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        │  |  │                                    │  |
|   └──────────────────────────────────────────────────┘  |  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  |
|                                                         |  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  |
|   ┌────────────────────────┐  ┌──────────────────────┐  |  │ ░░░░░░░░░░░░░░░░                    │  |
|   │ ░░░░░░░░░░░░░░░░░░░░   │  │ ░░░░░░░░░░░░░░░░░░   │  |  │                                    │  |
|   │ ░░░░░░░░░░░░░░░░░░░░   │  │ ░░░░░░░░░░░░░░░░░░   │  |  │ ┌────────────────────────────────┐ │  |
|   └────────────────────────┘  └──────────────────────┘  |  │ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │ │  |
|                                                         |  │ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │ │  |
|   ┌──────────────────────────────────────────────────┐  |  │ └────────────────────────────────┘ │  |
|   │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  |  │                                    │  |
|   │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  |  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  |
|   └──────────────────────────────────────────────────┘  |  └────────────────────────────────────┘  |
|                                                         |                                          |
|   💬 Microcopia de estado: "Calculando balance de pagos al 100% y asegurando variables en memoria..."|
+----------------------------------------------------------------------------------------------------+
```

---

### 2.3. Estados de Error del Sistema (Error Handling & Recovery)

Pactio implementa el principio de **Resolución Guiada de Errores**: un error nunca es un callejón sin salida; siempre provee el diagnóstico en lenguaje claro y un botón de acción correctiva en un solo clic.

#### Error 401/404: Enlace Mágico Expirado (TTL > 72 Horas)
```
+----------------------------------------------------------------------------------------------------+
|                                    PACTIO · SEGURIDAD CRIPTOGRÁFICA                                |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|                                     ┌─────────────────────────┐                                    |
|                                     │      ┌───────────┐      │                                    |
|                                     │      │  ⏳ 🔒 ⚠️ │      │                                    |
|                                     │      └───────────┘      │                                    |
|                                     │  Este enlace ha caducado│                                    |
|                                     │      por seguridad      │                                    |
|                                     └─────────────────────────┘                                    |
|                                                                                                    |
|   Por cumplimiento de la NOM-151 y protección de datos fiscales, los enlaces de revisión expiran   |
|   a las 72 horas para prevenir accesos no autorizados o intercepción de correos.                   |
|                                                                                                    |
|   Contrato: PACT-8X9K2 · Rediseño App Móvil                                                        |
|   Creador:  Sofía Ramos (sofia@uxstudio.mx)                                                        |
|                                                                                                    |
|   ┌────────────────────────────────────────────────────────────────────────────────────────────┐   |
|   │ Para renovar tu acceso instantáneamente, confirma tu número de WhatsApp o Correo:          │   |
|   │                                                                                            │   |
|   │  Teléfono registrado: [ +52 55 •••• 4218                     ]  [ Solicitar Nuevo Código ] │   |
|   └────────────────────────────────────────────────────────────────────────────────────────────┘   |
|                                                                                                    |
|   O si lo prefieres, pulsa abajo para enviar una notificación automática a Sofía:                  |
|                                                                                                    |
|   [ 💬 Notificar a Sofía por WhatsApp para que reactive el enlace ]   [ Volver al Inicio ]         |
+----------------------------------------------------------------------------------------------------+
```

#### Error de Discrepancia de Hash Criptográfico (Tampering Alert)
```
+----------------------------------------------------------------------------------------------------+
| 🚨 ALERTA DE SEGURIDAD CONTRACTUAL (Integrity Violation)                              [ Código: 409 ]|
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  No se pudo procesar la firma electrónica debido a una discordancia de integridad en el documento: |
|                                                                                                    |
|  • Hash del documento acordado (v1.1):  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7...|
|  • Hash recibido al estampar firma:    a89f31b209e7c4b1239aa812398402941209384029384092384092834...|
|                                                                                                    |
|  ¿Qué significa esto?                                                                              |
|  Un parámetro del contrato (fecha, hito o monto) cambió mientras tenías abierta la pantalla.       |
|  Para garantizar que ninguna parte firme algo diferente a lo pactado, la operación se congeló.    |
|                                                                                                    |
|  [ 🔄 Recargar Última Versión Oficial Aprobada ]          [ 🛡️ Consultar Bitácora de Auditoría ]    |
+----------------------------------------------------------------------------------------------------+
```

---

### 2.4. Estado 4: Landing del Cliente Receptor (Carátula Ejecutiva de 4 Cuadrantes)

Cuando el cliente (ej. Carlos, Director de Agencia) abre el enlace sin registrarse (*Zero-Login Experience*), no recibe un PDF ilegible de 15 páginas. Recibe la **Carátula Ejecutiva de 60 Segundos**, organizada en 4 cuadrantes simétricos con el sello de validez NOM-151.

```
+----------------------------------------------------------------------------------------------------+
|  PACTIO   Acuerdo Asistido · NOM-151          [ PACT-8X9K2 ]   [ 👁️ Vista Humana | ⚖️ Vista Jurídica ]|
+----------------------------------------------------------------------------------------------------+
|  PROYECTO: Rediseño App Móvil e Integración UI            CREADOR: Sofía Ramos (Perfil Verificado ✓)|
|  EMPRESA:  Inversiones Alfa S.A. de C.V.                 RECEPTOR: Carlos Mendoza (Dir. Marketing) |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   ┌──────────────────────────────────────────────┐  ┌────────────────────────────────────────────┐ │
|   │ 1. ¿QUÉ VAS A RECIBIR? (Entregables Clave)   │  │ 2. ¿CUÁNDO SE ENTREGA? (Cronograma)        │ │
|   ├──────────────────────────────────────────────┤  ├────────────────────────────────────────────┤ │
|   │ • 24 Pantallas UI en Figma (Auto-layout).    │  │ • Fecha de Arranque: Inmediata a anticipo. │ │
|   │ • Prototipo interactivo testeado con usuarios│  │ • Hito 1 (Wireframes): 12 Nov (Día 10).    │ │
|   │ • Design System exportado en tokens JSON.    │  │ • Entrega Final: 30 Nov (Día 25 hábil).    │ │
|   │ • Fuera de alcance: Código nativo frontend.  │  │ • Congelamiento automático si falta insumo.│ │
|   └──────────────────────────────────────────────┘  └────────────────────────────────────────────┘ │
|                                                                                                    |
|   ┌──────────────────────────────────────────────┐  ┌────────────────────────────────────────────┐ │
|   │ 3. ¿CUÁNTO Y CÓMO SE PAGA? (Hitos y Montos)  │  │ 4. ¿QUÉ PASA SI SE REQUIEREN CAMBIOS?      │ │
|   ├──────────────────────────────────────────────┤  ├────────────────────────────────────────────┤ │
|   │ • Total: $30,000.00 MXN (+ IVA deducible SAT)│  │ • 2 Rondas completas de ajustes incluidas. │ │
|   │ • Hito 1: $15,000 MXN (50%) Anticipo inicio. │  │ • Ronda extra: $1,500 MXN c/u acordada.    │ │
|   │ • Hito 2: $15,000 MXN (50%) Entrega y VoBo.  │  │ • Ventana de silencio: 5 días hábiles VoBo.│ │
|   │ • Interés moratorio preventivo: 2% mensual.  │  │ • Cesión de derechos: Al liquidar el 100%. │ │
|   └──────────────────────────────────────────────┘  └────────────────────────────────────────────┘ │
|                                                                                                    |
|  🛡️ Garantía Bilateral: Retrasos del creador generan descuento del 1% diario; retrasos de pago pausan|
|  el calendario sin penalización para el creador. Derechos cedidos al finiquito total.             |
|                                                                                                    |
|  ────────────────────────────────────────────────────────────────────────────────────────────────  |
|  ACCIONES DEL CLIENTE:                                                                             |
|                                                                                                    |
|  [ ✍️ APROBAR Y FIRMAR CONTRATO (1 min) ]          [ 💬 SOLICITAR AJUSTE EN CONDICIONES (Redline) ]|
+----------------------------------------------------------------------------------------------------+
```

---

### 2.5. Estado 5: Drawer de Negociación Paramétrica (`[Solicitar Ajuste]`)

Si el cliente no está 100% de acuerdo con una fecha o porcentaje, no abandona la aplicación ni abre Word. Pulsa `[Solicitar Ajuste]` y se despliega un panel lateral derecho que le permite proponer ajustes **estrictamente paramétricos** sin romper la seguridad legal del contrato.

```
+----------------------------------------------------------------------------------------------------+
|  PACTIO   Acuerdo Asistido · NOM-151                     │ SOLICITAR AJUSTE EN CONDICIONES    [✕] |
+----------------------------------------------------------│────────────────────────────────────────┤
|                                                          │ Selecciona qué parámetro deseas        │
|  CARÁTULA CONTRACTUAL CONGELADA (Background Atenuado)    │ proponer modificar a Sofía:            │
|                                                          │                                        │
|  1. Entregables:                                         │ [ Calendario ]  [• Pagos •]  [Cambios] │
|     24 pantallas UI en Figma...                          │                                        │
|                                                          │ Modificación en Esquema de Cobro:      │
|  2. Cronograma:                                          │  • Actual v1.0:                        │
|     30 Noviembre...                                      │    Hito 1: 50% ($15,000) Anticipo      │
|                                                          │    Hito 2: 50% ($15,000) Finiquito     │
|  3. Pagos e Hitos:                                       │                                        │
|     $30,000 MXN (50% / 50%)...                           │  • Tu propuesta para v1.1:             │
|                                                          │    [ 40% Anticipo ] ($12,000 MXN)      │
|  4. Reglas de Salida y Cambios...                        │    [ 30% Hito 1   ] ($9,000 MXN)       │
|                                                          │    [ 30% Finiquito] ($9,000 MXN)       │
|                                                          │                                        │
|                                                          │  Balance Propuesto:                    │
|                                                          │  [████████████████████████████] 100% OK│
|                                                          │                                        │
|                                                          │ Nota explicativa para el profesional:  │
|                                                          │ ┌────────────────────────────────────┐ │
|                                                          │ │ "Hola Sofía, para que tesorería    │ │
|                                                          │ │  libere el anticipo hoy, nos piden │ │
|                                                          │ │  3 hitos de facturación. Gracias!" │ │
|                                                          │ └────────────────────────────────────┘ │
|                                                          │                                        │
|                                                          │ ⚠️ Parámetros bloqueados por sistema:   │
|                                                          │ 🔒 Cesión de derechos (solo al 100%)   │
|                                                          │ 🔒 Cláusula penal por impago moroso    │
|                                                          │                                        │
|                                                          │ [ ENVIAR PROPUESTA DE AJUSTE A SOFÍA ] │
+----------------------------------------------------------┴────────────────────────────────────────+
```

---

### 2.6. Estado 6: Comparativa Diff v1.1 en Pantalla del Creador

Sofía recibe una notificación instantánea en WhatsApp y correo. Al entrar a Pactio, ve la tarjeta de **Diff Semántico** con el cambio propuesto resaltado en verde y el valor anterior en rojo tachado.

```
+----------------------------------------------------------------------------------------------------+
|  PACTIO   Bóveda / Negociación en Curso                     [ PACT-8X9K2 ]   [ 🔔 1 Notificación ] |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐  |
|  │ 💬 CARLOS MENDOZA (CLIENTE) PROPUSO UN AJUSTE EN EL PROYECTO "REDISEÑO APP MÓVIL"            │  |
|  ├──────────────────────────────────────────────────────────────────────────────────────────────┤  |
|  │ Mensaje del cliente:                                                                         │  |
|  │ "Hola Sofía, para que tesorería libere el anticipo hoy, nos piden 3 hitos de facturación..." │  |
|  ├──────────────────────────────────────────────────────────────────────────────────────────────┤  |
|  │ COMPARATIVA DE CONDICIONES (Diff Semántico v1.0 ➔ v1.1):                                     │  |
|  │                                                                                              │  |
|  │   CONDICIÓN ORIGINAL (v1.0):                                                                 │  |
|  │   [- Hito 1: 50% ($15,000 MXN) Anticipo previo a inicio de diseño. -]                        │  |
|  │   [- Hito 2: 50% ($15,000 MXN) Liquidación contra entrega y visto bueno final. -]           │  |
|  │                                                                                              │  |
|  │   CONDICIÓN PROPUESTA (Para emitir v1.1):                                                    │  |
|  │   [+ Hito 1: 40% ($12,000 MXN) Anticipo de reserva previo a iniciar wireframes. +]          │  |
|  │   [+ Hito 2: 30% ($9,000 MXN) Aprobación de arquitectura y wireframes (Día 12). +]           │  |
|  │   [+ Hito 3: 30% ($9,000 MXN) Liquidación contra entrega final de componentes (Día 25). +]   │  |
|  │                                                                                              │  |
|  │   IMPORTE TOTAL: $30,000.00 MXN (Inalterado) · IVA: Conforme a factura SAT                   │  |
|  ├──────────────────────────────────────────────────────────────────────────────────────────────┤  |
|  │ Impacto legal: La cesión de derechos sigue blindada al 100% del pago acumulado ($30,000 MXN).│  |
|  │                                                                                              │  |
|  │ [ ✓ ACEPTAR AJUSTE Y EMITIR v1.1 PARA FIRMA ]     [ 💬 CONTRAPROPONER ]     [ ✕ RECHAZAR ]   │  |
|  └──────────────────────────────────────────────────────────────────────────────────────────────┘  |
+----------------------------------------------------------------------------------------------------+
```

---

### 2.7. Estado 7: Signature Hub (Firma Biométrica Vectorial & e.firma SAT)

Al pulsar `[Aprobar y Firmar]`, se abre el centro multimodal de firmas con 3 alternativas con plena validez bajo el Código de Comercio (Arts. 89-114).

```
+----------------------------------------------------------------------------------------------------+
|  PACTIO   Formalización Legal y Cierre Bilateral                 [ PACT-8X9K2 ]   [ Cancelar ✕ ]  |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  Estás a punto de formalizar el contrato "Rediseño App Móvil" (Versión v1.1 Aprobada).             |
|  Hash SHA-256 inmutable: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855        |
|                                                                                                    |
|  SELECCIONA TU MÉTODO DE FIRMA VINCULANTE:                                                         |
|  ┌─────────────────────────┬──────────────────────────┬────────────────────────────────────────┐   |
|  │ [•] 1. Trazo en Pantalla│ [ ] 2. Nombre Tipográfico│ [ ] 3. e.firma SAT (Firma Avanzada FIEL│   |
|  └─────────────────────────┴──────────────────────────┴────────────────────────────────────────┘   |
|                                                                                                    |
|  ┌────────────────────────────────────────────────────────────────────────────────────────────┐    |
|  │ LIENZO DE TRAZO BIOMÉTRICO (Captura x, y, timestamp, presión a 60 FPS):                     │    |
|  │                                                                                            │    |
|  │                                                                                            │    |
|  │               ✍️  Carlos Mendoza V.                                                        │    |
|  │              ─────────────────────────────────────────                                     │    |
|  │                                                                                            │    |
|  │                                                                         [ 🗑️ Borrar Trazo ] │    |
|  └────────────────────────────────────────────────────────────────────────────────────────────┘    |
|   Sensibilidad táctil calibrada · Cumple requisitos periciales Art. 89 Código de Comercio          |
|                                                                                                    |
|  DESAFÍO DE AUTENTICIDAD DE DOS FACTORES (2FA):                                                    |
|  Ingresa el código OTP de 6 dígitos enviado a tu WhatsApp registrado (+52 55 •••• 4218):          |
|  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                                                               |
|  │ 8 │ │ 2 │ │ 9 │ │ 4 │ │ 1 │ │ 5 │   [✓] Código verificado con éxito                             |
|  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                                                               |
|                                                                                                    |
|  [✓] Acepto expresamente los términos del acuerdo, reconociendo mi firma electrónica simple con     |
|      plenos efectos jurídicos y vinculantes conforme a la legislación mercantil aplicable.         |
|                                                                                                    |
|  [ 🔒 ESTAMPAR FIRMA Y TIMBRAR ANTE PSC (NOM-151) ]                                                |
+----------------------------------------------------------------------------------------------------+
```

---

### 2.8. Estado 8: Modal de Timbrado NOM-151 & TSA (PSC Certification Stepper)

Proceso asíncrono de 800ms a 1.2s donde se emite la constancia oficial de conservación ante el Prestador de Servicios de Certificación (PSC) acreditado por la Secretaría de Economía.

```
+----------------------------------------------------------------------------------------------------+
|                                    PACTIO · CERTIFICACIÓN NOM-151                                  |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|                                     ┌─────────────────────────┐                                    |
|                                     │      ┌───────────┐      │                                    |
|                                     │      │  🏛️ ⏱️ 🛡️  │      │                                    |
|                                     │      └───────────┘      │                                    |
|                                     │  Estampando Sello Oficial│                                   |
|                                     │   de Tiempo y Validez   │                                    |
|                                     └─────────────────────────┘                                    |
|                                                                                                    |
|  PROCESO CRIPTOGRÁFICO DE CERTIFICACIÓN:                                                           |
|                                                                                                    |
|  [✓] 1. Compilación Canónica de PDF inmutable ............................ Completado (124 ms)     |
|  [✓] 2. Digest Criptográfico SHA-256 ..................................... e3b0c442... (0.2 ms)   |
|  [✓] 3. Transmisión segura al PSC Acreditado (Secretaría de Economía) ... Confirmado (410 ms)     |
|  [►] 4. Generación de Sello Digital de Tiempo (TSA RFC 3161) ............. ESTAMPANDO... (85%)    |
|  [ ] 5. Emisión de Constancia ASN.1 DER y Fecha Cierta SAT ............... Pendiente               |
|                                                                                                    |
|  [████████████████████████████████████████████████████████████░░░░░░] 85% Concluyendo certificación|
|                                                                                                    |
|  💬 "Generando constancia legal inalterable para plena defensa fiscal y deducibilidad..."          |
+----------------------------------------------------------------------------------------------------+
```

---

### 2.9. Estado 9: Kit de Respaldo Fiscal Download Hub (Art. 69-B CFF)

Una vez timbrado, ambas partes acceden a la pantalla de felicitación y descarga del **Kit de Respaldo Fiscal**, el paquete integral que protege la deducibilidad y demuestra la materialidad del servicio ante auditorías del SAT.

```
+----------------------------------------------------------------------------------------------------+
|  PACTIO   ¡Acuerdo Formalizado Exitosamente!            [ PACT-8X9K2 ]   [ Ir a mi Bóveda → ]      |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  🎉 ¡ENHORABUENA! El contrato "Rediseño App Móvil" cuenta con fecha cierta y plena validez legal.   |
|                                                                                                    |
|  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐  |
|  │ PAQUETE PROBATORIO LISTO PARA CONTABILIDAD Y AUDITORÍAS FISCALES                             │  |
|  ├──────────────────────────────────────────────────────────────────────────────────────────────┤  |
|  │ Archivo descargable: PACT-8X9K2_Kit_Fiscal_NOM151.zip (1.8 MB)                                │  |
|  │                                                                                              │  |
|  │ Contenido del Kit Criptográfico:                                                             │  |
|  │  1. 📄 Contrato_Formalizado_v1.1.pdf   Contrato final con sellos visuales y códigos QR.      │  |
|  │  2. 🏛️ Constancia_NOM151.der          Constancia binaria oficial emitida por PSC autorizado.│  |
|  │  3. 🛡️ Bitacora_Materialidad_SAT.json  Trazabilidad completa: IPs, OTPs, User-Agents y hash. │  |
|  │  4. 📘 LEEME_PRIMERO_CONTABILIDAD.pdf  Guía práctica en 1 hoja para el contador de tu cliente│  |
|  ├──────────────────────────────────────────────────────────────────────────────────────────────┤  |
|  │ Código Único: PACT-8X9K2                                                                     │  |
|  │ Hash Documental: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855           │  |
|  │ Sello de Tiempo (TSA): 29-Oct-2026 07:42:18 GMT-6 · PSC: Mifiel Acreditado Secretaría de Ec.│  |
|  │                                                                                              │  |
|  │ [ 📥 DESCARGAR KIT FISCAL COMPLETO (.ZIP) ]       [ 📄 VER PDF EN NAVEGADOR ]                │  |
|  └──────────────────────────────────────────────────────────────────────────────────────────────┘  |
|                                                                                                    |
|  🚀 Próximo paso: Sofía iniciará el Hito 1 en cuanto reciba el anticipo pactado de $12,000 MXN.   |
+----------------------------------------------------------------------------------------------------+
```

---

### 2.10. Estado 10: Bóveda de Contratos (Dashboard Integral)

El panel central de control donde el creador administra el ciclo de vida de todos sus proyectos, con búsqueda determinista $O(1)$ mediante NanoID (`PACT-XXXXX`), filtros por estado y alertas preventivas.

```
+----------------------------------------------------------------------------------------------------+
|  PACTIO   Bóveda de Acuerdos                            [ + Nuevo Contrato ]  [ Sofía Ramos 👤 ]   |
+----------------------------------------------------------------------------------------------------+
|  🔍 Búsqueda rápida: [ PACT-8X9K2 o Cliente o Proyecto...                 ] [ Cmd+K ] [ Filtrar ▾ ]|
|                                                                                                    |
|  FILTROS:  [• Todos (14) •]  [ Borradores (2) ]  [ Pendientes (3) ]  [ Activos (6) ] [ Concluidos (3)]
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  PROYECTO: Rediseño App Móvil (v1.1) · Cliente: Inversiones Alfa S.A.         [ Código: PACT-8X9K2 ]|
|  Estado:   ● ACTIVO EN EJECUCIÓN · Hito 1 cobrado (40%) · En desarrollo de Wireframes              |
|  Vigencia: Vence en 12 días (15 de Noviembre) ⚠️ [ Alerta Preventiva: Entrega Próxima ]             |
|  Hash:     e3b0c442... | NOM-151: Sello Mifiel Acreditado                                          |
|  Acciones: [ Ver Contrato 📄 ]  [ Descargar Kit Fiscal 📥 ]  [ Registrar Entrega ]  [ Renovar 🔄 ] |
|  ────────────────────────────────────────────────────────────────────────────────────────────────  |
|  PROYECTO: Consultoría UI y Auditoría Heurística · Cliente: Startup Beta       [ Código: PACT-3M8N1 ]|
|  Estado:   🟡 PENDIENTE DE REVISIÓN · Magic link visto hace 2 horas por el cliente                 |
|  Alerta:   ⏰ Ventana de silencio: Faltan 4 días para aprobación tácita automática                |
|  Acciones: [ Reenviar Recordatorio WhatsApp ]  [ Ver Estado de Negociación ]  [ Cancelar 🗑️ ]      |
|  ────────────────────────────────────────────────────────────────────────────────────────────────  |
|  PROYECTO: Identidad Visual y Manual de Marca · Cliente: Café Orgánico         [ Código: PACT-9L2K4 ]|
|  Estado:   ⚪ BORRADOR (Incompleto - Paso 3 de 5) · Guardado hace 1 día                            |
|  Acciones: [ Continuar Editando → ]                   [ Descartar / Eliminar Borrador 🗑️ ]         |
|  ────────────────────────────────────────────────────────────────────────────────────────────────  |
|  PROYECTO: Diseño Web E-commerce · Cliente: Calzados del Norte                 [ Código: PACT-1V7Q5 ]|
|  Estado:   🟢 CONCLUIDO Y LIQUIDADO AL 100% · Derechos Patrimoniales Cedidos                       |
|  Acciones: [ Ver Expediente Histórico ]   [ Descargar Kit Fiscal ]   [ 🔄 Renovar / Duplicar ]    |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Wireframes Detallados de Alta Fidelidad en 4 Breakpoints

Pactio adapta su ergonomía visual y distribución geométrica a cuatro contextos físicos de uso:

---

### 3.1. Breakpoint 1: Ultra-Wide / 4K / 2K (`viewport >= 1440px / 1920px`)

* **Problema resuelto:** En pantallas de 27" a 40", estirar el texto a todo el ancho provoca líneas de más de 180 caracteres, rompiendo la Ley de Bringhurst y causando fatiga visual severa.
* **Solución de arquitectura:** Contenedor maestro centrado (`max-w-[1600px]`, `margin: 0 auto`). El Asistente de Creación se restringe a **640px** (zona de lectura confortable) y el documento contractual se renderiza en **escala física 1:1 proporcional a una hoja Carta/A4 real (780px)** con textura de papel y halo luminoso.

```
+====================================================================================================================================+
|  PACTIO   Proyecto: Rediseño App Móvil        [ Auto-guardado ✓ ]     [ 👁️ Vista Humana | ⚖️ Vista Jurídica ]      [ PACT-8X9K2 ]   [ 👤 ]|
+====================================================================================================================================+
| < Margen > |                       ASISTENTE WIZARD (640px)                       |         HOJA LEGAL ESCALA 1:1 (780px)         | < Margen > |
|  Neutro    |                                                                      |                                               |  Neutro    |
|            |  PASO 3 DE 5: ESQUEMA DE COBRO Y PAGOS                               |  ┌─────────────────────────────────────────┐  |            |
|            |  ──────────────────────────────────────────────────────────────────  |  │ CONTRATO PRIVADO DE PRESTACIÓN DE       │  |            |
|            |                                                                      |  │ SERVICIOS PROFESIONALES INDEPENDIENTES  │  |            |
|            |  Define cómo y cuándo se liquidará el importe de tu trabajo.         |  │                                         │  |            |
|            |                                                                      |  │ Conste por el presente instrumento que  │  |            |
|            |  Importe Total del Proyecto (Sin IVA):                               |  │ celebran, por una parte, SOFÍA RAMOS,   │  |            |
|            |  ┌────────────────────────────────────────────────────────────────┐  |  │ y por la otra, INVERSIONES ALFA S.A...  │  |            |
|            |  │ $ 30,000.00                                            [ MXN ▾]│  |  │                                         │  |            |
|            |  └────────────────────────────────────────────────────────────────┘  |  │ CLÁUSULA PRIMERA.- OBJETO Y ALCANCE:    │  |            |
|            |                                                                      |  │ El PRESTADOR se obliga a ejecutar...    │  |            |
|            |  Distribución de Pagos recomendada para tu industria:                |  │                                         │  |            |
|            |  [ 50% Anticipo / 50% Final ]   [• 40% / 30% / 30% •]   [ A Medida ] |  │ CLÁUSULA SEGUNDA.- ESQUEMA DE PAGOS:    │  |            |
|            |                                                                      |  │ El CLIENTE pagará la cantidad neta de:  │  |            |
|            |  DESGLOSE DE HITOS:                                                  |  │  a) Hito 1: $12,000.00 MXN (40%)        │  |            |
|            |  ┌────────────────────────────────────────────────────────────────┐  |  │     previo al inicio de wireframes.     │  |            |
|            |  │ ⠿ Hito 1: Anticipo de Reserva                   [ 40% ] $12,000│  |  │  b) Hito 2: $9,000.00 MXN (30%)         │  |            |
|            |  │   Condición: Previo a iniciar labores en Figma.                │  |  │     a la aprobación de wireframes.      │  |            |
|            |  ├────────────────────────────────────────────────────────────────┤  |  │  c) Hito 3: $9,000.00 MXN (30%)         │  |            |
|            |  │ ⠿ Hito 2: Entrega de Wireframes y Flujos        [ 30% ] $9,000 │  |  │     contra entrega de prototipo final.  │  |            |
|            |  │   Condición: Aprobación formal del hito 1.                     │  |  │                                         │  |            |
|            |  ├────────────────────────────────────────────────────────────────┤  |  │ CLÁUSULA TERCERA.- CESIÓN CONDICIONADA: │  |            |
|            |  │ ⠿ Hito 3: Prototipo Final y Tokens              [ 30% ] $9,000 │  |  │ La transmisión de derechos patrimoniales│  |            |
|            |  │   Condición: Liquidación y visto bueno final.                  │  |  │ opera ÚNICA Y EXCLUSIVAMENTE tras la    │  |            |
|            |  └────────────────────────────────────────────────────────────────┘  |  │ liquidación del 100% de los honorarios. │  |            |
|            |                                                                      |  │                                         │  |            |
|            |  BARRA DE BALANCE FINANCIERO OBLIGATORIO:                            |  │ Sello Hash: e3b0c44298fc1c149afbf4c8... │  |            |
|            |  [✓] BALANCE DEL PROYECTO: 100% CUBIERTO ($30,000.00 MXN)            |  │ Página 1 de 3               [NOM-151 ✓]│  |            |
|            |  [██████████████████████████████████████████████████████] 100% Verde |  └─────────────────────────────────────────┘  |            |
|            |                                                                      |                                               |            |
|            |  [ ← Anterior: Alcance ]            [ Siguiente: Derechos de Autor →]|                                               |            |
+====================================================================================================================================+
```

---

### 3.2. Breakpoint 2: Laptop Estándar (`1024px <= viewport < 1440px`)

* **Configuración canónica:** Split-Pane 55% / 45%.
* **Comportamiento:** El usuario interactúa con los controles en el panel izquierdo y observa cómo la hoja de la derecha reacciona en menos de 16 milisegundos con un sutil halo de resaltado en la cláusula que se está mutando.

```
+----------------------------------------------------------------------------------------------------+
|  PACTIO   Rediseño App Móvil        [ PACT-8X9K2 ]   [ 👁️ Humano | ⚖️ Jurídico ]  [ Guardado 11:24 ✓]|
+----------------------------------------------------------------------------------------------------+
|   ASISTENTE INTERACTIVO (55%)                           |  VISTA PREVIA REACTIVA (45%)             |
|                                                         |                                          |
|   MÓDULO 3: ESQUEMA DE COBRO                            |  ┌────────────────────────────────────┐  |
|   Total: [ $ 30,000.00 MXN                            ] |  │ CLÁUSULA SEGUNDA: HONORARIOS       │  |
|                                                         |  │                                    │  |
|   Selecciona modelo de cobro:                           |  │ Las partes convienen como retri-   │  |
|   (•) Hitos vinculados a entregables                    |  │ bución total la suma pactada de    │  |
|   ( ) 50% Anticipo y 50% Liquidación                    |  │ $30,000.00 MXN, distribuidos en    │  |
|   ( ) Pago único contra entrega final                   |  │ los siguientes hitos forzosos:     │  |
|                                                         |  │                                    │  |
|   Hito 1: [ Anticipo de inicio                     ]    |  │ 1. Hito 1: $12,000.00 MXN (40%)    │  |
|   Monto:  [ 40 % ] -> $12,000.00 MXN                    |  │    al suscribir el acuerdo.        │  |
|                                                         |  │ 2. Hito 2: $9,000.00 MXN (30%)     │  |
|   Hito 2: [ Entrega de Wireframes                  ]    |  │    al validar la arquitectura.     │  |
|   Monto:  [ 30 % ] -> $9,000.00 MXN                     |  │ 3. Hito 3: $9,000.00 MXN (30%)     │  |
|                                                         |  │    contra finiquito y entrega.     │  |
|   Hito 3: [ Prototipo Final y Design System        ]    |  │                                    │  |
|   Monto:  [ 30 % ] -> $9,000.00 MXN                     |  │ Retraso en pagos: Genera un 2%     │  |
|                                                         |  │ moratorio mensual preventivo.      │  |
|   Balance Total: [████████████████████████████] 100% OK |  │                                    │  |
|                                                         |  │ [ Hoja 1 de 2 · NOM-151 Ready 🛡️ ] │  |
|   [ ← Módulo 2: Alcance ]      [ Módulo 4: Derechos → ] |  └────────────────────────────────────┘  |
+----------------------------------------------------------------------------------------------------+
```

---

### 3.3. Breakpoint 3: Tablet (`768px <= viewport < 1023px`)

Las tablets operan en dos modos claramente diferenciados según la orientación del acelerómetro:

#### A. Modo Horizontal (Landscape - 50% / 50% Táctil)
Optimizado para interacción con Apple Pencil / Stylus o dedos, con controles expandidos de mínimo 44px de altura.

```
+----------------------------------------------------------------------------------------------------+
|  PACTIO   Rediseño App Móvil        [ PACT-8X9K2 ]   [ 👁️ Modo Humano ]   [ Guardado ]   [ Menú ☰ ]|
+----------------------------------------------------------------------------------------------------+
|   ASISTENTE TÁCTIL (50%)                                |  RÉPLICA DOCUMENTAL (50%)                |
|                                                         |                                          |
|   Paso 3: Esquema de Cobro                              |  ┌────────────────────────────────────┐  |
|   Total: [ $ 30,000.00 MXN                            ] |  │ CARÁTULA DE HONORARIOS             │  |
|                                                         |  │ Total: $30,000 MXN                 │  |
|   [ 50/50 ]   [• 40/30/30 •]   [ Personalizado ]        |  │                                    │  |
|                                                         |  │ • Hito 1 (40%): $12,000 MXN        │  |
|   Hito 1 (Anticipo): [ 40%  ▾ ] = $12,000 MXN           |  │ • Hito 2 (30%): $9,000 MXN         │  |
|   Hito 2 (Avance):   [ 30%  ▾ ] = $9,000 MXN            |  │ • Hito 3 (30%): $9,000 MXN         │  |
|   Hito 3 (Final):    [ 30%  ▾ ] = $9,000 MXN            |  │                                    │  |
|                                                         |  │ Cesión sujeta al 100% de pago      │  |
|   Balance: [██████████████████████████] 100% Cubierto   |  └────────────────────────────────────┘  |
|                                                         |                                          |
|   [ ← Anterior ]                         [ Siguiente → ]|  🔍 [ + Ampliar Hoja ]  [ 📄 Pantalla Full]|
+----------------------------------------------------------------------------------------------------+
```

#### B. Modo Vertical (Portrait - Tabs Conmutables)
Para evitar comprimir el texto a columnas ilegibles de 300px, el layout conmuta a pestañas superiores fijas:

```
+----------------------------------------------------------------------------------------------------+
|  PACTIO   Rediseño App Móvil                                             [ PACT-8X9K2 ]   [ Menú ☰ ]|
+----------------------------------------------------------------------------------------------------+
|  PESTAÑAS CONMUTABLES:   [• 📝 Asistente (Paso 3 de 5) •]   |   [ 📄 Ver Hoja de Contrato (Live) ] |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   MÓDULO 3: ESQUEMA DE COBRO Y PAGOS                                                               |
|   Define el valor total de tu proyecto y los hitos de entrega asociados.                           |
|                                                                                                    |
|   Importe Total (Sin IVA):                                                                         |
|   ┌────────────────────────────────────────────────────────────────────────────────────────────┐   |
|   │ $ 30,000.00                                                                        [ MXN ▾]│   |
|   └────────────────────────────────────────────────────────────────────────────────────────────┘   |
|                                                                                                    |
|   Esquema de Distribución:                                                                         |
|   [  50% Anticipo / 50% Fin  ]   [•  40% Anticipo / 30% / 30%  •]   [  Personalizado  ]            |
|                                                                                                    |
|   Desglose de Hitos de Facturación:                                                                |
|   ┌────────────────────────────────────────────────────────────────────────────────────────────┐   |
|   │ ⠿ Hito 1: Anticipo de Reserva (Inicio)                                       [ 40% ] $12,000│   |
|   ├────────────────────────────────────────────────────────────────────────────────────────────┤   |
|   │ ⠿ Hito 2: Wireframes y Arquitectura de Información                           [ 30% ] $9,000 │   |
|   ├────────────────────────────────────────────────────────────────────────────────────────────┤   |
|   │ ⠿ Hito 3: Prototipo Interactivo y Entrega de Archivos                        [ 30% ] $9,000 │   |
|   └────────────────────────────────────────────────────────────────────────────────────────────┘   |
|                                                                                                    |
|   Balance: [██████████████████████████████████████████████████████████████████████] 100% Cubierto   |
|                                                                                                    |
|   ──────────────────────────────────────────────────────────────────────────────────────────────   |
|   [ ← Volver a Alcance ]                                        [ Continuar a Propiedad Int. → ]   |
+----------------------------------------------------------------------------------------------------+
|  ⚡ Píldora inferior de notificación: "Hoja legal actualizada en segundo plano (v1.0 lista)"       |
+----------------------------------------------------------------------------------------------------+
```

---

### 3.4. Breakpoint 4: Móvil Smartphone (`viewport < 768px`, ej. iPhone / Android)

* **Filosofía Mobile:** Enfoque absoluto en la tarea presente.
* **Tap Targets:** Altura mínima de **48px**, zona ergonómica en el tercio inferior para el pulgar.
* **Dock Deslizable Inferior (*Bottom Dock*):** Muestra el progreso del borrador de manera persistente. Un toque o deslizamiento hacia arriba abre la hoja de contrato en un **Bottom Sheet a pantalla completa**.

#### Pantalla Móvil del Creador (Wizard Paso 3 con Bottom Dock)
```
+--------------------------------------------------+
|  PACTIO              [ 👁️ Humano ]   [ PACT-8X9K2 ]|
+--------------------------------------------------+
|  Paso 3 de 5: Esquema de Cobro                   |
|                                                  |
|  Importe Total (Sin IVA):                        |
|  ┌────────────────────────────────────────────┐  |
|  │ $ 30,000.00                          [MXN] │  |
|  └────────────────────────────────────────────┘  |
|                                                  |
|  Modelo de Pagos:                                |
|  [ 50% / 50% ]  [• 40 / 30 / 30 •]  [ A Medida ] |
|                                                  |
|  • Hito 1: Anticipo de Inicio                    |
|    [ 40 %              ▼ ] -> $ 12,000.00 MXN    |
|                                                  |
|  • Hito 2: Wireframes Validados                  |
|    [ 30 %              ▼ ] -> $  9,000.00 MXN    |
|                                                  |
|  • Hito 3: Entrega Final                         |
|    [ 30 %              ▼ ] -> $  9,000.00 MXN    |
|                                                  |
|  Balance: [████████████████████████████] 100% OK │
|                                                  |
|  [ ← Anterior ]                  [ Siguiente → ] │
|                                                  |
+--------------------------------------------------+
|  📄 Borrador v1.0 (65%)        [ ▲ Ver Contrato ] |
+--------------------------------------------------+
```

#### Bottom Sheet Desplegado en Móvil (Al tocar "Ver Contrato")
```
+--------------------------------------------------+
|                  ══════ [ DRAG HANDLE ] ══════   |
|  CONTRATO v1.0 (VISTA PREVIA)       [ Cerrar ✕ ] |
+--------------------------------------------------+
|                                                  |
|  ┌────────────────────────────────────────────┐  |
|  │ CONTRATO PRIVADO DE SERVICIOS              │  |
|  │                                            │  |
|  │ Entre Sofía Ramos ("Prestador") e Inver-   │  |
|  │ siones Alfa ("Cliente"):                   │  |
|  │                                            │  |
|  │ 1. ALCANCE Y ENTREGABLES:                  │  |
|  │    24 pantallas UI en Figma y Prototipo.   │  |
|  │                                            │  |
|  │ 2. HONORARIOS Y FORMA DE PAGO:             │  |
|  │    Total: $30,000.00 MXN                   │  |
|  │    - 40% Anticipo ($12,000 MXN)            │  |
|  │    - 30% Aprobación Wireframes ($9,000 MXN)│  |
|  │    - 30% Finiquito ($9,000 MXN)            │  |
|  │                                            │  |
|  │ 3. CESIÓN DE DERECHOS:                     │  |
|  │    Condicionada estrictamente al pago del  │  |
|  │    100% de la contraprestación convenida.  │  |
|  │                                            │  |
|  │ Hash: e3b0c442... | Validez NOM-151        │  |
|  └────────────────────────────────────────────┘  |
|                                                  |
|  [ 📥 Descargar Borrador PDF ]                   |
+--------------------------------------------------+
```

#### Pantalla Móvil del Cliente Receptor (Revisión de Carátula en WhatsApp Link)
```
+--------------------------------------------------+
|  PACTIO · Acuerdo Seguro NOM-151    [ PACT-8X9K2 ]|
+--------------------------------------------------+
|  Sofía Ramos te ha compartido el resumen de      |
|  colaboración para "Rediseño App Móvil".         |
|                                                  |
|  ┌────────────────────────────────────────────┐  |
|  │ 1. ¿QUÉ RECIBES?                           │  |
|  │ • 24 Pantallas UI en Figma listas para dev.│  |
|  │ • Prototipo interactivo en alta fidelidad. │  │
|  └────────────────────────────────────────────┘  |
|                                                  |
|  ┌────────────────────────────────────────────┐  |
|  │ 2. ¿CUÁNDO SE ENTREGA?                     │  |
|  │ • 25 días hábiles a partir del anticipo.   │  |
|  │ • Hito 1 (Wireframes): 12 de Noviembre.    │  |
|  └────────────────────────────────────────────┘  |
|                                                  |
|  ┌────────────────────────────────────────────┐  |
|  │ 3. ¿CUÁNTO Y CÓMO SE PAGA?                 │  |
|  │ • Total: $30,000 MXN (Factura SAT deducible│  |
|  │ • 40% Anticipo / 30% Avance / 30% Cierre   │  |
|  └────────────────────────────────────────────┘  |
|                                                  |
|  ┌────────────────────────────────────────────┐  |
|  │ 4. ¿CAMBIOS O CANCELACIONES?               │  |
|  │ • 2 rondas de revisión incluidas.          │  |
|  │ • 5 días para dar visto bueno a entregas.  │  |
|  └────────────────────────────────────────────┘  |
|                                                  |
|  [ ✍️ APROBAR Y FIRMAR CONTRATO (1 min) ]       |
|                                                  |
|  [ 💬 SOLICITAR AJUSTE EN FECHA O PAGO ]         |
+--------------------------------------------------+
```

---

## 4. Arquitectura y Mecánica del Switch Dual de Lenguaje

Uno de los principales detonadores de litigios e impagos es la **incomprensión del lenguaje legal**. Por otro lado, un contrato puramente coloquial carece de rigor probatorio ante un juez mercantil. Pactio resuelve esta paradoja mediante el **Switch Dual de Lenguaje en el Navbar**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       INTERRUPTOR CONMUTABLE DE PERSPECTIVA LINGÜÍSTICA                         │
├────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│  [• 👁️ Vista Humana (Coloquial Explicada) •]   │   [  ⚖️ Vista Jurídica (Formal Mercantil)  ]   │
└────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```

### 4.1. Garantía de Cero Desplazamiento Acumulado (CLS = 0.000)
Para conmutar entre ambos textos sin que la pantalla salte o parpadee:
1. El contenedor de cada cláusula utiliza una reserva de altura mínima (`min-height`) calculada previamente vía CSS Grid.
2. La transición se ejecuta mediante una animación suave de opacidad cruzada (`cross-fade` de 150ms).
3. Ambos textos provienen del mismo estado JSON estructurado en memoria; solo cambia el motor de renderizado del componente.

### 4.2. Mapeo Módulo por Módulo: Vista Humana vs. Vista Jurídica

| Módulo | 👁️ Lo que se lee en Vista Humana | ⚖️ Lo que se lee en Vista Jurídica |
| :--- | :--- | :--- |
| **M1: Partes y Domicilio** | **¿Quiénes hacen el trato?**<br>Sofía Ramos (Diseñadora independiente con RFC y cuenta bancaria verificada) y Carlos Mendoza en representación de Inversiones Alfa S.A. de C.V. Ambos acuerdan resolver cualquier desacuerdo amistosamente en CDMX. | **PROEMIO Y DECLARACIONES:**<br>Contrato que celebran por una parte Sofía Ramos García (en lo sucesivo "EL PRESTADOR") y por la otra Inversiones Alfa S.A. de C.V. ("EL CLIENTE"), sujetándose a las disposiciones de los Artículos 2606 al 2615 del Código Civil Federal y Código de Comercio. |
| **M2: Alcance e Insumos** | **¿Qué se entrega y qué necesitas dar tú?**<br>Sofía te entrega 24 pantallas en Figma y un prototipo navegable. El reloj de entrega de 25 días empieza a contar únicamente después de que el cliente entregue el logotipo en curvas y contraseñas de acceso. No incluye programación web ni compra de tipografías. | **CLÁUSULA PRIMERA (OBJETO Y PRELACIÓN OPERATIVA):**<br>EL PRESTADOR se compromete a la elaboración de los entregables especificados en el Anexo A. El cómputo del plazo convenido queda formalmente supeditado a la entrega íntegra de los insumos y antecedentes técnicos requeridos al CLIENTE. |
| **M3: Esquema de Cobro** | **¿Cómo fluye el dinero?**<br>El proyecto cuesta \$30,000 MXN netos (+ IVA). Se paga en 3 partes: 40% (\$12,000) para arrancar, 30% (\$9,000) al validar wireframes y 30% (\$9,000) al recibir los archivos finales. Si el cliente tarda más de 5 días en pagar, el proyecto se pone en pausa y aplica un 2% mensual por mora. | **CLÁUSULA SEGUNDA (CONTRAPRESTACIÓN Y MORA):**<br>EL CLIENTE se obliga a liquidar la cantidad de \$30,000.00 MXN conforme al calendario de hitos. La falta de pago tempestivo dentro de los cinco (5) días hábiles siguientes al vencimiento causará un interés moratorio del 2% mensual, facultando la suspensión de labores. |
| **M4: Derechos de Autor (PI)** | **¿De quién son los diseños?**<br>Los diseños son 100% tuyos una vez que hayas liquidado el último peso del contrato. Si el proyecto se cancela antes o no se liquida el 100%, los derechos siguen siendo de Sofía y la empresa no puede usarlos legalmente. Sofía podrá mostrar el trabajo en su portafolio. | **CLÁUSULA TERCERA (PROPIEDAD INTELECTUAL CONDICIONADA):**<br>La traslación de los derechos patrimoniales a que se refiere el Artículo 83 de la Ley Federal del Derecho de Autor se encuentra sujeta a la CONDICIÓN SUSPENSIVA del pago íntegro del 100% del precio convenido. EL PRESTADOR conserva el derecho inalienable de autoría y exhibición de portafolio. |
| **M5: Revisiones y Salida** | **¿Qué pasa si hay cambios o si se cancela?**<br>Tienes 2 rondas completas de correcciones incluidas. Cada ronda extra costará \$1,500 MXN. Cuando Sofía entregue un avance, tienes 5 días hábiles para dar retroalimentación; si no dices nada en ese plazo, se considera aprobado en automático. Si cancelas sin culpa de Sofía, ella retiene el anticipo. | **CLÁUSULA CUARTA (PRECLUSIÓN, SILENCIO TÁCITO Y RESCISIÓN):**<br>EL CLIENTE dispondrá de una ventana perentoria de cinco (5) días hábiles para emitir objeciones fundadas. Transcurrido dicho plazo sin notificación formal, operará de pleno derecho la aceptación tácita y preclusión de reclamos. En caso de terminación anticipada injustificada, operará una pena convencional equivalente a la retención del anticipo. |

---

## 5. Especificación de Componentes Interactivos Clave

### 5.1. Componente: Milestones Slider & Payment Balance Bar (`MilestonePaymentCard`)

Este componente asegura que el usuario nunca genere contratos con importes desbalanceados. Cuenta con un sistema visual de retroalimentación inmediata:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⠿ HITO 2: Arquitectura y Wireframes                              [ 30% ] $9,000 │
├─────────────────────────────────────────────────────────────────────────────┤
│ Nombre del Hito: [ Entrega de Wireframes navegables en Figma             ]  │
│                                                                             │
│ Condición de Cobro:                                                         │
│ ( ) Al firmar contrato  (•) Contra entrega del entregable  ( ) Por fecha    │
│                                                                             │
│ Ajuste fino de porcentaje:                                                  │
│ 10% [──────────────●──────────────────────────────] 80%                     │
│                                                                             │
│ [ 🗑️ Eliminar Hito ]                                 [ + Vincular Entregable ]│
└─────────────────────────────────────────────────────────────────────────────┘

ESTADOS DE LA BARRA DE BALANCE TOTAL:

Estado A: Incompleto (< 100%) - Bloquea avance con alerta ámbar
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ FALTA ASIGNAR EL 15% ($4,500.00 MXN)                                      │
│ [████████████████████████████████████████████████░░░░░░░░░] 85% Ámbar       │
└─────────────────────────────────────────────────────────────────────────────┘

Estado B: Perfecto (= 100%) - Habilita botón [Siguiente] con check verde
┌─────────────────────────────────────────────────────────────────────────────┐
│ [✓] BALANCE TOTAL DEL PROYECTO: 100% CUBIERTO ($30,000.00 MXN)              │
│ [████████████████████████████████████████████████████████████████] 100% Verde │
└─────────────────────────────────────────────────────────────────────────────┘

Estado C: Desbordado (> 100%) - Alerta de error rojo
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🚨 ERROR: LA SUMA EXCEDE EL 100% EN UN 10% (Total: $33,000.00 MXN)          │
│ [████████████████████████████████████████████████████████████████|████] Rojo │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.2. Componente: Tooltips Flotantes con Analogías de la Vida Real `(?)`

Junto a cada cláusula o selector legal existe un icono circular `(?)`. Al pasar el mouse en desktop o dar un tap en móviles, se despliega una tarjeta de Legal Design con una analogía didáctica del mundo real:

```
                  ┌───────────────────────────────────────────────────────┐
                  │ 🔑 ANALOGÍA: Como las llaves de un departamento       │
                  ├───────────────────────────────────────────────────────┤
[ Cesión al 100% (?)] │ "No le entregas las llaves definitivas al inquilino  │
                  │  hasta que no haya liquidado el depósito completo.    │
                  │  Si el cliente solo paga el anticipo y luego cancela, │
                  │  los diseños siguen siendo tuyos y la ley te protege  │
                  │  para impedir que los usen comercialmente."           │
                  │                                                       │
                  │ 🏛️ Fundamento: Art. 83 Ley Federal del Derecho de Autor│
                  │                                        [ Entendido ✓ ]│
                  └───────────────────────────────────────────────────────┘
```

#### Catálogo Oficial de las 5 Analogías Canónicas en Pactio:
1. **Cesión Condicionada de Derechos:**  
   *Analogía:* *"🔑 Como entregar las llaves de un departamento: No entregas la propiedad definitiva hasta que te hayan transferido el pago total."*
2. **Aprobación Tácita por Silencio (5 días):**  
   *Analogía:* *"⏰ El que calla, otorga tras 5 días: Si envías el trabajo y el cliente no responde en 5 días hábiles, se asume que todo está correcto para que no congelen tu flujo de caja indefinidamente."*
3. **Suspensión por Falta de Pago:**  
   *Analogía:* *"⛽ Sin gasolina, el coche no avanza: Si el cliente tarda en pagar un hito, puedes pausar el proyecto sin penalizaciones y tu fecha de entrega se recorre exactamente los mismos días."*
4. **Límite de Responsabilidad Civil:**  
   *Analogía:* *"🛡️ Nadie responde por lo que no cobró: Si diseñaste una tienda online por \$30,000 MXN y el servidor del cliente se cae, lo máximo que te pueden reclamar legalmente es el monto cobrado por tu trabajo."*
5. **Insumos Previos del Cliente:**  
   *Analogía:* *"🧱 No se puede levantar una pared sin ladrillos: Tu reloj de trabajo arranca formalmente hasta que el cliente te envíe los logotipos, copys y accesos que necesitas para trabajar."*

---

### 5.3. Componente: Drawer de Negociación Asíncrona (Matriz de Parámetros)

El drawer lateral derecho `[Solicitar Ajuste]` aplica una estricta **Matriz de Gobernanza Paramétrica**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                    MATRIZ DE GOBERNANZA PARAMÉTRICA EN NEGOCIACIÓN ASÍNCRONA                    │
├───────────────────────┬────────────┬─────────────────────────────┬──────────────────────────────┤
│ Parámetro             │ ¿Editable? │ Opciones permitidas         │ Bloqueo estricto del sistema │
├───────────────────────┼────────────┼─────────────────────────────┼──────────────────────────────┤
│ **Hitos de Pago**     │ **SÍ**     │ Reacomodar % (suma = 100%)  │ Prohibido proponer 0% inicial│
│ **Plazos de Revisión**│ **SÍ**     │ Extender de 5 a 7 u 8 días  │ Reducir tiempo del creador   │
│ **Rondas de Cambios** │ **SÍ**     │ Agregar 1 ronda con costo   │ Exigir "cambios ilimitados"  │
│ **Propiedad Intelect**│ ❌ **NO**  │ Ninguna (Bloqueado)         │ Inviolable: Pago al 100%     │
│ **Interés Moratorio** │ ❌ **NO**  │ Ninguna (Bloqueado)         │ Inviolable: 2% moratorio CCo │
│ **Jurisdicción**      │ ❌ **NO**  │ Solo nota sugerida          │ Forzar tribunales extranjeros│
└───────────────────────┴────────────┴─────────────────────────────┴──────────────────────────────┘
```

---

## 6. Integración de Design Tokens y Conmutador de Temas

Pactio provee tres experiencias cromáticas completas mapeadas al archivo [`figma_design_tokens.json`](figma_design_tokens.json):

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SELECTOR DE TEMAS DE INTERFAZ                                 │
├───────────────────────────────┬───────────────────────────────┬─────────────────────────────────┤
│ 1. 🌑 Midnight Slate (Def)   │ 2. 📜 Warm Paper / Arena      │ 3. 👁️ High-Contrast AAA         │
│ Fondo #0B1120 / Slate 900     │ Fondo #F5EFE6 / Paper 50      │ Fondo #000000 puro              │
│ Acento Azul Cobalto #2563EB   │ Acento Cuero Cálido #8C5835   │ Acento Cyber Gold #FFD700       │
│ Texto Slate 50 (14.2:1 AAA)   │ Texto Stone 900 (16.1:1 AAA)  │ Texto Blanco Puro (21:1 AAA)    │
│ Enfoque corporativo moderno   │ Descanso ocular estilo Kindle │ Máxima accesibilidad / Visión baja
└───────────────────────────────┴───────────────────────────────┴─────────────────────────────────┘
```

### 6.1. Selector de Escala Tipográfica y Modo Dislexia
* Selector de zoom tipográfico en cabecera: `[ A- (100%) ]  [ A (120%) ]  [ A+ (140%) ]`.
* Toggle de fuente inclusiva: `[•] Usar fuente adaptada a Dislexia (OpenDyslexic)`.

---

## 7. Mapeo de Flujos de Teclado, Foco y Atajos de Accesibilidad

Para cumplir cabalmente con **WCAG 2.1 AAA**, toda la plataforma puede operarse sin ratón:

| Atajo de Teclado | Contexto | Acción Ejecutada |
| :--- | :--- | :--- |
| `Cmd + K` / `Ctrl + K` | Global (Cualquier pantalla) | Abre la paleta de comandos y búsqueda instantánea $O(1)$ de contratos. |
| `Tab` / `Shift + Tab` | Formularios y Bóveda | Recorrido lineal determinista de elementos interactivos con focus ring de 3px. |
| `Escape` | Modales y Drawers | Cierra el drawer de negociación o firma y regresa el foco al botón que lo abrió. |
| `Alt + L` / `Opt + L` | Vista de Contrato | Conmuta instantáneamente entre `[ 👁️ Vista Humana ]` y `[ ⚖️ Vista Jurídica ]`. |
| `Alt + P` / `Opt + P` | Bóveda | Dispara la creación de un nuevo contrato protegido. |

---

## 8. Dictamen de Aprobación de Arquitectura Visual

Este documento y sus tokens asociados en [`figma_design_tokens.json`](figma_design_tokens.json) constituyen la **guía definitiva de implementación visual y frontend** para Pactio. Se garantiza:
1. Simetría total en la relación creador-cliente.
2. Cero fricción en smartphones sin registro forzado.
3. Certeza técnica y legal conforme a la NOM-151 y Código Fiscal de la Federación.
4. Accesibilidad universal y rendimiento de 60 cuadros por segundo en cualquier pantalla.

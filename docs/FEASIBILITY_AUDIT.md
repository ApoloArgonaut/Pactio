# PACTIO - DICTAMEN DE VIABILIDAD TÉCNICA Y AUDITORÍA DE ARQUITECTURA
**Documento Canónico de Arquitectura de Sistemas y Factibilidad Técnica v2.0**  
**Rol:** Lead Systems & Technical Architect  
**Audiencia:** Lead de UX/UI, Lead de CX, Core Engineering Team, Project Stakeholders

---

## ÍNDICE SISTEMÁTICO
1. [Rendimiento del Live Preview (Split-Pane Real-Time)](#1-rendimiento-del-live-preview-split-pane-real-time)
2. [Almacenamiento Dual e Indexación de Alto Rendimiento](#2-almacenamiento-dual-e-indexación-de-alto-rendimiento)
3. [Identificador Único, Fingerprinting y Búsquedas $O(1)$](#3-identificador-único-fingerprinting-y-búsquedas-o1)
4. [Máquina de Estados de Negociación (FSM) y Redlining Modular](#4-máquina-de-estados-de-negociación-fsm-y-redlining-modular)
5. [Fundamentación Criptográfica y Legal de SHA-256 vs. SHA-512 / SHA-3](#5-fundamentación-criptográfica-y-legal-de-sha-256-vs-sha-512--sha-3)
6. [Seguridad y Criptografía de los Magic Links](#6-seguridad-y-criptografía-de-los-magic-links)
7. [Viabilidad de Firma: Canvas Vectorial vs. e.firma SAT](#7-viabilidad-de-firma-canvas-vectorial-vs-efirma-sat)
8. [Capítulo Exhaustivo de Ciberseguridad (Modelo STRIDE & Pen-Testing)](#8-capítulo-exhaustivo-de-ciberseguridad-modelo-stride--pen-testing)
9. [Arquitectura del Dashboard (Bóveda), Expiración y Clonación Atómica](#9-arquitectura-del-dashboard-bóveda-expiración-y-clonación-atómica)
10. [Matriz de Consenso: Fricciones Técnicas vs. Deseos de UX/UI](#10-matriz-de-consenso-fricciones-técnicas-vs-deseos-de-uxui)
11. [Roadmap de Implementación Técnica por Sprints](#11-roadmap-de-implementación-técnica-por-sprints)

---

## 1. RENDIMIENTO DEL LIVE PREVIEW (SPLIT-PANE REAL-TIME)

### 1.1. Diagnóstico: El colapso de compilar PDF en tiempo real
La propuesta de compilar un archivo binario PDF en cada pulsación de tecla (`onKeyDown` / `onChange`) es inviable a escala:

1. **Server-Side Rendering de PDF (Puppeteer / Chromium Headless / Gotenberg / Weasyprint):**
   - **Latencia y Concurrencia:** Iniciar o reusar una pestaña en Chromium headless consume entre 50 MB y 150 MB de memoria RAM y toma entre 450 ms y 1,500 ms de procesamiento por invocación.
   - **Colapso de CPU:** Si un usuario escribe a un ritmo promedio de 4 a 6 caracteres por segundo, generar PDFs en el servidor generaría cientos de solicitudes por minuto por sesión activa. Con 50 usuarios concurrentes, el pool de renderizado saturará los cores de CPU, colapsará la cola de trabajos y disparará los costos de infraestructura a niveles insostenibles.
2. **Client-Side Rendering de PDF (@react-pdf/renderer, jsPDF, pdfmake):**
   - **Bloqueo del Event Loop (Jank visual):** Aunque se traslade la ejecución a un *Web Worker*, el cálculo de métricas tipográficas (*font metric calculation*), corte de líneas (*line breaking*), paginado geométrico y serialización binaria compite por la memoria y el hilo de renderizado del navegador.
   - **Degradación Móvil y Batería:** En dispositivos móviles de gama media o baja, esto produce caídas drásticas de cuadros por segundo (< 20 fps), congelamiento del teclado virtual y consumo excesivo de batería.

### 1.2. Solución Canónica: Arquitectura Híbrida "Dual-Engine / Single Source of Truth"

| Dimensión | Pane de Edición / Live Preview (Tiempo Real) | Compilación Canónica de PDF (Final / Hito) |
| :--- | :--- | :--- |
| **Tecnología** | React / Tailwind CSS / HTML5 DOM reactivo | Chromium Headless en contenedor aislado (Node.js / Go) |
| **Frecuencia** | En cada pulsación / cambio de toggle (0 ms red) | Solo en transiciones de estado (`Draft` → `Pending_Review`) o descarga explícita |
| **Tiempo de respuesta** | < 16 ms (60 fps constante) | 800 ms - 1.2 s (proceso en background asíncrono con BullMQ) |
| **Consumo de recursos** | CPU cliente insignificante (Virtual DOM diffing) | Controlado bajo demanda en worker pools elásticos |
| **Fidelidad geométrica** | Hoja simulada Carta/A4 con Tailwind (`aspect-[8.5/11]`) | PDF/A estático inmutable con tipografía incrustada |

#### Implementación Técnica del Live Preview:
1. **Contrato como Estado Estructurado (JSON Schema):**  
   El contrato se modela como un documento JSON canónico estructurado y reactivo:
   ```typescript
   interface ContractData {
     metadata: {
       contractCode: string; // ej. PACT-8X9K2
       title: string;
       createdAt: string;
       currency: 'MXN' | 'USD';
       validUntil?: string;
     };
     parties: { provider: PartyInfo; client: PartyInfo };
     scope: { serviceType: string; deliverables: Deliverable[]; dates: ProjectTimeline };
     payments: { model: 'fixed' | 'milestones' | 'hourly'; schedule: PaymentItem[]; lateFee: number };
     clauses: ClauseConfig[]; // Toggles activos: confidencialidad, propiedad intelectual, no competencia
   }
   ```
2. **Pane de Edición (Izquierda):**  
   Controla las mutaciones del store (vía Zustand con mutaciones selectivas para evitar re-renders innecesarios).
3. **Pane de Visualización (Derecha):**  
   Renderiza un componente `<ContractDocumentPreview data={contractState} />` en puro HTML/CSS.
   - Utiliza CSS Paged Media: `@page { size: letter; margin: 20mm; }` y clases Tailwind como `break-inside-avoid` en cada cláusula legal para reflejar con un 99.8% de precisión cómo lucirán los saltos de página del PDF final.
   - Cambios de toggle y campos de texto se actualizan en tiempo real mediante `requestAnimationFrame` sin ninguna llamada a red ni compilación de canvas/PDF.
4. **Persistencia Backend Eficiente:**  
   Debounce local de 1,000 ms para autoguardado en API (`PATCH /api/contracts/:id/draft`) y guardado inmediato en `onBlur` o navegación entre pasos.

---

## 2. ALMACENAMIENTO DUAL E INDEXACIÓN DE ALTO RENDIMIENTO

### 2.1. Dual Storage Pattern: JSONB Estructurado + Texto Plano / Markdown Canónico
En la base de datos relacional (PostgreSQL), cada contrato persiste en dos columnas complementarias de primer nivel:
1. `structured_payload` (`JSONB`): Almacena la jerarquía completa de datos para reactividad en UI, validación contra esquemas Zod/TypeScript, y manipulación modular de cláusulas.
2. `plain_text_content` (`TEXT`): Representación textual canónica en Markdown/Texto Plano normalizado del contrato en su versión vigente.

```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_code VARCHAR(12) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(32) NOT NULL,
    version_major INT NOT NULL DEFAULT 1,
    version_minor INT NOT NULL DEFAULT 0,
    structured_payload JSONB NOT NULL,
    plain_text_content TEXT NOT NULL,
    valid_until TIMESTAMPTZ NULL,
    deleted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.2. Justificación Técnica: Por qué esto NO satura el servidor
- **Huella de Almacenamiento Insignificante:** Un contrato de servicios estándar oscila entre 1,500 y 3,000 palabras. El texto plano normalizado pesa entre **8 KB y 15 KB** en UTF-8. 
  - Almacenar 50,000 contratos en texto plano requiere aproximadamente **500 MB a 750 MB** de almacenamiento secundario (un costo inferior a $0.10 USD/mes en cualquier proveedor cloud).
  - Comparado con los 500 KB - 2 MB que pesa un PDF binario compilado o una imagen rasterizada, el costo de storage es despreciable.
- **Rendimiento de Full-Text Search (FTS):**
  - Consultar datos dentro de objetos JSON anidados con operadores JSONB (`->`, `->>`, `@>`) obliga al motor de base de datos a desempaquetar árboles binarios y parsear claves, lo que degrada la latencia bajo concurrencia.
  - Al tener `plain_text_content`, PostgreSQL utiliza un índice **GIN (Generalized Inverted Index)** sobre el vector de texto completo nativo:
    ```sql
    ALTER TABLE contracts ADD COLUMN text_search_tsv tsvector 
    GENERATED ALWAYS AS (to_tsvector('spanish', plain_text_content)) STORED;

    CREATE INDEX idx_contracts_fts ON contracts USING GIN(text_search_tsv);
    ```
  - Permite búsquedas instantáneas (< 2 ms) de cualquier palabra clave, cláusula de propiedad intelectual, monto o condición especial entre millones de registros.
- **Auditoría Atemporal (Long-Term Preservation & Data Longevity):**
  - Dentro de 10 o 15 años, el esquema de datos de la interfaz de usuario, las versiones de librerías o los frameworks frontend (React/Zustand) pueden quedar deprecados o modificarse.
  - El campo `plain_text_content` preserva la literalidad jurídica exacta de lo convenido sin depender de ningún software interpretador propietario, cumpliendo con los principios de conservación a largo plazo previstos en el Código de Comercio.

---

## 3. IDENTIFICADOR ÚNICO, FINGERPRINTING Y BÚSQUEDAS $O(1)$

### 3.1. Problemática: Homónimos, Ambigüedad y Escala en Clientes
En plataformas contractuales para profesionistas independientes, es común que:
- Múltiples clientes compartan nombres comunes (ej. "Juan Domínguez", "Consultores Asociados").
- Un creador tenga 10 o 15 contratos distintos con el mismo cliente a lo largo de los años.
- Las partes requieran referenciar un contrato verbalmente, por teléfono, correo o WhatsApp sin copiar un UUID v4 largo de 36 caracteres (`f47ac10b-58cc-4372-a567-0e02b2c3d479`).

### 3.2. Estructura de Identificación Tripartita

```
┌────────────────────────────────────────────────────────────────────────┐
│                        IDENTIFICACIÓN TRIPARTITA                       │
├─────────────────────┬──────────────────────────┬───────────────────────┤
│ Identificador       │ Propósito                │ Formato / Ejemplo     │
├─────────────────────┼──────────────────────────┼───────────────────────┤
│ 1. UUID Técnico     │ Llave primaria interna   │ UUID v4 / UUID v7     │
│ 2. Código Humano    │ Búsqueda rápida, soporte │ NanoID (Crockford)    │
│                     │ y facturación            │ ej. "PACT-8X9K2"      │
│ 3. Hash Cripto      │ No repudio e integridad  │ SHA-256 (64 hex)      │
│                     │ NOM-151                  │ ej. "e3b0c44298fc..." │
└─────────────────────┴──────────────────────────┴───────────────────────┘
```

1. **UUID v4 / UUID v7 (`id`):** Identificador interno inmutable no correlativo para control relacional en base de datos.
2. **Código Humano Único (`contract_code`):**
   - Generado mediante NanoID con alfabeto **Crockford Base32** (`0123456789ABCDEFGHJKMNPQRSTVWXYZ`), eliminando letras visualmente ambiguas (`I`, `L`, `O`, `U`).
   - Longitud de 6 a 8 caracteres, precedido por prefijo nemotécnico (ej. `PACT-8X9K2`).
   - Fácil de dictar, memorizar e imprimir en carátulas o recibos.
3. **Hash Criptográfico Inmutable (`document_hash`):**
   - Digest SHA-256 del contenido canónico final y del binario PDF sellado por el PSC.

### 3.3. Estrategia de Indexación para Búsquedas Ultrarrápidas ($O(1)$ amortizado)
Para garantizar tiempos de respuesta inferiores a **1 ms**:
```sql
-- 1. Búsqueda exacta O(1) / O(log N) mediante B-Tree por código corto legible
CREATE UNIQUE INDEX idx_contracts_code ON contracts(contract_code);

-- 2. Búsqueda por cliente / creador con orden cronológico
CREATE INDEX idx_contracts_user_client ON contracts(user_id, status, created_at DESC);

-- 3. Búsqueda Full-Text Search O(log N) sobre texto plano
-- Resuelve consultas como 'Juan Domínguez anticipo 50%' en < 2 ms
SELECT id, contract_code, status, created_at 
FROM contracts 
WHERE user_id = $1 
  AND text_search_tsv @@ plainto_tsquery('spanish', 'Juan Dominguez anticipo')
ORDER BY ts_rank(text_search_tsv, plainto_tsquery('spanish', 'Juan Dominguez anticipo')) DESC;
```

---

## 4. MÁQUINA DE ESTADOS DE NEGOCIACIÓN (FSM) Y REDLINING MODULAR

### 4.1. Diagrama FSM Riguroso con Ciclo Completo de Contrapropuestas

```
                      [Draft]
                         │
                         │ (Creador hace clic en "Enviar a Revisión")
                         ▼
             ┌──► [Pending_Client_Review] ────────────────────────────────────────┐
             │           │                                                        │
             │           │ (Cliente solicita ajustes)                             │
             │           ▼                                                        │
             │    [Adjustment_Requested]                                          │
             │           │                                                        │
             │           │ (Creador abre panel de ajustes)                        │
             │           ▼                                                        │
             │       [v1.1_Draft]                                                 │ (Cliente aprueba
             │           │                                                        │  sin cambios)
             │           │                                                        │
             │           │ (Creador aplica/contrapropone y reenvía)               │
             └───────────┘                                                        │
                                                                                  ▼
                                                                        [Mutually_Approved]
                                                                                  │
                                                                                  │ (Inicia recolección de firmas)
                                                                                  ▼
                                                                       [Signed_Pending_PSC]
                                                                                  │
                                                                                  │ (PSC sella con NOM-151)
                                                                                  ▼
                                                                        [Completed_NOM151]
                                                                          (Inmutable)

     * Rutas de Cancelación/Expiración:
       [Cualquier estado antes de Mutually_Approved] ──(Descarte)──► [Cancelled] / [Expired]
```

### 4.2. Matriz de Estados, Actores, Reglas de Transición e Inmutabilidad

| Estado | Actor con Control | Mutabilidad del Contrato | Snapshot Criptográfico | Acciones Permitidas |
| :--- | :--- | :--- | :--- | :--- |
| **`Draft`** | Creador (Freelancer) | Totalmente editable | `null` | Modificar datos, toggles, cláusulas, previsualizar réplica HTML. |
| **`Pending_Client_Review`** | Cliente Receptor | Solo Lectura para ambas partes | `SHA-256(v1.0_Canonical_JSON + PDF)` | Cliente puede: (a) Aprobar sin cambios, (b) Solicitar Ajustes modulares. |
| **`Adjustment_Requested`** | Cliente / Creador | Bloqueado para edición directa | Snapshot con anotaciones pendientes | Cliente agrega comentarios y propuestas a cláusulas específicas. |
| **`v1.1_Draft`** | Creador | Editable solo en cláusulas observadas | `SHA-256(v1.0)` como parent hash | Creador visualiza Diff visual; acepta, rechaza o ajusta; reenvía a `Pending_Client_Review`. |
| **`Mutually_Approved`** | Sistema (Bloqueo Paritario) | **100% INMUTABLE** (Read-Only) | `FINAL_CANONICAL_HASH = SHA256(v1.X_Approved)` | Se dispara la compilación del PDF canónico final. Nadie puede alterar 1 byte. |
| **`Signed_Pending_PSC`** | Ambas partes / Sistema | Inmutable | Hash de firmas vinculadas al documento | Se recolectan firmas (trazo / e.firma). Se despacha el payload al PSC. |
| **`Completed_NOM151`** | Estado Terminal | Inmutable / Sellado permanente | Constancia NOM-151 ASN.1 DER embed | Descarga de PDF con hoja de evidencias y constancia descargable. |
| **`Cancelled` / `Expired`**| Creador / Timeout | Inactivo (Soft-deleted) | Último snapshot congelado | Archivado en la bóveda con marca de no concretado. |

### 4.3. Redlining Modular vs. Confusión de Edición Libre
- **Por qué NO permitir edición libre de texto al cliente (tipo Google Docs):**  
  En un contexto jurídico para freelancers, permitir que el cliente modifique texto directamente abre la puerta a que inserte cláusulas abusivas inadvertidas o modifique condiciones de pago subrepticiamente ("cláusulas trampa"), rompiendo la confianza.
- **Mecanismo de Ajuste Modular Estructurado:**
  El cliente no edita el documento base; interactúa con cada cláusula mediante un botón contextual *"Sugerir cambio"*.
  - Cada sugerencia almacena: `{ clause_id, field, original_value, suggested_value, reason, timestamp }`.
  - En la interfaz del Creador (`v1.1_Draft`), se despliega un **Diff Visual Semántico**:
    - Rojo tachado para el valor anterior.
    - Verde resaltado para el valor sugerido.
    - Acciones atómicas: `[Aceptar]`, `[Rechazar]`, `[Contrapropuesta]`.
  - El reenvío actualiza la versión menor (`v1.1`) y regresa a `Pending_Client_Review` para validación paritaria.

### 4.4. Audit Trail Criptográfico con Encadenamiento (Hash Chaining)
Cada acción se asienta en una tabla de auditoría inmutable:
```json
{
  "event_id": "evt_01HGB...",
  "contract_id": "ctr_987...",
  "version": "1.1",
  "sequence_index": 5,
  "action": "PROPOSAL_RESUBMITTED",
  "actor": { "role": "CREATOR", "email": "sofia@uxstudio.mx" },
  "metadata": {
    "ip_address": "201.175.42.18",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
    "screen_resolution": "1728x1117",
    "tls_fingerprint": "ja3_..."
  },
  "document_hash_at_event": "d2c5e...48b",
  "previous_event_hash": "a1b2c...3d4",
  "current_event_hash": "SHA256(event_id + timestamp + action + metadata + prev_hash)"
}
```

---

## 5. FUNDAMENTACIÓN CRIPTOGRÁFICA Y LEGAL DE SHA-256 VS. SHA-512 / SHA-3

### 5.1. ¿Por qué SHA-256 es el algoritmo idóneo para Pactio?

#### 1. Requerimiento Normativo Estricto en México (NOM-151-SCFI-2016 y SAT)
- La **Norma Oficial Mexicana NOM-151-SCFI-2016** y los lineamientos técnicos de la Secretaría de Economía para los Prestadores de Servicios de Certificación (PSC) establecen formalmente el uso de la familia SHA-2 (con SHA-256 como estándar de referencia obligatoria) para la generación de constancias de conservación de mensajes de datos y sellado de tiempo.
- El **Servicio de Administración Tributaria (SAT)** en el Anexo 20 de la Resolución Miscelánea Fiscal y los estándares de e.firma (CFF Art. 17-D) emplean exclusivamente cadenas de firma **RSA-SHA256**.
- El protocolo **RFC 3161 (Time-Stamp Protocol)** implementado por los PSCs autorizados en México (ej. Mifiel, Seguridata, Advantech) utiliza `id-sha256` en las solicitudes `TimeStampReq`. Utilizar SHA-3 (Keccak) o algoritmos no normados provocaría rechazo inmediato en las autoridades certificadoras y nulidad probatoria ante tribunales mercantiles.

#### 2. Rendimiento y Aceleración por Hardware Nativo
- Los procesadores modernos (tanto x86_64 con *Intel SHA Extensions* como ARMv8/Apple Silicon con *ARM Cryptography Extensions*) cuentan con **instrucciones de silicio dedicadas para SHA-256** (`sha256rnds2`).
- Esto permite calcular el digest de un contrato en **menos de 0.2 ms** en el navegador de un smartphone o en un servidor Node.js sin sobrecalentar el procesador ni degradar la experiencia de usuario.
- SHA-512 requiere procesadores nativos de 64 bits y duplica el tamaño de los hashes en estructuras ASN.1 DER y códigos QR probatorios sin aportar ninguna ventaja práctica en seguridad.

#### 3. Espacio Criptográfico y Resistencia a Colisiones
- El espacio de estados de SHA-256 es de $2^{256} \approx 1.15 \times 10^{77}$ combinaciones (un número similar al total de átomos estimados en la Vía Láctea).
- Para generar una colisión por paradoja del cumpleaños se requerirían $2^{128}$ operaciones de hashing. Con la capacidad de cómputo de todos los supercomputadores del planeta operando conjuntamente, tomaría billones de años encontrar dos contratos que arrojen el mismo hash.
- A la fecha no existe ninguna debilidad matemática ni ataque práctico conocido contra la resistencia a preimagen o colisiones de SHA-256.

---

## 6. SEGURIDAD Y CRIPTOGRAFÍA DE LOS MAGIC LINKS

### 6.1. Modelo de Amenazas en Enlaces sin Login Obligatorio
1. **Intercepción de Bots y Escáneres de Correo (Microsoft Defender Safe Links, Google Workspace Spam Filter):**
   - Los servicios de seguridad abren automáticamente todos los enlaces recibidos para verificar malware. Si el enlace mágico ejecuta acciones mediante `GET` o es de un solo uso (*single-use burn*), el bot consume el token antes de que el usuario abra el correo, o falsea la aceptación del contrato.
2. **Fuga de Referrer (Referrer Leakage):**
   - Si el enlace contiene el token en el query string y la página carga recursos externos, el token se fuga en el encabezado HTTP `Referer`.
3. **Fuerza Bruta y Ataques de Enumeración.**
4. **Intercepción en Tránsito (Man-in-the-Middle o Reenvío no autorizado de email).**

### 6.2. Arquitectura de Defensa Multicapa

#### A. Generación y Almacenamiento Criptográfico del Token
- **Entropía:** Generación con CSPRNG de 256 bits (`crypto.randomBytes(32)`), codificado en Base64URL.
- **Zero-Storage of Raw Tokens:** En base de datos **NUNCA** se almacena el token en texto claro. Se almacena únicamente su digest `SHA-256(token)`.
- **TTL Estricto:** Expiración por defecto de 72 horas para revisión.

#### B. Patrón "Zero-Click Immunity" (Anti-Bot Landing)
- Los enlaces enviados en los correos tienen el formato:  
  `https://app.pactio.lat/c/review?auth=TOKEN_VALUE`
- La petición `GET` correspondiente a esa URL:
  - **NO** altera estados en la base de datos ni consume el token.
  - Sirve un cascarón estático ligero con encabezados:
    ```http
    Referrer-Policy: no-referrer
    X-Robots-Tag: noindex, nofollow, noarchive
    Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
    ```
- En el cliente, la página ejecuta una validación transparente:
  - Realiza una llamada `POST /api/v1/auth/claim-link` enviando el token en el body JSON.
  - El backend verifica el token, asocia la huella de navegación y devuelve una cookie de sesión firmada `HttpOnly`, `Secure`, `SameSite=Strict`.
  - El frontend redirige internamente a `/contracts/:id/review` eliminando el token de la barra de direcciones (`window.history.replaceState`), blindando el historial del navegador.

#### C. Control de Acceso y Rate Limiting
- **Rate-Limiting por Bucket (Redis):** Máximo 5 intentos fallidos por IP cada 15 minutos; bloqueo de 1 hora ante anomalías de enumeración.
- **Fingerprinting Forense:** Se registra IP y User-Agent en la activación. Si se detecta un salto anómalo entre la apertura y la firma, se solicita una confirmación OTP de 4 dígitos enviada al correo del receptor.

---

## 7. VIABILIDAD DE FIRMA: CANVAS (VECTORIAL) VS. E.FIRMA SAT

### 7.1. Firma en Canvas (Trazo Táctil): Vectorial vs. Raster

#### La trampa del PNG en Base64:
- Un trazo de canvas exportado a PNG en Base64 pesa entre 120 KB y 400 KB.
- Almacenarlo en la base de datos satura el almacenamiento y eleva la latencia de red.
- **Gravedad Legal/Pericial:** Una imagen rasterizada no tiene propiedades dinámicas. Ante un juicio mercantil donde se impugne la firma, un PNG no permite a un perito en grafoscopía determinar velocidad de arranque, pausas, dirección de curvas ni orden de trazos.

#### Solución Canónica: Captura Paramétrica Vectorial (JSON de Curvas Bézier + SVG)
1. **Captura de Eventos Pointer:**
   Se capturan eventos nativos `PointerEvent` (`pointerdown`, `pointermove`, `pointerup`):
   ```typescript
   interface StrokePoint {
     x: number;          // Coordenada normalizada (0.0 a 1.0) respecto al viewBox
     y: number;
     time: number;       // Timestamp milisegundos desde inicio del trazo
     pressure: number;   // Presión (0.0 a 1.0) para stylus / Apple Pencil
   }
   type Stroke = StrokePoint[];
   type BiometricSignaturePayload = Stroke[];
   ```
2. **Eficiencia Extrema de Almacenamiento:**
   - La serie de trazos vectoriales normalizados pesa entre **1.8 KB y 4.5 KB** en formato JSON.
   - Con compresión Gzip en almacenamiento / red: **< 1.2 KB** (reducción del 98% frente a un PNG en base64).
3. **Renderizado Nítido e Inmutable:**
   - Se dibuja en cualquier resolución mediante interpolación de splines (curvas de Bézier cúbicas con grosor dinámico proporcional a la velocidad y presión).
   - Para incrustar en el PDF canónico final, se exporta como elemento `<svg>` vectorial nativo con dimensiones exactas (`120x60 pt`), garantizando calidad de impresión perfecta sin pixelación.
4. **Respaldo Legal (Código de Comercio Art. 89):**  
   Al conservar el vector temporal y la métrica de ejecución del trazo, la firma electrónica simple adquiere una robustez pericial que supera sustancialmente a cualquier imagen plana.

---

### 7.2. e.firma SAT: Arquitectura Cero-Conocimiento (Client-Side Cryptography)

#### La Regla de Oro Legal y de Seguridad:
Bajo el Artículo 17-D del Código Fiscal de la Federación (CFF) y la Ley de Firma Electrónica Avanzada (LFEA), la clave privada (`.key`) es de **uso exclusivo del titular**.  
> **ALERTA CRÍTICA:** Pactio **NUNCA** debe recibir ni almacenar en sus servidores el archivo `.key` ni la contraseña de la e.firma de los usuarios. Almacenar o transmitir contraseñas o llaves privadas convertiría a Pactio en custodio de identidad fiscal, atrayendo responsabilidad penal y civil por suplantación de identidad.

#### Flujo de Firma en Navegador (Client-Side Signing):

```
[Usuario] 
   │ Selecciona .cer y .key localmente + ingresa contraseña en input local
   ▼
[Navegador: Web Worker Criptográfico en Memoria Volátil]
   │ 1. Descifra el archivo .key localmente usando PBKDF2 / 3DES / AES-CBC
   │ 2. Obtiene la llave privada RSA en memoria
   │ 3. Lee el SHA-256 del documento canónico pactado (hash inmutable)
   │ 4. Genera la firma digital PKCS#1 v1.5 / RSA-SHA256
   │ 5. Pesa y extrae del .cer público: RFC, CURP y Razón Social / Nombre
   │ 6. PURGA Y SOBRESCRIBE LA MEMORIA (Buffer.fill(0))
   ▼
[Transmisión al Servidor Pactio (HTTPS)]
   │ Envía ÚNICAMENTE:
   │ - Certificado público .cer (Base64)
   │ - Firma criptográfica resultante (Base64)
   │ - Metadatos extraídos (RFC, Nombre)
   │ (NUNCA viajan la contraseña ni el archivo .key)
   ▼
[Servidor Pactio / API PSC (Mifiel)]
   │ 1. Valida la firma contra el hash del documento usando la llave pública del .cer
   │ 2. Consulta OCSP / Lista de Certificados Revocados (LCR) del SAT
   │ 3. Solicita la Constancia de Conservación NOM-151 al PSC autorizado
```

#### Estándar NOM-151-SCFI-2016 y Rol del PSC:
- Para dar plena validez probatoria conforme al Código de Comercio mexicano (Artículos 89 a 114), el documento y sus firmas deben someterse a un PSC acreditado por la Secretaría de Economía (como Mifiel).
- El PSC no lee el contenido del contrato (garantizando confidencialidad); recibe únicamente el **SHA-256 del contrato compilado y firmado**.
- El PSC estampa un **Sello Digital de Tiempo (TSA)** y emite una **Constancia de Conservación de Mensajes de Datos (formato ASN.1 DER)**.
- Esta constancia prueba fehacientemente ante cualquier tribunal judicial que el contrato existía íntegro e inalterado en ese instante exacto.

---

## 8. CAPÍTULO EXHAUSTIVO DE CIBERSEGURIDAD (MODELO STRIDE & PEN-TESTING)

Para blindar la plataforma ante auditorías de seguridad, auditorías SOC 2 y pruebas de penetración (*pen-testing*), se desglosa el modelo de amenazas formal bajo la metodología **STRIDE**:

```
┌────────────────────────────────────────────────────────────────────────┐
│               ANÁLISIS DE AMENAZAS - METODOLOGÍA STRIDE                │
├──────────────────────────┬─────────────────────────────────────────────┤
│ Amenaza STRIDE           │ Contramedida de Arquitectura en Pactio      │
├──────────────────────────┼─────────────────────────────────────────────┤
│ S - Spoofing             │ Tokens HMAC-SHA256 + Desafío OTP por red    │
│ T - Tampering            │ Hashes canónicos + Encadenamiento forense   │
│ R - Repudiation          │ Sello de Tiempo NOM-151 + Vector biométrico │
│ I - Information Discl.   │ AES-256 at rest, TLS 1.3, Headers anti-leak │
│ D - Denial of Service    │ Token Bucket en Redis + Colas asíncronas    │
│ E - Elevation of Priv.   │ Scopes JWT/PASETO acotados a menor privilegio│
└──────────────────────────┴─────────────────────────────────────────────┘
```

### 8.1. S - Spoofing (Suplantación de Identidad)
- **Vulnerabilidad evaluada:** Un atacante intercepta o adivina un magic link e intenta firmar haciéndose pasar por el cliente receptor.
- **Defensa Técnica:**
  - Los magic links poseen 256 bits de entropía generados con CSPRNG.
  - Al abrirse, se evalúa la huella de red del cliente (IP, ASN y User-Agent). Si se detecta un salto de país o red de hosting/VPN no habitual frente al entorno de creación, el sistema exige un **Desafío OTP secundario** de 6 dígitos enviado al correo o WhatsApp validado del receptor antes de habilitar la firma.
  - Para firmantes vía e.firma SAT, la identidad queda ligada de forma irrefutable al RFC/CURP validado contra la Autoridad Certificadora del SAT.

### 8.2. T - Tampering (Manipulación de Datos o Cláusulas)
- **Vulnerabilidad evaluada:** Un actor malicioso altera una cifra de pago o modifica una cláusula de propiedad intelectual en el trayecto de red o directamente en la base de datos.
- **Defensa Técnica:**
  - El documento congelado para revisión o firma genera un hash canónico `SHA-256` que se almacena en el estado del backend.
  - Al momento de la firma, el backend recalcula el hash del contenido actual y verifica que coincida exactamente con el hash firmado. Si difiere por un solo espacio en blanco o carácter, la transacción se aborta con error de violación de integridad.
  - La bitácora de auditoría utiliza **encadenamiento criptográfico (hash chaining)**: alterar un registro previo rompería la validez de toda la cadena subsiguiente.

### 8.3. R - Repudiation (Repudio Contractual)
- **Vulnerabilidad evaluada:** Un contratante afirma judicialmente: *"Yo nunca firmé ese contrato, ni autoricé esa penalización"*.
- **Defensa Técnica:**
  - **Doble blindaje probatorio:**
    1. **Constancia NOM-151-SCFI-2016** emitida por un PSC acreditado ante la Secretaría de Economía. Bajo el Código de Comercio (Art. 89 a 95), la constancia otorga presunción legal de que el mensaje de datos ha permanecido íntegro e inalterado desde la fecha del sello de tiempo (inversión de la carga de la prueba en beneficio de quien presenta la constancia).
    2. **Evidencia Biométrica Dinámica:** Para firma autógrafa digital, el registro contiene el vector de trazo temporal (`x, y, time, pressure`), dirección IP certificada, sello de tiempo de apertura y aceptación expresa de términos conforme al Art. 89 bis del Código de Comercio.

### 8.4. I - Information Disclosure (Fuga de Información Confidencial)
- **Vulnerabilidad evaluada:** Exposición de contratos en tránsito, indexación accidental en motores de búsqueda como Google, o fuga por dump de base de datos.
- **Defensa Técnica:**
  - **En Tránsito:** Forzado de protocolo **TLS 1.3** con suites criptográficas robustas (ECDHE-RSA-AES128-GCM-SHA256) y encabezado **HSTS** (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`).
  - **En Reposo:** Encriptación de volúmenes de base de datos con **AES-256** (vía LUKS o EBS encrypted), y columnas sensibles (ej. datos fiscales o identificadores personales) respaldadas con cifrado a nivel de aplicación mediante Envelope Encryption (AWS KMS / Vault).
  - **Anti-Crawling:** Encabezados HTTP `X-Robots-Tag: noindex, nofollow, noarchive` en todas las rutas de contratos, y `Referrer-Policy: no-referrer` para impedir que el token se filtre a servicios analíticos.

### 8.5. D - Denial of Service (Denegación de Servicio - DoS)
- **Vulnerabilidad evaluada:** Ataques automatizados contra endpoints de generación de PDF o peticiones de firma masivas destinadas a saturar memoria y CPU.
- **Defensa Técnica:**
  - **Rate Limiting Distribuido (Redis):** Algoritmo *Token Bucket* configurado en API Gateway:
    - Endpoints de autenticación / Magic Link: Máximo 5 peticiones erróneas por IP / 15 minutos.
    - Endpoints de renderizado de PDF: Máximo 3 peticiones por minuto por contrato.
  - **Límites de Payload:** Restricción estricta de tamaño en peticiones entrantes (`body-parser: 2 MB max`).
  - **Colas Asíncronas Desacopladas:** La compilación de PDFs y la comunicación con la API del PSC se gestionan a través de colas en segundo plano con aislamiento de memoria (BullMQ / Redis), impidiendo que picos de tráfico afecten la navegación web.

### 8.6. E - Elevation of Privilege (Escalamiento de Privilegios)
- **Vulnerabilidad evaluada:** Un cliente que accede mediante enlace mágico intenta editar parámetros del freelancer, ver contratos de terceros o acceder a rutas de administración.
- **Defensa Técnica:**
  - **Principio de Menor Privilegio (PoLP):** Los tokens emitidos para clientes receptores están acotados mediante claims estrictos de alcance (*scopes*):
    ```json
    {
      "sub": "client_guest_anon",
      "contract_id": "ctr_98765",
      "scope": ["contract:read", "contract:suggest_adjustment", "contract:sign"],
      "exp": 1730246400
    }
    ```
  - Un middleware en el backend valida en cada petición que el token contenga el permiso explícito y que el `contract_id` coincida con el recurso solicitado. Es matemáticamente imposible realizar mutaciones sobre contratos no autorizados.

---

## 9. ARQUITECTURA DEL DASHBOARD (BÓVEDA), EXPIRACIÓN Y CLONACIÓN ATÓMICA

### 9.1. Patrón Soft-Delete para Preservación de Integridad Referencial
En sistemas jurídicos y de contratación, la eliminación física (`DELETE FROM contracts`) está terminantemente prohibida, ya que destruye la trazabilidad histórica, rompe la integridad referencial de las tablas de auditoría (`audit_events`) y viola exigencias normativas de conservación documental.
- **Mecanismo:** Columna `deleted_at TIMESTAMPTZ NULL`.
- Cuando un usuario "descarta" o "elimina" un borrador, se ejecuta:
  ```sql
  UPDATE contracts SET deleted_at = NOW() WHERE id = $1 AND user_id = $2;
  ```
- **Índice Parcial para Desempeño Óptimo:**
  ```sql
  -- Garantiza que las consultas de la bóveda ignoren registros eliminados en 0 ms
  CREATE INDEX idx_contracts_active_vault ON contracts(user_id, status) 
  WHERE deleted_at IS NULL;
  ```

### 9.2. Vigencia Contractual y Monitoreo Automático de Vencimientos
- **Campo `valid_until TIMESTAMPTZ`:** Registra la fecha de conclusión o vencimiento de la relación jurídica pactada (ej. vigencia de 6 meses o 1 año).
- **Worker de Monitoreo de Vigencias (Cron Scheduler / BullMQ):**
  - Un proceso batch diario ejecuta:
    ```sql
    SELECT id, contract_code, user_id, structured_payload->'parties'->'client'->>'email' AS client_email, valid_until
    FROM contracts
    WHERE status = 'Completed_NOM151'
      AND deleted_at IS NULL
      AND valid_until BETWEEN NOW() AND NOW() + INTERVAL '15 days';
    ```
  - Dispara eventos de notificación proactiva vía correo o WhatsApp:
    - *"Tu contrato PACT-8X9K2 con Empresa X vence en 15 días: ¿Deseas renovar o extender los entregables?"*
  - Convierte a la plataforma en una herramienta recurrente de retención (LTV) y cobranza para el profesional independiente.

### 9.3. Transacción Atómica de "Clone & Renew" ($O(1)$)
Cuando un creador desea renovar un servicio con un cliente recurrente o usar un contrato anterior como plantilla base, el backend ejecuta una transacción atómica que duplica el contenido estructural sin heredar firmas, hashes antiguos ni estados previos:

```typescript
// Implementación conceptual de la transacción atómica de duplicación
async function cloneAndRenewContract(originalContractId: string, userId: string): Promise<Contract> {
  return await db.transaction(async (tx) => {
    // 1. Obtener contrato original activo
    const original = await tx.contracts.findFirstOrThrow({
      where: { id: originalContractId, userId, deletedAt: null }
    });

    // 2. Generar nuevo identificador único humano y técnico
    const newContractCode = await generateUniqueNanoId(tx); // ej. 'PACT-9Y2M1'
    const newContractId = crypto.randomUUID();

    // 3. Sanitizar y clonar payload estructurado
    const clonedPayload = structuredClone(original.structuredPayload);
    clonedPayload.metadata.contractCode = newContractCode;
    clonedPayload.metadata.createdAt = new Date().toISOString();
    // Limpiar firmas previas y fechas vencidas
    delete clonedPayload.signatures;
    delete clonedPayload.nom151Certificate;

    // 4. Regenerar texto plano canónico para indexación inmediata
    const plainText = compileCanonicalMarkdown(clonedPayload);

    // 5. Insertar nuevo contrato en estado Draft
    const newContract = await tx.contracts.create({
      data: {
        id: newContractId,
        contractCode: newContractCode,
        userId: userId,
        status: 'Draft',
        versionMajor: 1,
        versionMinor: 0,
        structuredPayload: clonedPayload,
        plainTextContent: plainText,
        parentContractId: original.id, // Vínculo histórico opcional
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // 6. Registrar evento inicial en el Audit Trail
    await recordAuditEvent(tx, {
      contractId: newContractId,
      action: 'CONTRACT_CLONED_FROM_PARENT',
      actor: { userId, role: 'CREATOR' },
      metadata: { parentContractCode: original.contractCode }
    });

    return newContract;
  });
}
```
- **Rendimiento:** Ejecución en base de datos en **< 15 ms**.
- **Resultado UX:** El profesional cuenta instantáneamente con un contrato completamente redactado, listo para ajustar montos o fechas y enviar a revisión en menos de 30 segundos.

---

## 10. MATRIZ DE CONSENSO: FRICCIONES TÉCNICAS VS. DESEOS DE UX/UI

| Fricción Detectada | Suposición de Diseño (UX) | Riesgo Técnico / Legal / Seguridad | Solución de Consenso Aprobada |
| :--- | :--- | :--- | :--- |
| **1. Edición del Contrato** | Edición libre colaborativa en tiempo real tipo Google Docs para ambas partes. | *Race conditions*, sobrecosto de CRDTs, y riesgo legal de adulteración furtiva de cláusulas ("cláusulas trampa"). | **Redlining Modular Asíncrono:** El cliente propone ajustes puntuales por cláusula (`clause_id`). El creador aprueba o rechaza mediante Diff visual (v1.0 vs v1.1). |
| **2. Firma en Dispositivos Móviles** | Modal flotante emergente pequeño sobre el documento en smartphones. | El scroll vertical de página compite con el canvas táctil; área insuficiente para firma legible en pantallas de 375px. | **Full-Screen Signature Sheet (100dvh):** Pantalla completa dedicada con scroll bloqueado, canvas expandido, botón "Limpiar trazo" y aceptación legal obligatoria previa. |
| **3. Acceso sin Registro Previo** | El cliente nunca crea cuenta ni contraseña bajo ninguna circunstancia. | Si el enlace expira en 72 horas por seguridad, el cliente pierde el acceso a su contrato firmado meses después. | **Lazy Registration Progresivo:** Firma inmediata sin login. En la confirmación se ofrece descarga del PDF + botón *"Crear mi bóveda en 1 clic"*. Si el link vence, un botón *"Reenviar acceso a mi correo"* renueva el token. |
| **4. e.firma SAT en Móviles** | Permitir carga de archivos `.cer` y `.key` indistintamente en smartphones y desktop. | En iOS/Android, ubicar y manipular archivos `.key` en el gestor de archivos genera fricción severa en usuarios no técnicos. | **Enfoque Adaptativo:** En móvil, la opción primaria y por defecto es **Trazo Táctil Biométrico + OTP** (100% legal con NOM-151). Si requiere e.firma SAT, se sugiere *"Continuar en computadora"* enviando enlace al correo. |
| **5. Descarga de PDF en Cualquier Momento** | Botón para descargar el PDF canónico compilado en cada segundo de la edición. | Renderizar PDFs sobre estados incompletos satura los workers y almacena binarios inconsistentes. | **Borrador HTML inmediato vs. PDF Oficial Sellado:** La descarga rápida de borrador utiliza `window.print()` con estilos `@media print` locales sin costo de servidor. El PDF oficial sellado con hash inmutable se compila únicamente en hitos formales. |

---

## 11. ROADMAP DE IMPLEMENTACIÓN TÉCNICA POR SPRINTS

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ROADMAP DE IMPLEMENTACIÓN TÉCNICA                    │
├───────────┬────────────────────────────────────────────────────────────┤
│ Sprint 1  │ • Esquema JSON canónico unificado (Zod / TypeScript).      │
│ Fundamentos│ • Live Preview Split-Pane en React con Tailwind CSS.      │
│ & Preview │ • Paginación predictiva CSS Paged Media (break-avoid).     │
│           │ • Persistencia dual (JSONB + plain_text_content).          │
├───────────┼────────────────────────────────────────────────────────────┤
│ Sprint 2  │ • Búsquedas FTS con índice GIN y NanoID único (O(1)).      │
│ FSM &     │ • Máquina de estados finita con redlining modular v1.0-v1.1│
│ Magic Links│ • Magic links con Anti-Bot Landing y sesión efímera.      │
│           │ • Audit trail inmutable con encadenamiento de hashes.      │
├───────────┼────────────────────────────────────────────────────────────┤
│ Sprint 3  │ • Canvas vectorial con captura biométrica de trazos (SVG). │
│ Firmas &  │ • Web Worker para e.firma SAT client-side (cero conocim.). │
│ NOM-151   │ • Integración con API de PSC (Mifiel) para sellos NOM-151. │
│           │ • Full-screen mobile signature sheet.                      │
├───────────┼────────────────────────────────────────────────────────────┤
│ Sprint 4  │ • Bóveda de contratos con Soft-Delete y filtros rápidos.   │
│ Bóveda &  │ • Transacción atómica de Clonación y Renovación rápida.    │
│ Hardening │ • Pen-testing, validación STRIDE y hardening de seguridad. │
└───────────┴────────────────────────────────────────────────────────────┘
```

---
*Fin del Dictamen de Viabilidad Técnica v2.0.*

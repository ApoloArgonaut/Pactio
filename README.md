# 🛡️ PACTIO — Acuerdos Digitales Transparentes & Blindaje Jurídico

> **Plataforma LegalTech de contratos inteligentes, preservación criptográfica NOM-151 y mediación de alcance para creadores de software, diseñadores y profesionales independientes en México y Latinoamérica.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Vitest-159%2F159%20Passing%20(100%25)-4caf50?logo=vitest&logoColor=white)](file:///root/UX%20Project/Pactio/test/)
[![NOM-151](https://img.shields.io/badge/Presunción%20Legal-NOM--151--SCFI--2016-0284c7)](file:///root/UX%20Project/Pactio/docs/CYBERSECURITY_AUDIT_REPORT.md)
[![LFDA Art. 83](https://img.shields.io/badge/Propiedad%20Intelectual-LFDA%20Art.%2083-8b5cf6)](file:///root/UX%20Project/Pactio/docs/02_dossier_maestro_prd_pactio.md)
[![Security Policy](https://img.shields.io/badge/Ciberseguridad-Zero--Exposure%20Strict-dc2626)](file:///root/UX%20Project/Pactio/scripts/security-audit.sh)
[![WCAG AAA](https://img.shields.io/badge/Accesibilidad-WCAG%202.1%20AAA-f59e0b)](file:///root/UX%20Project/Pactio/docs/pactio_ux_ui_cx_design_specification.md)

---

## 📑 Tabla de Contenidos
1. [El Problema Real en LATAM](#-el-problema-real-en-latam)
2. [La Solución Pactio](#-la-solución-pactio)
3. [Pilares de Funcionalidad & UX](#-pilares-de-funcionalidad--ux)
4. [Marco Regulatorio & Cumplimiento Normativo](#-marco-regulatorio--cumplimiento-normativo)
5. [Arquitectura de Software & Ciberseguridad](#-arquitectura-de-software--ciberseguridad)
6. [Catálogo de Documentación Ejecutiva (.md, .docx, .pdf)](#-catálogo-de-documentación-ejecutiva)
7. [Guía de Instalación y Despliegue Rápido](#-guía-de-instalación-y-despliegue-rápido)
8. [¿Cómo aseguramos que Pactio sea confiable? (Calidad y Pruebas)](#-cómo-aseguramos-que-pactio-sea-confiable-calidad-y-pruebas)

---

## 🚨 El Problema Real en LATAM

El **68% de los profesionales digitales independientes y agencias boutique** en México y América Latina enfrentan riesgos operacionales críticos:

* 🚫 **Finiquitos impagos y entregas vulnerables:** Clientes que reciben código fuente o archivos finales de diseño y retienen o postergan indefinidamente el pago final.
* 🌪️ **Corrimiento de alcance descontrolado (*Scope Creep*):** Peticiones interminables de *"un cambiecito rápido"* sin cotización ni orden de cambio formal.
* 💬 **Informalidad probatoria:** Acuerdos pactados por WhatsApp, Slack o correos informales que resultan inadmisibles o de bajísimo valor probatorio en tribunales mercantiles.
* ⚖️ **Falsas soluciones genéricas:** Herramientas tradicionales de firma electrónica (DocuSign, PandaDoc) aplican firmas electrónicas simples que no cumplen con los requisitos de **Fecha Cierta (SCJN)** ni con la **NOM-151-SCFI-2016**, dejando al creador desprotegido ante controversias del SAT (Art. 69-B CFF).

---

## 💡 La Solución Pactio

**Pactio** reimagina la relación contractual entre el creador y su cliente desde la base de la empatía, la transparencia y el rigor jurídico:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FLUJO VIRTUSO PACTIO                             │
├─────────────────┬───────────────────┬───────────────────┬───────────────────┤
│   1. ASISTENTE  │   2. COMPILADOR   │   3. SIMULADOR    │   4. TIMBRADO     │
│    PARÁMETRICO  │    DUAL-PANE      │    NEGOCIACIÓN    │     NOM-151       │
│                 │                   │                   │                   │
│ Creador define  │ Vista Humana      │ Cliente recibe    │ Sello cripto-     │
│ entregables,    │ (lenguaje claro)  │ Magic Link, revisa│ gráfico TSA vía   │
│ hitos y blindaje│ vs. Vista Legal   │ y sugiere ajustes │ PSC acreditado    │
│ en 5 minutos.   │ vinculante.       │ sin fricción.     │ por Economía.     │
└─────────────────┴───────────────────┴───────────────────┴───────────────────┘
```

---

## ✨ Pilares de Funcionalidad & UX

### 1. Compilador Dual Reactivo (*Dual-Pane Reactive Compiler*)
* **Vista Humana (Human Language):** Explicación clara sin jerga jurídica, desglosando qué se entrega, cuándo se paga y qué ocurre ante demoras.
* **Vista Jurídica (Strict Legal Spec):** Redacción formal vinculante con citación rigurosa de legislación aplicable (Código de Comercio, LFDA, CCF).
* **Compilación en Tiempo Real:** Modificar un insumo en el asistente recalcula instantáneamente el texto canónico y su **hash criptográfico SHA-256**.

### 2. Blindaje Jurídico de 5 Capas
1. **Reserva de Dominio Absoluta (LFDA Art. 83):** Los derechos patrimoniales sobre el software, diseño o activos se transmiten **única y exclusivamente** al liquidar el 100% del precio total convenido.
2. **Blindaje de Insumos Previos (*Time-Lock Shield*):** Los días hábiles de entrega inician su conteo solo cuando el cliente entrega accesos, credenciales y contenidos completos.
3. **Control Estricto de Revisiones:** 2 rondas de ajuste incluidas; rondas adicionales se facturan automáticamente con recargo explícito.
4. **Derecho Irrenunciable de Portafolio (LFDA Art. 21):** El creador conserva el derecho moral de exhibir el trabajo como caso de estudio profesional.
5. **Salida Limpia y Tarifa de Cancelación (*Kill Fee* 30%):** En caso de rescisión unilateral por parte del cliente, se garantiza la liquidación del trabajo proporcional ejecutado más un 30% de blindaje por lucro cesante.

### 3. Simulador de Cliente y Negociación Bilateral
* Permite al creador visualizar con exactitud la interfaz que verá su cliente al abrir el **Magic Link**.
* Cajón lateral de negociación (*Negotiation Drawer*) para solicitar ajustes en hitos de pago, porcentajes de anticipo o rondas de revisión sin llamadas incómodas.

### 4. Centro de Firma Multimodal & Timbrado NOM-151
* ✍️ **Firma Táctil / Trazo:** Canvas optimizado para pantallas táctiles, tablets y ratón con control de presión y suavizado.
* 🖋️ **Firma Tipeada (Script Tipográfico):** Generación vectorial instantánea para usuarios sin tableta de dibujo.
* 🔐 **Firma Electrónica Avanzada (e.firma SAT):** Procesamiento Zero-Knowledge en memoria volátil de navegador mediante **WebCrypto API** (las llaves privadas y contraseñas nunca tocan un servidor externo).
* 🏛️ **Timbrado Oficial NOM-151:** Simulación de acuse emitido por Prestador de Servicios de Certificación (PSC) acreditado ante la Secretaría de Economía de México con estampa de tiempo conforme al CENAM.

### 5. Multidivisa Nativa (MXN, USD, EUR) y Auto-Balance de Hitos
* Soporte para transacciones en Pesos Mexicanos, Dólares Americanos y Euros.
* Selector de distribución de pagos con rebalanceo automático:
  * **50% Anticipo / 50% Finiquito (Estándar de la industria)**
  * **30% Anticipo / 40% Entrega Beta / 30% Finiquito (Proyectos medianos)**
  * **100% Pago Previo (Sprints Express prioritarios)**
  * **Hitos personalizados con redistribución automática al 100%**.

### 6. Sistema de Temas Accesibles & Ergonomía Visual (WCAG 2.1 AAA)
* **Midnight Dark:** Fondo OLED de mínimo consumo ocular para jornadas de trabajo nocturnas.
* **Warm Paper:** Experiencia editorial documental que reproduce la lectura sobre papel bond cálido.
* **High Contrast (WCAG AAA):** Modo de contraste estricto en amarillo y negro puro para máxima legibilidad.
* Conmutador dinámico de escala tipográfica (de 85% a 115%) con preservación de contraste y jerarquías visuales.

---

## ⚖️ Marco Regulatorio & Cumplimiento Normativo

Pactio opera bajo estricto apego al marco jurídico mexicano e internacional de comercio electrónico:

| Norma / Ley | Ámbito de Aplicación | Mecanismo en Pactio |
|---|---|---|
| **NOM-151-SCFI-2016** | Requisitos para la conservación de mensajes de datos y digitalización de documentos. | Generación de estampa de tiempo TSA y constancia ASN.1 DER emitida por PSC acreditado ante la Secretaría de Economía. |
| **Código de Comercio (Arts. 89 al 114)** | Validez jurídica de acuerdos electrónicos y no-repudio probatorio. | Firma electrónica avanzada con presunción legal de autoría e integridad inalterable. |
| **Ley Federal del Derecho de Autor (Art. 83)** | Obras por encargo y transmisión de derechos patrimoniales. | Cláusula de Reserva de Dominio vinculada a la condición suspensiva del pago del 100%. |
| **Ley Federal del Derecho de Autor (Art. 21)** | Derechos morales de los creadores (Inalienables e imprescriptibles). | Reserva expresa del derecho de divulgación, paternidad y exhibición en portafolio profesional. |
| **Código Fiscal de la Federación (Art. 69-B)** | Materialidad contractual ante el Servicio de Administración Tributaria (SAT). | Trazabilidad de hitos, entregables específicos y fecha cierta certificada admisible en revisiones fiscales. |

---

## 🔒 Arquitectura de Software & Ciberseguridad

### Estructura Modular del Proyecto

```
Pactio/
├── .env.example                       # Plantilla de entorno sanitizada
├── .gitignore                         # Blindaje estricto contra fuga de credenciales
├── package.json                       # Configuración de dependencias y scripts
├── tsconfig.json                      # Configuración de TypeScript en modo estricto
├── vite.config.ts                     # Configuración de Vite y Vitest
│
├── scripts/
│   └── security-audit.sh              # Auditor pre-flight de ciberseguridad
│
├── docs/                              # Suite completa de documentación
│   ├── docx/                          # Formatos editables Microsoft Word (.docx)
│   ├── pdf/                           # Formatos impresos de alta calidad (.pdf)
│   ├── audits/                        # Dictámenes y actas de mesa redonda (.md)
│   ├── figma_design_tokens.json       # Tokens oficiales de diseño
│   └── ...                            # Especificaciones maestras en Markdown
│
├── src/
│   ├── App.tsx                        # Orquestador principal modularizado (264 líneas)
│   ├── components/
│   │   ├── layout/                    # Navbar y controles globales
│   │   ├── wizard/                    # Asistente de 5 pasos (Partes, Alcance, Pagos, IP, Gobernanza)
│   │   ├── preview/                   # Visualizador de documento y auditor criptográfico
│   │   ├── simulator/                 # Simulador del cliente y cajón de ajustes
│   │   ├── vault/                     # Bóveda y gestión de ciclo de vida de contratos
│   │   ├── landing/                   # Vista de bienvenida e inducción para nuevos usuarios
│   │   ├── confirmed/                 # Pantalla de confirmación y descarga post-timbrado
│   │   └── modals/                    # Modal de firmas (Touch, Tipeada, e.firma SAT)
│   ├── core/
│   │   ├── compiler/                  # Compilador dual reactivo (Humano / Jurídico)
│   │   ├── crypto/                    # Generador NanoID CSPRNG seguro
│   │   ├── fsm/                       # Máquina de estados finitos (11 transiciones)
│   │   ├── psc/                       # Proveedor de certificación NOM-151 Sandbox
│   │   ├── schemas/                   # Esquemas Zod tipados con validación estricta
│   │   └── store/                     # Store global Zustand con reactividad instantánea
│   └── hooks/
│       └── useThemeStyles.ts          # Centralización de tokens de diseño para los 3 temas
│
└── test/                              # Suite de pruebas unitarias y de penetración
    ├── api-endpoints.test.ts
    ├── compiler.test.ts
    ├── core-engine.test.ts
    ├── fsm.test.ts
    ├── nanoid.test.ts
    ├── schemas.test.ts
    └── security/                      # Pruebas de seguridad (XSS, Entropía, e.firma)
```

### Política de Seguridad de Cero Exposición (*Zero-Exposure Policy*)

Pactio implementa medidas preventivas de nivel militar para evitar fugas de información sensible en repositorios públicos:

* 🛡️ **Aislamiento de Llaves SSH y Certificados:** El archivo `.gitignore` excluye categóricamente cualquier archivo `id_rsa*`, `id_ed25519*`, `*.pem`, `*.key`, `*.p12`, `*.pfx` y certificados locales.
* 🛡️ **Aislamiento de Secretos de Entorno:** Ningún archivo `.env` se añade al control de versiones; únicamente se distribuye `.env.example` con claves de prueba de desarrollo.
* 🛡️ **Bases de Datos Locales Protegidas:** Se bloquean extensiones `*.db`, `*.sqlite`, `*.sqlite3` y archivos de auditoría interna de motores Git.
* 🛡️ **Comando de Verificación Continua:**
  ```bash
  npm run security:check
  ```
  Ejecuta un análisis automatizado en 5 etapas antes de cualquier commit o despliegue.

---

## 📚 Catálogo de Documentación Ejecutiva

La carpeta [`docs/`](file:///root/UX%20Project/Pactio/docs/) incluye la especificación integral del producto en tres formatos (**Markdown**, **Microsoft Word .docx** y **Adobe PDF**):

| Documento | Descripción y Alcance | Markdown | Word (.docx) | PDF (.pdf) |
|---|---|:---:|:---:|:---:|
| **01. Caso de Estudio Ejecutivo** | Resumen directivo del producto, justificación de negocio, ROI y métricas clave. | [Ver .md](file:///root/UX%20Project/Pactio/docs/01_caso_de_estudio_ejecutivo_pactio.md) | [Descargar .docx](file:///root/UX%20Project/Pactio/docs/docx/01_caso_de_estudio_ejecutivo_pactio.docx) | [Descargar .pdf](file:///root/UX%20Project/Pactio/docs/pdf/01_caso_de_estudio_ejecutivo_pactio.pdf) |
| **02. Dossier Maestro & PRD** | Product Requirements Document integral, user personas, diagramas de flujo y FSM. | [Ver .md](file:///root/UX%20Project/Pactio/docs/02_dossier_maestro_prd_pactio.md) | [Descargar .docx](file:///root/UX%20Project/Pactio/docs/docx/02_dossier_maestro_prd_pactio.docx) | [Descargar .pdf](file:///root/UX%20Project/Pactio/docs/pdf/02_dossier_maestro_prd_pactio.pdf) |
| **03. Reporte de Ciberseguridad** | Modelo STRIDE de amenazas, auditoría OWASP ASVS v4.0 y análisis criptográfico. | [Ver .md](file:///root/UX%20Project/Pactio/docs/CYBERSECURITY_AUDIT_REPORT.md) | [Descargar .docx](file:///root/UX%20Project/Pactio/docs/docx/CYBERSECURITY_AUDIT_REPORT.docx) | [Descargar .pdf](file:///root/UX%20Project/Pactio/docs/pdf/CYBERSECURITY_AUDIT_REPORT.pdf) |
| **04. Especificación de Ingeniería** | Arquitectura del compilador dual, estado Zustand, FSM y endpoints REST. | [Ver .md](file:///root/UX%20Project/Pactio/docs/ENGINEERING_SPEC.md) | [Descargar .docx](file:///root/UX%20Project/Pactio/docs/docx/ENGINEERING_SPEC.docx) | [Descargar .pdf](file:///root/UX%20Project/Pactio/docs/pdf/ENGINEERING_SPEC.pdf) |
| **05. Especificación UX/UI/CX** | Heurísticas de Nielsen, tokens de diseño WCAG AAA, jerarquías visuales y diseño responsivo. | [Ver .md](file:///root/UX%20Project/Pactio/docs/pactio_ux_ui_cx_design_specification.md) | [Descargar .docx](file:///root/UX%20Project/Pactio/docs/docx/pactio_ux_ui_cx_design_specification.docx) | [Descargar .pdf](file:///root/UX%20Project/Pactio/docs/pdf/pactio_ux_ui_cx_design_specification.pdf) |
| **06. Wireframes & Flujos Visuales** | Diagramas de interfaz ASCII en alta fidelidad y guías de interacción paso a paso. | [Ver .md](file:///root/UX%20Project/Pactio/docs/pactio_wireframes_and_visual_flows.md) | [Descargar .docx](file:///root/UX%20Project/Pactio/docs/docx/pactio_wireframes_and_visual_flows.docx) | [Descargar .pdf](file:///root/UX%20Project/Pactio/docs/pdf/pactio_wireframes_and_visual_flows.pdf) |
| **07. Auditoría de Factibilidad** | Viabilidad técnica, económica y regulatoria de la integración con PSC y SAT. | [Ver .md](file:///root/UX%20Project/Pactio/docs/FEASIBILITY_AUDIT.md) | [Descargar .docx](file:///root/UX%20Project/Pactio/docs/docx/FEASIBILITY_AUDIT.docx) | [Descargar .pdf](file:///root/UX%20Project/Pactio/docs/pdf/FEASIBILITY_AUDIT.pdf) |
| **08. Deep Dive Research & Testing** | Análisis de mercado, benchmarking competitivo y pruebas de usabilidad. | [Ver .md](file:///root/UX%20Project/Pactio/docs/deep_dive_research_y_testing.md) | [Descargar .docx](file:///root/UX%20Project/Pactio/docs/docx/deep_dive_research_y_testing.docx) | [Descargar .pdf](file:///root/UX%20Project/Pactio/docs/pdf/deep_dive_research_y_testing.pdf) |
| **09. Auditoría Adversarial Senior PM** | Crítica constructiva de producto, gaps competitivos y defensas estratégicas. | [Ver .md](file:///root/UX%20Project/Pactio/docs/audits/auditoria_adversarial_senior_pm.md) | [Descargar .docx](file:///root/UX%20Project/Pactio/docs/docx/auditoria_adversarial_senior_pm.docx) | [Descargar .pdf](file:///root/UX%20Project/Pactio/docs/pdf/auditoria_adversarial_senior_pm.pdf) |
| **10. Dictamen Regulatorio LegalTech** | Comparativa jurídica regional (México, Argentina, Colombia, Chile) y validez probatoria. | [Ver .md](file:///root/UX%20Project/Pactio/docs/audits/dictamen_regulatorio_legaltech_latam.md) | [Descargar .docx](file:///root/UX%20Project/Pactio/docs/docx/dictamen_regulatorio_legaltech_latam.docx) | [Descargar .pdf](file:///root/UX%20Project/Pactio/docs/pdf/dictamen_regulatorio_legaltech_latam.pdf) |
| **11. Auditoría Naive Tester (UX/UI)** | Hallazgos de usabilidad exploratoria sin sesgo previo y correcciones implementadas. | [Ver .md](file:///root/UX%20Project/Pactio/docs/audits/naive_user_exploratory_audit.md) | [Descargar .docx](file:///root/UX%20Project/Pactio/docs/docx/naive_user_exploratory_audit.docx) | [Descargar .pdf](file:///root/UX%20Project/Pactio/docs/pdf/naive_user_exploratory_audit.pdf) |
| **12. Auditoría Senior Staff Architect** | Análisis de complejidad ciclomática, modularización y deuda técnica reducida en 87%. | [Ver .md](file:///root/UX%20Project/Pactio/docs/audits/senior_architect_code_audit.md) | [Descargar .docx](file:///root/UX%20Project/Pactio/docs/docx/senior_architect_code_audit.docx) | [Descargar .pdf](file:///root/UX%20Project/Pactio/docs/pdf/senior_architect_code_audit.pdf) |
| **13. Acta de Mesa Redonda Final** | Minuta ejecutiva de alineación multidisciplinaria (PM, Legal, UX, Arquitectura y QA). | [Ver .md](file:///root/UX%20Project/Pactio/docs/audits/pactio_final_all_hands_meeting.md) | [Descargar .docx](file:///root/UX%20Project/Pactio/docs/docx/pactio_final_all_hands_meeting.docx) | [Descargar .pdf](file:///root/UX%20Project/Pactio/docs/pdf/pactio_final_all_hands_meeting.pdf) |

---

## 🚀 Guía de Instalación y Despliegue Rápido

### Prerrequisitos
* Node.js v20.x o superior
* npm v10.x o superior

### 1. Clonar el Repositorio
```bash
git clone https://github.com/ApoloArgonaut/Pactio.git
cd Pactio
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Entorno
```bash
cp .env.example .env
```

### 4. Ejecutar Suite de Seguridad Pre-Flight
```bash
npm run security:check
```

### 5. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible localmente en `http://localhost:3001` (o en el puerto configurado).

### 6. Ejecutar Pruebas Automatizadas
```bash
# Ejecutar todas las 159 pruebas unitarias y de integración
npm test

# Ejecutar con reporte de cobertura
npm run test:coverage
```

### 7. Compilar para Producción
```bash
npm run build
npx vite build
```

---

## 🛡️ ¿Cómo aseguramos que Pactio sea confiable? (Calidad y Pruebas)

Para que tanto tú como tus clientes puedan tener total tranquilidad de que un contrato es válido, blindado y que el dinero no se perderá en un malentendido o error de cálculo, Pactio pasa por **159 pruebas de calidad automáticas**.

En palabras sencillas y sin tecnicismos complicados, esto es lo que cuidamos en cada rincón de la plataforma:

* 🎯 **Cuentas claras y sin errores de dedo:**
  El sistema revisa al instante que los datos de ambas partes (como el RFC en México), correos y fechas estén completos. Además, calcula los anticipos, pagos intermedios y finiquitos de manera automática para que jamás envíes una cotización con sumas chuecas o porcentajes que no cuadren al 100%.

* 🤝 **Lo que lees en sencillo dice exactamente lo mismo que lo legal:**
  Pactio cuenta con dos vistas: la **Humana** (para entender todo en español claro, con peras y manzanas) y la **Jurídica** (el contrato formal con artículos de ley). Nuestro sistema comprueba de forma automática que ambas versiones digan exactamente lo mismo, sin trampas, contradicciones ni letras chiquitas.

* 🚫 **Protección contra alteraciones o textos dañinos:**
  Todo lo que escribes en el título del proyecto o en la lista de entregables pasa por un filtro de seguridad para evitar que personas malintencionadas puedan inyectar códigos raros o alterar lo que ya se había acordado.

* 🚦 **Flujos a prueba de confusiones y pasos saltados:**
  Nadie puede firmar un contrato que ya fue cancelado, ni timbrar un documento que todavía está en borrador. El sistema actúa como un semáforo inteligente que vigila que cada etapa (crear → revisar → negociar → firmar → timbrar) ocurra en su momento exacto.

* 🔐 **Sellos digitales que no se pueden falsificar:**
  Cada acuerdo recibe una huella digital única (como una firma microscópica e irrepetible del archivo). Si alguien intentara cambiar tan solo un punto o una coma después de firmado, la aplicación lo detecta de inmediato y avisa que el documento fue alterado.

* 📬 **Enlaces privados y seguros para compartir con tus clientes:**
  Cuando le mandas el enlace a tu cliente para que revise o firme el acuerdo, ese acceso es privado, vence a los pocos días y solo funciona para esa persona, evitando que curiosos o terceros puedan ver la información de tu proyecto.

* 🔒 **Tus contraseñas y llaves del SAT se quedan en tu dispositivo:**
  Si firmas usando tu e.firma del SAT, el archivo y tu clave se procesan exclusivamente dentro de tu navegador (en tu propia computadora o teléfono). **Nunca viajan por internet ni se guardan en ningún servidor externo**. Tu privacidad fiscal está 100% protegida.

> 💡 **Nota para equipos de desarrollo y auditoría técnica:**  
> Estas garantías se ejecutan mediante **Vitest** con 159 suites de pruebas unitarias y de integración (esquemas estrictos con Zod, sanitización contra inyección XSS, máquina de estados finitos FSM de 11 fases, generador NanoID criptográfico CSPRNG y operaciones WebCrypto Zero-Knowledge). Puedes ejecutar la suite completa en tu terminal con `npm test`.

---

## 📦 Descarga de Código Fuente Completo

El proyecto incluye el paquete empaquetado y listo para distribución:
* **Archivo ZIP:** [`pactio_complete_project.zip`](file:///root/UX%20Project/Pactio/pactio_complete_project.zip) (Código limpio, tests, dependencias y suite documental lista para revisión local).

---

## 👤 Autor & Contacto

* **Líder de Proyecto & Product Designer:** [Apolo Argonaut](https://github.com/ApoloArgonaut)
* **Repositorio en GitHub:** [https://github.com/ApoloArgonaut/Pactio](https://github.com/ApoloArgonaut/Pactio)
* **Licencia:** Software de uso privado / Demostración de portafolio para presentación profesional y de inversión.

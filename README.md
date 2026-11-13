# 🛡️ PACTIO — Smart Agreements & Legal Shield for Digital Creators

<div align="center">

> **Plataforma LegalTech de contratos inteligentes, preservación criptográfica NOM-151 y mediación de alcance para creadores de software, diseñadores y profesionales independientes en México y Latinoamérica.**
>
> *Smart legal-tech platform featuring plain-language contract compilation, NOM-151 cryptographic preservation, and scope mediation for freelancers & agencies in LATAM.*

[![React 19](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](#-despliegue-con-docker--docker-deployment)
[![Tests Passing](https://img.shields.io/badge/Tests-159%2F159%20Passing-4caf50?logo=vitest&logoColor=white)](test/)
[![Legal Shield](https://img.shields.io/badge/NOM--151%20%7C%20LFDA-Blindaje%20Legal-0284c7)](docs/)
[![WCAG AAA](https://img.shields.io/badge/Accesibilidad-WCAG%202.1%20AAA-f59e0b)](docs/)

[🇪🇸 Versión en Español](#-versión-en-español) • [🇺🇸 English Version](#-english-version) • [📚 Documentación / Docs](docs/) • [🐳 Docker](#-despliegue-con-docker--docker-deployment)

</div>

---

## 🇪🇸 Versión en Español

### 💡 ¿Qué es Pactio?
El **68% de los diseñadores, desarrolladores y creadores independientes** en LATAM sufren impagos de finiquitos, clientes que exigen cambios infinitos (*scope creep*) o disputas por acuerdos informales en WhatsApp.

**Pactio** elimina la fricción entre creador y cliente mediante contratos digitales interactivos que cualquier persona puede entender sin tecnicismos legales, pero con **validez jurídica plena ante tribunales y el SAT**.

### 🌟 Pilares Principales de la Experiencia

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. ASISTENTE   │ ──> │  2. COMPILADOR  │ ──> │  3. SIMULADOR   │ ──> │   4. TIMBRADO   │
│   PARÁMETRICO   │     │    DUAL-PANE    │     │   NEGOCIACIÓN   │     │     NOM-151     │
│ Entregables en  │     │  Vista Humana   │     │ Cliente sugiere │     │  Sello legal    │
│ 5 minutos       │     │   vs. Jurídica  │     │ cambios sin lío │     │  admisible SAT  │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **Compilador Dual (Humano / Jurídico):** Lectura en español claro ("con peras y manzanas") para el cliente y redacción jurídica vinculante para el contrato formal.
2. **Blindaje de Insumos & Reserva de Dominio (LFDA Art. 83):** Los derechos del código y diseño se transfieren **únicamente** cuando se liquida el 100% del pago. Los plazos de entrega no corren hasta que el cliente entregue todos sus insumos.
3. **Simulador de Negociación Bilateral:** Tu cliente puede solicitar ajustes en anticipos o rondas de revisión desde un enlace interactivo sin llamadas incómodas.
4. **Firma Multimodal & Timbrado Oficial:** Firma con trazo táctil, tipografía script o **e.firma SAT** (procesada 100% en tu dispositivo, sin enviar tus claves a internet).
5. **Ergonomía Visual & Accesibilidad:** 3 temas visuales (*Midnight Dark*, *Warm Paper*, *High Contrast*) con contraste WCAG 2.1 AAA.

---

### 📊 Resultados de las pruebas de usabilidad

Estudio con **8 participantes** en dos cohortes, tareas moderadas y medición estandarizada:

| Métrica | Resultado | Referencia |
|---|---|---|
| **System Usability Scale (SUS)** | **87.8 / 100** | Grado A+, percentil 96 |
| **Tasa de éxito en tareas** | **95.8%** (23 de 24) | Objetivo > 85% |
| **Tiempo medio para crear un acuerdo** | **3 min 42 s** | Objetivo < 5 min |
| **Hallazgos de auditoría implementados** | **12+ en 48 horas** | Ciclo de una semana |

**Dato de decisión:** convertir la firma en un acto de dos pasos con «Solicitar ajuste» visible redujo el abandono del flujo. Antes, cada objeción del cliente reiniciaba la conversación desde cero.

---

## 🇺🇸 English Version

### 💡 What is Pactio?
Over **68% of digital freelancers and boutique agencies in Latin America** face unpaid project balances, endless unpaid revisions (*scope creep*), or informal WhatsApp agreements with zero legal enforceability.

**Pactio** solves this by bridging human clarity and ironclad legal protection through interactive, parameter-driven contracts with **full evidentiary validity in Mexican courts and tax authorities (SAT)**.

### 🌟 Key Product Pillars
1. **Dual-Pane Real-Time Compiler:** Seamless toggle between plain human language and formal legal text.
2. **Copyright Reservation (Mexican Copyright Act Art. 83):** Intellectual property transfer is strictly conditional upon 100% payment completion. Delivery clocks only start once all client assets are delivered.
3. **Client Negotiation Simulator:** Enables clients to review milestones, request reasonable adjustments, and approve terms with zero friction.
4. **Zero-Knowledge Digital Signature & NOM-151:** Sign via touch canvas, cursive typography, or official Mexican **e.firma SAT** (computed in-browser via WebCrypto; private keys never leave your machine).
5. **WCAG 2.1 AAA Ergonomics:** Tailored themes (*Midnight Dark*, *Warm Paper*, *High Contrast*) ensuring accessible contrast and smooth reading.

---

### 📊 Usability testing results

Study with **8 participants** across two cohorts, moderated tasks, standardised scoring:

| Metric | Result | Benchmark |
|---|---|---|
| **System Usability Scale (SUS)** | **87.8 / 100** | Grade A+, 96th percentile |
| **Task success rate** | **95.8%** (23 of 24) | Target > 85% |
| **Median time to create an agreement** | **3 min 42 s** | Target < 5 min |
| **Audit findings shipped** | **12+ within 48 hours** | One-week cycle |

**Key design decision:** turning signature into a two-step act with a visible *Request changes* button cut flow abandonment. Before it, every client objection restarted the conversation from scratch.

---

## 🐳 Despliegue con Docker / Docker Deployment

Pactio incluye configuración para correr en **cualquier computadora** (Mac, Windows o Linux) con un solo comando, sin necesidad de instalar Node.js ni dependencias locales:

```bash
# 1. Clonar el repositorio / Clone repository
git clone https://github.com/ApoloArgonaut/Pactio.git
cd Pactio

# 2. Iniciar con Docker Compose / Run with Docker
docker compose up -d
```
> 🌐 Abre tu navegador en / Open in browser: **`http://localhost:3001`**

---

## 💻 Instalación Local Alternativa / Local Development

Si prefieres ejecutarlo con Node.js en tu máquina:

```bash
# Instalar dependencias / Install dependencies
npm install

# Iniciar servidor de desarrollo / Start dev server (Port 3001)
npm run dev

# Ejecutar las 159 pruebas automatizadas / Run test suite
npm test
```

---

## 📚 Documentación Ejecutiva / Complete Documentation Suite

Para conocer el análisis a fondo, especificaciones de arquitectura, diseño UX y dictámenes legales, consulta los documentos especializados en la carpeta [`docs/`](docs/):

| Documento / Asset | Descripción / Description | Markdown | Word (.docx) | PDF (.pdf) |
|---|---|:---:|:---:|:---:|
| **01. Caso de Estudio Ejecutivo** | Resumen directivo para reclutadores, ROI y portafolio. | [Ver .md](docs/01_caso_de_estudio_ejecutivo_pactio.md) | [Descargar](docs/docx/01_caso_de_estudio_ejecutivo_pactio.docx) | [Descargar](docs/pdf/01_caso_de_estudio_ejecutivo_pactio.pdf) |
| **02. Dossier Maestro & PRD** | User Personas, flujos completos y máquina de estados FSM. | [Ver .md](docs/02_dossier_maestro_prd_pactio.md) | [Descargar](docs/docx/02_dossier_maestro_prd_pactio.docx) | [Descargar](docs/pdf/02_dossier_maestro_prd_pactio.pdf) |
| **03. Reporte de Ciberseguridad** | Modelo STRIDE, OWASP ASVS v4.0 y criptografía Zero-Knowledge. | [Ver .md](docs/CYBERSECURITY_AUDIT_REPORT.md) | [Descargar](docs/docx/CYBERSECURITY_AUDIT_REPORT.docx) | [Descargar](docs/pdf/CYBERSECURITY_AUDIT_REPORT.pdf) |
| **04. Especificación de Ingeniería** | Arquitectura del compilador dual, estado Zustand y REST APIs. | [Ver .md](docs/ENGINEERING_SPEC.md) | [Descargar](docs/docx/ENGINEERING_SPEC.docx) | [Descargar](docs/pdf/ENGINEERING_SPEC.pdf) |
| **05. Especificación UX/UI/CX** | Heurísticas de Nielsen, tokens de diseño y contraste WCAG AAA. | [Ver .md](docs/pactio_ux_ui_cx_design_specification.md) | [Descargar](docs/docx/pactio_ux_ui_cx_design_specification.docx) | [Descargar](docs/pdf/pactio_ux_ui_cx_design_specification.pdf) |
| **06. Wireframes & Flujos Visuales** | Pantallas de interfaz, breakpoints y recorrido paso a paso. | [Ver .md](docs/pactio_wireframes_and_visual_flows.md) | [Descargar](docs/docx/pactio_wireframes_and_visual_flows.docx) | [Descargar](docs/pdf/pactio_wireframes_and_visual_flows.pdf) |
| **07. Auditoría de Factibilidad** | Viabilidad técnica y regulatoria ante PSC y el SAT. | [Ver .md](docs/FEASIBILITY_AUDIT.md) | [Descargar](docs/docx/FEASIBILITY_AUDIT.docx) | [Descargar](docs/pdf/FEASIBILITY_AUDIT.pdf) |
| **08. Deep Dive Research & Testing** | Benchmarking competitivo y pruebas de usabilidad exploratoria. | [Ver .md](docs/deep_dive_research_y_testing.md) | [Descargar](docs/docx/deep_dive_research_y_testing.docx) | [Descargar](docs/pdf/deep_dive_research_y_testing.pdf) |
| **09–13. Auditorías Especializadas** | Dictamen legal LATAM, auditoría de código y actas multidisciplinarias. | [Ver Carpeta](docs/audits/) | [Ver .docx](docs/docx/) | [Ver .pdf](docs/pdf/) |

---

## 👤 Autor & Contacto / Author & Contact

* **Diseño de producto, UX/UI y CX:** Ezra Gonzalez — [LinkedIn](https://www.linkedin.com/in/ezra-gonzalez-studio) · [GitHub](https://github.com/ApoloArgonaut)
* **Repositorio Oficial:** [https://github.com/ApoloArgonaut/Pactio](https://github.com/ApoloArgonaut/Pactio)
* **Licencia:** Software de uso privado / Portafolio profesional.

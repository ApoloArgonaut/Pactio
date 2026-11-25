# Pactio

Plataforma de acuerdos para freelancers en México y Latinoamérica. Convierte un
trato hablado por WhatsApp en un contrato que el cliente entiende y que se puede
firmar en línea.

Caso de estudio completo de producto: investigación, arquitectura de información,
prototipo funcional en React y TypeScript, y pruebas de usabilidad con 8
participantes.

## El problema

Un freelancer cierra un trabajo por mensaje. Acuerda un precio, un plazo y unas
revisiones, y ninguna de las tres cosas queda escrita de forma que se pueda
reclamar después.

Cuando el cliente pide cambios que nadie había presupuestado, el freelancer tiene
dos salidas malas: absorber el trabajo o discutir por mensaje y quedar como el
difícil. La tercera, tener un contrato claro desde el principio, casi nunca ocurre
porque redactar uno cuesta más que el trabajo mismo en proyectos pequeños.

Ese es el hueco que Pactio ataca. No la falta de plantillas de contrato, sino la
fricción de redactar uno para un proyecto de tres mil pesos.

## Qué hace

El flujo tiene cuatro pasos. El freelancer llena un cuestionario con entregables,
precio, anticipo y rondas de revisión, y la herramienta compila el acuerdo en dos
vistas simultáneas: una en español claro para el cliente y otra en lenguaje
jurídico para el documento formal.

El cliente abre un enlace, lee la versión clara, puede pedir ajustes en anticipos o
revisiones sin llamada de por medio, y firma con trazo táctil, tipografía o
e.firma del SAT.

Tres decisiones de producto que vale la pena señalar:

La transferencia de derechos del código y el diseño queda condicionada al pago
completo, apoyada en el artículo 83 de la Ley Federal de Derecho de Autor. No es
una cláusula decorativa: es la que evita que un cliente use el trabajo sin pagarlo.

Los plazos de entrega no empiezan a correr hasta que el cliente entrega todos sus
insumos. Suena obvio y es la causa más común de retrasos atribuidos al freelancer.

La e.firma se procesa en el navegador. La llave privada nunca sale del dispositivo
del usuario, ni siquiera hacia el servidor de la aplicación.

## Resultados de usabilidad

Estudio con 8 participantes en dos cohortes, tareas moderadas y medición
estandarizada.

| Métrica | Resultado | Referencia |
|---|---:|---|
| System Usability Scale | 87.8 / 100 | Grado A+, percentil 96 |
| Tasa de éxito en tareas | 95.8% (23 de 24) | Objetivo > 85% |
| Tiempo medio para crear un acuerdo | 3 min 42 s | Objetivo < 5 min |

El cambio que más movió la aguja fue convertir la firma en un acto de dos pasos, con
un botón de «Solicitar ajuste» visible. Antes, cada objeción del cliente reiniciaba
la conversación desde cero. Después, la objeción se resolvía dentro del flujo.

## Cómo está construido

React 19 y TypeScript, con Zustand para el estado, Zod para validación y Vitest
para pruebas. El compilador dual genera las dos vistas desde un mismo modelo de
acuerdo.

```
npm install && npm run dev     # http://localhost:3001
npm test                       # 159 pruebas
npm run build                  # typecheck estricto
```

O con Docker, sin instalar Node:

```bash
docker compose up -d
```

## Documentación

El repositorio incluye trece documentos: caso de estudio ejecutivo, PRD con
personas y máquina de estados, reporte de ciberseguridad con modelo STRIDE y OWASP
ASVS, especificación de ingeniería, especificación UX/UI, wireframes, auditoría de
factibilidad regulatoria y auditorías especializadas. Están en `docs/`, en Markdown
y también en `.docx` y `.pdf`.

## Limitaciones

Ocho participantes es una muestra de usabilidad, no un estudio estadístico. El SUS
de 87.8 es una señal fuerte, no un intervalo de confianza, y las dos cohortes son
pequeñas.

El SUS mide usabilidad percibida. No mide si el contrato resultante se sostiene en
un juicio, que es otra pregunta y requiere abogados, no usuarios.

El proyecto está diseñado siguiendo NOM-151-SCFI-2016 y la Ley Federal de Derecho
de Autor, pero es un prototipo de portafolio. No es un servicio legal en operación
y no sustituye la revisión de un abogado.

## Autoría

Diseño de producto, UX/UI y CX: Ezra Gonzalez.
[LinkedIn](https://www.linkedin.com/in/ezra-gonzalez-studio) · [GitHub](https://github.com/ApoloArgonaut)

Código bajo licencia MIT. Los documentos y el caso de estudio son de uso libre con
atribución.

---

### English summary

Pactio turns informal freelance agreements in Latin America into plain-language
contracts clients can actually read and sign online. Four-step flow: a parametric
questionnaire, a dual-pane compiler that produces a human version and a legal
version from the same model, a negotiation link the client can use without a phone
call, and in-browser e.firma signing where the private key never leaves the device.

Usability study with 8 participants: SUS 87.8 (96th percentile), 95.8% task success
(23/24), 3 min 42 s to create an agreement. 159 automated tests passing.

Portfolio prototype, not an operating legal service.

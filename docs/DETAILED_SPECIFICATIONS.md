# 🔬 PACTIO — Especificaciones Técnicas Detalladas y Auditoría

> **Documento de consulta técnica avanzada para ingenieros de software, auditores de ciberseguridad y asesores legales.**

---

## 1. Compilador Dual Reactivo (Arquitectura Frontend)
El compilador dual opera en memoria mediante **Zustand** y esquemas reactivos **Zod**. Cada modificación en los formularios de las 5 etapas desencadena una recompilación de dos representaciones canónicas:
* **Vista Humana:** Texto estructurado con formato visual amigable, desglose de hitos y condiciones en lenguaje llano.
* **Vista Jurídica:** Texto formal vinculante con citación rigurosa de legislación aplicable (Código de Comercio Arts. 89-114, Ley Federal del Derecho de Autor Art. 83 y 21, Código Fiscal de la Federación Art. 69-B).
* **Hash SHA-256 Canónico:** Se calcula el digest criptográfico de ambas versiones para detectar cualquier discrepancia o manipulación no autorizada.

---

## 2. Marco Jurídico y Cumplimiento Normativo

| Norma / Ley | Ámbito de Aplicación | Mecanismo en Pactio |
|---|---|---|
| **NOM-151-SCFI-2016** | Requisitos para la conservación de mensajes de datos y digitalización de documentos. | Generación de estampa de tiempo TSA y constancia ASN.1 DER emitida por PSC acreditado ante la Secretaría de Economía. |
| **Código de Comercio (Arts. 89 al 114)** | Validez jurídica de acuerdos electrónicos y no-repudio probatorio. | Firma electrónica avanzada con presunción legal de autoría e integridad inalterable. |
| **Ley Federal del Derecho de Autor (Art. 83)** | Obras por encargo y transmisión de derechos patrimoniales. | Cláusula de Reserva de Dominio vinculada a la condición suspensiva del pago del 100%. |
| **Ley Federal del Derecho de Autor (Art. 21)** | Derechos morales de los creadores (Inalienables e imprescriptibles). | Reserva expresa del derecho de divulgación, paternidad y exhibición en portafolio profesional. |
| **Código Fiscal de la Federación (Art. 69-B)** | Materialidad contractual ante el SAT. | Trazabilidad de hitos, entregables específicos y fecha cierta certificada admisible en revisiones fiscales. |

---

## 3. Modelo de Ciberseguridad y Pruebas Automatizadas

Pactio cuenta con **159 pruebas automatizadas** que validan:
1. **Esquemas Zod:** Validación estricta de RFCs mexicanos (personas físicas y morales), direcciones, montos, hitos y fechas.
2. **Sanitización XSS:** Neutralización de inyecciones maliciosas en títulos, cláusulas y campos de texto abierto.
3. **Compilador Dual:** Consistencia estricta entre la vista humana y la vista jurídica canónica.
4. **FSM (Máquina de Estados):** 11 estados y transiciones válidas e invalidación de estados no permitidos.
5. **Criptografía NanoID & SHA-256:** Uniformidad estadística de entropía y detección de manipulación de caracteres (*Tampering detection*).
6. **Tokens Magic Link HMAC-SHA256:** Resistencia contra firmas alteradas, caducidad de tokens (>72h) y revocación en cascada.
7. **e.firma SAT Zero-Knowledge:** Validación de que ninguna contraseña ni llave privada no cifrada sea expuesta o transmitida fuera de la memoria volátil del navegador.

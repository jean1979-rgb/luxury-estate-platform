# PRIVATE ESTATES MÉXICO

# CONTRATO TÉCNICO OFICIAL

## EditorialPdfDocument

Versión 1.0

---

# OBJETIVO

EditorialPdfDocument constituye el contrato único entre el Motor Editorial y el Motor PDF.

El Renderer únicamente consumirá EditorialPdfDocument.

El Renderer no consumirá directamente:

- BrokerProperty
- AdminPropertyInput
- EditorialResult

---

# FLUJO

BrokerProperty
        │
        ▼
Adapter
        │
        ▼
AdminPropertyInput
        │
        ▼
generateEditorial()
        │
        ▼
EditorialResult
        │
        ▼
EditorialPdfDocumentBuilder
        │
        ▼
EditorialPdfDocument
        │
        ▼
Renderer

---

# RESPONSABILIDADES

BrokerProperty

Persistencia.

---

AdminPropertyInput

Modelo administrativo.

---

EditorialResult

Contenido editorial.

---

EditorialPdfDocument

Documento completo listo para renderizar.

No genera contenido.

No interpreta información.

Únicamente concentra toda la información necesaria para producir el PDF.

---

Renderer

Únicamente renderiza.

No interpreta.

No transforma.

No consulta catálogos.

No construye textos.

---

# ESTRUCTURA

EditorialPdfDocument contiene:

• portada

• arquitectura

• espacios

• materiales

• amenidades

• galeria

• destino

• inversion

• cierre

Cada sección deberá contener:

Contenido editorial.

Datos técnicos.

Imágenes.

QR cuando corresponda.

Información necesaria para renderizar la página.

---

# PRINCIPIOS

Todo dato utilizado por el Renderer deberá existir previamente dentro de EditorialPdfDocument.

El Renderer no deberá consultar directamente BrokerProperty.

El Renderer no deberá consultar directamente EditorialResult.

El Renderer no deberá consultar directamente catálogos editoriales.

Todo deberá llegar previamente resuelto.

---

# CONTRATO

EditorialPdfDocument representa el único documento consumido por el Renderer.

Ninguna otra estructura forma parte del contrato del Motor PDF.


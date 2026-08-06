# PRIVATE ESTATES MÉXICO

# EDITORIAL PDF DOCUMENT

## ESQUEMA OFICIAL

Versión 1.0

---

# OBJETIVO

Definir exactamente la estructura que consumirá el Renderer.

Cada propiedad existe porque alguna página del PDF la necesita.

No existen propiedades decorativas.

No existen propiedades redundantes.

---

# PORTADA

Debe contener:

• title

• classification

• tagline

• editorialTagline

• collection

• price

• bedrooms

• bathrooms

• area

• phone

• luxuryScore

• coverImage

---

# ARQUITECTURA

Debe contener:

• titulo

• descripcion

• factores

• image

---

# ESPACIOS

Debe contener:

• titulo

• subtitulo

• espacios

• fraseEditorial

• images

---

# MATERIALES

Debe contener:

• titulo

• subtitulo

• fraseEditorial

• heroImage

• materiales

Cada material deberá contener:

• titulo

• descripcion

• muestra

---

# AMENIDADES

Debe contener:

• titulo

• subtitulo

• fraseEditorial

• amenidades

• images

---

# GALERÍA

Debe contener:

• titulo

• subtitulo

• images

---

# DESTINO

Debe contener:

• titulo

• subtitulo

• descripcion

• lugaresCercanos

• mapImage

---

# INVERSIÓN

Debe contener:

• titulo

• descripcion

• beneficios

• fraseEditorial

• graph

---

# CIERRE

Debe contener:

• titulo

• subtitulo

• fraseFinal

• qr

---

# REGLAS

Cada página del PDF deberá poder renderizarse utilizando únicamente esta estructura.

Ningún renderer podrá consultar BrokerProperty.

Ningún renderer podrá consultar AdminPropertyInput.

Ningún renderer podrá consultar EditorialResult.

Todo deberá encontrarse previamente resuelto dentro de EditorialPdfDocument.


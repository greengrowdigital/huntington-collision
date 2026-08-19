# Huntington Collision Center

## What it is

Sitio de captación para un taller de colisión y detailing familiar en Huntington Station,
Long Island. No vende online: convierte visitas en **estimados gratis** y **llamadas**.

- **Register**: brand (el diseño ES el producto — landing de negocio local)
- **Owner**: Mike Sulek · Est. 2013 · NY DMV № 7127281
- **Dirección**: 99 E. Jericho Turnpike, Huntington Station, NY 11746
- **Teléfono**: (631) 492-0123 · **IG**: @huntington_collision

## Quién llega y en qué estado

Tres visitantes, en orden de valor:

1. **Acaba de chocar** (alta urgencia, baja paciencia, casi siempre en móvil, a veces
   parado en la calle). Necesita: ¿me remolcan?, ¿aceptan mi seguro?, ¿cuánto tardan?
   Su conversión es **llamar**, ahora.
2. **Tiene daño y está comparando talleres** (días de investigación, revisa fotos de
   trabajos, lee reviews). Su conversión es **mandar fotos para estimado**.
3. **Quiere mejorar su carro** (detailing, cerámico, wrap, tint, starlights). Menos
   urgencia, más precio-sensible. Su conversión es **ver precios y agendar**.

El sitio no puede optimizarse solo para (1); (2) y (3) son el margen.

## Qué tiene que lograr cada página

| Ruta | Trabajo |
|---|---|
| `/` | Probar competencia en 5 segundos con trabajo real. Ruta rápida a llamar/cotizar. |
| `/services` | Catálogo con precios reales. Quita la fricción de "¿cuánto cuesta?". |
| `/gallery` | Prueba. Fotos y video del taller y de trabajos en proceso, sin retoque. |
| `/about` | Confianza: familiar, 12 años, garantía, seguros, licencia. |
| `/contact` | Convertir: formulario, teléfono, mapa, horario. |

## Restricciones

- **Bilingüe EN/ES**, persistente en `localStorage`. Long Island tiene demanda real en español.
- **Móvil manda**: el visitante 1 casi siempre llega en teléfono, a veces con datos malos.
- **Sin backend**: el formulario es demo (`data-fake`). Conectar a n8n/Formspree en producción.
- **Assets reales del cliente** — nada de stock. Fotos y video del taller en `assets/media/`.
- Estático (HTML+CSS+JS). Sin framework: el SEO local y el TTFB son parte de la conversión.

## Estado

Revamp completo (2026-08-19) sobre la demo editorial anterior. Ver `DESIGN.md`.

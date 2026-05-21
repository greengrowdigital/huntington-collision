# Huntington Collision Center · Demo

Demo de landing multi-página para Huntington Collision Center (99 E. Jericho Tpke, Huntington Station, NY).

## Stack

- HTML estático multi-página
- Tailwind CSS via CDN
- Google Fonts: Inter + Bricolage Grotesque + JetBrains Mono
- Vanilla JS para animaciones (IntersectionObserver, scroll progress, before/after slider, modal, i18n)
- Bilingüe EN/ES con localStorage persistente
- Listo para Vercel (`vercel.json` incluido, `cleanUrls: true`)

## Páginas

- `index.html` — Hero, servicios destacados, proceso, before/after, reviews, CTA
- `services.html` — Catálogo completo (colisión, pintura, PPF/cerámico, detail, wraps, mecánica)
- `gallery.html` — 3 sliders before/after + grid de fotos del taller
- `about.html` — Historia, valores, equipo, números
- `contact.html` — Formulario, info de contacto, mapa embebido

## Deploy

```
vercel --prod
```

## Notas

- Las imágenes son de Unsplash como placeholder. Cuando estén disponibles las fotos reales del taller / clientes, reemplazar URLs en `index.html`, `gallery.html` y `about.html`.
- El form de contacto y el modal son `data-fake` — muestran un mensaje de éxito sin enviar realmente. Conectar a n8n/Formspree/etc cuando se ponga en producción.
- Sin variables de entorno requeridas.

## Negocio

- **Owner**: Mike Sulek
- **Phone**: (631) 492-0123
- **Address**: 99 E. Jericho Turnpike, Huntington Station, NY 11746
- **Instagram**: @huntington_collision
- **Established**: 2013 (BBB File 2015)
- **Insurance**: All major carriers (GEICO, Allstate, Progressive, State Farm, USAA, Liberty)

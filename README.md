# Huntington Collision Center

Landing multi-página para el taller de colisión y detailing de 99 E. Jericho Turnpike,
Huntington Station, NY. Revamp completo (2026-08-19) sobre la demo editorial anterior.

Ver [`DESIGN.md`](DESIGN.md) para el sistema de diseño y [`PRODUCT.md`](PRODUCT.md) para
a quién sirve cada página.

## Stack

HTML estático + CSS propio + JS vanilla. **Sin framework y sin Tailwind CDN**: para un
negocio local el LCP y el SEO son parte de la conversión, y la versión anterior cargaba
~400 KB bloqueantes desde un tercero.

El lenguaje visual está alineado al de [The Car Guys](../../../webs-gaelalejandropty/Car-)
por pedido del cliente: negro profundo, un solo acento, glass, cards elevadas con tilt 3D,
botones píldora con *shine*, blobs difuminados y titulares cuya segunda línea va en serif
itálica con degradado. El acento aquí es el **azul del logo**, no el dorado del Car-.

- **Fuentes**: Syne (display), Fraunces itálica (acento), Inter (cuerpo), JetBrains Mono (datos).
  Son las mismas del Car-, porque son las que producen ese look.
- **Paleta**: `#050505` de fondo + `#0157F9` muestreado del logo con `palettegen`.
- **Interacción**: tilt 3D en tarjetas, brillo interno que sigue al puntero *dentro* de la
  tarjeta, botones magnéticos, contadores animados, parallax en los cierres, nav que se
  vuelve píldora al bajar. Nada de esto toca el cursor del navegador.
- **Bilingüe EN/ES**: diccionario en atributos `data-en` / `data-es`, persistido en `localStorage`.
- **Idioma por defecto**: inglés. Solo arranca en español si la zona horaria del equipo
  apunta a un país hispanohablante (Puerto Rico cuenta como EE. UU.). Sin señal → inglés.

## Páginas

| Ruta | Contenido |
|---|---|
| `index.html` | Hero, urgencia (grúa), servicios con precio, aseguradoras, video del taller, proceso, reseñas |
| `services.html` | Catálogo completo con precios y tiempos reales, agrupado en 3 bloques |
| `gallery.html` | 18 videos verticales + 32 fotos, agrupadas por tipo de trabajo |
| `about.html` | Historia, forma de trabajar, credenciales |
| `contact.html` | Formulario, datos, mapa |

## Assets

Todo el material es **real, del cliente**. Nada de stock.

**El nombre del archivo dice para qué servicio es** (`towing-flatbed`, `detail-escalade`,
`starlight-headliner`). No es cosmético: en la primera pasada las fotos se repartieron
por composición y quedó un carro chocado ilustrando "detailing" y ningún camión en
"towing". Al cambiar una, respeta el emparejamiento.

- `assets/media/photo/` — 35 fotos en WebP, dos tamaños (`@sm` para móvil), nombradas por servicio
- `assets/media/video/` — 25 clips MP4 + póster WebP de cada uno
- `assets/brand/` — logo en WebP y PNG

Los originales viven en `public/` y están gitignoreados (~96 MB).

> ⚠️ **Los 20 videos se grabaron con el teléfono en vertical.** Siete de ellos reportan
> `1024x576` en el contenedor pero traen `rotation=-90` en metadata: su formato real es
> 576×1024. Si se reprocesan, **no forzar dimensiones** — dejar que ffmpeg auto-rote y
> limitar solo el ancho:
> ```
> ffmpeg -i in.mp4 -an -c:v libx264 -crf 28 -vf "scale='min(720,iw)':-2" out.mp4
> ```
> Forzar `scale=1024:576` estira el frame y deforma el vídeo.

Por eso el hero usa una **foto** de fondo (nítida a lo ancho) y muestra el vídeo en un
panel vertical a su formato nativo, en vez de estirarlo a fondo apaisado.

## Detalles de implementación

- **Loader**: cortina con el logo, una sola vez por sesión (`sessionStorage`). Solo existe
  con JS y tiene tope de 4 s, así que nunca se queda pegado.
- **Motion**: los reveals mejoran un default ya visible. Sin JS la página se lee completa.
  Todo respeta `prefers-reduced-motion`.
- **Video**: se reproduce solo lo visible; se pausa fuera de viewport, con la pestaña
  oculta y bajo `prefers-reduced-motion` (queda el póster).
- **Modal**: foco atrapado, `Escape`, clic en backdrop, foco devuelto al disparador.

## Pendiente antes de producción

1. **Formularios**: son `data-demo`, muestran éxito sin enviar. Conectar a n8n / Formspree.
2. **Reseñas**: los tres testimonios son de la demo anterior, sin verificar. Reemplazar
   por reseñas reales de Google antes de publicar.
3. **Métricas**: `12 años`, `8,200 carros`, `4.8★ / 127 reseñas` vienen de la demo previa.
   Confirmar con el cliente.
4. **Pagos y citas**: pendiente conectar Square (ver conversación con el equipo).

## Deploy

```
node scripts/stamp-assets.mjs   # obligatorio si tocaste CSS o JS
vercel --prod
```

`vercel.json` ya trae `cleanUrls`. Sin variables de entorno.

> ⚠️ **Tras cambiar `assets/styles.css` o `assets/app.js`, corre `scripts/stamp-assets.mjs`**
> antes de desplegar. Sella cada archivo con un hash de su contenido en la URL
> (`styles.css?v=68b55d2a`).
>
> Sin eso, quien ya visitó el sitio se queda con la copia guardada y ve el HTML
> nuevo contra el CSS viejo, o sea una página sin estilos. Pasó en agosto de 2026:
> `vercel.json` servía todo `/assets` como `immutable` por un año, así que los
> iPhone que habían entrado antes nunca volvían a pedir la hoja de estilos.
> Ahora CSS y JS van con `must-revalidate` y las imágenes siguen `immutable`,
> que es lo correcto para ellas.

## Negocio

- **Dirección**: 99 E. Jericho Turnpike, Huntington Station, NY 11746
- **Teléfono**: (631) 492-0123
- **Correo**: aahuntingtoncollision@gmail.com
- **Instagram**: [@huntington_collision](https://www.instagram.com/huntington_collision/)
- **Desde**: 2013 · NY DMV № 7134012

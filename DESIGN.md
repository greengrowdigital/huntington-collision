# Design System — Huntington Collision

## La escena

> Nueve de la noche en Jericho Turnpike. Un M5 con el frente desarmado está bajo los
> fluorescentes del taller, la carrocería en primer gris. Alguien pasa manejando y ve
> el azul del letrero encendido.

Esa escena obliga el tema: **oscuro**. No por estilo — el material fotográfico real del
cliente es oscuro, el logo es negro, y el momento en que alguien busca un taller de
colisión suele ser de noche y con estrés.

## Referencia nombrada

**Configurador near-black de Polestar con un único color-señal eléctrico.**

Lo que NO es: editorial-magazine (era el diseño anterior — serif display + folios + kickers),
Stripe-minimal, acid-maximalism, glassmorphism, SaaS oscuro genérico.

## Color — estrategia *Committed*

El negro ocupa ~90% de la superficie. El azul aparece **solo donde hay acción o estado**:
CTA, link activo, indicador de "abierto ahora", número que importa. Nunca decorativo.
Si el azul se puede quitar sin perder información, sobra.

Muestreado del logo (`palettegen`): `#0157F9` · `#065EF9` · `#FDFDFD` · `#000000`.

| Token | Valor | Uso |
|---|---|---|
| `--void` | `oklch(.145 .014 262)` | Fondo. Negro tintado hacia el azul de marca. |
| `--surface` | `oklch(.196 .016 262)` | Paneles, filas, formularios. |
| `--raised` | `oklch(.252 .018 262)` | Hover, bordes activos. |
| `--blue` | `#0157F9` | Fondo de CTA, gráficos, texto ≥18px. |
| `--blue-lift` | `#5B9DFF` | Links y texto pequeño sobre negro. |
| `--blue-deep` | `oklch(.42 .20 263)` | Pressed / hover del CTA. |
| `--ink` | `oklch(.985 .002 262)` | Texto principal. |
| `--ink-2` | `oklch(.76 .012 262)` | Texto secundario. |
| `--ink-3` | `oklch(.60 .012 262)` | Labels, metadatos. |

### Contraste verificado (WCAG, calculado no estimado)

| Par | Ratio | Veredicto |
|---|---|---|
| `--ink` sobre `--void` | 18.9:1 | AAA |
| `--ink-2` sobre `--void` | 8.4:1 | AAA |
| `--ink-3` sobre `--void` | 5.1:1 | AA (body) |
| **blanco sobre `--blue`** | **5.63:1** | AA — por eso el CTA lleva texto blanco |
| `--blue` sobre `--void` | 3.47:1 | Solo texto grande / gráficos |
| **`--blue-lift` sobre `--void`** | **7.18:1** | AA — el azul para texto pequeño |

Regla dura: `--blue` nunca se usa como color de texto por debajo de 18px. Para eso existe
`--blue-lift`.

## Tipografía

Voz de marca en tres palabras físicas: **panel-beaten · night-lit · exact.**

Rechazados por reflejo (defaults de training data): Inter, Space Grotesk, DM Sans,
IBM Plex, JetBrains Mono, Newsreader, DM Serif.

| Rol | Familia | Por qué |
|---|---|---|
| Display | **Archivo** (`wdth 112–125`, `wght 700–800`) | Grotesque americana de señalización. En expanded + mayúsculas da presencia de título de película sin caer en serif editorial. |
| Body | **Archivo** (`wdth 100`, `wght 400–500`) | Misma familia; el contraste lo hace el eje de anchura, no una segunda fuente tímida. |
| Datos | **Martian Mono** (`wdth 75–87`) | Números de reclamo, DMV, precios, specs. El mono está justificado semánticamente — el taller sí maneja identificadores — no como disfraz "técnico". |

Dos familias, contraste en eje real (grotesque ancha vs mono estrecha).

- Techo de display: `clamp()` max **5.5rem**. Tracking mínimo **-0.03em**.
- Body: 65–75ch, `line-height 1.65` (texto claro sobre oscuro necesita más aire).
- `text-wrap: balance` en h1–h3, `pretty` en párrafos largos.

## Motion

Marketing, así que puede ser más expresiva que UI de producto — pero sigue siendo servicio.

- **Entrada**: `--ease-out-quint` `cubic-bezier(.22,1,.36,1)`. Sin bounce, sin elastic.
- **Duraciones**: micro 160–220ms · reveal de sección 620ms · hero 900ms.
- **Solo** `transform` / `opacity` / `clip-path` / `filter`. Nunca `transition: all`.
- **Stagger**: 45ms por item, tope 6 items.
- **Reveals mejoran un default ya visible**: el contenido nace visible y la clase `.is-in`
  añade el movimiento. Si el JS no corre, la página se lee igual. Nada de `opacity: 0`
  esperando a un observer.
- `prefers-reduced-motion: reduce` → todo colapsa a crossfade de 1ms, los videos se pausan
  y se muestra el póster.

## Bans respetados

Del diseño anterior se eliminan: kicker uppercase en cada sección (`.folio`), numeración
`Feature №01…06` como andamio, gradient text, el KPI strip de plantilla SaaS.

Los números **sí** aparecen en el proceso de reparación, porque ahí son una secuencia real
y ordenada donde el orden es la información.

Nunca: side-stripe borders, glassmorphism decorativo, grids de tarjetas idénticas,
custom cursor.

## Estructura de conversión (home)

1. **Hero video** — competencia probada en 5s + dos CTAs (cotizar / llamar)
2. **Barra de urgencia** — remolque 24/7, para el que acaba de chocar
3. **Servicios** con precio real
4. **Aseguradoras** — quita la ansiedad de "¿aceptan mi seguro?"
5. **Trabajo real** — video y foto del taller, sin retocar
6. **Proceso** en 4 pasos (aquí sí van números)
7. **Reviews** específicas
8. **Cierre** + mapa + horario

## Stack

HTML estático + CSS propio + JS vanilla. **Sin Tailwind CDN** (el diseño anterior lo cargaba:
~400KB bloqueantes desde un tercero). Para un negocio local el LCP y el SEO son parte de la
conversión, así que el CSS va inline-first y propio.

/* Sella styles.css y app.js con un hash de su contenido en la URL.
   Cambiar la cabecera Cache-Control no sirve para quien ya tiene la copia
   vieja guardada como immutable: esa entrada solo caduca si cambia la URL.
   Reejecutar tras cada cambio de CSS o JS. */
import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = ['index.html', 'services.html', 'gallery.html', 'about.html', 'contact.html'];

const hash = (f) =>
  createHash('sha256').update(readFileSync(join(ROOT, f))).digest('hex').slice(0, 8);

const vCss = hash('assets/styles.css');
const vJs = hash('assets/app.js');

console.log(`styles.css -> ${vCss}`);
console.log(`app.js     -> ${vJs}`);

for (const p of PAGES) {
  const path = join(ROOT, p);
  let s = readFileSync(path, 'utf8');

  s = s.replace(/href="assets\/styles\.css(\?v=[a-f0-9]+)?"/g, `href="assets/styles.css?v=${vCss}"`);
  s = s.replace(/src="assets\/app\.js(\?v=[a-f0-9]+)?"/g, `src="assets/app.js?v=${vJs}"`);

  writeFileSync(path, s, 'utf8');

  const okCss = s.includes(`styles.css?v=${vCss}`);
  const okJs = s.includes(`app.js?v=${vJs}`);
  console.log(`${p}: css=${okCss ? 'ok' : 'FALLO'} js=${okJs ? 'ok' : 'FALLO'}`);
}

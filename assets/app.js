/* Huntington Collision — comportamiento
   Todo es progresivo: sin JS la página sigue legible y navegable. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.documentElement;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* Safari anterior a 14 no tiene addEventListener en MediaQueryList: llamarlo
     lanza TypeError y se lleva por delante todo el script que venga después. */
  function onMediaChange(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  /* Cada bloque se aísla: si uno falla en un navegador viejo, los demás
     siguen funcionando en vez de caerse en cadena. */
  function block(name, fn) {
    try { fn(); }
    catch (e) { if (window.console && console.warn) console.warn('[hc] ' + name, e); }
  }

  /* Las animaciones de entrada arrancan el contenido en opacity:0, así que
     solo pueden activarse una vez que este archivo está corriendo de verdad.
     Si no llega a ejecutarse, la clase nunca se pone y todo se ve tal cual:
     una página sin animaciones, no una página en blanco. */
  root.classList.add('anim');

  /* Última red: si el observador no llega a marcar algo (navegador sin
     IntersectionObserver, error posterior, render headless), se revela todo. */
  window.setTimeout(function () {
    var pending = document.querySelectorAll('.rise:not(.is-in), .rise-kids:not(.is-in), .hero:not(.is-in)');
    for (var i = 0; i < pending.length; i++) pending[i].classList.add('is-in');
  }, 2500);

  /* ----------------------------------------------------------------
     Loader — cortina de entrada, una vez por sesión.
     Nunca se queda pegado: hay un tope de tiempo pase lo que pase.
     ---------------------------------------------------------------- */
  (function loader() {
    var el = document.querySelector('.loader');
    if (!el || !root.classList.contains('loading')) return;

    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      el.classList.add('done');
      root.classList.remove('loading');
      try { sessionStorage.setItem('hc-seen', '1'); } catch (e) {}
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 800);
    }

    var MIN = reduced.matches ? 0 : 1300;
    var started = Date.now();
    function finish() { setTimeout(close, Math.max(0, MIN - (Date.now() - started))); }

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });

    setTimeout(close, 4000); // red de seguridad
  })();

  /* ----------------------------------------------------------------
     i18n — EN/ES persistente
     ---------------------------------------------------------------- */
  var LANG_KEY = 'hc-lang';

  /* Zonas horarias de países hispanohablantes. Puerto Rico queda fuera a
     propósito: es Estados Unidos y ahí manda la regla de abajo. */
  var ES_ZONES = new RegExp(
    '^(America/(Mexico_City|Tijuana|Cancun|Monterrey|Merida|Chihuahua|Hermosillo' +
    '|Mazatlan|Bahia_Banderas|Ojinaga|Matamoros|Guatemala|El_Salvador|Tegucigalpa' +
    '|Managua|Costa_Rica|Panama|Havana|Santo_Domingo|Bogota|Caracas|Lima|La_Paz' +
    '|Santiago|Punta_Arenas|Asuncion|Montevideo|Guayaquil|Argentina/.+)' +
    '|Europe/Madrid|Atlantic/Canary|Africa/Ceuta|Pacific/Galapagos)$'
  );

  function getLang() {
    // 1. Lo que el visitante eligió gana siempre.
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'es') return saved;
    } catch (e) {}

    // 2. El negocio está en Long Island, así que inglés es el default.
    //    No usamos navigator.language: alguien en Nueva York con el navegador
    //    en español sigue siendo un cliente al que se recibe en inglés.
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && ES_ZONES.test(tz)) return 'es';
    } catch (e) {}

    // 3. Sin señal de ubicación: inglés.
    return 'en';
  }

  function applyLang(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
      var v = el.getAttribute('data-' + lang);
      if (v !== null) el.textContent = v;
    });
    document.querySelectorAll('[data-' + lang + '-html]').forEach(function (el) {
      el.innerHTML = el.getAttribute('data-' + lang + '-html');
    });
    document.querySelectorAll('[data-' + lang + '-ph]').forEach(function (el) {
      el.setAttribute('placeholder', el.getAttribute('data-' + lang + '-ph'));
    });
    document.querySelectorAll('[data-' + lang + '-aria]').forEach(function (el) {
      el.setAttribute('aria-label', el.getAttribute('data-' + lang + '-aria'));
    });

    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });

    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  var lang = getLang();
  applyLang(lang);

  document.querySelectorAll('[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      lang = btn.getAttribute('data-lang');
      applyLang(lang);
      splitWords(); // el titular cambió de idioma: rehacer el troceado
    });
  });

  /* ----------------------------------------------------------------
     Titular troceado en palabras, para que entren escalonadas
     ---------------------------------------------------------------- */
  function splitWords() {
    document.querySelectorAll('[data-split]').forEach(function (el) {
      var text = el.getAttribute('data-raw') || el.textContent;
      el.setAttribute('data-raw', text);
      el.innerHTML = text.split(/\s+/).map(function (w, i) {
        return '<span class="word" style="transition-delay:' + (i * 55) + 'ms"><i style="transition-delay:' +
               (i * 55) + 'ms">' + w + '</i></span>';
      }).join(' ');
    });
  }
  splitWords();

  /* ----------------------------------------------------------------
     Reveals — mejoran un default ya visible
     ---------------------------------------------------------------- */
  var revealTargets = document.querySelectorAll('.rise, .rise-kids, .hero');

  if (!('IntersectionObserver' in window) || reduced.matches) {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    revealTargets.forEach(function (el) { io.observe(el); });

    // Lo que ya está en pantalla al cargar entra de inmediato.
    requestAnimationFrame(function () {
      revealTargets.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      });
    });
  }

  /* ----------------------------------------------------------------
     Contadores — animan una sola vez al entrar en pantalla
     ---------------------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var runCount = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = (el.getAttribute('data-decimals') | 0);
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduced.matches) { el.textContent = target.toFixed(decimals) + suffix; return; }

      var dur = 1400, t0 = null;
      var tick = function (ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4); // ease-out quart
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ----------------------------------------------------------------
     Scroll: barra de progreso, nav pegajosa y parallax
     ---------------------------------------------------------------- */
  var bar = document.querySelector('.progress');
  var nav = document.querySelector('.nav');
  var parallaxEls = reduced.matches ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var docH = 0, ticking = false;

  function measure() { docH = document.documentElement.scrollHeight - window.innerHeight; }

  function onScrollFrame() {
    var y = window.scrollY;

    if (bar) bar.style.transform = 'scaleX(' + (docH > 0 ? Math.min(y / docH, 1) : 0) + ')';
    if (nav) nav.classList.toggle('is-stuck', y > 24);

    for (var i = 0; i < parallaxEls.length; i++) {
      var el = parallaxEls[i];
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      var box = el.getBoundingClientRect();
      // Solo mover lo que se ve, y relativo al centro del viewport.
      if (box.bottom > -200 && box.top < window.innerHeight + 200) {
        var mid = box.top + box.height / 2 - window.innerHeight / 2;
        el.style.setProperty('--par', (-mid * speed).toFixed(1) + 'px');
      }
    }
    ticking = false;
  }

  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
  }, { passive: true });
  onScrollFrame();

  /* ----------------------------------------------------------------
     Tilt 3D y brillo interno — solo con ratón fino y sin reduced-motion
     ---------------------------------------------------------------- */
  // Pointer Events y las custom properties que usa el tilt son lo más nuevo
  // de todo el archivo: si algo va a fallar en un navegador viejo, es esto.
  if (fine.matches && !reduced.matches) block('tilt', function () {
    document.querySelectorAll('.tilt').forEach(function (card) {
      var inner = card.querySelector('.tilt-in') || card;
      var max = parseFloat(card.getAttribute('data-tilt')) || 6;
      var frame = null;

      card.addEventListener('pointermove', function (e) {
        if (frame) return;
        frame = requestAnimationFrame(function () {
          var b = card.getBoundingClientRect();
          var px = (e.clientX - b.left) / b.width;
          var py = (e.clientY - b.top) / b.height;
          inner.style.setProperty('--ry', ((px - 0.5) * max * 2).toFixed(2) + 'deg');
          inner.style.setProperty('--rx', ((0.5 - py) * max * 2).toFixed(2) + 'deg');
          card.style.setProperty('--px', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--py', (py * 100).toFixed(1) + '%');
          frame = null;
        });
      });

      card.addEventListener('pointerleave', function () {
        inner.style.setProperty('--rx', '0deg');
        inner.style.setProperty('--ry', '0deg');
      });
    });

    // Brillo interno en elementos que no llevan tilt
    document.querySelectorAll('.sheen:not(.tilt)').forEach(function (el) {
      var frame = null;
      el.addEventListener('pointermove', function (e) {
        if (frame) return;
        frame = requestAnimationFrame(function () {
          var b = el.getBoundingClientRect();
          el.style.setProperty('--px', (((e.clientX - b.left) / b.width) * 100).toFixed(1) + '%');
          el.style.setProperty('--py', (((e.clientY - b.top) / b.height) * 100).toFixed(1) + '%');
          frame = null;
        });
      });
    });

    // Botones magnéticos: desplazamiento corto, nunca tanto como para
    // que el puntero pierda el objetivo.
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      var frame = null;
      btn.addEventListener('pointermove', function (e) {
        if (frame) return;
        frame = requestAnimationFrame(function () {
          var b = btn.getBoundingClientRect();
          var dx = (e.clientX - (b.left + b.width / 2)) / b.width;
          var dy = (e.clientY - (b.top + b.height / 2)) / b.height;
          btn.style.setProperty('--mx', (dx * 10).toFixed(1) + 'px');
          btn.style.setProperty('--my', (dy * 10).toFixed(1) + 'px');
          frame = null;
        });
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  });

  /* ----------------------------------------------------------------
     Nav móvil
     ---------------------------------------------------------------- */
  var burger = document.getElementById('burger');
  var panel = document.getElementById('navPanel');
  if (burger && panel) {
    burger.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        panel.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----------------------------------------------------------------
     Vídeo: reproducir solo lo visible; póster bajo reduced-motion
     ---------------------------------------------------------------- */
  var videos = document.querySelectorAll('video[data-auto]');
  function stopAll() { videos.forEach(function (v) { v.pause(); }); }

  if (videos.length) {
    if (reduced.matches) {
      stopAll();
    } else if ('IntersectionObserver' in window) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var v = e.target;
          if (e.isIntersecting) {
            var p = v.play();
            if (p && p.catch) p.catch(function () {});
          } else { v.pause(); }
        });
      }, { threshold: 0.2 });
      videos.forEach(function (v) { vio.observe(v); });
    }

    onMediaChange(reduced, function (e) { if (e.matches) stopAll(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stopAll(); });
  }

  /* ----------------------------------------------------------------
     Modal de cotización — foco atrapado, Escape, backdrop
     ---------------------------------------------------------------- */
  var modal = document.getElementById('quoteModal');
  if (modal) {
    var card = modal.querySelector('.modal-card');
    var lastFocus = null;
    var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])';

    function openModal() {
      lastFocus = document.activeElement;
      modal.classList.add('open');
      modal.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      var first = card.querySelector(FOCUSABLE);
      if (first) setTimeout(function () { first.focus(); }, 60);
    }
    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.querySelectorAll('[data-open-quote]').forEach(function (t) {
      t.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
    });
    modal.querySelectorAll('[data-close-quote]').forEach(function (t) {
      t.addEventListener('click', closeModal);
    });
    modal.addEventListener('mousedown', function (e) { if (e.target === modal) closeModal(); });

    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key !== 'Tab') return;

      var items = Array.prototype.filter.call(
        card.querySelectorAll(FOCUSABLE),
        function (el) { return el.offsetParent !== null; }
      );
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ----------------------------------------------------------------
     Formularios demo — validación en blur, foco al primer error
     ---------------------------------------------------------------- */
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    var msg = form.querySelector('[data-form-msg]');
    function errorNode(field) { return form.querySelector('[data-err-for="' + field.name + '"]'); }

    function validate(field) {
      var node = errorNode(field);
      var ok = field.checkValidity();
      field.setAttribute('aria-invalid', String(!ok));
      if (node) {
        node.hidden = ok;
        if (!ok) {
          node.textContent = field.validity.valueMissing
            ? (lang === 'es' ? 'Este campo es obligatorio.' : 'This field is required.')
            : (lang === 'es' ? 'Revisa el formato.' : 'Check the format.');
        }
      }
      return ok;
    }

    form.querySelectorAll('input, textarea').forEach(function (f) {
      f.addEventListener('blur', function () {
        if (f.value || f.hasAttribute('required')) validate(f);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var fields = Array.prototype.slice.call(form.querySelectorAll('input, textarea'));
      var firstBad = null;
      fields.forEach(function (f) { if (!validate(f) && !firstBad) firstBad = f; });
      if (firstBad) { firstBad.focus(); return; }

      var btn = form.querySelector('button[type="submit"]');
      var original = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = lang === 'es' ? 'Enviando…' : 'Sending…'; }

      setTimeout(function () {
        if (btn) { btn.disabled = false; btn.textContent = original; }
        if (msg) {
          msg.hidden = false;
          msg.textContent = lang === 'es'
            ? 'Recibido. Te llamamos al (631) 492-0123 en menos de una hora hábil.'
            : 'Got it. We’ll call you back within one business hour on (631) 492-0123.';
        }
        form.reset();
        fields.forEach(function (f) {
          f.setAttribute('aria-invalid', 'false');
          var n = errorNode(f); if (n) n.hidden = true;
        });
      }, 700);
    });
  });

  /* ----------------------------------------------------------------
     Año en el pie
     ---------------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();

/* Huntington Collision — comportamiento
   Todo es progresivo: sin JS la página sigue legible y navegable. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.documentElement;

  /* ----------------------------------------------------------------
     Loader — telón de entrada, una sola vez por sesión.
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
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 900);
    }

    // Mínimo para que la barra se lea, máximo para no castigar conexiones lentas.
    var MIN = reduced.matches ? 0 : 1250;
    var started = Date.now();

    function finish() {
      var waited = Date.now() - started;
      setTimeout(close, Math.max(0, MIN - waited));
    }

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });

    // Red de seguridad: si `load` nunca llega (vídeo lento, red caída), sale igual.
    setTimeout(close, 4000);
  })();

  /* ----------------------------------------------------------------
     i18n — EN/ES persistente
     Los nodos llevan data-en / data-es (y variantes -html, -ph, -aria).
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
    //    Solo cambia si el reloj del equipo apunta a un país hispanohablante.
    //    No usamos navigator.language: alguien en Nueva York con el navegador
    //    en español sigue siendo un cliente al que hay que recibir en inglés.
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
    });
  });

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
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });

    revealTargets.forEach(function (el) { io.observe(el); });

    // Red de seguridad: lo que ya está en pantalla al cargar entra de inmediato.
    requestAnimationFrame(function () {
      revealTargets.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      });
    });
  }

  /* ----------------------------------------------------------------
     Progreso de scroll — transform, sin leer layout en cada frame
     ---------------------------------------------------------------- */
  var bar = document.querySelector('.progress');
  if (bar) {
    var ticking = false;
    var docH = 0;

    function measure() {
      docH = document.documentElement.scrollHeight - window.innerHeight;
    }
    function paint() {
      var p = docH > 0 ? Math.min(window.scrollY / docH, 1) : 0;
      bar.style.transform = 'scaleX(' + p + ')';
      ticking = false;
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }

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

  function stopAll() {
    videos.forEach(function (v) { v.pause(); });
  }

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
          } else {
            v.pause();
          }
        });
      }, { threshold: 0.2 });
      videos.forEach(function (v) { vio.observe(v); });
    }

    reduced.addEventListener('change', function (e) {
      if (e.matches) stopAll();
    });

    // No gastar batería/datos en una pestaña oculta
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAll();
    });
  }

  /* ----------------------------------------------------------------
     Servicios: la fila enfocada manda sobre la imagen
     ---------------------------------------------------------------- */
  var specRows = document.querySelectorAll('[data-spec]');
  var specImgs = document.querySelectorAll('[data-spec-img]');
  var specCap = document.querySelector('[data-spec-cap]');

  if (specRows.length && specImgs.length) {
    var showSpec = function (key, label) {
      specImgs.forEach(function (img) {
        img.classList.toggle('on', img.getAttribute('data-spec-img') === key);
      });
      if (specCap && label) specCap.textContent = label;
    };
    specRows.forEach(function (row) {
      var key = row.getAttribute('data-spec');
      var show = function () { showSpec(key, row.getAttribute('data-spec-label')); };
      row.addEventListener('mouseenter', show);
      row.addEventListener('focusin', show);
    });
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

    function errorNode(field) {
      return form.querySelector('[data-err-for="' + field.name + '"]');
    }

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
      fields.forEach(function (f) {
        if (!validate(f) && !firstBad) firstBad = f;
      });
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

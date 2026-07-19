/* ═══════════════════════════════════════════════════
   MAIN.JS — Lógica del portfolio (GitHub Pages safe)
   Solo HTML/CSS/JS puro — sin dependencias externas
   ═══════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────
   1. NAV — Scroll state + hamburger + active link
   ────────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');
  const sections = document.querySelectorAll('section[id]');

  if (!nav || !toggle || !menu) return;

  // Scroll: agrega clase scrolled al nav
  const onScroll = () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 20);
    updateActiveLink();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Hamburguesa — accesibilidad: aria-expanded
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  // Cerrar menú al hacer click en un link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    });
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  // Resaltar link activo según sección visible (IntersectionObserver)
  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= 120) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('is-active', href === current);
    });
  }

  onScroll(); // Estado inicial
})();


/* ──────────────────────────────────────────────
   2. SCROLL REVEAL — Sección "Quién soy"
      y cualquier elemento con clase .js-reveal
   ────────────────────────────────────────────── */
(function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.sobre-mi__intro-block, .sobre-mi__bio, .sobre-mi__stats, .sobre-mi__skills, .sobre-mi__cta-row'
  );

  if (!targets.length || !('IntersectionObserver' in window)) {
    // Fallback: mostrar todo directamente si no hay soporte
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Una sola vez
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
})();


/* ──────────────────────────────────────────────
   3. CONTADOR ANIMADO — Estadísticas de "Quién soy"
   ────────────────────────────────────────────── */
(function initCounters() {
  const statNumbers = document.querySelectorAll('.sobre-mi__stat-number[data-target]');
  if (!statNumbers.length) return;

  const duration = 1500; // ms

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target) || target === 0) return; // Si es 0, no animar

    const start = performance.now();
    const prefix = el.textContent.startsWith('+') ? '+' : '';

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      // Usar textContent (no innerHTML) — prevención XSS
      el.textContent = `${prefix}${current}`;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Disparar cuando el bloque de stats sea visible
  if (!('IntersectionObserver' in window)) {
    statNumbers.forEach(el => animateCounter(el));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.sobre-mi__stat-number[data-target]').forEach(animateCounter);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const statsBlock = document.querySelector('.sobre-mi__stats');
  if (statsBlock) observer.observe(statsBlock);
})();


/* ──────────────────────────────────────────────
   4. FOOTER — Año dinámico
   ────────────────────────────────────────────── */
(function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    // Usar textContent para evitar XSS
    yearEl.textContent = new Date().getFullYear().toString();
  }
})();


/* ──────────────────────────────────────────────
   5. SEGURIDAD — Abrir links externos de forma segura
      rel="noopener noreferrer" en todos los target="_blank"
      (HU02, HU06, HU07, HU08, HU12 de la matriz)
   ────────────────────────────────────────────── */
(function secureExternalLinks() {
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    const rel = link.getAttribute('rel') || '';
    if (!rel.includes('noopener')) {
      link.setAttribute('rel', (rel + ' noopener noreferrer').trim());
    }
  });
})();


/* ──────────────────────────────────────────────
   6. SMOOTH SCROLL — Fallback para Safari antiguo
   ────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;
      e.preventDefault();
      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
        10
      ) || 72;
      const top = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  })();
})();


/* ──────────────────────────────────────────────
   7. BENTO GRID — Paginación mobile (scroll-spy)
      Actualiza el dot activo al deslizar
   ────────────────────────────────────────────── */
(function initBentoPagination() {
  const grid = document.getElementById('bento-grid');
  const pager = document.getElementById('bento-pagination');
  if (!grid || !pager) return;

  const dots = pager.querySelectorAll('.bento-pagination__dot');
  const cards = grid.querySelectorAll('.bento-card');

  if (!dots.length || !cards.length) return;

  // Scroll-spy: actualiza dot activo cuando una card entra al viewport
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = Array.from(cards).indexOf(entry.target);
        if (idx === -1) return;
        dots.forEach((d, i) => {
          d.classList.toggle('bento-pagination__dot--active', i === idx);
        });
      });
    },
    {
      root: grid,
      threshold: 0.6, // La card debe estar 60% visible
    }
  );

  cards.forEach(card => observer.observe(card));

  // Click en dot → scroll a la card correspondiente
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const target = cards[i];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    });
  });
})();

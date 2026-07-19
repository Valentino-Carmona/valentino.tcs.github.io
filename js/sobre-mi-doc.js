/* ═══════════════════════════════════════════════════
   SOBRE-MI-DOC.JS
   Static Documentation Site — Interactividad
   ═══════════════════════════════════════════════════ */

'use strict';

// ── 1. Año dinámico en el footer ──────────────────
const footerYear = document.getElementById('footer-year');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

// ── 2. Topbar: borde al hacer scroll ─────────────
const topbar = document.getElementById('topbar');
const onScrollTopbar = () => {
  if (window.scrollY > 10) {
    topbar?.classList.add('topbar--scrolled');
  } else {
    topbar?.classList.remove('topbar--scrolled');
  }
};
window.addEventListener('scroll', onScrollTopbar, { passive: true });
onScrollTopbar();

// ── 3. Sidebar móvil: toggle del drawer ──────────
const sidebarToggle = document.getElementById('sidebar-toggle');
const docSidebar    = document.getElementById('doc-sidebar');

const closeSidebar = () => {
  docSidebar?.classList.remove('is-open');
  sidebarToggle?.setAttribute('aria-expanded', 'false');
};

const openSidebar = () => {
  docSidebar?.classList.add('is-open');
  sidebarToggle?.setAttribute('aria-expanded', 'true');
};

sidebarToggle?.addEventListener('click', () => {
  const isOpen = sidebarToggle.getAttribute('aria-expanded') === 'true';
  isOpen ? closeSidebar() : openSidebar();
});

// Cerrar sidebar al hacer clic fuera (overlay)
docSidebar?.addEventListener('click', (e) => {
  if (e.target === docSidebar || e.target.matches('.doc-sidebar::after')) {
    closeSidebar();
  }
});

// Cerrar sidebar al seleccionar un enlace en móvil
docSidebar?.querySelectorAll('.tree__link').forEach((link) => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 900) closeSidebar();
  });
});

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

// ── 4. Accordion del Tree Navigation ──────────────
const chapterBtns = document.querySelectorAll('.tree__chapter-btn');

chapterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const chapter   = btn.closest('.tree__chapter');
    const targetId  = btn.getAttribute('aria-controls');
    const itemsList = document.getElementById(targetId);
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      // Colapsar
      btn.setAttribute('aria-expanded', 'false');
      chapter.setAttribute('aria-expanded', 'false');
      itemsList?.classList.add('tree__items--collapsed');
    } else {
      // Expandir este capítulo
      btn.setAttribute('aria-expanded', 'true');
      chapter.setAttribute('aria-expanded', 'true');
      itemsList?.classList.remove('tree__items--collapsed');
    }
  });
});

// ── 5. Resaltado activo del link en el sidebar ────
// Usa IntersectionObserver para detectar qué sección es visible
const docSections = document.querySelectorAll('.doc-section[id], .doc-chapter[id]');
const navLinks    = document.querySelectorAll('.tree__link');

const activateLink = (id) => {
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === `#${id}`) {
      link.classList.add('is-active');
      // Expandir el capítulo padre si está colapsado
      const parentItems   = link.closest('.tree__items');
      const parentChapter = parentItems?.closest('.tree__chapter');
      const parentBtn     = parentChapter?.querySelector('.tree__chapter-btn');

      if (parentBtn && parentBtn.getAttribute('aria-expanded') === 'false') {
        parentBtn.setAttribute('aria-expanded', 'true');
        parentChapter.setAttribute('aria-expanded', 'true');
        parentItems.classList.remove('tree__items--collapsed');
      }
    } else {
      link.classList.remove('is-active');
    }
  });
};

const intersectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activateLink(entry.target.id);
      }
    });
  },
  {
    rootMargin: `-${72 + 32}px 0px -60% 0px`,
    threshold: 0,
  }
);

docSections.forEach((section) => {
  intersectionObserver.observe(section);
});

// ── 6. Barra de progreso de lectura ───────────────
const progressBar = document.getElementById('doc-progress-bar');

const updateProgress = () => {
  const docEl = document.documentElement;
  const scrollTop = window.scrollY || docEl.scrollTop;
  const scrollHeight = docEl.scrollHeight - docEl.clientHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  if (progressBar) {
    progressBar.style.width = `${Math.min(progress, 100).toFixed(2)}%`;
  }
};

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ── 7. Skill bars: animación al entrar en viewport ─
const skillBars = document.querySelectorAll('.skill-bar__fill');

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // El nivel viene del style inline "--level: X%"
        // La transición CSS se encarga de la animación
        entry.target.style.width = entry.target.style.getPropertyValue('--level') || '0%';
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

skillBars.forEach((bar) => {
  // Resetear el ancho para que la animación se vea al entrar
  const level = bar.style.getPropertyValue('--level');
  bar.style.width = '0%';
  // Guardar el nivel objetivo
  bar.dataset.level = level;
  skillObserver.observe(bar);
});

// ── 8. Anchor links: copiar al portapapeles ───────
document.querySelectorAll('.doc-section__anchor').forEach((anchor) => {
  const section = anchor.closest('.doc-section');
  if (!section) return;

  anchor.setAttribute('role', 'button');
  anchor.setAttribute('tabindex', '0');
  anchor.setAttribute('title', 'Copiar enlace a esta sección');

  const copyLink = () => {
    const id  = section.id;
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    // Feedback visual temporal
    anchor.textContent = '✓';
    anchor.style.opacity = '1';
    setTimeout(() => {
      anchor.textContent = '#';
      anchor.style.opacity = '';
    }, 1500);
  };

  anchor.addEventListener('click', copyLink);
  anchor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyLink();
    }
  });
});

// ── 9. Paginación dinámica: prev / next capítulo ──
// Actualiza los textos de prev/next según qué capítulo es visible
const chapters = Array.from(document.querySelectorAll('.doc-chapter'));
const pagPrev  = document.getElementById('pag-prev');
const pagNext  = document.getElementById('pag-next');

const updatePagination = (activeId) => {
  const idx = chapters.findIndex((ch) => ch.id === activeId);
  if (idx === -1) return;

  const prevCh = chapters[idx - 1];
  const nextCh = chapters[idx + 1];

  if (pagPrev) {
    if (prevCh) {
      pagPrev.setAttribute('href', `#${prevCh.id}`);
      const prevTitle = prevCh.querySelector('.doc-chapter__title')?.textContent ?? '';
      const prevLabel = pagPrev.querySelector('.doc-pagination__title');
      if (prevLabel) prevLabel.textContent = prevTitle;
      pagPrev.style.visibility = 'visible';
    } else {
      pagPrev.style.visibility = 'hidden';
    }
  }

  if (pagNext) {
    if (nextCh) {
      pagNext.setAttribute('href', `#${nextCh.id}`);
      const nextTitle = nextCh.querySelector('.doc-chapter__title')?.textContent ?? '';
      const nextLabel = pagNext.querySelector('.doc-pagination__title');
      if (nextLabel) nextLabel.textContent = nextTitle;
      pagNext.style.visibility = 'visible';
    } else {
      pagNext.style.visibility = 'hidden';
    }
  }
};

const chapterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updatePagination(entry.target.id);
      }
    });
  },
  { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
);

chapters.forEach((ch) => chapterObserver.observe(ch));

// Inicializar con el primer capítulo
if (chapters.length > 0) updatePagination(chapters[0].id);

// ── 10. Reducción de movimiento: desactivar animaciones ──
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.skill-bar__fill').forEach((bar) => {
    bar.style.transition = 'none';
  });
}

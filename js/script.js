/* ============================================================
   RAÍZ — Script principal
   Funcionalidades: nav scroll, menú mobile, intro effect
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. NAV — Cambio de estado al hacer scroll
  ---------------------------------------------------------- */
  const nav = document.querySelector('.nav');

  function updateNav() {
    if (window.scrollY > 60) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  if (nav) {
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav(); // Estado inicial
  }

  /* ----------------------------------------------------------
     2. MENÚ MOBILE — Toggle
  ---------------------------------------------------------- */
  const menuToggle = document.querySelector('.nav__menu-toggle');
  const navLinks   = document.querySelector('.nav__links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      const isOpen = this.getAttribute('aria-expanded') === 'true';

      this.setAttribute('aria-expanded', String(!isOpen));
      navLinks.classList.toggle('nav__links--open');
    });

    // Cerrar menú al hacer click en un link
    navLinks.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('nav__links--open');
      });
    });
  }

  /* ----------------------------------------------------------
     3. INTRO — Efecto de expansión (OrnaVillas style)
  ---------------------------------------------------------- */
  // Ejecuta el código cuando el HTML base esté listo en el navegador
  const heroSection = document.querySelector('.hero');

  if (heroSection) {
    // Espera 300ms de cortesía para que la carga visual sea limpia y quita la clase
    setTimeout(function () {
      heroSection.classList.remove('loading');
    }, 300);
  }

  
})();

/* ── Hero RAÍZ — Spotlight cursor reveal ─────────────────── */
(function () {
  const SPOTLIGHT_R = 260;

  const canvas  = document.getElementById('heroCanvas');
  const reveal  = document.getElementById('heroReveal');
  const section = canvas ? canvas.closest('.hero-raiz') : null;

  if (!canvas || !reveal || !section) return;

  // Ajustar canvas al tamaño de la ventana
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Posición raw del mouse y posición suavizada
  const mouse  = { x: -999, y: -999 };
  const smooth = { x: -999, y: -999 };
  let   raf    = null;

  // Pintar la máscara en el canvas y aplicarla al reveal
  function paintMask(x, y) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createRadialGradient(x, y, 0, x, y, SPOTLIGHT_R);
    grad.addColorStop(0,    'rgba(255,255,255,1)');
    grad.addColorStop(0.40, 'rgba(255,255,255,1)');
    grad.addColorStop(0.60, 'rgba(255,255,255,0.75)');
    grad.addColorStop(0.75, 'rgba(255,255,255,0.4)');
    grad.addColorStop(0.88, 'rgba(255,255,255,0.12)');
    grad.addColorStop(1,    'rgba(255,255,255,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    const dataURL = canvas.toDataURL();
    reveal.style.maskImage         = 'url(' + dataURL + ')';
    reveal.style.webkitMaskImage   = 'url(' + dataURL + ')';
    reveal.style.maskSize          = '100% 100%';
    reveal.style.webkitMaskSize    = '100% 100%';
  }

  // Loop de animación con lerp (suavizado)
  function loop() {
    smooth.x += (mouse.x - smooth.x) * 0.1;
    smooth.y += (mouse.y - smooth.y) * 0.1;
    paintMask(smooth.x, smooth.y);
    raf = requestAnimationFrame(loop);
  }

  // Escuchar el mouse solo dentro del hero
  section.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Ocultar el reveal cuando el mouse sale del hero
  section.addEventListener('mouseleave', function () {
    mouse.x = -999;
    mouse.y = -999;
  });

  // Arrancar el loop
  raf = requestAnimationFrame(loop);
})();

// ------------------------------------------------------------
// LÓGICA DEL CARRUSEL DE CURSOS (ESTILO APPLE TV - DESKTOP ONLY)
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.course-card');
  const prevBtn = document.getElementById('coursePrev');
  const nextBtn = document.getElementById('courseNext');
  
  if (!cards.length || !prevBtn || !nextBtn) return;

  let activeIndex = 1; 
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 4000; // 4 segundos para dar tiempo a apreciar la fluidez

  function updateCarousel() {
    cards.forEach((card) => {
      const cardIndex = parseInt(card.getAttribute('data-index'), 10);
      
      card.classList.remove('is-left', 'is-active', 'is-right');

      if (cardIndex === activeIndex) {
        card.classList.add('is-active');
      } else if (cardIndex === (activeIndex - 1 + cards.length) % cards.length) {
        card.classList.add('is-left');
      } else {
        card.classList.add('is-right');
      }
    });
  }

  // Animación secuencial cíclica automática
  function startAutoplay() {
    if (autoplayTimer) return;
    autoplayTimer = setInterval(() => {
      activeIndex = (activeIndex + 1) % cards.length;
      updateCarousel();
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Interacciones manuales que respetan el ritmo elástico
  nextBtn.addEventListener('click', () => {
    activeIndex = (activeIndex + 1) % cards.length;
    updateCarousel();
    resetAutoplay();
  });

  prevBtn.addEventListener('click', () => {
    activeIndex = (activeIndex - 1 + cards.length) % cards.length;
    updateCarousel();
    resetAutoplay();
  });

  // Pausa suave al pasar el cursor (fomenta la interacción fluida de Apple)
  const carouselWrapper = document.querySelector('.courses__carousel-container');
  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', stopAutoplay);
    carouselWrapper.addEventListener('mouseleave', startAutoplay);
  }

  // Inicialización
  updateCarousel();
  startAutoplay();
}); 

// ------------------------------------------------------------
// INTERACTIVIDAD 3D: CÁPSULA DE SILLA EN FRASE PRINCIPAL
// ------------------------------------------------------------
(function() {
  const capsule = document.getElementById('interactiveChairCapsule');
  const chair = document.getElementById('movingChair');

  // Si no existen los elementos en esta página, salimos de forma segura sin romper el resto del JS
  if (!capsule || !chair) return;

  capsule.addEventListener('mousemove', (e) => {
    const rect = capsule.getBoundingClientRect();
    
    // Coordenadas relativas respecto a la cápsula
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Grados de rotación y traslación
    const rotateX = -y * 35; 
    const rotateY = x * 45;  
    const translateX = x * 15; 

    chair.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) scale(1.15)`;
  });

  // Retorno elástico al salir
  capsule.addEventListener('mouseleave', () => {
    chair.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    chair.style.transform = 'rotateX(0deg) rotateY(0deg) translateX(0px) scale(1)';
  });

  // Respuesta inmediata al entrar
  capsule.addEventListener('mouseenter', () => {
    chair.style.transition = 'transform 0.1s ease-out';
  });
})();

// ------------------------------------------------------------
// ANIMACIÓN ESCALONADA: PILARES EDITORIALES (CARDS)
// ------------------------------------------------------------
(function() {
  const cards = document.querySelectorAll('.js-scroll-reveal');
  if (!cards.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px', // Se dispara un poco antes de llegar del todo
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      // Si entra en el campo visual
      if (entry.isIntersecting) {
        // Recorremos las tarjetas y les aplicamos el delay secuencial
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('is-visible');
          }, index * 80); // Delay exacto de 80ms entre cada una
        });

        // Dejamos de observar para que se ejecute una sola vez
        observer.disconnect();
      }
    });
  }, observerOptions);

  // Inicializamos la observación sobre el contenedor de la cuadrícula
  const grid = document.querySelector('.pillars-grid');
  if (grid) observer.observe(grid);
})();

// ------------------------------------------------------------
// INTERACTION: FLIP 3D EN CARDS PILARES (DESKTOP & MOBILE)
// ------------------------------------------------------------
(function() {
  const pCards = document.querySelectorAll('.pillar-card');
  if (!pCards.length) return;

  pCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Alternamos el estado de rotación de forma segura
      const isFlipped = this.getAttribute('data-flipped') === 'true';
      
      if (!isFlipped) {
        this.classList.add('is-flipped');
        this.setAttribute('data-flipped', 'true');
      } else {
        this.classList.remove('is-flipped');
        this.setAttribute('data-flipped', 'false');
      }
    });
  });
})();

/* ==========================================================================
   EDITORIAL — scroll-driven interaction (Versión Full Screen Completa)
   ========================================================================== */

(function () {
  'use strict';

  const section = document.getElementById('editorial');
  if (!section) return;

  const textGroup = document.getElementById('editorialTextGroup');
  const scrim = document.getElementById('editorialScrim');
  const media = document.getElementById('editorialMedia');
  const video = media?.querySelector('video');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.innerWidth < 760;

  function initSimpleMode() {
    section.classList.add('is-simple');
    section.classList.remove('editorial--no-js');
    if (media) media.style.opacity = "1";
    if (video) video.play().catch(() => {});
  }

  function initScrollMode() {
    section.classList.remove('editorial--no-js', 'is-simple');

    const P1_FADE_END   = 0.20; 
    const P2_MOVE_START = 0.20; 
    const P2_MOVE_END   = 0.65; 
    
    // El video empieza a aparecer un poquito antes de que el texto se termine de acomodar
    const P3_VIDEO_START = 0.40;
    const P3_VIDEO_END   = 0.75;

    let metrics = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function clamp01(v) {
      return Math.min(1, Math.max(0, v));
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    // 👈 MODIFICADO: Ajustá este 42 o 48 para cambiar el tamaño final del texto en Desktop
    function getTargetScale() {
      const vw = window.innerWidth;
      const targetSize = (vw < 1280) ? 28 : 46; 
      const titleEl = textGroup.querySelector('.editorial__title');
      const currentHeroSize = parseFloat(window.getComputedStyle(titleEl).fontSize);
      return currentHeroSize > 0 ? (targetSize / currentHeroSize) : 0.6;
    }

    function measure() {
      textGroup.style.transform = 'none';
      textGroup.style.top = '';
      textGroup.style.left = '';
      textGroup.style.position = 'absolute';

      const gutter = parseFloat(window.getComputedStyle(section).getPropertyValue('--gutter')) || 24;
      
      // 👈 COORDENADAS: Más aire respecto al lateral izquierdo y barra superior de RAÍZ
      const targetLeft = gutter + 50; 
      const targetTop = gutter + 110; 

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      metrics = {
        startX: vw / 2,
        startY: vh / 2,
        endX: targetLeft,
        endY: targetTop,
        targetScale: getTargetScale()
      };
    }

    function applyFrame(progress) {
      if (!metrics) return;

      // ---- PASO 1: Aparición en el centro ----
      const fadeT = easeOutCubic(clamp01(progress / P1_FADE_END));

      // ---- PASO 2: Desplazamiento y alineación ----
      const moveProgress = clamp01((progress - P2_MOVE_START) / (P2_MOVE_END - P2_MOVE_START));
      const moveT = easeOutCubic(moveProgress);

      if (moveT === 0) {
        textGroup.style.top = '50%';
        textGroup.style.left = '50%';
        textGroup.style.transform = `translate(-50%, -50%) scale(1)`;
        textGroup.style.alignItems = 'center';
      } else {
        const currentX = lerp(metrics.startX, metrics.endX, moveT);
        const currentY = lerp(metrics.startY, metrics.endY, moveT);
        const currentScale = lerp(1, metrics.targetScale, moveT);

        textGroup.style.top = '0px';
        textGroup.style.left = '0px';
        
        const offsetX = lerp(-50, 0, moveT);
        const offsetY = lerp(-50, 0, moveT);
        
        textGroup.style.transform = `translate(${currentX}px, ${currentY}px) translate(${offsetX}%, ${offsetY}%) scale(${currentScale})`;
        
        if (moveT > 0.5) {
          textGroup.style.alignItems = 'flex-start';
        } else {
          textGroup.style.alignItems = 'center';
        }
      }

      textGroup.style.opacity = String(fadeT);

      // Fondo blur del título (scrim)
      const scrimT = clamp01((moveT - 0.75) / 0.25);
      scrim.style.opacity = String(scrimT);

      // ---- PASO 3: Revelación del Video Full Screen ----
      const videoProgress = clamp01((progress - P3_VIDEO_START) / (P3_VIDEO_END - P3_VIDEO_START));
      const videoT = easeOutCubic(videoProgress);

      // Forzamos que la opacidad de la caja del video suba con el scroll
      if (media) {
        media.style.opacity = String(videoT);
      }
    }

    let ticking = false;
    let scrollDistance = 0;

    function recalcScrollDistance() {
      scrollDistance = section.offsetHeight - window.innerHeight;
    }

    function onScrollTick() {
      const rect = section.getBoundingClientRect();
      const scrolled = -rect.top;
      const progress = scrollDistance > 0 ? clamp01(scrolled / scrollDistance) : 0;

      applyFrame(progress);

      // Control estricto de reproducción basado en visibilidad
      if (video) {
        if (progress > 0.15 && progress < 0.98) {
          if (video.paused) {
            video.play().catch(err => console.log("Esperando interacción de usuario para video", err));
          }
        } else {
          if (!video.paused) video.pause();
        }
      }

      ticking = false;
    }

    function requestTick() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScrollTick);
      }
    }

    let resizeTimeout;
    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        measure();
        recalcScrollDistance();
        requestTick();
      }, 150);
    }

    measure();
    recalcScrollDistance();
    requestTick();

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', onResize);
  }

  function boot() {
    if (isMobile() || prefersReducedMotion) {
      initSimpleMode();
    } else {
      initScrollMode();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     Referencias
     ============================================================ */
  const stage    = document.getElementById('tourStage');
  const line     = document.getElementById('connectorLine');
  const hotspots = Array.from(document.querySelectorAll('.hotspot'));

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ============================================================
     HOTSPOTS — hover (desktop) + click/tap (siempre), uno activo
     a la vez, con línea conectora + tooltip posicionados en JS.
     ============================================================ */
  let pinnedId = null;
  let hoverId  = null;
  let activeId = null;

  function activeIdValue(){ return pinnedId ?? hoverId; }

  function setState(id){
    activeId = id;

    hotspots.forEach(h => {
      const isOn = h.dataset.id === String(id);
      h.classList.toggle('is-active', isOn);
      h.setAttribute('aria-expanded', String(isOn));
    });

    document.querySelectorAll('.tour-tooltip').forEach(t => {
      t.classList.toggle('is-visible', t.dataset.tooltipFor === String(id));
    });

    line.classList.toggle('is-visible', id !== null);

    if (id !== null) positionTooltip(id);
  }

  function positionTooltip(id){
    const dot = hotspots.find(h => h.dataset.id === String(id));
    const tooltip = document.getElementById('tooltip-' + id);
    if (!dot || !tooltip) return;

    const stageRect = stage.getBoundingClientRect();
    const dotRect = dot.getBoundingClientRect();

    // centro del punto, en coordenadas relativas al stage
    const dotX = dotRect.left + dotRect.width / 2 - stageRect.left;
    const dotY = dotRect.top + dotRect.height / 2 - stageRect.top;

    const dotXPercent = dotX / stageRect.width;
    const side = dotXPercent > 0.5 ? 'left' : 'right'; // abre hacia el lado con más espacio
    const gap = 26;

    const tooltipWidth = tooltip.offsetWidth || 222;
    let left = side === 'right' ? dotX + gap : dotX - gap - tooltipWidth;
    let top = dotY - (tooltip.offsetHeight || 70) / 2;

    // clamp para que nunca se salga del stage (clave en mobile)
    const margin = 4;
    left = Math.max(margin, Math.min(left, stageRect.width - tooltipWidth - margin));
    top = Math.max(margin, Math.min(top, stageRect.height - (tooltip.offsetHeight || 70) - margin));

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    // línea conectora: del punto al borde más cercano del tooltip
    const lineX2 = side === 'right' ? left : left + tooltipWidth;
    const lineY2 = top + (tooltip.offsetHeight || 70) / 2;

    line.setAttribute('x1', dotX);
    line.setAttribute('y1', dotY);
    line.setAttribute('x2', lineX2);
    line.setAttribute('y2', lineY2);
  }

  hotspots.forEach(dot => {
    const id = dot.dataset.id;

    if (canHover){
      dot.addEventListener('mouseenter', () => { hoverId = id; setState(activeIdValue()); });
      dot.addEventListener('mouseleave', () => { hoverId = null; setState(activeIdValue()); });
    }

    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      pinnedId = (pinnedId === id) ? null : id;
      setState(activeIdValue());
    });

    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Escape'){ pinnedId = null; hoverId = null; setState(null); dot.blur(); }
    });
  });

  // cerrar al hacer click fuera de un hotspot o de un tooltip
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.hotspot') && !e.target.closest('.tour-tooltip')){
      pinnedId = null;
      hoverId = null;
      setState(null);
    }
  });

  // recalcular posición si cambia el tamaño de la ventana
  window.addEventListener('resize', () => { if (activeId !== null) positionTooltip(activeId); });
});

document.addEventListener('DOMContentLoaded', () => {

  const circle = document.getElementById('capsuleCircle');
  if (!circle) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // en mobile la sección destruye el círculo por CSS; ni siquiera
  // vale la pena correr el loop de animación.
  if (!canHover || prefersReducedMotion) return;

  /* ============================================================
     Giro continuo con velocidad interpolada (acelera al entrar,
     desacelera al salir en vez de cortar en seco).
     ============================================================ */
  const SPEED = 0.018;  // grados por milisegundo en velocidad crucero
  const EASE  = 0.035;  // qué tan rápido la velocidad alcanza el objetivo

  let spin = 0;
  let velocity = 0;
  let targetVelocity = 0;
  let lastTime = null;
  let rafId = null;

  function tick(time){
    if (lastTime === null) lastTime = time;
    const delta = time - lastTime;
    lastTime = time;

    velocity += (targetVelocity - velocity) * EASE;
    spin += velocity * delta;

    // Única escritura por frame: .capsule-card__inner hereda --spin
    // y se auto-corrige, sin tocar las 8 tarjetas desde JS.
    circle.style.setProperty('--spin', `${spin}deg`);

    const stillMoving = Math.abs(velocity) > 0.0005 || targetVelocity !== 0;
    if (stillMoving){
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      lastTime = null;
    }
  }

  function ensureLoopRunning(){
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  circle.addEventListener('mouseenter', () => {
    targetVelocity = SPEED;
    ensureLoopRunning();
  });

  circle.addEventListener('mouseleave', () => {
    targetVelocity = 0;
    ensureLoopRunning();
  });
});
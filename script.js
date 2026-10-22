"use strict";
/* =========================================================
   NEXO STUDIO — COMPLETO
   ========================================================= */

const WHATSAPP_NUMBER = "573204273991";
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 721px)");

/* =========================================================
   WHATSAPP
   ========================================================= */
function getWhatsAppUrl(message) {
  const number = String(WHATSAPP_NUMBER).replace(/\D/g, "");
  if (!number || number.length < 10 || number.length > 15) {
    console.error("Revisa el número de WhatsApp.");
    return null;
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
function openWhatsApp(message) {
  const url = getWhatsAppUrl(message);
  if (!url) {
    alert("No se pudo preparar WhatsApp. Revisa el número.");
    return;
  }
  window.location.href = url;
}
const generalMessage = "Hola, Nexo Studio. Quiero información sobre sus servicios de diseño y desarrollo web.";
function configureWhatsAppLink(element, message) {
  if (!element) return;
  const url = getWhatsAppUrl(message);
  if (url) {
    element.href = url;
    element.target = "_blank";
    element.rel = "noopener noreferrer";
  } else {
    element.href = "#";
    element.addEventListener("click", e => {
      e.preventDefault();
      openWhatsApp(message);
    });
  }
}

/* =========================================================
   AÑO AUTOMÁTICO
   ========================================================= */
const yearElement = $("#year");
const yearFooter = $("#year-footer");
if (yearElement) yearElement.textContent = new Date().getFullYear();
if (yearFooter) yearFooter.textContent = new Date().getFullYear();

/* =========================================================
   MENÚ RESPONSIVE
   ========================================================= */
const menuButton = $("#menu");
const navigation = $("#nav");
function closeMenu() {
  if (!menuButton || !navigation) return;
  navigation.classList.remove("open");
  document.body.classList.remove("menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menú");
}
if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
    navigation.classList.toggle("open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });
  $$("a", navigation).forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", e => e.key === "Escape" && closeMenu());
  window.addEventListener("resize", () => window.innerWidth > 720 && closeMenu());
}

/* =========================================================
   HEADER AL DESPLAZARSE
   ========================================================= */
const header = $("#header");
function updateHeader() {
  if (!header) return;
  header.classList.toggle("header-scrolled", window.scrollY > 25);
}
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

/* =========================================================
   ANIMACIONES DE ENTRADA
   ========================================================= */
const revealElements = $$(".reveal");
if ("IntersectionObserver" in window && !reduceMotion.matches) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" })
  .observe(revealElements[0]);
  revealElements.forEach(el => revealObserver.observe(el));
} else {
  revealElements.forEach(el => el.classList.add("visible"));
}

/* =========================================================
   MALLA 3D — INTEGRADA AL FONDO
   ========================================================= */
(function initializeInteractiveMesh() {
  const canvas = $("#mesh-canvas");
  const heroArt = $("#hero-art");
  if (!canvas || !heroArt) {
    console.warn("No se encontró el canvas o el contenedor de la malla.");
    return;
  }
  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!ctx) {
    console.warn("El navegador no puede crear el lienzo.");
    return;
  }

  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: false, pressed: false };
  const settings = {
    spacing: 18,
    mobileSpacing: 21,
    perspective: 560,
    depth: 390,
    amplitude: 36,
    interactionRadius: 135,
    interactionStrength: 46,
    speed: 0.00042,
    pixelRatioLimit: 2,
    maxPoints: 1900
  };

  let width = 0, height = 0, dpr = 1, columns = 0, rows = 0;
  let points = [];
  let animationFrame = 0, lastTime = 0, elapsed = 0;
  let visible = true, disposed = false;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(x) { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); }

  function buildGrid() {
    const spacing = width < 480 ? settings.mobileSpacing : settings.spacing;
    columns = Math.max(12, Math.ceil(width / spacing) + 1);
    rows = Math.max(14, Math.ceil(height / spacing) + 1);
    while (columns * rows > settings.maxPoints) {
      columns = Math.max(12, Math.floor(columns * 0.94));
      rows = Math.max(14, Math.floor(rows * 0.94));
    }
    points = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        points.push({
          column: c, row: r,
          baseX: (c / (columns - 1) - 0.5) * width,
          baseY: (r / (rows - 1) - 0.5) * height,
          x: 0, y: 0, z: 0,
          screenX: 0, screenY: 0,
          scale: 1, alpha: 1, brightness: 0
        });
      }
    }
  }

  function resizeCanvas() {
    if (disposed) return;
    const rect = heroArt.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, settings.pixelRatioLimit);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGrid();
    drawFrame(0, true);
  }

  function terrainHeight(x, y, time) {
    const nx = x / Math.max(width, 1);
    const ny = y / Math.max(height, 1);
    const w1 = Math.sin(nx * 9.2 + time * 0.8) * Math.cos(ny * 5.6 - time * 0.55);
    const w2 = Math.sin(nx * 16.0 - ny * 7.5 + time * 0.45);
    const w3 = Math.cos(nx * 5.5 + ny * 10.5 - time * 0.32);
    const p1x = width * 0.35, p1y = height * 0.42;
    const p2x = width * 0.72, p2y = height * 0.58;
    const d1 = Math.hypot(x - p1x, (y - p1y) * 1.05);
    const d2 = Math.hypot(x - p2x, (y - p2y) * 1.1);
    const pk1 = Math.exp(-d1 / Math.max(width * 0.22, 1));
    const pk2 = Math.exp(-d2 / Math.max(width * 0.19, 1));
    return w1 * 21 + w2 * 7 + w3 * 5 + pk1 * 33 + pk2 * 24;
  }

  function setPointer(e) {
    const rect = heroArt.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointer.targetX = e.clientX - rect.left;
    pointer.targetY = e.clientY - rect.top;
    pointer.active = true;
  }
  function resetPointer() { pointer.active = false; pointer.pressed = false; }

  heroArt.addEventListener("pointermove", setPointer, { passive: true });
  heroArt.addEventListener("pointerenter", setPointer);
  heroArt.addEventListener("pointerleave", resetPointer);
  heroArt.addEventListener("pointerdown", e => { setPointer(e); pointer.pressed = true; }, { passive: true });
  heroArt.addEventListener("pointerup", () => pointer.pressed = false, { passive: true });
  heroArt.addEventListener("pointercancel", resetPointer);

  function projectPoint(p) {
    const cx = width * 0.5, cy = height * 0.5;
    const camDist = settings.perspective;
    const depthPos = p.z + settings.depth * 0.5;
    const persp = camDist / Math.max(150, camDist + depthPos);
    p.scale = persp;
    p.screenX = cx + p.x * persp;
    p.screenY = cy + p.y * persp;
    const ex = Math.abs(p.baseX / Math.max(width * 0.5, 1));
    const ey = Math.abs(p.baseY / Math.max(height * 0.5, 1));
    const fade = 1 - Math.max(ex * 0.4, ey * 0.22);
    p.alpha = clamp((0.42 + persp * 0.65) * fade, 0.12, 1);
    return p;
  }

  function updatePoints(time, delta) {
    const followSpeed = pointer.active ? 0.12 : 0.055;
    pointer.x = lerp(pointer.x, pointer.active ? pointer.targetX : width * 0.5, followSpeed);
    pointer.y = lerp(pointer.y, pointer.active ? pointer.targetY : height * 0.5, followSpeed);
    const cx = width * 0.5, cy = height * 0.5;

    for (const p of points) {
      const x = p.baseX, y = p.baseY;
      let h = reduceMotion.matches ? terrainHeight(x, y, 0) : terrainHeight(x, y, time);

      if (pointer.active) {
        const dx = x - pointer.x, dy = y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < settings.interactionRadius) {
          const influence = 1 - smoothstep(dist / settings.interactionRadius);
          const strength = pointer.pressed ? settings.interactionStrength * 1.35 : settings.interactionStrength;
          h += influence * strength;
        }
      }

      const tiltX = pointer.active ? ((pointer.y / Math.max(height, 1)) - 0.5) * 0.11 : 0;
      const tiltY = pointer.active ? ((pointer.x / Math.max(width, 1)) - 0.5) * 0.13 : 0;
      p.x = x + (y - cy) * tiltX;
      p.y = y + (x - cx) * tiltY;
      p.z = h;
      projectPoint(p);

      const d = Math.hypot(p.screenX - pointer.x, p.screenY - pointer.y);
      p.brightness = pointer.active ? 1 - smoothstep(d / 150) : 0;
    }
  }

  function drawConnections() {
    ctx.save();
    ctx.lineWidth = 0.55;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const i = r * columns + c;
        const p = points[i];
        if (c < columns - 1) {
          const right = points[i + 1];
          const a = (p.alpha + right.alpha) * 0.5;
          ctx.strokeStyle = `rgba(130, 255, 78, ${a * 0.085})`;
          ctx.beginPath();
          ctx.moveTo(p.screenX, p.screenY);
          ctx.lineTo(right.screenX, right.screenY);
          ctx.stroke();
        }
        if (r < rows - 1) {
          const below = points[i + columns];
          const a = (p.alpha + below.alpha) * 0.5;
          ctx.strokeStyle = `rgba(130, 255, 78, ${a * 0.07})`;
          ctx.beginPath();
          ctx.moveTo(p.screenX, p.screenY);
          ctx.lineTo(below.screenX, below.screenY);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function drawPoints() {
    for (const p of points) {
      const baseRadius = 0.85 + p.scale * 0.7;
      const glow = p.brightness;
      const radius = baseRadius + glow * 1.15;
      const alpha = p.alpha;

      if (glow > 0.06) {
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, radius * (2.2 + glow), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(117, 255, 57, ${glow * alpha * 0.12})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.screenX, p.screenY, radius, 0, Math.PI * 2);
      const green = Math.round(190 + glow * 65);
      const red = Math.round(111 + glow * 65);
      const blue = Math.round(46 + glow * 9);
      ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * (0.45 + glow * 0.35)})`;
      ctx.fill();
    }
  }

  function drawAmbientGlow() {
    const grad = ctx.createRadialGradient(
      width * 0.5, height * 0.48, 0,
      width * 0.5, height * 0.48, Math.max(width, height) * 0.6
    );
    grad.addColorStop(0, "rgba(69, 255, 39, 0.025)");
    grad.addColorStop(0.5, "rgba(69, 255, 39, 0.01)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  function drawFrame(ts, staticFrame = false) {
    if (disposed || !width || !height) return;
    const delta = lastTime ? Math.min(ts - lastTime, 32) : 16;
    lastTime = ts;
    if (!staticFrame && !reduceMotion.matches) elapsed += delta * settings.speed;

    ctx.clearRect(0, 0, width, height);
    drawAmbientGlow();
    updatePoints(elapsed, delta);
    drawConnections();
    drawPoints();
  }

  function animate(ts) {
    animationFrame = 0;
    if (disposed || !visible || document.hidden) return;
    drawFrame(ts);
    if (!reduceMotion.matches) animationFrame = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (disposed || !visible || document.hidden) return;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (reduceMotion.matches) { drawFrame(0, true); return; }
    lastTime = 0;
    animationFrame = requestAnimationFrame(animate);
  }
  function stopAnimation() {
    if (!animationFrame) return;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        visible = e.isIntersecting;
        visible ? startAnimation() : stopAnimation();
      });
    }, { threshold: 0.01 }).observe(heroArt);
  }
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stopAnimation() : startAnimation();
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resizeCanvas(); startAnimation(); }, 100);
  }, { passive: true });

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => { resizeCanvas(); startAnimation(); }).observe(heroArt);
  }

  window.addEventListener("pagehide", () => {
    disposed = true;
    stopAnimation();
  }, { once: true });

  resizeCanvas();
  startAnimation();
  console.info("Malla 3D integrada correctamente ✅");
})();

/* =========================================================
   BRILLO DEL CURSOR
   ========================================================= */
const cursorGlow = $(".cursor-glow");
if (cursorGlow && desktopPointer.matches && !reduceMotion.matches) {
  window.addEventListener("pointermove", e => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  }, { passive: true });
}

/* =========================================================
   ENLACES DE WHATSAPP
   ========================================================= */
configureWhatsAppLink($("#direct-whatsapp"), generalMessage);
configureWhatsAppLink($("#footer-whatsapp"), generalMessage);

/* =========================================================
   BOTONES DE PAQUETES
   ========================================================= */
$$(".choose-plan").forEach(btn => {
  btn.addEventListener("click", () => {
    const plan = btn.dataset.plan || "Personalizado";
    const msg = [
      "Hola, Nexo Studio.",
      "",
      `Me interesa el paquete ${plan}.`,
      "Me gustaría saber qué incluye, el tiempo de entrega y las condiciones."
    ].join("\n");
    openWhatsApp(msg);
  });
});

/* =========================================================
   SERVICIOS Y PORTAFOLIO
   ========================================================= */
const serviceMap = {
  "Estrategia digital": "No lo tengo definido",
  "Diseño de experiencias": "Diseño visual",
  "Desarrollo web": "Web corporativa"
};
$$("[data-service]").forEach(link => {
  link.addEventListener("click", () => {
    const svc = link.dataset.service;
    const select = $("#servicio");
    const detalles = $("#detalles");
    if (!svc) return;
    if (select) {
      const val = serviceMap[svc] || svc;
      const opt = Array.from(select.options).find(o => o.value === val);
      if (opt) opt.selected = true;
    }
    if (detalles && !detalles.value.trim()) {
      detalles.value = `Me interesa el servicio de ${svc}.`;
    }
  });
});
$$("[data-project]").forEach(p => {
  p.addEventListener("click", () => {
    const name = p.dataset.project;
    const detalles = $("#detalles");
    if (!detalles || !name) return;
    detalles.value = `Me interesa un proyecto similar a "${name}". Quiero una propuesta para mi marca.`;
  });
});

/* =========================================================
   FORMULARIO DE CONTACTO
   ========================================================= */
const contactForm = $("#contact-form");
const formStatus = $("#form-status");
if (contactForm) {
  contactForm.addEventListener("submit", e => {
    e.preventDefault();
    if (!contactForm.reportValidity()) return;
    const fd = new FormData(contactForm);
    const nombre = String(fd.get("nombre") || "").trim();
    const correo = String(fd.get("correo") || "").trim();
    const servicio = String(fd.get("servicio") || "").trim();
    const presupuesto = String(fd.get("presupuesto") || "Por definir").trim();
    const detalles = String(fd.get("detalles") || "").trim();
    const msg = [
      "Hola, Nexo Studio. Quiero solicitar una propuesta.",
      "",
      `Nombre: ${nombre}`,
      `Correo: ${correo}`,
      `Servicio: ${servicio}`,
      `Presupuesto: ${presupuesto}`,
      "",
      "Detalles:",
      detalles || "Me gustaría recibir asesoría.",
      "",
      "Quedo atento/a a su respuesta."
    ].join("\n");
    const url = getWhatsAppUrl(msg);
    if (!url) {
      if (formStatus) formStatus.textContent = "Error al preparar el enlace.";
      return;
    }
    if (formStatus) formStatus.textContent = "Abriendo WhatsApp...";
    window.location.href = url;
  });
}

/* =========================================================
   NAVEGACIÓN SUAVE
   ========================================================= */
$$('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") { e.preventDefault(); return; }
    let target;
    try { target = $(targetId); } catch { return; }
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({
      behavior: reduceMotion.matches ? "auto" : "smooth",
      block: "start"
    });
    history.replaceState?.({}, "", targetId);
  });
});

/* =========================================================
   IMÁGENES DEL PORTAFOLIO
   ========================================================= */
$$(".project-image img").forEach(img => {
  img.addEventListener("error", () => {
    img.style.opacity = "0";
    const parent = img.closest(".project-image");
    if (parent) {
      parent.style.background = "radial-gradient(ellipse at 50% 40%, #23432e, #0b100d 72%)";
    }
  });
});

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */
document.documentElement.classList.add("js-ready");
console.info("Nexo Studio — Todo listo ✅");

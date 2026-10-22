
"use strict";

/* =========================================================
   NEXO STUDIO — INTERACCIONES PRINCIPALES
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
    console.error("Revisa el número de WhatsApp configurado.");
    return null;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
  const url = getWhatsAppUrl(message);

  if (!url) {
    alert("No se pudo preparar WhatsApp. Revisa el número configurado.");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

const generalMessage =
  "Hola, Nexo Studio. Quiero información sobre sus servicios de diseño y desarrollo web.";

function configureWhatsAppLink(element, message = generalMessage) {
  if (!element) return;

  const url = getWhatsAppUrl(message);

  if (url) {
    element.href = url;
    element.target = "_blank";
    element.rel = "noopener noreferrer";
  }
}

configureWhatsAppLink($("#direct-whatsapp"));
configureWhatsAppLink($("#footer-whatsapp"));

/* =========================================================
   AÑO AUTOMÁTICO
   ========================================================= */

const currentYear = new Date().getFullYear();

if ($("#year")) $("#year").textContent = currentYear;
if ($("#year-footer")) $("#year-footer").textContent = currentYear;

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
    const nextOpen = !isOpen;

    menuButton.setAttribute("aria-expanded", String(nextOpen));
    menuButton.setAttribute(
      "aria-label",
      nextOpen ? "Cerrar menú" : "Abrir menú"
    );

    navigation.classList.toggle("open", nextOpen);
    document.body.classList.toggle("menu-open", nextOpen);
  });

  $$("a", navigation).forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) closeMenu();
  });
}

/* =========================================================
   CABECERA AL DESPLAZARSE
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
   Corrección: se conserva la instancia del observador.
   ========================================================= */

const revealElements = $$(".reveal");

if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.10,
    rootMargin: "0px 0px -35px 0px"
  });

  revealElements.forEach(element => revealObserver.observe(element));
} else {
  revealElements.forEach(element => element.classList.add("visible"));
}

/* =========================================================
   MALLA 3D INTERACTIVA
   Fondo transparente, puntos luminosos y relieve ondulado.
   ========================================================= */

(function initializeInteractiveMesh() {
  const canvas = $("#mesh-canvas");
  const heroArt = $("#hero-art");

  if (!canvas || !heroArt) return;

  const ctx = canvas.getContext("2d", {
    alpha: true,
    desynchronized: true
  });

  if (!ctx) return;

  const settings = {
    spacingDesktop: 17,
    spacingMobile: 20,
    maxPoints: 1800,
    perspective: 560,
    depth: 260,
    interactionRadius: 145,
    interactionStrength: 45,
    pixelRatioLimit: 1.75,
    speed: 0.00045
  };

  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false,
    pressed: false
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let columns = 0;
  let rows = 0;
  let points = [];
  let elapsed = 0;
  let lastTime = 0;
  let animationFrame = 0;
  let visible = true;
  let disposed = false;

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  const lerp = (a, b, t) =>
    a + (b - a) * t;

  const smoothstep = value => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };

  function buildGrid() {
    const spacing = width < 480
      ? settings.spacingMobile
      : settings.spacingDesktop;

    columns = Math.max(12, Math.ceil(width / spacing) + 1);
    rows = Math.max(12, Math.ceil(height / spacing) + 1);

    while (columns * rows > settings.maxPoints) {
      columns = Math.max(12, Math.floor(columns * 0.95));
      rows = Math.max(12, Math.floor(rows * 0.95));
    }

    points = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        points.push({
          column: c,
          row: r,
          baseX: (c / (columns - 1) - 0.5) * width,
          baseY: (r / (rows - 1) - 0.5) * height,
          x: 0,
          y: 0,
          z: 0,
          screenX: 0,
          screenY: 0,
          scale: 1,
          alpha: 1,
          brightness: 0
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

    pointer.x = width * 0.5;
    pointer.y = height * 0.5;
    pointer.targetX = pointer.x;
    pointer.targetY = pointer.y;

    buildGrid();
    drawFrame(0, true);
  }

  function terrainHeight(x, y, time) {
    const nx = x / Math.max(width, 1);
    const ny = y / Math.max(height, 1);

    const waveA =
      Math.sin(nx * 9.2 + time * 0.8) *
      Math.cos(ny * 5.6 - time * 0.55);

    const waveB =
      Math.sin(nx * 16 - ny * 7.5 + time * 0.45);

    const waveC =
      Math.cos(nx * 5.5 + ny * 10.5 - time * 0.32);

    const peak1 = Math.exp(
      -Math.hypot(x - width * 0.36, (y - height * 0.44) * 1.1) /
      Math.max(width * 0.23, 1)
    );

    const peak2 = Math.exp(
      -Math.hypot(x - width * 0.73, (y - height * 0.59) * 1.1) /
      Math.max(width * 0.20, 1)
    );

    return (
      waveA * 23 +
      waveB * 8 +
      waveC * 5 +
      peak1 * 32 +
      peak2 * 24
    );
  }

  function projectPoint(point) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    const depthPosition = point.z + settings.depth * 0.5;
    const perspective = settings.perspective /
      Math.max(150, settings.perspective + depthPosition);

    point.scale = perspective;
    point.screenX = centerX + point.x * perspective;
    point.screenY = centerY + point.y * perspective;

    const edgeX = Math.abs(point.baseX / Math.max(width * 0.5, 1));
    const edgeY = Math.abs(point.baseY / Math.max(height * 0.5, 1));

    const fade = 1 - Math.max(edgeX * 0.38, edgeY * 0.22);

    point.alpha = clamp(
      (0.42 + perspective * 0.65) * fade,
      0.08,
      1
    );
  }

  function updatePoints(time) {
    const follow = pointer.active ? 0.12 : 0.055;

    pointer.x = lerp(
      pointer.x,
      pointer.active ? pointer.targetX : width * 0.5,
      follow
    );

    pointer.y = lerp(
      pointer.y,
      pointer.active ? pointer.targetY : height * 0.5,
      follow
    );

    const centerX = width * 0.5;
    const centerY = height * 0.5;

    for (const point of points) {
      const x = point.baseX;
      const y = point.baseY;

      let z = terrainHeight(
        x,
        y,
        reduceMotion.matches ? 0 : time
      );

      if (pointer.active) {
        const distance = Math.hypot(
          x - pointer.x,
          y - pointer.y
        );

        if (distance < settings.interactionRadius) {
          const influence = 1 - smoothstep(
            distance / settings.interactionRadius
          );

          const strength = pointer.pressed
            ? settings.interactionStrength * 1.3
            : settings.interactionStrength;

          z += influence * strength;
        }
      }

      const tiltX = pointer.active
        ? ((pointer.y / Math.max(height, 1)) - 0.5) * 0.11
        : 0;

      const tiltY = pointer.active
        ? ((pointer.x / Math.max(width, 1)) - 0.5) * 0.13
        : 0;

      point.x = x + (y - centerY) * tiltX;
      point.y = y + (x - centerX) * tiltY;
      point.z = z;

      projectPoint(point);

      const pointerDistance = Math.hypot(
        point.screenX - pointer.x,
        point.screenY - pointer.y
      );

      point.brightness = pointer.active
        ? 1 - smoothstep(pointerDistance / 150)
        : 0;
    }
  }

  function drawAmbientGlow() {
    const gradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.48,
      0,
      width * 0.5,
      height * 0.48,
      Math.max(width, height) * 0.6
    );

    gradient.addColorStop(0, "rgba(69, 255, 39, 0.035)");
    gradient.addColorStop(0.5, "rgba(69, 255, 39, 0.012)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawConnections() {
    ctx.save();
    ctx.lineWidth = 0.55;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const index = r * columns + c;
        const point = points[index];

        if (c < columns - 1) {
          const right = points[index + 1];
          const alpha = (point.alpha + right.alpha) * 0.5;

          ctx.strokeStyle = `rgba(130, 255, 78, ${alpha * 0.085})`;
          ctx.beginPath();
          ctx.moveTo(point.screenX, point.screenY);
          ctx.lineTo(right.screenX, right.screenY);
          ctx.stroke();
        }

        if (r < rows - 1) {
          const below = points[index + columns];
          const alpha = (point.alpha + below.alpha) * 0.5;

          ctx.strokeStyle = `rgba(130, 255, 78, ${alpha * 0.07})`;
          ctx.beginPath();
          ctx.moveTo(point.screenX, point.screenY);
          ctx.lineTo(below.screenX, below.screenY);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  function drawPoints() {
    for (const point of points) {
      const glow = point.brightness;
      const radius = 0.85 + point.scale * 0.7 + glow * 1.15;
      const alpha = point.alpha;

      if (glow > 0.06) {
        ctx.beginPath();
        ctx.arc(
          point.screenX,
          point.screenY,
          radius * (2.2 + glow),
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(117, 255, 57, ${glow * alpha * 0.12})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(point.screenX, point.screenY, radius, 0, Math.PI * 2);

      const red = Math.round(111 + glow * 65);
      const green = Math.round(190 + glow * 65);
      const blue = Math.round(46 + glow * 9);

      ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * (0.45 + glow * 0.35)})`;
      ctx.fill();
    }
  }

  function drawFrame(timestamp, staticFrame = false) {
    if (disposed || !width || !height) return;

    const delta = lastTime
      ? Math.min(timestamp - lastTime, 32)
      : 16;

    lastTime = timestamp;

    if (!staticFrame && !reduceMotion.matches) {
      elapsed += delta * settings.speed;
    }

    ctx.clearRect(0, 0, width, height);

    drawAmbientGlow();
    updatePoints(elapsed);
    drawConnections();
    drawPoints();
  }

  function animate(timestamp) {
    animationFrame = 0;

    if (disposed || !visible || document.hidden) return;

    drawFrame(timestamp);

    if (!reduceMotion.matches) {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function stopAnimation() {
    if (!animationFrame) return;

    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function startAnimation() {
    if (disposed || !visible || document.hidden) return;

    stopAnimation();

    if (reduceMotion.matches) {
      drawFrame(0, true);
      return;
    }

    lastTime = 0;
    animationFrame = requestAnimationFrame(animate);
  }

  function setPointer(event) {
    const rect = heroArt.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    pointer.targetX = event.clientX - rect.left;
    pointer.targetY = event.clientY - rect.top;
    pointer.active = true;
  }

  function resetPointer() {
    pointer.active = false;
    pointer.pressed = false;
  }

  heroArt.addEventListener("pointermove", setPointer, { passive: true });
  heroArt.addEventListener("pointerenter", setPointer);
  heroArt.addEventListener("pointerleave", resetPointer);

  heroArt.addEventListener("pointerdown", event => {
    setPointer(event);
    pointer.pressed = true;
  }, { passive: true });

  heroArt.addEventListener("pointerup", () => {
    pointer.pressed = false;
  }, { passive: true });

  heroArt.addEventListener("pointercancel", resetPointer);

  if ("IntersectionObserver" in window) {
    const meshObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        visible = entry.isIntersecting;

        if (visible) {
          startAnimation();
        } else {
          stopAnimation();
        }
      });
    }, { threshold: 0.01 });

    meshObserver.observe(heroArt);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  let resizeTimer = 0;

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      resizeCanvas();
      startAnimation();
    }, 120);
  }, { passive: true });

  if ("ResizeObserver" in window) {
    const canvasObserver = new ResizeObserver(() => {
      resizeCanvas();
      startAnimation();
    });

    canvasObserver.observe(heroArt);
  }

  window.addEventListener("pagehide", () => {
    disposed = true;
    stopAnimation();
  }, { once: true });

  resizeCanvas();
  startAnimation();
})();

/* =========================================================
   BRILLO DEL CURSOR
   ========================================================= */

const cursorGlow = $(".cursor-glow");

if (cursorGlow && desktopPointer.matches && !reduceMotion.matches) {
  window.addEventListener("pointermove", event => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

/* =========================================================
   BOTONES DE PLANES
   ========================================================= */

$$(".choose-plan").forEach(button => {
  button.addEventListener("click", () => {
    const plan = button.dataset.plan || "Personalizado";

    const message = [
      "Hola, Nexo Studio.",
      "",
      `Me interesa el plan: ${plan}.`,
      "Me gustaría conocer qué incluye, el tiempo de entrega y las condiciones."
    ].join("\n");

    openWhatsApp(message);
  });
});

/* =========================================================
   SERVICIOS Y PROYECTOS
   ========================================================= */

$$("[data-service]").forEach(link => {
  link.addEventListener("click", () => {
    const service = link.dataset.service;
    const select = $("#servicio");
    const details = $("#detalles");

    if (!service) return;

    if (select) {
      const option = Array.from(select.options).find(
        item => item.value.toLowerCase() === service.toLowerCase()
      );

      if (option) {
        select.value = option.value;
      } else {
        const otherOption = Array.from(select.options).find(
          item => item.value === "Otro / No lo sé"
        );

        if (otherOption) select.value = otherOption.value;
      }
    }

    if (details && !details.value.trim()) {
      details.value = `Me interesa el servicio de ${service}.`;
    }
  });
});

$$("[data-project]").forEach(project => {
  project.addEventListener("click", () => {
    const name = project.dataset.project;
    const details = $("#detalles");

    if (!name || !details) return;

    details.value =
      `Me interesa un proyecto similar a "${name}". Quiero una propuesta para mi marca.`;

    const contactSection = $("#contacto");

    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "start"
      });
    }

    window.setTimeout(() => {
      details.focus({ preventScroll: true });
    }, reduceMotion.matches ? 0 : 450);
  });
});

/* =========================================================
   FORMULARIO DE CONTACTO
   Abre WhatsApp con la información preparada.
   El usuario revisa y envía el mensaje desde WhatsApp.
   ========================================================= */

const contactForm = $("#contact-form");
const formStatus = $("#form-status");

if (contactForm) {
  contactForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);

    const nombre = String(formData.get("nombre") || "").trim();
    const correo = String(formData.get("correo") || "").trim();
    const servicio = String(formData.get("servicio") || "").trim();
    const presupuesto = String(
      formData.get("presupuesto") || "Por definir"
    ).trim();
    const detalles = String(formData.get("detalles") || "").trim();

    const message = [
      "Hola, Nexo Studio. Quiero solicitar una propuesta.",
      "",
      `Nombre: ${nombre}`,
      `Correo: ${correo}`,
      `Servicio: ${servicio}`,
      `Presupuesto: ${presupuesto}`,
      "",
      "Detalles del proyecto:",
      detalles || "Me gustaría recibir asesoría.",
      "",
      "Quedo atento/a a su respuesta."
    ].join("\n");

    const url = getWhatsAppUrl(message);

    if (!url) {
      if (formStatus) {
        formStatus.textContent =
          "No se pudo preparar el enlace. Inténtalo de nuevo.";
      }

      return;
    }

    if (formStatus) {
      formStatus.textContent =
        "Tu solicitud está preparada. Revisa el mensaje en WhatsApp y envíalo.";
    }

    window.open(url, "_blank", "noopener,noreferrer");
  });
}

/* =========================================================
   NAVEGACIÓN SUAVE
   Evita que los enlaces con href="#" lleven al inicio.
   ========================================================= */

$$('a[href^="#"]').forEach(link => {
  link.addEventListener("click", event => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      event.preventDefault();
      return;
    }

    let target;

    try {
      target = $(targetId);
    } catch {
      return;
    }

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: reduceMotion.matches ? "auto" : "smooth",
      block: "start"
    });

    if (history.replaceState) {
      history.replaceState({}, "", targetId);
    }
  });
});

/* =========================================================
   IMÁGENES DEL PORTAFOLIO
   ========================================================= */

$$(".project-image img").forEach(image => {
  image.addEventListener("error", () => {
    image.style.opacity = "0";

    const container = image.closest(".project-image");

    if (container) {
      container.style.background =
        "radial-gradient(ellipse at 50% 40%, #23432e, #0b100d 72%)";
    }
  });
});

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

document.documentElement.classList.add("js-ready");

console.info("Nexo Studio — Sitio inicializado correctamente.");

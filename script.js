
"use strict";

/* =========================================================
   NEXO STUDIO — CONFIGURACIÓN
   ========================================================= */

// Número de WhatsApp internacional, sin + ni espacios.
const WHATSAPP_NUMBER = "573204273991";

const $ = (selector, context = document) =>
  context.querySelector(selector);

const $$ = (selector, context = document) =>
  Array.from(context.querySelectorAll(selector));

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const desktopPointer = window.matchMedia(
  "(hover: hover) and (pointer: fine) and (min-width: 721px)"
);

/* =========================================================
   WHATSAPP
   ========================================================= */

function getWhatsAppUrl(message) {
  const number = String(WHATSAPP_NUMBER).replace(/\D/g, "");

  if (!number || number.length < 10 || number.length > 15) {
    console.error(
      "Nexo Studio: revisa el número configurado en WHATSAPP_NUMBER."
    );
    return null;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
  const url = getWhatsAppUrl(message);

  if (!url) {
    alert(
      "No se pudo preparar WhatsApp. Revisa el número comercial en script.js."
    );
    return;
  }

  window.location.href = url;
}

const generalMessage =
  "Hola, Nexo Studio. Quiero información sobre sus servicios de diseño y desarrollo web.";

function configureWhatsAppLink(element, message) {
  if (!element) return;

  const url = getWhatsAppUrl(message);

  if (url) {
    element.href = url;
    element.target = "_blank";
    element.rel = "noopener noreferrer";
  } else {
    element.href = "#";

    element.addEventListener("click", (event) => {
      event.preventDefault();
      openWhatsApp(message);
    });
  }
}

/* =========================================================
   AÑO AUTOMÁTICO
   ========================================================= */

const yearElement = $("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* =========================================================
   MENÚ RESPONSIVE
   ========================================================= */

const menuButton = $(".menu");
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
    const isOpen =
      menuButton.getAttribute("aria-expanded") === "true";

    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Abrir menú" : "Cerrar menú"
    );

    navigation.classList.toggle("open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  $$("a", navigation).forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) closeMenu();
  });
}

/* =========================================================
   HEADER AL DESPLAZARSE
   ========================================================= */

const header = $("#header");

function updateHeader() {
  if (!header) return;

  header.classList.toggle(
    "header-scrolled",
    window.scrollY > 25
  );
}

window.addEventListener("scroll", updateHeader, {
  passive: true
});

updateHeader();

/* =========================================================
   ANIMACIONES DE ENTRADA
   ========================================================= */

const revealElements = $$(".reveal");

if (
  "IntersectionObserver" in window &&
  !reduceMotion.matches
) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}

/* =========================================================
   MALLA 3D INTERACTIVA — NEXO STUDIO

   - Puntos verdes con perspectiva.
   - Ondas y relieves tridimensionales.
   - Interacción con mouse, lápiz y pantalla táctil.
   - Movimiento autónomo suave.
   - Ajuste automático al tamaño y densidad de pantalla.
   - Pausa cuando la sección no está visible.
   ========================================================= */

(function initializeInteractiveMesh() {
  const canvas = $("#mesh-canvas");
  const heroArt = $("#hero-art");

  if (!canvas || !heroArt) {
    console.warn(
      "Nexo Studio: no se encontró #mesh-canvas o #hero-art."
    );
    return;
  }

  const ctx = canvas.getContext("2d", {
    alpha: true,
    desynchronized: true
  });

  if (!ctx) {
    console.warn(
      "Nexo Studio: el navegador no pudo crear el canvas."
    );
    return;
  }

  const reducedMotion = reduceMotion.matches;

  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false,
    pressed: false
  };

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

  let width = 0;
  let height = 0;
  let dpr = 1;
  let columns = 0;
  let rows = 0;
  let points = [];
  let animationFrame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let visible = true;
  let disposed = false;

  const prefersFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function smoothstep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  /* -------------------------------------------------------
     RESOLUCIÓN Y MALLA
     ------------------------------------------------------- */

  function buildGrid() {
    const spacing =
      width < 480
        ? settings.mobileSpacing
        : settings.spacing;

    columns = Math.max(
      12,
      Math.ceil(width / spacing) + 1
    );

    rows = Math.max(
      14,
      Math.ceil(height / spacing) + 1
    );

    // Evita consumir demasiados recursos en pantallas grandes.
    while (columns * rows > settings.maxPoints) {
      columns = Math.max(12, Math.floor(columns * 0.94));
      rows = Math.max(14, Math.floor(rows * 0.94));
    }

    points = [];

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        points.push({
          column,
          row,
          baseX:
            (column / (columns - 1) - 0.5) * width,
          baseY:
            (row / (rows - 1) - 0.5) * height,
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

    dpr = Math.min(
      window.devicePixelRatio || 1,
      settings.pixelRatioLimit
    );

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildGrid();
    drawFrame(0, true);
  }

  /* -------------------------------------------------------
     TERRENO TRIDIMENSIONAL
     ------------------------------------------------------- */

  function terrainHeight(x, y, time) {
    const nx = x / Math.max(width, 1);
    const ny = y / Math.max(height, 1);

    // Ondas amplias para producir un paisaje digital.
    const waveOne =
      Math.sin(nx * 9.2 + time * 0.8) *
      Math.cos(ny * 5.6 - time * 0.55);

    const waveTwo =
      Math.sin(nx * 16.0 - ny * 7.5 + time * 0.45);

    const waveThree =
      Math.cos(nx * 5.5 + ny * 10.5 - time * 0.32);

    // Dos relieves suaves, como montañas digitales.
    const peakOneX = width * 0.35;
    const peakOneY = height * 0.42;

    const peakTwoX = width * 0.72;
    const peakTwoY = height * 0.58;

    const distanceOne = Math.hypot(
      x - peakOneX,
      (y - peakOneY) * 1.05
    );

    const distanceTwo = Math.hypot(
      x - peakTwoX,
      (y - peakTwoY) * 1.1
    );

    const peakOne =
      Math.exp(-distanceOne / Math.max(width * 0.22, 1));

    const peakTwo =
      Math.exp(-distanceTwo / Math.max(width * 0.19, 1));

    return (
      waveOne * 21 +
      waveTwo * 7 +
      waveThree * 5 +
      peakOne * 33 +
      peakTwo * 24
    );
  }

  /* -------------------------------------------------------
     INTERACCIÓN DEL PUNTERO
     ------------------------------------------------------- */

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

  heroArt.addEventListener(
    "pointermove",
    (event) => {
      setPointer(event);
    },
    { passive: true }
  );

  heroArt.addEventListener("pointerenter", (event) => {
    setPointer(event);
  });

  heroArt.addEventListener("pointerleave", resetPointer);

  heroArt.addEventListener("pointerdown", (event) => {
    setPointer(event);
    pointer.pressed = true;
  }, { passive: true });

  heroArt.addEventListener("pointerup", () => {
    pointer.pressed = false;
  }, { passive: true });

  heroArt.addEventListener("pointercancel", resetPointer);

  /* -------------------------------------------------------
     PROYECCIÓN EN PERSPECTIVA
     ------------------------------------------------------- */

  function projectPoint(point) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    // Cámara imaginaria situada delante de la superficie.
    const cameraDistance = settings.perspective;

    const depthPosition =
      point.z + settings.depth * 0.5;

    const perspective =
      cameraDistance /
      Math.max(150, cameraDistance + depthPosition);

    point.scale = perspective;

    point.screenX =
      centerX + point.x * perspective;

    point.screenY =
      centerY + point.y * perspective;

    const edgeX = Math.abs(point.baseX / Math.max(width * .5, 1));
    const edgeY = Math.abs(point.baseY / Math.max(height * .5, 1));

    const edgeFade = 1 - Math.max(edgeX * .4, edgeY * .22);

    point.alpha = clamp(
      (0.42 + perspective * 0.65) * edgeFade,
      0.12,
      1
    );

    return point;
  }

  /* -------------------------------------------------------
     ACTUALIZAR POSICIÓN DE LOS PUNTOS
     ------------------------------------------------------- */

  function updatePoints(time, delta) {
    const followSpeed = pointer.active ? 0.12 : 0.055;

    pointer.x = lerp(
      pointer.x,
      pointer.active ? pointer.targetX : width * 0.5,
      followSpeed
    );

    pointer.y = lerp(
      pointer.y,
      pointer.active ? pointer.targetY : height * 0.5,
      followSpeed
    );

    const centerX = width * 0.5;
    const centerY = height * 0.5;

    for (const point of points) {
      const x = point.baseX;
      const y = point.baseY;

      const heightValue = reducedMotion
        ? terrainHeight(x, y, 0)
        : terrainHeight(x, y, time);

      let displacedZ = heightValue;

      // El cursor empuja y deforma la superficie.
      if (pointer.active) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);

        const radius = settings.interactionRadius;

        if (distance < radius) {
          const influence =
            1 - smoothstep(distance / radius);

          const strength = pointer.pressed
            ? settings.interactionStrength * 1.35
            : settings.interactionStrength;

          displacedZ += influence * strength;
        }
      }

      // Inclinación leve para reforzar la sensación 3D.
      const tiltX = pointer.active
        ? ((pointer.y / Math.max(height, 1)) - .5) * 0.11
        : 0;

      const tiltY = pointer.active
        ? ((pointer.x / Math.max(width, 1)) - .5) * 0.13
        : 0;

      point.x = x + (y - centerY) * tiltX;
      point.y = y + (x - centerX) * tiltY;
      point.z = displacedZ;

      projectPoint(point);

      const dx = point.screenX - pointer.x;
      const dy = point.screenY - pointer.y;
      const distance = Math.hypot(dx, dy);

      const proximity = pointer.active
        ? 1 - smoothstep(distance / 150)
        : 0;

      point.brightness = proximity;
    }
  }

  /* -------------------------------------------------------
     DIBUJAR LÍNEAS DE PROFUNDIDAD
     ------------------------------------------------------- */

  function drawConnections() {
    ctx.save();
    ctx.lineWidth = 0.55;

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const index = row * columns + column;
        const point = points[index];

        // Cada punto se conecta con el de la derecha.
        if (column < columns - 1) {
          const right = points[index + 1];

          const averageAlpha =
            (point.alpha + right.alpha) * 0.5;

          ctx.strokeStyle =
            `rgba(130, 255, 78, ${averageAlpha * 0.105})`;

          ctx.beginPath();
          ctx.moveTo(point.screenX, point.screenY);
          ctx.lineTo(right.screenX, right.screenY);
          ctx.stroke();
        }

        // Conexión con el punto inferior.
        if (row < rows - 1) {
          const below = points[index + columns];

          const averageAlpha =
            (point.alpha + below.alpha) * 0.5;

          ctx.strokeStyle =
            `rgba(130, 255, 78, ${averageAlpha * 0.09})`;

          ctx.beginPath();
          ctx.moveTo(point.screenX, point.screenY);
          ctx.lineTo(below.screenX, below.screenY);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  /* -------------------------------------------------------
     DIBUJAR LOS PUNTOS NEÓN
     ------------------------------------------------------- */

  function drawPoints() {
    for (const point of points) {
      const baseRadius = 0.85 + point.scale * 0.7;
      const glow = point.brightness;

      const radius = baseRadius + glow * 1.15;
      const alpha = point.alpha;

      // Halo individual alrededor de los puntos iluminados.
      if (glow > 0.06) {
        ctx.beginPath();
        ctx.arc(
          point.screenX,
          point.screenY,
          radius * (2.2 + glow),
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          `rgba(117, 255, 57, ${glow * alpha * 0.16})`;

        ctx.fill();
      }

      // Núcleo del punto.
      ctx.beginPath();
      ctx.arc(
        point.screenX,
        point.screenY,
        radius,
        0,
        Math.PI * 2
      );

      const green = Math.round(190 + glow * 65);
      const red = Math.round(111 + glow * 65);
      const blue = Math.round(46 + glow * 9);

      ctx.fillStyle =
        `rgba(${red}, ${green}, ${blue}, ${alpha * (0.55 + glow * 0.45)})`;

      ctx.fill();
    }
  }

  /* -------------------------------------------------------
     ILUMINACIÓN AMBIENTAL
     ------------------------------------------------------- */

  function drawAmbientGlow() {
    const glow = ctx.createRadialGradient(
      width * 0.5,
      height * 0.48,
      0,
      width * 0.5,
      height * 0.48,
      Math.max(width, height) * 0.6
    );

    glow.addColorStop(0, "rgba(69, 255, 39, 0.035)");
    glow.addColorStop(0.5, "rgba(69, 255, 39, 0.012)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  /* -------------------------------------------------------
     RENDERIZADO
     ------------------------------------------------------- */

  function drawFrame(timestamp, staticFrame = false) {
    if (disposed || !width || !height) return;

    const delta = lastTime
      ? Math.min(timestamp - lastTime, 32)
      : 16;

    lastTime = timestamp;

    if (!staticFrame && !reducedMotion) {
      elapsed += delta * settings.speed;
    }

    ctx.clearRect(0, 0, width, height);

    drawAmbientGlow();
    updatePoints(elapsed, delta);
    drawConnections();
    drawPoints();
  }

  function animate(timestamp) {
    animationFrame = 0;

    if (disposed || !visible || document.hidden) {
      return;
    }

    drawFrame(timestamp);

    // Con movimiento reducido, se dibuja una sola imagen estable.
    if (!reducedMotion) {
      animationFrame = window.requestAnimationFrame(animate);
    }
  }

  function startAnimation() {
    if (disposed || !visible || document.hidden) return;

    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    if (reducedMotion) {
      drawFrame(0, true);
      return;
    }

    lastTime = 0;
    animationFrame = window.requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (!animationFrame) return;

    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  /* -------------------------------------------------------
     AHORRO DE RECURSOS
     ------------------------------------------------------- */

  let visibilityObserver = null;

  if ("IntersectionObserver" in window) {
    visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;

          if (visible) {
            startAnimation();
          } else {
            stopAnimation();
          }
        });
      },
      {
        threshold: 0.01
      }
    );

    visibilityObserver.observe(heroArt);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  let resizeTimer = 0;

  function handleResize() {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      resizeCanvas();
      startAnimation();
    }, 100);
  }

  window.addEventListener("resize", handleResize, {
    passive: true
  });

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      startAnimation();
    });

    resizeObserver.observe(heroArt);

    // El observer queda ligado al elemento mientras exista la página.
  }

  /* -------------------------------------------------------
     LIMPIEZA DE EVENTOS
     ------------------------------------------------------- */

  window.addEventListener("pagehide", () => {
    disposed = true;
    stopAnimation();

    if (visibilityObserver) {
      visibilityObserver.disconnect();
    }
  }, { once: true });

  /* -------------------------------------------------------
     INICIO
     ------------------------------------------------------- */

  resizeCanvas();
  startAnimation();

  console.info(
    "Nexo Studio: malla 3D interactiva inicializada."
  );
})();

/* =========================================================
   BRILLO DEL CURSOR
   ========================================================= */

const cursorGlow = $(".cursor-glow");

if (
  cursorGlow &&
  desktopPointer.matches &&
  !reduceMotion.matches
) {
  window.addEventListener(
    "pointermove",
    (event) => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    },
    { passive: true }
  );
}

/* =========================================================
   ENLACES DIRECTOS DE WHATSAPP
   ========================================================= */

configureWhatsAppLink($("#direct-whatsapp"), generalMessage);
configureWhatsAppLink($("#footer-whatsapp"), generalMessage);

/* =========================================================
   BOTONES DE PAQUETES
   ========================================================= */

$$(".choose-plan").forEach((button) => {
  button.addEventListener("click", () => {
    const plan = button.dataset.plan || "Personalizado";

    const message = [
      "Hola, Nexo Studio.",
      "",
      `Me interesa el paquete ${plan}.`,
      "Me gustaría conocer qué incluye, el tiempo de entrega y las condiciones."
    ].join("\n");

    openWhatsApp(message);
  });
});

/* =========================================================
   BOTONES DE SERVICIOS
   ========================================================= */

const serviceMappings = {
  "Estrategia digital": "No lo tengo definido",
  "Diseño de experiencias": "Diseño visual",
  "Desarrollo web": "Web corporativa"
};

$$("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    const service = link.dataset.service;
    const serviceSelect = $("#servicio");
    const detailsField = $("#detalles");

    if (!service) return;

    if (serviceSelect) {
      const desiredValue =
        serviceMappings[service] || service;

      const option = Array.from(
        serviceSelect.options
      ).find((item) => item.value === desiredValue);

      if (option) {
        serviceSelect.value = option.value;
      }
    }

    if (detailsField && !detailsField.value.trim()) {
      detailsField.value =
        `Me interesa el servicio de ${service}.`;
    }
  });
});

/* =========================================================
   PORTAFOLIO: REFERENCIAS DE PROYECTOS
   ========================================================= */

$$("[data-project]").forEach((project) => {
  project.addEventListener("click", () => {
    const name = project.dataset.project;
    const detailsField = $("#detalles");

    if (!detailsField || !name) return;

    detailsField.value =
      `Me interesa un proyecto similar a la referencia "${name}". ` +
      "Quiero conversar sobre una propuesta adaptada a mi marca.";
  });
});

/* =========================================================
   FORMULARIO DE CONTACTO
   ========================================================= */

const contactForm = $("#contact-form");
const formStatus = $("#form-status");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);

    const name = String(
      formData.get("nombre") || ""
    ).trim();

    const email = String(
      formData.get("correo") || ""
    ).trim();

    const service = String(
      formData.get("servicio") || ""
    ).trim();

    const budget = String(
      formData.get("presupuesto") || "Por definir"
    ).trim();

    const details = String(
      formData.get("detalles") || ""
    ).trim();

    const message = [
      "Hola, Nexo Studio. Quiero solicitar una propuesta para mi proyecto web.",
      "",
      `Nombre: ${name}`,
      `Correo: ${email}`,
      `Servicio: ${service}`,
      `Presupuesto aproximado: ${budget}`,
      "",
      "Detalles del proyecto:",
      details || "Me gustaría recibir asesoría para definir mi proyecto.",
      "",
      "Quedo atento/a a su respuesta."
    ].join("\n");

    const url = getWhatsAppUrl(message);

    if (!url) {
      if (formStatus) {
        formStatus.textContent =
          "No se pudo preparar el enlace de WhatsApp. Revisa la configuración.";
      }

      return;
    }

    if (formStatus) {
      formStatus.textContent =
        "Abriendo WhatsApp. Revisa el mensaje y envíalo para completar la solicitud.";
    }

    window.location.href = url;
  });
}

/* =========================================================
   NAVEGACIÓN SUAVE
   ========================================================= */

$$('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
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

    if (window.history?.replaceState) {
      window.history.replaceState(null, "", targetId);
    }
  });
});

/* =========================================================
   IMÁGENES DEL PORTAFOLIO
   ========================================================= */

$$(".project-image img").forEach((img) => {
  img.addEventListener("error", () => {
    img.style.opacity = "0";

    const parent = img.closest(".project-image");

    if (parent) {
      parent.style.background =
        "radial-gradient(ellipse at 50% 40%, #23432e, #0b100d 72%)";
    }
  });
});

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

document.documentElement.classList.add("js-ready");

console.info(
  "Nexo Studio: interfaz inicializada correctamente."
);

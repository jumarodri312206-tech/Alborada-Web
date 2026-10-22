
"use strict";

/* =========================================================
   NEXO STUDIO — CONFIGURACIÓN GENERAL
   ========================================================= */

/*
  IMPORTANTE:
  Sustituye este número por tu WhatsApp comercial real.
  Colombia: 57 + número de celular.
  No uses +, espacios, paréntesis ni guiones.
*/
const WHATSAPP_NUMBER = "573204273991";

const $ = (selector, context = document) =>
  context.querySelector(selector);

const $$ = (selector, context = document) =>
  Array.from(context.querySelectorAll(selector));

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);


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
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";

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
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      closeMenu();
    }
  });
}


/* =========================================================
   HEADER: ESTADO AL DESPLAZARSE
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
   MOVIMIENTO 3D DE LA PORTADA
   ========================================================= */

const artScene = $("#art-scene");
const heroArt = $(".hero-art");

const supportsPointerMotion = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
).matches;

if (
  artScene &&
  heroArt &&
  supportsPointerMotion &&
  !reduceMotion.matches
) {
  let framePending = false;
  let pointerX = 0;
  let pointerY = 0;

  heroArt.addEventListener("pointermove", (event) => {
    const rect = heroArt.getBoundingClientRect();

    pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerY = (event.clientY - rect.top) / rect.height - 0.5;

    if (framePending) return;

    framePending = true;

    window.requestAnimationFrame(() => {
      const rotateY = pointerX * 10;
      const rotateX = pointerY * -8;

      artScene.style.transform =
        `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      framePending = false;
    });
  });

  heroArt.addEventListener("pointerleave", () => {
    artScene.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}


/* =========================================================
   BRILLO AMBIENTAL DEL CURSOR
   ========================================================= */

const cursorGlow = $(".cursor-glow");

if (
  cursorGlow &&
  supportsPointerMotion &&
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
   WHATSAPP — CONSTRUCCIÓN DE ENLACES
   ========================================================= */

function getWhatsAppUrl(message) {
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");

  if (!number || number.length < 10 || number === "573001234567") {
    alert(
      "Antes de usar WhatsApp, abre script.js y configura el número comercial de Nexo Studio."
    );

    return null;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
  const url = getWhatsAppUrl(message);

  if (!url) return;

  // Navegación en la misma pestaña para evitar bloqueadores de ventanas.
  window.location.href = url;
}


/* =========================================================
   WHATSAPP DIRECTO
   ========================================================= */

const directWhatsApp = $("#direct-whatsapp");
const footerWhatsApp = $("#footer-whatsapp");

const generalMessage =
  "Hola, Nexo Studio. Quiero hablar sobre un proyecto web. " +
  "¿Podrían darme información sobre sus servicios y el proceso de trabajo?";

function configureWhatsAppLink(element, message) {
  if (!element) return;

  const url = getWhatsAppUrl(message);

  if (url) {
    element.href = url;
  } else {
    element.href = "#contacto";
    element.addEventListener("click", (event) => {
      event.preventDefault();
      openWhatsApp(message);
    });
  }
}

configureWhatsAppLink(directWhatsApp, generalMessage);
configureWhatsAppLink(footerWhatsApp, generalMessage);


/* =========================================================
   BOTONES DE LOS PAQUETES
   ========================================================= */

$$(".choose-plan").forEach((button) => {
  button.addEventListener("click", () => {
    const plan = button.dataset.plan || "Personalizado";

    const message = [
      "Hola, Nexo Studio.",
      "",
      `Me interesa el paquete ${plan}.`,
      "Me gustaría conocer qué incluye, el tiempo estimado de entrega y las condiciones de contratación."
    ].join("\n");

    openWhatsApp(message);
  });
});


/* =========================================================
   BOTONES DE SERVICIOS
   ========================================================= */

$$("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    const service = link.dataset.service;
    const serviceSelect = $("#servicio");

    if (!serviceSelect) return;

    const option = Array.from(serviceSelect.options).find(
      (item) => item.value.toLowerCase() === service.toLowerCase()
    );

    if (option) {
      serviceSelect.value = option.value;
    } else if (service.toLowerCase().includes("estrategia")) {
      serviceSelect.value = "No lo tengo definido";
    }

    const detailsField = $("#detalles");

    if (detailsField && !detailsField.value.trim()) {
      detailsField.value = `Me interesa el servicio de ${service}.`;
    }
  });
});


/* =========================================================
   PORTAFOLIO: PREPARAR UNA CONSULTA SOBRE UN PROYECTO
   ========================================================= */

$$("[data-project]").forEach((project) => {
  project.addEventListener("click", (event) => {
    // Los proyectos son ejemplos visuales y dirigen al formulario.
    // No se presenta una demostración ficticia como si fuera un cliente real.
    const name = project.dataset.project;
    const detailsField = $("#detalles");

    if (detailsField) {
      detailsField.value =
        `Me interesa un proyecto similar a la referencia "${name}". ` +
        "Quiero conversar sobre una propuesta adaptada a mi marca.";
    }
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

    if (!contactForm.reportValidity()) {
      return;
    }

    const formData = new FormData(contactForm);

    const name = String(formData.get("nombre") || "").trim();
    const email = String(formData.get("correo") || "").trim();
    const service = String(formData.get("servicio") || "").trim();
    const budget = String(formData.get("presupuesto") || "Por definir").trim();
    const details = String(formData.get("detalles") || "").trim();

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
          "Configura tu número de WhatsApp en script.js para activar el envío.";
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

    const target = $(targetId);

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: reduceMotion.matches ? "auto" : "smooth",
      block: "start"
    });

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", targetId);
    }
  });
});


/* =========================================================
   IMÁGENES: TRATAMIENTO DE ERRORES
   ========================================================= */

$$(".project-image img").forEach((img) => {
  img.addEventListener("error", () => {
    // Mantiene el fondo visual del proyecto si una imagen externa falla.
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

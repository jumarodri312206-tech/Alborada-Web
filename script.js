
"use strict";

/* =========================================================
   NEXO STUDIO — CONFIGURACIÓN
   ========================================================= */

// WhatsApp con indicativo del país, sin + ni espacios.
const WHATSAPP_NUMBER = "573204273991";

const $ = (selector, context = document) =>
  context.querySelector(selector);

const $$ = (selector, context = document) =>
  Array.from(context.querySelectorAll(selector));

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const supportsPointerMotion =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  window.matchMedia("(min-width: 721px)").matches;

/* =========================================================
   WHATSAPP
   ========================================================= */

function getWhatsAppUrl(message) {
  const number = String(WHATSAPP_NUMBER).replace(/\D/g, "");

  if (!number || number.length < 10 || number.length > 15) {
    console.error("Nexo Studio: revisa WHATSAPP_NUMBER.");
    return null;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
  const url = getWhatsAppUrl(message);

  if (!url) {
    alert("No se pudo preparar WhatsApp. Revisa el número en script.js.");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
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
   ESCENA 3D DE LA PORTADA
   ========================================================= */

const artScene = $("#art-scene");
const heroArt = $(".hero-art");

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

    if (!rect.width || !rect.height) return;

    pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerY = (event.clientY - rect.top) / rect.height - 0.5;

    if (framePending) return;

    framePending = true;

    window.requestAnimationFrame(() => {
      artScene.style.transform =
        `rotateX(${-pointerY * 6}deg) ` +
        `rotateY(${pointerX * 8}deg)`;

      framePending = false;
    });
  });

  heroArt.addEventListener("pointerleave", () => {
    artScene.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

/* =========================================================
   BRILLO DEL CURSOR
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
   ENLACES DIRECTOS DE WHATSAPP
   ========================================================= */

const directWhatsApp = $("#direct-whatsapp");
const footerWhatsApp = $("#footer-whatsapp");

configureWhatsAppLink(directWhatsApp, generalMessage);
configureWhatsAppLink(footerWhatsApp, generalMessage);

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

$$("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    const service = link.dataset.service;
    const serviceSelect = $("#servicio");

    if (!service || !serviceSelect) return;

    const option = Array.from(serviceSelect.options).find(
      (item) => item.value.toLowerCase() === service.toLowerCase()
    );

    if (option) {
      serviceSelect.value = option.value;
    } else if (service.toLowerCase().includes("estrategia")) {
      const alternative = Array.from(serviceSelect.options).find(
        (item) => item.textContent.toLowerCase().includes("definido")
      );

      if (alternative) {
        serviceSelect.value = alternative.value;
      }
    }

    const detailsField = $("#detalles");

    if (detailsField && !detailsField.value.trim()) {
      detailsField.value = `Me interesa el servicio de ${service}.`;
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

    if (!detailsField) return;

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

    const name = String(formData.get("nombre") || "").trim();
    const email = String(formData.get("correo") || "").trim();
    const service = String(formData.get("servicio") || "").trim();
    const budget = String(
      formData.get("presupuesto") || "Por definir"
    ).trim();
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
          "No se pudo preparar WhatsApp. Revisa la configuración.";
      }

      return;
    }

    if (formStatus) {
      formStatus.textContent =
        "Abriendo WhatsApp. Revisa el mensaje y envíalo para completar la solicitud.";
    }

    window.open(url, "_blank", "noopener,noreferrer");
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

console.info("Nexo Studio: interfaz inicializada correctamente.");

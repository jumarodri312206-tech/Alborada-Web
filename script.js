
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const WHATSAPP_NUMBER = "573204273991";

  // ----------------------------------------
  // AÑO AUTOMÁTICO EN EL PIE DE PÁGINA
  // ----------------------------------------

  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // ----------------------------------------
  // MENÚ RESPONSIVE
  // ----------------------------------------

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".nav");

  function closeMenu() {
    if (!menuButton || !navigation) return;

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen =
        menuButton.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeMenu();
      } else {
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Cerrar menú");
        navigation.classList.add("is-open");
        document.body.classList.add("menu-open");
      }
    });

    navigation.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 700) closeMenu();
    });
  }

  // ----------------------------------------
  // ANIMACIONES AL DESPLAZARSE
  // ----------------------------------------

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
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
      element.classList.add("is-visible");
    });
  }

  // ----------------------------------------
  // SELECCIÓN DE PLANES
  // ----------------------------------------

  const planLinks = document.querySelectorAll(".plan-link");
  const detailsField = document.getElementById("detalles");
  const serviceField = document.getElementById("servicio");

  planLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const plan = link.dataset.plan || "";

      if (detailsField && plan) {
        detailsField.value =
          `Me interesa el plan "${plan}". ` +
          "Quisiera conocer más detalles y confirmar la cotización.";
      }
    });
  });

  // ----------------------------------------
  // PROYECTOS: PRECARGAR EL NOMBRE
  // ----------------------------------------

  const projectLinks = document.querySelectorAll("[data-project]");

  projectLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const project = link.dataset.project || "";

      if (detailsField && project) {
        detailsField.value =
          `Me interesa una página web inspirada en el concepto "${project}". ` +
          "Quisiera conversar sobre una propuesta personalizada.";
      }
    });
  });

  // ----------------------------------------
  // FORMULARIO DE CONTACTO A WHATSAPP
  // ----------------------------------------

  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const name =
        document.getElementById("nombre")?.value.trim() || "";

      const email =
        document.getElementById("correo")?.value.trim() || "";

      const service = serviceField?.value || "";

      const budget =
        document.getElementById("presupuesto")?.value || "Por definir";

      const details =
        detailsField?.value.trim() || "Sin detalles adicionales";

      const message = [
        "Hola, Nexo Studio. Me gustaría consultar sobre un proyecto web.",
        "",
        `Nombre: ${name}`,
        `Correo: ${email || "No indicado"}`,
        `Proyecto: ${service}`,
        `Presupuesto estimado: ${budget}`,
        `Detalles: ${details}`,
        "",
        "Quedo atento/a a la información y a una posible cotización."
      ].join("\n");

      const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      if (status) {
        status.textContent =
          "Abriendo WhatsApp con los datos de tu proyecto...";
      }

      const whatsappWindow = window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
      );

      // Alternativa si el navegador bloquea la nueva pestaña.
      if (!whatsappWindow) {
        window.location.href = whatsappURL;
      }
    });
  }

  // ----------------------------------------
  // ENLACE FLOTANTE DE WHATSAPP
  // ----------------------------------------

  const whatsappFloat = document.getElementById("whatsapp-float");

  if (whatsappFloat) {
    whatsappFloat.href = `https://wa.me/${WHATSAPP_NUMBER}`;
    whatsappFloat.target = "_blank";
    whatsappFloat.rel = "noopener noreferrer";
  }
});

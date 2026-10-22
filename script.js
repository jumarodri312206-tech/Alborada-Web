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
  // MALLA DIGITAL ANIMADA DE LA PORTADA
  // ----------------------------------------

  const canvas = document.getElementById("mesh-canvas");
  const artContainer = document.getElementById("hero-art");
  const context = canvas ? canvas.getContext("2d") : null;

  if (canvas && context && artContainer) {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let animationFrame = null;
    let lastFrame = 0;
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let points = [];

    const spacing = 25;
    const pointer = {
      active: false
    };

    function resizeCanvas() {
      const bounds = artContainer.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      points = [];

      const columns = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          points.push({
            x: column * spacing - spacing,
            y: row * spacing - spacing,
            column,
            row
          });
        }
      }

      drawMesh(performance.now(), true);
    }

    function getPoint(point, currentTime) {
      const waveA = Math.sin(
        point.column * 0.42 + currentTime * 0.00065
      );

      const waveB = Math.cos(
        point.row * 0.34 - currentTime * 0.00048
      );

      const waveC = Math.sin(
        (point.column + point.row) * 0.19 +
        currentTime * 0.00042
      );

      let x = point.x;
      let y = point.y + waveA * 9 + waveB * 5 + waveC * 4;

      if (pointer.active) {
        const dx = x - mouseX;
        const dy = y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = 130;

        if (distance < radius && distance > 0) {
          const force = (1 - distance / radius) * 10;
          x += (dx / distance) * force;
          y += (dy / distance) * force;
        }
      }

      return {
        x,
        y,
        wave: (waveA + waveB + waveC) / 3
      };
    }

    function drawMesh(currentTime, staticFrame = false) {
      if (!context || !width || !height) return;

      context.clearRect(0, 0, width, height);

      if (!staticFrame && !reducedMotion) {
        time = currentTime;
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;
      }

      const columns = Math.ceil(width / spacing) + 2;
      const grid = points.map((point) => getPoint(point, time));

      // Líneas horizontales
      for (let row = 0; row < grid.length / columns; row++) {
        context.beginPath();

        for (let column = 0; column < columns; column++) {
          const index = row * columns + column;
          const point = grid[index];

          if (!point) continue;

          if (column === 0) {
            context.moveTo(point.x, point.y);
          } else {
            context.lineTo(point.x, point.y);
          }
        }

        context.strokeStyle = "rgba(200, 255, 61, 0.16)";
        context.lineWidth = 0.7;
        context.stroke();
      }

      // Líneas verticales
      for (let column = 0; column < columns; column++) {
        context.beginPath();

        let started = false;

        for (let index = column; index < grid.length; index += columns) {
          const point = grid[index];

          if (!point) continue;

          if (!started) {
            context.moveTo(point.x, point.y);
            started = true;
          } else {
            context.lineTo(point.x, point.y);
          }
        }

        context.strokeStyle = "rgba(200, 255, 61, 0.12)";
        context.lineWidth = 0.7;
        context.stroke();
      }

      // Puntos de luz en las intersecciones
      for (let index = 0; index < grid.length; index++) {
        const point = grid[index];

        if (!point) continue;

        const brightness = Math.max(
          0.12,
          Math.min(0.65, 0.25 + point.wave * 0.3)
        );

        context.beginPath();
        context.arc(point.x, point.y, 1.1, 0, Math.PI * 2);
        context.fillStyle = `rgba(200, 255, 61, ${brightness})`;
        context.fill();
      }

      if (!staticFrame && !reducedMotion) {
        animationFrame = requestAnimationFrame(drawMesh);
      }
    }

    artContainer.addEventListener("pointermove", (event) => {
      const bounds = artContainer.getBoundingClientRect();

      targetMouseX = event.clientX - bounds.left;
      targetMouseY = event.clientY - bounds.top;
      pointer.active = true;
    });

    artContainer.addEventListener("pointerleave", () => {
      pointer.active = false;
    });

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(artContainer);
    } else {
      window.addEventListener("resize", resizeCanvas);
    }

    resizeCanvas();

    if (!reducedMotion) {
      animationFrame = requestAnimationFrame(drawMesh);
    } else {
      drawMesh(performance.now(), true);
    }

    // Pausa la animación si la pestaña no está visible.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (animationFrame !== null) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      } else if (!reducedMotion && animationFrame === null) {
        animationFrame = requestAnimationFrame(drawMesh);
      }
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
  // PROYECTOS: PRECARGAR EL NOMBRE EN EL FORMULARIO
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

      const name = document.getElementById("nombre")?.value.trim() || "";
      const email = document.getElementById("correo")?.value.trim() || "";
      const service = serviceField?.value || "";
      const budget =
        document.getElementById("presupuesto")?.value || "Por definir";
      const details = detailsField?.value.trim() || "Sin detalles adicionales";

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

      // Si el navegador bloquea la nueva pestaña, abre WhatsApp en la misma.
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

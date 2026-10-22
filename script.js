
"use strict";

/* =========================================================
   NEXO STUDIO — CONFIGURACIÓN
   ========================================================= */

// Reemplaza este número por el WhatsApp comercial de tu agencia.
// Incluye el indicativo del país, sin +, espacios ni guiones.
// Ejemplo Colombia: 573001234567
const WHATSAPP_NUMBER = "573001234567";


/* =========================================================
   UTILIDADES
   ========================================================= */

const seleccionar = (selector, contexto = document) =>
  contexto.querySelector(selector);

const seleccionarTodos = (selector, contexto = document) =>
  [...contexto.querySelectorAll(selector)];


/* =========================================================
   MENÚ RESPONSIVE
   ========================================================= */

const botonMenu = seleccionar(".menu");
const navegacion = seleccionar(".header nav");

function cerrarMenu() {
  if (!botonMenu || !navegacion) return;

  navegacion.classList.remove("open");
  document.body.classList.remove("menu-open");
  botonMenu.setAttribute("aria-expanded", "false");
  botonMenu.setAttribute("aria-label", "Abrir menú");
  botonMenu.textContent = "☰";
}

if (botonMenu && navegacion) {
  botonMenu.setAttribute("aria-expanded", "false");
  botonMenu.setAttribute("aria-label", "Abrir menú");

  botonMenu.addEventListener("click", () => {
    const estaAbierto = navegacion.classList.toggle("open");

    document.body.classList.toggle("menu-open", estaAbierto);
    botonMenu.setAttribute("aria-expanded", String(estaAbierto));
    botonMenu.setAttribute(
      "aria-label",
      estaAbierto ? "Cerrar menú" : "Abrir menú"
    );

    botonMenu.textContent = estaAbierto ? "×" : "☰";
  });

  seleccionarTodos("a", navegacion).forEach((enlace) => {
    enlace.addEventListener("click", cerrarMenu);
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      cerrarMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      cerrarMenu();
    }
  });
}


/* =========================================================
   AÑO AUTOMÁTICO EN EL FOOTER
   ========================================================= */

const elementoAnio = seleccionar("#year");

if (elementoAnio) {
  elementoAnio.textContent = new Date().getFullYear();
}


/* =========================================================
   ENLACES DE WHATSAPP
   ========================================================= */

function crearEnlaceWhatsApp(mensaje) {
  const numero = WHATSAPP_NUMBER.replace(/\D/g, "");

  if (!numero || numero.length < 10) {
    alert(
      "Configura primero el número de WhatsApp comercial en script.js."
    );
    return null;
  }

  return (
    "https://wa.me/" +
    numero +
    "?text=" +
    encodeURIComponent(mensaje)
  );
}

function abrirWhatsApp(mensaje) {
  const enlace = crearEnlaceWhatsApp(mensaje);

  if (!enlace) return;

  window.open(enlace, "_blank", "noopener,noreferrer");
}


/* =========================================================
   BOTONES DE LOS PAQUETES
   ========================================================= */

// Los botones con clase .elegir-plan pueden tener un atributo
// data-plan con el nombre del paquete que se quiere consultar.

seleccionarTodos(".elegir-plan").forEach((boton) => {
  boton.addEventListener("click", (evento) => {
    evento.preventDefault();

    const plan =
      boton.dataset.plan ||
      boton.closest(".price")?.querySelector("h3")?.textContent?.trim() ||
      "Personalizado";

    const mensaje =
      `Hola, Nexo Studio. Estoy interesado/a en el paquete "${plan}". ` +
      "Me gustaría conocer los detalles, tiempos de entrega y proceso de contratación.";

    abrirWhatsApp(mensaje);
  });
});


/* =========================================================
   FORMULARIO DE CONTACTO
   ========================================================= */

const formulario = seleccionar("#contact-form");

if (formulario) {
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formulario.reportValidity()) {
      return;
    }

    const datos = new FormData(formulario);

    const nombre = String(datos.get("nombre") || "").trim();
    const correo = String(datos.get("correo") || "").trim();
    const servicio = String(datos.get("servicio") || "").trim();
    const presupuesto = String(datos.get("presupuesto") || "").trim();
    const detalles = String(datos.get("detalles") || "").trim();

    const mensaje = [
      "Hola, Nexo Studio. Quiero solicitar información para un proyecto web.",
      "",
      `Nombre: ${nombre}`,
      `Correo: ${correo}`,
      `Servicio: ${servicio || "Por definir"}`,
      `Presupuesto aproximado: ${presupuesto || "Por definir"}`,
      "",
      "Detalles del proyecto:",
      detalles || "Quiero conversar sobre mi idea."
    ].join("\n");

    abrirWhatsApp(mensaje);
  });
}


/* =========================================================
   ANIMACIONES AL DESPLAZARSE
   ========================================================= */

// Si el navegador no soporta IntersectionObserver, los elementos
// permanecen visibles normalmente.

const elementosAnimados = seleccionarTodos(
  ".service, .project, .price, .steps article"
);

if ("IntersectionObserver" in window) {
  const observador = new IntersectionObserver(
    (entradas, observer) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observer.unobserve(entrada.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -25px 0px"
    }
  );

  elementosAnimados.forEach((elemento) => {
    elemento.classList.add("reveal");
    observador.observe(elemento);
  });
}


/* =========================================================
   EFECTO 3D SUAVE CON EL RATÓN
   ========================================================= */

// Solo se activa en dispositivos que disponen de ratón.
// El movimiento es sutil y no modifica el diseño en móviles.

const escena3D = seleccionar(".art");
const prefiereMovimientoReducido = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

if (
  escena3D &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !prefiereMovimientoReducido.matches
) {
  escena3D.addEventListener("mousemove", (evento) => {
    const rectangulo = escena3D.getBoundingClientRect();

    const x = (evento.clientX - rectangulo.left) / rectangulo.width;
    const y = (evento.clientY - rectangulo.top) / rectangulo.height;

    const rotacionY = (x - 0.5) * 5;
    const rotacionX = (0.5 - y) * 5;

    escena3D.style.transform =
      `perspective(1000px) rotateX(${rotacionX}deg) rotateY(${rotacionY}deg)`;
  });

  escena3D.addEventListener("mouseleave", () => {
    escena3D.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  });
}


/* =========================================================
   NAVEGACIÓN SUAVE
   ========================================================= */

seleccionarTodos('a[href^="#"]').forEach((enlace) => {
  enlace.addEventListener("click", (evento) => {
    const destino = enlace.getAttribute("href");

    if (!destino || destino === "#") return;

    const seccion = seleccionar(destino);

    if (!seccion) return;

    evento.preventDefault();

    seccion.scrollIntoView({
      behavior: prefiereMovimientoReducido.matches ? "auto" : "smooth",
      block: "start"
    });

    // Actualiza el fragmento de la URL sin provocar un salto brusco.
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", destino);
    }
  });
});


/* =========================================================
   MENSAJE DE CONSOLA
   ========================================================= */

console.info(
  "Nexo Studio | Sitio inicializado correctamente."
);

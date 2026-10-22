
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

(() => {
  "use strict";

  const container = document.getElementById("three-container");
  const art = document.getElementById("hero-art");

  if (!container || !art) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power"
    });
  } catch (error) {
    console.warn(
      "Nexo Studio: no fue posible iniciar la animación 3D.",
      error
    );
    return;
  }

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 1.5)
  );

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.z = 6.2;

  // FIGURA GEOMÉTRICA 3D
  const geometry = new THREE.IcosahedronGeometry(1.3, 2);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xc8ff3d,
    metalness: 0.58,
    roughness: 0.27,
    clearcoat: 0.8,
    clearcoatRoughness: 0.22,
    flatShading: true
  });

  const sculpture = new THREE.Mesh(geometry, material);
  scene.add(sculpture);

  // MALLA GEOMÉTRICA SUPERPUESTA
  const wireGeometry = new THREE.IcosahedronGeometry(1.34, 2);

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xe0ff99,
    wireframe: true,
    transparent: true,
    opacity: 0.22
  });

  const wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
  scene.add(wireframe);

  // ILUMINACIÓN
  scene.add(new THREE.AmbientLight(0xffffff, 1.4));

  const limeLight = new THREE.PointLight(0xc8ff3d, 30);
  limeLight.position.set(2.5, 2.2, 3.5);
  scene.add(limeLight);

  const whiteLight = new THREE.PointLight(0xffffff, 18);
  whiteLight.position.set(-3, -1, 2);
  scene.add(whiteLight);

  const backLight = new THREE.PointLight(0x8ab72c, 12);
  backLight.position.set(0, 2, -3);
  scene.add(backLight);

  let frameId = null;
  let lastTime = 0;
  let elapsed = 0;
  let isVisible = true;
  let disposed = false;

  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;

  // DIBUJAR LA ESCENA
  function render() {
    if (!disposed) {
      renderer.render(scene, camera);
    }
  }

  // ADAPTAR LA ESCENA AL TAMAÑO DEL CONTENEDOR
  function resize() {
    if (disposed) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;

    if (width < 500) {
      camera.position.z = 6.8;
    } else if (width < 800) {
      camera.position.z = 6.4;
    } else {
      camera.position.z = 6.0;
    }

    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);

    render();
  }

  // DETENER LA ANIMACIÓN
  function stopAnimation() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    lastTime = 0;
  }

  // ANIMACIÓN PRINCIPAL
  function animate(now) {
    frameId = null;

    if (disposed || !isVisible || document.hidden) return;

    const delta = lastTime
      ? Math.min((now - lastTime) / 1000, 0.05)
      : 0;

    lastTime = now;
    elapsed += delta;

    // Movimiento suave siguiendo el puntero.
    pointerX += (targetX - pointerX) * 0.04;
    pointerY += (targetY - pointerY) * 0.04;

    // Rotación y movimiento flotante.
    sculpture.rotation.x =
      Math.sin(elapsed * 0.45) * 0.17 + pointerY * 0.1;

    sculpture.rotation.y += delta * 0.22 + pointerX * 0.0015;

    sculpture.rotation.z =
      Math.cos(elapsed * 0.3) * 0.1;

    sculpture.position.y =
      Math.sin(elapsed * 0.7) * 0.07;

    // La malla sigue el movimiento de la figura.
    wireframe.rotation.copy(sculpture.rotation);
    wireframe.rotation.y += 0.035;
    wireframe.position.copy(sculpture.position);

    render();

    frameId = requestAnimationFrame(animate);
  }

  // INICIAR SOLO CUANDO SEA NECESARIO
  function startAnimation() {
    if (
      disposed ||
      reducedMotion.matches ||
      !isVisible ||
      document.hidden ||
      frameId !== null
    ) {
      return;
    }

    frameId = requestAnimationFrame(animate);
  }

  // RESPETAR LA PREFERENCIA DE MOVIMIENTO DEL USUARIO
  function updateMotionPreference() {
    stopAnimation();

    if (reducedMotion.matches) {
      sculpture.rotation.set(0.12, -0.35, 0);
      wireframe.rotation.copy(sculpture.rotation);
      render();
    } else {
      startAnimation();
    }
  }

  // INTERACCIÓN CON EL PUNTERO
  art.addEventListener("pointermove", (event) => {
    const bounds = art.getBoundingClientRect();

    if (!bounds.width || !bounds.height) return;

    targetX =
      ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;

    targetY =
      ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  });

  art.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });

  // CAMBIOS DE TAMAÑO
  let resizeObserver;

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
  } else {
    window.addEventListener("resize", resize);
  }

  // PAUSAR CUANDO LA PORTADA NO ESTÁ VISIBLE
  let intersectionObserver;

  if ("IntersectionObserver" in window) {
    intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;

      if (isVisible) {
        startAnimation();
      } else {
        stopAnimation();
      }
    });

    intersectionObserver.observe(art);
  }

  // PAUSAR CUANDO LA PESTAÑA ESTÁ OCULTA
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  // ESCUCHAR CAMBIOS EN LA PREFERENCIA DE MOVIMIENTO
  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", updateMotionPreference);
  }

  // LIBERAR RECURSOS
  function cleanup() {
    if (disposed) return;

    disposed = true;
    stopAnimation();

    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();

    window.removeEventListener("resize", resize);

    geometry.dispose();
    material.dispose();
    wireGeometry.dispose();
    wireMaterial.dispose();

    renderer.dispose();
  }

  window.addEventListener("pagehide", cleanup, { once: true });

  // PRIMER DIBUJO
  resize();

  if (reducedMotion.matches) {
    sculpture.rotation.set(0.12, -0.35, 0);
    wireframe.rotation.copy(sculpture.rotation);
    render();
  } else {
    startAnimation();
  }
})();


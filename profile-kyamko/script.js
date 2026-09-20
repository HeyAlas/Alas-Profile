document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

function lockScrollUntilEntry() {
  document.documentElement.classList.add("profile-locked");
  document.body.classList.add("profile-locked");
}

function unlockScrollAfterEntry() {
  document.documentElement.classList.remove("profile-locked");
  document.body.classList.remove("profile-locked");
}

function handleLockedScroll(event) {
  if (
    document.documentElement.classList.contains("profile-locked") ||
    document.body.classList.contains("profile-locked")
  ) {
    event.preventDefault();
  }
}

lockScrollUntilEntry();

window.addEventListener("wheel", handleLockedScroll, { passive: false });
window.addEventListener("touchmove", handleLockedScroll, { passive: false });
window.addEventListener("keydown", (event) => {
  if (
    document.documentElement.classList.contains("profile-locked") ||
    document.body.classList.contains("profile-locked")
  ) {
    if (["ArrowDown", "PageDown", "Space", " ", "ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
    }
  }
}, { passive: false });

const finePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
);

const introScreen = document.querySelector(".intro-screen");
const header = document.querySelector(".site-header");
const coverLink = document.querySelector(".cover-link");
const entrySection = document.querySelector("#profile-entry");

const revealBlocks =
  document.querySelectorAll(".reveal-block");

const directionalElements =
  document.querySelectorAll("[data-directional]");

const directionClasses = [
  "tilt-left",
  "tilt-right",
  "tilt-up",
  "tilt-down",
  "tilt-up-left",
  "tilt-up-right",
  "tilt-down-left",
  "tilt-down-right"
];

/* ==================================================
   INTRO
================================================== */

let introFinished = false;
let introStarted = false;
let introTransitionTimer = null;

function resetIntroPointerState() {
  if (!introScreen) {
    return;
  }

  introScreen.style.setProperty("--intro-tilt-x", "0deg");
  introScreen.style.setProperty("--intro-tilt-y", "0deg");
  introScreen.style.setProperty("--intro-shift-x", "0px");
  introScreen.style.setProperty("--intro-shift-y", "0px");
  introScreen.style.setProperty("--orb-shift-x", "0px");
  introScreen.style.setProperty("--orb-shift-y", "0px");
  introScreen.style.setProperty("--orb-scale", "1");
  introScreen.style.setProperty("--orb-roll", "0deg");
  introScreen.style.setProperty("--intro-glow-x", "50%");
  introScreen.style.setProperty("--intro-glow-y", "38%");
}

function reactToIntroPointer(event) {
  if (!introScreen || introStarted || introFinished) {
    return;
  }

  const rect = introScreen.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;

  const tiltX = ((0.5 - y) * 9).toFixed(2);
  const tiltY = ((x - 0.5) * 12).toFixed(2);
  const shiftX = ((x - 0.5) * 20).toFixed(2);
  const shiftY = ((y - 0.5) * 20).toFixed(2);
  const orbShiftX = ((0.5 - x) * 26).toFixed(2);
  const orbShiftY = ((0.5 - y) * 18).toFixed(2);

  introScreen.style.setProperty("--intro-tilt-x", `${tiltX}deg`);
  introScreen.style.setProperty("--intro-tilt-y", `${tiltY}deg`);
  introScreen.style.setProperty("--intro-shift-x", `${shiftX}px`);
  introScreen.style.setProperty("--intro-shift-y", `${shiftY}px`);
  introScreen.style.setProperty("--orb-shift-x", `${orbShiftX}px`);
  introScreen.style.setProperty("--orb-shift-y", `${orbShiftY}px`);
  introScreen.style.setProperty("--orb-roll", `${((x - 0.5) * 10).toFixed(2)}deg`);
  introScreen.style.setProperty("--intro-glow-x", `${(x * 100).toFixed(1)}%`);
  introScreen.style.setProperty("--intro-glow-y", `${(y * 100).toFixed(1)}%`);
}

function reactToIntroTap(event) {
  if (!introScreen || introStarted || introFinished) {
    return;
  }

  const rect = introScreen.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;

  introScreen.style.setProperty("--intro-tilt-x", `${((0.5 - y) * 5).toFixed(2)}deg`);
  introScreen.style.setProperty("--intro-tilt-y", `${((x - 0.5) * 8).toFixed(2)}deg`);
  introScreen.style.setProperty("--intro-shift-x", `${((x - 0.5) * 12).toFixed(2)}px`);
  introScreen.style.setProperty("--intro-shift-y", `${((y - 0.5) * 12).toFixed(2)}px`);
  introScreen.style.setProperty("--orb-shift-x", `${((0.5 - x) * 18).toFixed(2)}px`);
  introScreen.style.setProperty("--orb-shift-y", `${((0.5 - y) * 12).toFixed(2)}px`);
  introScreen.style.setProperty("--orb-scale", "0.96");
  introScreen.style.setProperty("--intro-glow-x", `${(x * 100).toFixed(1)}%`);
  introScreen.style.setProperty("--intro-glow-y", `${(y * 100).toFixed(1)}%`);

  window.setTimeout(() => {
    if (introScreen) {
      introScreen.style.setProperty("--orb-scale", "1");
    }
    resetIntroPointerState();
  }, 220);
}

function finishIntro() {
  if (introFinished) {
    return;
  }

  introFinished = true;
  introStarted = true;
  unlockScrollAfterEntry();

  if (introTransitionTimer) {
    window.clearTimeout(introTransitionTimer);
    introTransitionTimer = null;
  }

  document.body.classList.remove("intro-running", "intro-transitioning", "intro-ready");
  document.body.classList.add("intro-started", "intro-complete");

  if (introScreen) {
    introScreen.classList.remove("is-activated");
    introScreen.setAttribute("aria-hidden", "true");
    introScreen.style.pointerEvents = "none";
  }
}

function beginIntroTransition() {
  if (introStarted || introFinished) {
    return;
  }

  introStarted = true;
  document.body.classList.add("intro-started");
  document.body.classList.add("intro-transitioning");
  document.body.classList.add("intro-running");

  if (introScreen) {
    introScreen.classList.add("is-activated");
    introScreen.style.pointerEvents = "none";
    introScreen.setAttribute("aria-hidden", "false");
  }

  introTransitionTimer = window.setTimeout(finishIntro, 3100);
}

function skipIntro() {
  if (prefersReducedMotion.matches) {
    finishIntro();
    return;
  }

  if (!introStarted && !introFinished) {
    beginIntroTransition();
  }

  if (!introFinished) {
    finishIntro();
  }
}

if (introScreen) {
  introScreen.setAttribute("aria-hidden", "false");
  introScreen.style.pointerEvents = "auto";
  introScreen.classList.add("is-idle");
  resetIntroPointerState();

  introScreen.addEventListener(
    "pointermove",
    (event) => {
      reactToIntroPointer(event);
    },
    { passive: true }
  );

  introScreen.addEventListener(
    "pointerleave",
    () => {
      if (!introStarted) {
        resetIntroPointerState();
      }
    },
    { passive: true }
  );

  introScreen.addEventListener(
    "pointerdown",
    (event) => {
      if (introStarted || introFinished) {
        return;
      }

      reactToIntroTap(event);
      beginIntroTransition();
    },
    { passive: true }
  );
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !introFinished) {
    skipIntro();
  }
});

function runIntro() {
  if (!introScreen) {
    return;
  }

  introFinished = false;
  introStarted = false;

  document.body.classList.remove("intro-complete", "intro-started", "intro-running", "intro-transitioning");

  if (prefersReducedMotion.matches) {
    finishIntro();
    return;
  }

  introScreen.setAttribute("aria-hidden", "false");
  introScreen.style.pointerEvents = "auto";
  introScreen.classList.add("is-idle");
  resetIntroPointerState();
  document.body.classList.add("intro-ready");
}

if (prefersReducedMotion.matches) {
  finishIntro();
} else {
  runIntro();
}

/* ==================================================
   DIRECTIONAL MOTION
================================================== */

function clearDirectionClasses(element) {
  directionClasses.forEach(
    (className) => {
      element.classList.remove(
        className
      );
    }
  );
}

function getDirectionalClass(
  element,
  event
) {
  const rect =
    element.getBoundingClientRect();

  const offsetX =
    (event.clientX - rect.left) /
    rect.width;

  const offsetY =
    (event.clientY - rect.top) /
    rect.height;

  const horizontal =
    offsetX < 0.38
      ? "left"
      : offsetX > 0.62
        ? "right"
        : "center";

  const vertical =
    offsetY < 0.38
      ? "up"
      : offsetY > 0.62
        ? "down"
        : "center";

  if (
    horizontal === "center" &&
    vertical === "center"
  ) {
    return "";
  }

  if (horizontal === "center") {
    return `tilt-${vertical}`;
  }

  if (vertical === "center") {
    return `tilt-${horizontal}`;
  }

  return `tilt-${vertical}-${horizontal}`;
}

function bindDirectionalMotion() {
  if (
    !finePointer.matches ||
    prefersReducedMotion.matches
  ) {
    return;
  }

  directionalElements.forEach(
    (element) => {
      element.addEventListener(
        "pointermove",
        (event) => {
          clearDirectionClasses(
            element
          );

          const direction =
            getDirectionalClass(
              element,
              event
            );

          if (direction) {
            element.classList.add(
              direction
            );
          }
        },
        {
          passive: true
        }
      );

      element.addEventListener(
        "pointerleave",
        () => {
          clearDirectionClasses(
            element
          );
        },
        {
          passive: true
        }
      );
    }
  );

  if (!header) {
    return;
  }

  header.addEventListener(
    "pointermove",
    (event) => {
      const rect =
        header.getBoundingClientRect();

      const offsetX =
        (event.clientX - rect.left) /
        rect.width;

      const offsetY =
        (event.clientY - rect.top) /
        rect.height;

      header.classList.toggle(
        "pointer-left",
        offsetX < 0.45
      );

      header.classList.toggle(
        "pointer-right",
        offsetX > 0.55
      );

      header.classList.toggle(
        "pointer-up",
        offsetY < 0.45
      );

      header.classList.toggle(
        "pointer-down",
        offsetY > 0.55
      );
    },
    {
      passive: true
    }
  );

  header.addEventListener(
    "pointerleave",
    () => {
      header.classList.remove(
        "pointer-left",
        "pointer-right",
        "pointer-up",
        "pointer-down"
      );
    },
    {
      passive: true
    }
  );
}

/* ==================================================
   CHROME ENTRY
================================================== */

function revealChromeEntry() {
  if (!entrySection) {
    return;
  }

  entrySection.classList.add(
    "is-revealed"
  );
}

if (
  coverLink &&
  entrySection
) {
  coverLink.addEventListener(
    "click",
    (event) => {
      if (
        prefersReducedMotion.matches
      ) {
        return;
      }

      event.preventDefault();

      document.body.classList.add(
        "is-entering"
      );

      window.setTimeout(
        () => {
          entrySection.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

          history.pushState(
            null,
            "",
            "#profile-entry"
          );
        },
        180
      );

      window.setTimeout(
        revealChromeEntry,
        520
      );

      window.setTimeout(
        () => {
          document.body.classList.remove(
            "is-entering"
          );
        },
        1900
      );
    }
  );
}

if (entrySection) {
  if (
    window.location.hash ===
    "#profile-entry"
  ) {
    revealChromeEntry();
  }

  if (
    "IntersectionObserver" in window
  ) {
    const entryObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting &&
                entry.intersectionRatio >=
                  0.35
              ) {
                revealChromeEntry();
              }
            }
          );
        },
        {
          threshold: [
            0.35,
            0.55
          ]
        }
      );

    entryObserver.observe(
      entrySection
    );
  }
}

/* ==================================================
   THREE.JS CHROME HERO
================================================== */

function initChromePointerFallback() {
  const chromeArt = document.querySelector(".chrome-art");
  const logoWrap = document.querySelector(".chrome-logo-wrap");

  if (!chromeArt || !logoWrap) {
    return;
  }

  const setPointerMotion = (event) => {
    const rect = chromeArt.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width;
    const offsetY = (event.clientY - rect.top) / rect.height;

    const rotateY = ((offsetX - 0.5) * 8).toFixed(2);
    const rotateX = ((0.5 - offsetY) * 4).toFixed(2);
    const shiftX = ((offsetX - 0.5) * 16).toFixed(2);
    const shiftY = ((0.5 - offsetY) * 12).toFixed(2);

    chromeArt.style.setProperty("--chrome-tilt-x", `${rotateX}deg`);
    chromeArt.style.setProperty("--chrome-tilt-y", `${rotateY}deg`);
    chromeArt.style.setProperty("--chrome-shift-x", `${shiftX}px`);
    chromeArt.style.setProperty("--chrome-shift-y", `${shiftY}px`);
    chromeArt.style.setProperty("--chrome-glow-x", `${(offsetX * 100).toFixed(1)}%`);
    chromeArt.style.setProperty("--chrome-glow-y", `${(offsetY * 100).toFixed(1)}%`);
  };

  const resetPointerMotion = () => {
    chromeArt.classList.remove("is-hovered");
    chromeArt.style.setProperty("--chrome-tilt-x", "0deg");
    chromeArt.style.setProperty("--chrome-tilt-y", "0deg");
    chromeArt.style.setProperty("--chrome-shift-x", "0px");
    chromeArt.style.setProperty("--chrome-shift-y", "0px");
    chromeArt.style.setProperty("--chrome-glow-x", "50%");
    chromeArt.style.setProperty("--chrome-glow-y", "50%");
  };

  const activatePointerMotion = (event) => {
    chromeArt.classList.add("is-hovered");
    setPointerMotion(event);
  };

  chromeArt.addEventListener("pointerenter", activatePointerMotion, { passive: true });
  chromeArt.addEventListener("pointermove", setPointerMotion, { passive: true });
  chromeArt.addEventListener("pointerleave", resetPointerMotion, { passive: true });
}

function initThreeChromeScene() {
  const chromeArt = document.querySelector(".chrome-art");
  const chromeWebglRoot = document.querySelector(".chrome-webgl");
  const fallbackImage = document.querySelector(".chrome-fallback");

  if (!chromeArt || !chromeWebglRoot || !fallbackImage) {
    return;
  }

  const THREE = window.THREE;

  if (
    !THREE ||
    !window.WebGLRenderingContext ||
    prefersReducedMotion.matches ||
    !finePointer.matches
  ) {
    chromeArt.classList.add("is-fallback");

    if (finePointer.matches) {
      initChromePointerFallback();
    }

    return;
  }

  try {
    // Three.js hero initialization: the ALAS wordmark is rendered on a transparent plane so the
    // original chrome identity remains readable while subtle parallax, highlight travel, and depth
    // are added without altering the rest of the portfolio structure.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    chromeWebglRoot.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const alastTexture = textureLoader.load(
      "assets/ALAS_CHROME.png",
      () => {
        chromeArt.classList.add("is-webgl");
      },
      undefined,
      () => {
        chromeArt.classList.add("is-fallback");
      }
    );

    const uniforms = {
      uTime: { value: 0 },
      uTexture: { value: alastTexture },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexShader: `
        varying vec2 vUv;
        uniform vec2 uPointer;

        void main() {
          vUv = uv;
          vec3 transformed = position;

          transformed.x += uPointer.x * 0.18 * (1.0 - abs(position.y * 0.8));
          transformed.y += uPointer.y * 0.12 * (1.0 - abs(position.x * 0.7));

          vec4 modelPosition = modelMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * viewMatrix * modelPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec2 uPointer;

        varying vec2 vUv;

        void main() {
          vec4 tex = texture2D(uTexture, vUv);
          vec2 centered = vUv - 0.5;
          float glow = 1.0 - smoothstep(0.0, 1.1, length(centered * vec2(1.25, 1.12)));

          vec2 highlightPoint = vec2(
            0.5 + uPointer.x * 0.65,
            0.5 - uPointer.y * 0.58
          );

          float highlight = smoothstep(0.38, 0.0, distance(vUv, highlightPoint));
          float sheen = smoothstep(0.0, 0.95, highlight + glow * 0.28);

          vec3 chromeTint = mix(vec3(0.88, 0.91, 0.97), vec3(1.0, 1.0, 1.0), sheen * 0.65);
          vec3 base = tex.rgb * (0.84 + sheen * 0.4);
          vec3 finalColor = mix(base, chromeTint, sheen * 0.7);

          float alpha = tex.a;
          finalColor += vec3(0.18, 0.23, 0.32) * glow * 0.16;
          finalColor += vec3(0.32, 0.38, 0.52) * highlight * 0.42;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `
    });

    const alastPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(7.4, 3.8),
      material
    );

    alastPlane.position.z = 0.25;
    scene.add(alastPlane);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.12);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
    const rimLight = new THREE.DirectionalLight(0xa5c4ff, 0.82);

    keyLight.position.set(1.8, 1.2, 3.5);
    rimLight.position.set(-2.4, -1.2, 2.6);

    scene.add(ambientLight, keyLight, rimLight);

    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerCurrent = new THREE.Vector2(0, 0);
    const targetRotation = new THREE.Vector2(0, 0);
    const currentRotation = new THREE.Vector2(0, 0);
    const hoverBoost = { value: 0 };

    function resizeRenderer() {
      const rect = chromeArt.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function updatePointerFromEvent(event) {
      chromeArt.classList.add("is-hovered");
      const rect = chromeArt.getBoundingClientRect();
      const localX = (event.clientX - rect.left) / rect.width;
      const localY = (event.clientY - rect.top) / rect.height;

      pointerTarget.x = (localX - 0.5) * 2;
      pointerTarget.y = (0.5 - localY) * 2;
      hoverBoost.value = 1;
    }

    function handlePointerLeave() {
      chromeArt.classList.remove("is-hovered");
      pointerTarget.set(0, 0);
      hoverBoost.value = 0;
    }

    chromeArt.addEventListener("pointerenter", (event) => {
      chromeArt.classList.add("is-hovered");
      updatePointerFromEvent(event);
    }, { passive: true });
    chromeArt.addEventListener("pointermove", updatePointerFromEvent, { passive: true });
    chromeArt.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    function updateSceneMotion() {
      const rect = entrySection.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const travel = Math.max(entrySection.offsetHeight - viewportHeight, 1);
      const progress = Math.min(Math.max(-rect.top / travel, 0), 1);
      const revealProgress = entrySection.classList.contains("is-revealed") ? 1 : 0;

      const scaleTarget = 0.88 + progress * 0.14 + revealProgress * 0.08;
      const depthTarget = 0.22 + progress * 0.28;

      alastPlane.scale.x = THREE.MathUtils.lerp(alastPlane.scale.x, scaleTarget, 0.08);
      alastPlane.scale.y = THREE.MathUtils.lerp(alastPlane.scale.y, scaleTarget, 0.08);
      alastPlane.position.z = THREE.MathUtils.lerp(alastPlane.position.z, depthTarget, 0.05);

      pointerCurrent.x = THREE.MathUtils.lerp(pointerCurrent.x, pointerTarget.x, 0.06);
      pointerCurrent.y = THREE.MathUtils.lerp(pointerCurrent.y, pointerTarget.y, 0.06);
      hoverBoost.value = THREE.MathUtils.lerp(hoverBoost.value, pointerTarget.lengthSq() > 0 ? 1 : 0, 0.08);

      targetRotation.x = pointerCurrent.y * (2.2 + hoverBoost.value * 1.3);
      targetRotation.y = pointerCurrent.x * (4.6 + hoverBoost.value * 2.2);
      currentRotation.x = THREE.MathUtils.lerp(currentRotation.x, targetRotation.x, 0.08);
      currentRotation.y = THREE.MathUtils.lerp(currentRotation.y, targetRotation.y, 0.08);

      alastPlane.rotation.x = currentRotation.x;
      alastPlane.rotation.y = currentRotation.y;

      const cameraX = pointerCurrent.x * (0.42 + hoverBoost.value * 0.28);
      const cameraY = pointerCurrent.y * (0.26 + hoverBoost.value * 0.18);
      const cameraZ = 5.2 - progress * 0.6;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraX, 0.08);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraY, 0.08);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraZ, 0.08);
      camera.lookAt(0, 0, 0);

      uniforms.uPointer.value.x = pointerCurrent.x * (0.92 + hoverBoost.value * 0.45);
      uniforms.uPointer.value.y = pointerCurrent.y * (0.92 + hoverBoost.value * 0.45);
      uniforms.uScroll.value = progress;
      uniforms.uTime.value += 0.016;
    }

    let frameId = null;

    function animate() {
      if (!chromeArt || !chromeWebglRoot) {
        return;
      }

      updateSceneMotion();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }

    resizeRenderer();
    updateSceneMotion();
    renderer.render(scene, camera);
    chromeArt.classList.add("is-webgl");
    frameId = requestAnimationFrame(animate);

    window.addEventListener("resize", resizeRenderer, { passive: true });

    const cleanup = () => {
      window.removeEventListener("resize", resizeRenderer);
      chromeArt.removeEventListener("pointermove", updatePointerFromEvent);
      chromeArt.removeEventListener("pointerleave", handlePointerLeave);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      material.dispose();
      alastPlane.geometry.dispose();
      alastTexture.dispose();
      renderer.dispose();
    };

    chromeArt.__threeCleanup = cleanup;
  } catch (error) {
    console.warn("Three.js ALAS hero failed to initialize; using the original image fallback.", error);
    chromeArt.classList.add("is-fallback");
  }
}

initThreeChromeScene();

/* ==================================================
   SCROLL REVEALS
================================================== */

if (
  "IntersectionObserver" in window
) {
  const revealObserver =
    new IntersectionObserver(
      (
        entries,
        observer
      ) => {
        entries.forEach(
          (entry) => {
            if (
              entry.isIntersecting
            ) {
              entry.target.classList.add(
                "is-visible"
              );

              observer.unobserve(
                entry.target
              );
            }
          }
        );
      },
      {
        threshold: 0.18,
        rootMargin:
          "0px 0px -8% 0px"
      }
    );

  if (finePointer.matches) {
    revealBlocks.forEach(
      (block) => {
        revealObserver.observe(
          block
        );
      }
    );
  } else {
    revealBlocks.forEach(
      (block) => {
        block.classList.add("is-visible");
      }
    );
  }
} else {
  revealBlocks.forEach(
    (block) => {
      block.classList.add(
        "is-visible"
      );
    }
  );
}

const projectCards = document.querySelectorAll("[data-project-card]");

projectCards.forEach((card) => {
  const toggleProjectCard = () => {
    if (finePointer.matches) {
      return;
    }

    const isOpen = card.classList.toggle("is-open");
    card.setAttribute("aria-expanded", String(isOpen));
  };

  card.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      return;
    }

    toggleProjectCard();
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    toggleProjectCard();
  });
});

const depthRows = document.querySelectorAll(".skill-row, .toolkit-row");

if ("IntersectionObserver" in window && finePointer.matches) {
  const depthObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle(
          "is-visible",
          entry.isIntersecting
        );
      });
    },
    {
      threshold: 0.24,
      rootMargin: "0px 0px -12% 0px"
    }
  );

  depthRows.forEach((row, index) => {
    row.style.setProperty("--row-delay", `${(index % 4) * 55}ms`);
    depthObserver.observe(row);
  });
} else {
  depthRows.forEach((row) => {
    row.classList.add("is-visible");
  });
}

/* ==================================================
   CHROME SCROLL STATE
================================================== */

function updateEntryScrollState() {
  if (
    !entrySection ||
    prefersReducedMotion.matches ||
    !finePointer.matches
  ) {
    return;
  }

  const rect =
    entrySection.getBoundingClientRect();

  const viewportHeight =
    window.innerHeight ||
    document.documentElement.clientHeight;

  const travel =
    Math.max(
      entrySection.offsetHeight -
        viewportHeight,
      1
    );

  const progress =
    Math.min(
      Math.max(
        -rect.top / travel,
        0
      ),
      1
    );

  entrySection.classList.toggle(
    "is-scrolled",
    progress > 0.58
  );
}

let ticking = false;

window.addEventListener(
  "scroll",
  () => {
    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(
      () => {
        updateEntryScrollState();
        ticking = false;
      }
    );
  },
  {
    passive: true
  }
);

/* ==================================================
   REDUCED MOTION
================================================== */

function handleReducedMotionChange() {
  document.body.classList.remove(
    "is-entering"
  );

  if (
    prefersReducedMotion.matches
  ) {
    finishIntro();

    revealBlocks.forEach(
      (block) => {
        block.classList.add(
          "is-visible"
        );
      }
    );

    if (entrySection) {
      entrySection.classList.add(
        "is-revealed"
      );
    }
  }
}

if (
  typeof
  prefersReducedMotion.addEventListener ===
  "function"
) {
  prefersReducedMotion.addEventListener(
    "change",
    handleReducedMotionChange
  );
} else if (
  typeof
  prefersReducedMotion.addListener ===
  "function"
) {
  prefersReducedMotion.addListener(
    handleReducedMotionChange
  );
}

/* ==================================================
   START
================================================== */

bindDirectionalMotion();
updateEntryScrollState();
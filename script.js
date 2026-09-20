document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const introScreen = document.querySelector(".intro-screen");
const header = document.querySelector(".site-header");
const coverLink = document.querySelector(".cover-link");
const entrySection = document.querySelector("#profile-entry");
const revealBlocks = document.querySelectorAll(".reveal-block");
const directionalElements = document.querySelectorAll("[data-directional]");

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

const introState = {
  started: false,
  finished: false,
  pointerFrame: 0,
  transitionTimer: null,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function setIntroVariable(name, value) {
  if (!introScreen) return;
  introScreen.style.setProperty(name, value);
}

function resetIntroPointerState() {
  if (!introScreen) return;

  setIntroVariable("--intro-tilt-x", "0deg");
  setIntroVariable("--intro-tilt-y", "0deg");
  setIntroVariable("--intro-shift-x", "0px");
  setIntroVariable("--intro-shift-y", "0px");
  setIntroVariable("--orb-shift-x", "0px");
  setIntroVariable("--orb-shift-y", "0px");
  setIntroVariable("--orb-scale", "1");
  setIntroVariable("--orb-roll", "0deg");
  setIntroVariable("--intro-glow-x", "50%");
  setIntroVariable("--intro-glow-y", "38%");
}

function updateIntroPointerVisual(clientX, clientY) {
  if (!introScreen || introState.started || introState.finished) {
    return;
  }

  const rect = introScreen.getBoundingClientRect();
  const x = clamp((clientX - rect.left) / rect.width, 0, 1);
  const y = clamp((clientY - rect.top) / rect.height, 0, 1);

  const tiltX = ((0.5 - y) * 9).toFixed(2);
  const tiltY = ((x - 0.5) * 12).toFixed(2);
  const shiftX = ((x - 0.5) * 20).toFixed(2);
  const shiftY = ((y - 0.5) * 20).toFixed(2);
  const orbShiftX = ((0.5 - x) * 26).toFixed(2);
  const orbShiftY = ((0.5 - y) * 18).toFixed(2);

  setIntroVariable("--intro-tilt-x", `${tiltX}deg`);
  setIntroVariable("--intro-tilt-y", `${tiltY}deg`);
  setIntroVariable("--intro-shift-x", `${shiftX}px`);
  setIntroVariable("--intro-shift-y", `${shiftY}px`);
  setIntroVariable("--orb-shift-x", `${orbShiftX}px`);
  setIntroVariable("--orb-shift-y", `${orbShiftY}px`);
  setIntroVariable("--orb-roll", `${((x - 0.5) * 10).toFixed(2)}deg`);
  setIntroVariable("--intro-glow-x", `${(x * 100).toFixed(1)}%`);
  setIntroVariable("--intro-glow-y", `${(y * 100).toFixed(1)}%`);
}

function reactToIntroPointer(event) {
  if (!introScreen || introState.started || introState.finished) {
    return;
  }

  if (introState.pointerFrame) {
    cancelAnimationFrame(introState.pointerFrame);
  }

  introState.pointerFrame = requestAnimationFrame(() => {
    updateIntroPointerVisual(event.clientX, event.clientY);
    introState.pointerFrame = 0;
  });
}

function beginIntroTransition() {
  if (introState.started || introState.finished) {
    return;
  }

  introState.started = true;
  document.body.classList.add("intro-transitioning", "intro-running");

  if (introScreen) {
    introScreen.classList.add("is-activated");
    introScreen.classList.remove("is-idle");
    introScreen.style.pointerEvents = "none";
    introScreen.setAttribute("aria-hidden", "false");
  }

  introState.transitionTimer = window.setTimeout(finishIntro, 3100);
}

function finishIntro() {
  if (introState.finished) {
    return;
  }

  introState.finished = true;

  if (introState.transitionTimer) {
    window.clearTimeout(introState.transitionTimer);
    introState.transitionTimer = null;
  }

  document.body.classList.remove("intro-running", "intro-transitioning");
  document.body.classList.add("intro-complete");

  if (introScreen) {
    introScreen.classList.remove("is-activated", "is-idle");
    introScreen.setAttribute("aria-hidden", "true");
    introScreen.style.pointerEvents = "none";
  }
}

function skipIntro() {
  if (introState.finished) {
    return;
  }

  if (prefersReducedMotion.matches || !introScreen) {
    finishIntro();
    return;
  }

  finishIntro();
}

function runIntro() {
  if (!introScreen) return;

  if (prefersReducedMotion.matches) {
    finishIntro();
    return;
  }

  introScreen.setAttribute("aria-hidden", "false");
  introScreen.style.pointerEvents = "auto";
  introScreen.classList.add("is-idle");
  resetIntroPointerState();
}

if (introScreen) {
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
      if (!introState.started) {
        resetIntroPointerState();
      }
    },
    { passive: true }
  );

  introScreen.addEventListener(
    "pointerdown",
    (event) => {
      if (introState.started || introState.finished) {
        return;
      }

      const rect = introScreen.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);

      setIntroVariable("--intro-tilt-x", `${((0.5 - y) * 5).toFixed(2)}deg`);
      setIntroVariable("--intro-tilt-y", `${((x - 0.5) * 8).toFixed(2)}deg`);
      setIntroVariable("--intro-shift-x", `${((x - 0.5) * 12).toFixed(2)}px`);
      setIntroVariable("--intro-shift-y", `${((y - 0.5) * 12).toFixed(2)}px`);
      setIntroVariable("--orb-shift-x", `${((0.5 - x) * 18).toFixed(2)}px`);
      setIntroVariable("--orb-shift-y", `${((0.5 - y) * 12).toFixed(2)}px`);
      setIntroVariable("--orb-scale", "0.96");
      setIntroVariable("--intro-glow-x", `${(x * 100).toFixed(1)}%`);
      setIntroVariable("--intro-glow-y", `${(y * 100).toFixed(1)}%`);

      window.setTimeout(() => {
        setIntroVariable("--orb-scale", "1");
        resetIntroPointerState();
      }, 220);

      beginIntroTransition();
    },
    { passive: true }
  );
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !introState.finished) {
    skipIntro();
  }
});

function clearDirectionClasses(element) {
  directionClasses.forEach((className) => element.classList.remove(className));
}

function getDirectionalClass(element, event) {
  const rect = element.getBoundingClientRect();
  const offsetX = (event.clientX - rect.left) / rect.width;
  const offsetY = (event.clientY - rect.top) / rect.height;

  const horizontal = offsetX < 0.38 ? "left" : offsetX > 0.62 ? "right" : "center";
  const vertical = offsetY < 0.38 ? "up" : offsetY > 0.62 ? "down" : "center";

  if (horizontal === "center" && vertical === "center") {
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
  if (!finePointer.matches || prefersReducedMotion.matches) {
    return;
  }

  directionalElements.forEach((element) => {
    if (element.dataset.alasDirectionalBound === "true") {
      return;
    }

    element.dataset.alasDirectionalBound = "true";

    element.addEventListener(
      "pointermove",
      (event) => {
        clearDirectionClasses(element);
        const direction = getDirectionalClass(element, event);

        if (direction) {
          element.classList.add(direction);
        }
      },
      { passive: true }
    );

    element.addEventListener(
      "pointerleave",
      () => clearDirectionClasses(element),
      { passive: true }
    );
  });

  if (!header) {
    return;
  }

  header.addEventListener(
    "pointermove",
    (event) => {
      const rect = header.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width;
      const offsetY = (event.clientY - rect.top) / rect.height;

      header.classList.toggle("pointer-left", offsetX < 0.45);
      header.classList.toggle("pointer-right", offsetX > 0.55);
      header.classList.toggle("pointer-up", offsetY < 0.45);
      header.classList.toggle("pointer-down", offsetY > 0.55);
    },
    { passive: true }
  );

  header.addEventListener(
    "pointerleave",
    () => {
      header.classList.remove("pointer-left", "pointer-right", "pointer-up", "pointer-down");
    },
    { passive: true }
  );
}

function revealChromeEntry() {
  if (!entrySection) {
    return;
  }

  entrySection.classList.add("is-revealed");
}

if (coverLink && entrySection) {
  coverLink.addEventListener("click", (event) => {
    if (prefersReducedMotion.matches) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("is-entering");

    window.setTimeout(() => {
      entrySection.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", "#profile-entry");
    }, 180);

    window.setTimeout(() => {
      revealChromeEntry();
    }, 520);

    window.setTimeout(() => {
      document.body.classList.remove("is-entering");
    }, 1900);
  });
}

if (entrySection) {
  if (window.location.hash === "#profile-entry") {
    revealChromeEntry();
  }

  if ("IntersectionObserver" in window) {
    const entryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            revealChromeEntry();
          }
        });
      },
      { threshold: [0.35, 0.55] }
    );

    entryObserver.observe(entrySection);
  }
}

if ("IntersectionObserver" in window && revealBlocks.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  revealBlocks.forEach((block) => revealObserver.observe(block));
} else if (revealBlocks.length) {
  revealBlocks.forEach((block) => block.classList.add("is-visible"));
}

function updateEntryScrollState() {
  if (!entrySection || prefersReducedMotion.matches) {
    return;
  }

  const rect = entrySection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const travel = Math.max(entrySection.offsetHeight - viewportHeight, 1);
  const progress = Math.min(Math.max(-rect.top / travel, 0), 1);

  entrySection.classList.toggle("is-scrolled", progress > 0.58);
}

let ticking = false;

window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(() => {
      updateEntryScrollState();
      ticking = false;
    });
  },
  { passive: true }
);

function handleReducedMotionChange() {
  document.body.classList.remove("is-entering");

  if (prefersReducedMotion.matches) {
    finishIntro();

    revealBlocks.forEach((block) => block.classList.add("is-visible"));

    if (entrySection) {
      entrySection.classList.add("is-revealed");
    }
  }
}

if (typeof prefersReducedMotion.addEventListener === "function") {
  prefersReducedMotion.addEventListener("change", handleReducedMotionChange);
} else if (typeof prefersReducedMotion.addListener === "function") {
  prefersReducedMotion.addListener(handleReducedMotionChange);
}

runIntro();
bindDirectionalMotion();
updateEntryScrollState();

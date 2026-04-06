(() => {
  "use strict";

  // ---------- Elements ----------
  const body = document.body;
  const playSurface = document.getElementById("playSurface");
  const startOverlay = document.getElementById("startOverlay");
  const startBtn = document.getElementById("startBtn");
  const fsBtn = document.getElementById("fsBtn");
  const fsNote = document.getElementById("fsNote");
  const muteBtn = document.getElementById("muteBtn");
  const scoreValue = document.getElementById("scoreValue");
  const moodBadge = document.getElementById("moodBadge");
  const centerPulse = document.getElementById("centerPulse");
  const hotCorner = document.getElementById("hotCorner");

  const parentPanel = document.getElementById("parentPanel");
  const panelMute = document.getElementById("panelMute");
  const themeSelect = document.getElementById("themeSelect");
  const motionBtn = document.getElementById("motionBtn");
  const idleBtn = document.getElementById("idleBtn");
  const exitFsBtn = document.getElementById("exitFsBtn");
  const resetBtn = document.getElementById("resetBtn");
  const closePanelBtn = document.getElementById("closePanelBtn");

  // ---------- State ----------
  const moods = [
    "Tiny Joy Storm",
    "Giggle Galaxy",
    "Happy Tap Parade",
    "Bouncy Color Party",
    "Silly Sparkle Time",
    "Wiggle Wonder Mode"
  ];

  const themes = {
    confetti: {
      colors: ["#ff5ea8", "#ffcf40", "#59f0ff", "#8dff7a", "#ffffff"],
      emojis: ["🎉", "✨", "🌈", "🟣", "🟡"]
    },
    bubbles: {
      colors: ["#8de7ff", "#d2f8ff", "#6fd3ff", "#ffffff", "#9bf2df"],
      emojis: ["🫧", "🐠", "💧", "🐳", "🪸"]
    },
    space: {
      colors: ["#a896ff", "#79b8ff", "#ffd16e", "#ffffff", "#ef8bff"],
      emojis: ["⭐", "🪐", "🌙", "☄️", "✨"]
    },
    underwater: {
      colors: ["#87ffd0", "#62daff", "#bafcff", "#ffffff", "#5bf0a8"],
      emojis: ["🐟", "🪸", "🐢", "💦", "🫧"]
    }
  };

  const state = {
    started: false,
    score: 0,
    soundOn: true,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    idleDemo: true,
    theme: "confetti",
    parentOpen: false,
    typedBuffer: "",
    lastInputAt: Date.now(),
    audioCtx: null
  };

  // ---------- Utilities ----------
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function pointInViewportFallback() {
    return {
      x: window.innerWidth * rand(0.25, 0.75),
      y: window.innerHeight * rand(0.25, 0.75)
    };
  }

  function setMood() {
    moodBadge.textContent = pick(moods);
  }

  function updateScore(increment = 1) {
    state.score += increment;
    scoreValue.textContent = String(state.score);
  }

  function setSoundUI() {
    const text = state.soundOn ? "🔊 Sound On" : "🔇 Sound Off";
    muteBtn.textContent = text;
    muteBtn.setAttribute("aria-pressed", String(!state.soundOn));
  }

  function applyReducedMotion() {
    body.classList.toggle("reduced-motion", state.reducedMotion);
    motionBtn.textContent = `Reduced Motion: ${state.reducedMotion ? "On" : "Off"}`;
  }

  function applyIdleDemoUI() {
    idleBtn.textContent = `Idle Demo: ${state.idleDemo ? "On" : "Off"}`;
  }

  function setTheme(name) {
    if (!themes[name]) return;
    state.theme = name;
    body.setAttribute("data-theme", name);
    themeSelect.value = name;
  }

  function markInput() {
    state.lastInputAt = Date.now();
  }

  function clearTransientEffects() {
    playSurface.querySelectorAll(".effect").forEach((n) => n.remove());
  }

  // ---------- Audio ----------
  function ensureAudio() {
    if (!state.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      state.audioCtx = new AC();
    }
    if (state.audioCtx.state === "suspended") state.audioCtx.resume().catch(() => {});
    return state.audioCtx;
  }

  function playBlip() {
    if (!state.soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.value = rand(220, 880);
    filter.type = "lowpass";
    filter.frequency.value = rand(1000, 2400);

    gain.gain.value = 0.001;
    gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }

  // ---------- Effects ----------
  function spawnCenterPulse() {
    centerPulse.classList.remove("active");
    void centerPulse.offsetWidth;
    centerPulse.classList.add("active");
  }

  function spawnSpark(x, y) {
    const t = themes[state.theme];
    const count = state.reducedMotion ? 5 : 14;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "effect spark";
      const size = rand(10, 20);
      el.style.left = `${x - size / 2}px`;
      el.style.top = `${y - size / 2}px`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.background = pick(t.colors);
      el.style.setProperty("--dx", `${rand(-140, 140)}px`);
      el.style.setProperty("--dy", `${rand(-120, 120)}px`);
      playSurface.appendChild(el);
      setTimeout(() => el.remove(), state.reducedMotion ? 180 : 820);
    }
  }

  function spawnBubbles(x, y) {
    const t = themes[state.theme];
    const count = state.reducedMotion ? 3 : 9;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "effect bubble";
      const size = rand(18, 58);
      el.style.left = `${x - size / 2 + rand(-20, 20)}px`;
      el.style.top = `${y - size / 2 + rand(-15, 15)}px`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderColor = pick(t.colors);
      el.style.setProperty("--dx", `${rand(-35, 35)}px`);
      el.style.setProperty("--dy", `${rand(-50, 15)}px`);
      playSurface.appendChild(el);
      setTimeout(() => el.remove(), state.reducedMotion ? 220 : 1320);
    }
  }

  function spawnEmoji(x, y) {
    const t = themes[state.theme];
    const el = document.createElement("div");
    el.className = "effect emoji";
    el.textContent = pick(t.emojis);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--dx", `${rand(-80, 80)}px`);
    el.style.setProperty("--dy", `${rand(-120, -30)}px`);
    playSurface.appendChild(el);
    setTimeout(() => el.remove(), state.reducedMotion ? 200 : 1120);
  }

  function spawnStar(x, y) {
    const t = themes[state.theme];
    const el = document.createElement("div");
    el.className = "effect star";
    el.textContent = "✦";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = pick(t.colors);
    el.style.setProperty("--dx", `${rand(-120, 120)}px`);
    el.style.setProperty("--dy", `${rand(-120, 70)}px`);
    playSurface.appendChild(el);
    setTimeout(() => el.remove(), state.reducedMotion ? 200 : 920);
  }

  function spawnThemeEffect(x, y) {
    switch (state.theme) {
      case "bubbles":
        spawnBubbles(x, y);
        spawnEmoji(x, y);
        break;
      case "space":
        spawnStar(x, y);
        spawnSpark(x, y);
        break;
      case "underwater":
        spawnBubbles(x, y);
        spawnStar(x, y);
        spawnEmoji(x, y);
        break;
      case "confetti":
      default:
        spawnSpark(x, y);
        spawnEmoji(x, y);
        break;
    }
  }

  function celebrateAt(x, y) {
    if (!state.started) return;
    markInput();
    spawnThemeEffect(x, y);
    spawnCenterPulse();
    playBlip();
    updateScore(1);
    if (Math.random() < 0.23) setMood();
  }

  // ---------- Fullscreen ----------
  async function enterFullscreen() {
    const root = document.documentElement;
    const can = !!(root.requestFullscreen || root.webkitRequestFullscreen);
    if (!can) {
      fsNote.textContent = "Fullscreen is not supported on this browser.";
      return;
    }
    try {
      if (root.requestFullscreen) {
        await root.requestFullscreen();
      } else if (root.webkitRequestFullscreen) {
        root.webkitRequestFullscreen();
      }
      fsNote.textContent = "";
    } catch {
      fsNote.textContent = "Fullscreen was blocked. You can still play!";
    }
  }

  async function exitFullscreen() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore and continue gracefully.
    }
  }

  // ---------- Parent panel unlock ----------
  function openParentPanel() {
    state.parentOpen = true;
    parentPanel.classList.add("open");
    parentPanel.setAttribute("aria-hidden", "false");
  }

  function closeParentPanel() {
    state.parentOpen = false;
    parentPanel.classList.remove("open");
    parentPanel.setAttribute("aria-hidden", "true");
    state.typedBuffer = "";
  }

  let holdTimer = null;
  function onCornerHoldStart() {
    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = setTimeout(openParentPanel, 2000);
  }
  function onCornerHoldEnd() {
    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = null;
  }

  function updateTypedBuffer(key) {
    const lower = key.toLowerCase();
    if (!/^[a-z]$/.test(lower)) {
      state.typedBuffer = "";
      return;
    }
    state.typedBuffer = (state.typedBuffer + lower).slice(-6);
    if (state.typedBuffer.includes("parent")) {
      openParentPanel();
      state.typedBuffer = "";
    }
  }

  // ---------- Input handlers ----------
  function getPointerPoint(evt) {
    if (evt.touches && evt.touches[0]) {
      return { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
    }
    return { x: evt.clientX, y: evt.clientY };
  }

  function onPointer(evt) {
    if (!state.started || state.parentOpen) return;
    const p = getPointerPoint(evt);
    celebrateAt(p.x, p.y);
  }

  function onKey(evt) {
    if ((evt.ctrlKey || evt.metaKey) && ["r", "w", "q", "n", "t"].includes(evt.key.toLowerCase())) {
      evt.preventDefault();
      return;
    }
    if (["F5"].includes(evt.key)) {
      evt.preventDefault();
      return;
    }

    updateTypedBuffer(evt.key);

    if (!state.started || state.parentOpen) return;

    evt.preventDefault();
    const centerish = {
      x: window.innerWidth * rand(0.35, 0.65),
      y: window.innerHeight * rand(0.35, 0.68)
    };
    celebrateAt(centerish.x, centerish.y);
  }

  // ---------- Idle demo ----------
  setInterval(() => {
    if (!state.started || !state.idleDemo || state.parentOpen) return;
    const idleFor = Date.now() - state.lastInputAt;
    if (idleFor < 4500) return;

    const p = pointInViewportFallback();
    spawnThemeEffect(p.x, p.y);
    if (Math.random() < 0.35) playBlip();
  }, 1300);

  // ---------- Controls ----------
  startBtn.addEventListener("click", () => {
    state.started = true;
    startOverlay.classList.add("hidden");
    setMood();
    markInput();
    ensureAudio();
  });

  fsBtn.addEventListener("click", enterFullscreen);

  muteBtn.addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    setSoundUI();
    if (state.soundOn) playBlip();
  });

  panelMute.addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    setSoundUI();
  });

  themeSelect.addEventListener("change", () => setTheme(themeSelect.value));

  motionBtn.addEventListener("click", () => {
    state.reducedMotion = !state.reducedMotion;
    applyReducedMotion();
  });

  idleBtn.addEventListener("click", () => {
    state.idleDemo = !state.idleDemo;
    applyIdleDemoUI();
  });

  exitFsBtn.addEventListener("click", exitFullscreen);

  resetBtn.addEventListener("click", () => {
    state.score = 0;
    scoreValue.textContent = "0";
    clearTransientEffects();
  });

  closePanelBtn.addEventListener("click", closeParentPanel);

  parentPanel.addEventListener("click", (evt) => {
    if (evt.target === parentPanel) closeParentPanel();
  });

  hotCorner.addEventListener("pointerdown", onCornerHoldStart);
  hotCorner.addEventListener("pointerup", onCornerHoldEnd);
  hotCorner.addEventListener("pointercancel", onCornerHoldEnd);
  hotCorner.addEventListener("pointerleave", onCornerHoldEnd);

  playSurface.addEventListener("pointerdown", onPointer, { passive: true });
  playSurface.addEventListener("touchstart", onPointer, { passive: true });
  window.addEventListener("keydown", onKey, { passive: false });

  const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionMedia.addEventListener?.("change", (e) => {
    if (!state.parentOpen) {
      state.reducedMotion = e.matches;
      applyReducedMotion();
    }
  });

  // ---------- Init ----------
  applyReducedMotion();
  applyIdleDemoUI();
  setSoundUI();
  setTheme(state.theme);
  setMood();
})();

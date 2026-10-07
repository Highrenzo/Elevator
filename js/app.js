(() => {
  const floors = CONFIG.floors;
  const $floor = document.getElementById("floor");
  const $arrow = document.getElementById("arrow");
  const $keypad = document.getElementById("keypad");

  let current = CONFIG.startFloorIndex;
  let moving = false;
  const keys = [];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- Rendering pulsanti ----------
  // Come negli ascensori veri: piano più basso in basso a sinistra.
  const order = floors.map((_, i) => i);
  const rows = [];
  for (let i = 0; i < order.length; i += 2) rows.push(order.slice(i, i + 2));
  rows.reverse().flat().forEach((i) => {
    const btn = document.createElement("button");
    btn.className = "key";
    btn.textContent = floors[i].label;
    btn.setAttribute("aria-label", floors[i].name);
    btn.addEventListener("click", () => onPress(i));
    keys[i] = btn;
    $keypad.appendChild(btn);
  });

  function render() {
    $floor.textContent = floors[current].label;
    keys.forEach((k, i) => k.classList.toggle("current", i === current));
  }

  function restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  // Animazione al tocco: tre onde nei colori isybank
  function ripple(key) {
    ["var(--isy-blue)", "var(--isy-green)", "var(--isy-orange)"].forEach((c, n) => {
      const r = document.createElement("span");
      r.className = "ripple";
      r.style.setProperty("--c", c);
      r.style.animationDelay = `${n * 0.09}s`;
      r.addEventListener("animationend", () => r.remove());
      key.appendChild(r);
    });
  }

  // ---------- Logica ----------
  function onPress(target) {
    unlockAudio();
    const key = keys[target];

    if (moving || target === current) {
      restart(key, "shake");
      return;
    }
    ripple(key);
    travel(target);
  }

  async function travel(target) {
    moving = true;
    $floor.classList.remove("arrived");

    const dir = target > current ? 1 : -1;
    keys[target].classList.add("lit");
    $arrow.dataset.dir = dir > 0 ? "up" : "down";

    while (current !== target) {
      await sleep(CONFIG.secondsPerFloor * 1000);
      current += dir;
      render();
      $floor.style.setProperty("--tick-from", dir > 0 ? "30%" : "-30%");
      restart($floor, "tick");
    }

    // Arrivo
    $arrow.dataset.dir = "idle";
    keys[target].classList.remove("lit");
    $floor.classList.remove("tick");
    restart($floor, "arrived");
    if (CONFIG.chime) chime();
    moving = false;
  }

  // ---------- Suono "ding" ----------
  let audio;
  function unlockAudio() {
    // iOS richiede un tocco dell'utente per attivare l'audio
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
  }

  function chime() {
    if (!audio) return;
    const t = audio.currentTime;
    [[880, 0], [659.25, 0.35]].forEach(([freq, delay]) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.4, t + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.4);
      osc.connect(gain).connect(audio.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 1.5);
    });
  }

  render();

  // ---------- Offline (service worker) ----------
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js");
  }
})();

import "./styles.css";
import { icons } from "./js/icons.js";
import { THEMES, ACCENTS, applyTheme, extractLogoGlowColor } from "./js/themes.js";
import {
  loadStationCatalog,
  parseNumericFreq,
  slugifyStation,
  stationCity
} from "./js/catalog.js";
import { RadioVisualizer } from "./js/visualizer.js";

const fallbackLogo = "/assets/app-icon.png";
const RETRY_DELAYS_MS = [2000, 4000, 8000, 15000, 30000];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const state = {
  stations: [],
  catalogSource: "Syncing GlzHub…",
  selected: null,
  playing: false,
  intentionallyStopped: false,
  filter: "All",
  city: "All Cities",
  query: "",
  viewMode: localStorage.getItem("glz-view") || "list",
  theme: localStorage.getItem("glz-theme") || "Signal Noir",
  accent: localStorage.getItem("glz-accent") || "Amber",
  favorites: new Set(readJson("glz-favorites", [])),
  presets: readJson("glz-presets", [null, null, null, null, null, null]),
  recent: readJson("glz-recent", []),
  volume: Number(localStorage.getItem("glz-volume") ?? 0.9),
  muted: localStorage.getItem("glz-muted") === "true",
  sheetExpanded: false,
  sleepTimerEnd: null,
  sleepTimerDuration: 0,
  sleepTimerId: null,
  retryAttempt: 0,
  retryTimerId: null,
  streamLatencyMs: null,
  connectStartedAt: 0,
  noCorsStreams: new Set(),
  health: {},
  testingStreams: false
};

if (!Array.isArray(state.presets) || state.presets.length !== 6) {
  state.presets = [null, null, null, null, null, null];
}
if (!Number.isFinite(state.volume) || state.volume < 0 || state.volume > 1) {
  state.volume = 0.9;
}

applyTheme(state.theme, state.accent);

const audio = new Audio();
audio.preload = "none";
audio.volume = state.muted ? 0 : state.volume;
const visualizer = new RadioVisualizer(audio);

document.querySelector("#app").innerHTML = `
  <main class="app">
    <header class="topbar">
      <div class="brand">
        <img src="/assets/app-icon.png" alt="Glz Radio logo">
        <div class="brand-text">
          <strong>Glz Radio</strong>
          <span id="catalog-source-label">SYNCING GLZHUB…</span>
        </div>
      </div>
      <div class="topbar-actions">
        <button class="icon-pill-btn" id="open-diagnostics" type="button" title="Stream Health & GlzHub Sync" aria-label="Stream health and GlzHub sync">
          ${icons.signal}<span class="btn-label">Signal</span>
        </button>
        <button class="icon-pill-btn" id="open-theme" type="button" title="Theme & Accent" aria-label="Theme and accent settings">
          ${icons.palette}<span class="btn-label">Theme</span>
        </button>
        <button class="icon-pill-btn" id="open-shortcuts" type="button" title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts">
          ${icons.keyboard}
        </button>
        <div class="status-pill"><span class="status-dot" id="network-dot"></span><span id="network-label">Connected</span></div>
      </div>
    </header>

    <div class="header-band">
      <section class="weather-strip" aria-label="Local weather">
        <div class="weather-summary">
          <strong class="temperature" id="temperature">--°</strong>
          <span class="weather-copy" id="weather-copy">Updating local conditions…</span>
        </div>
        <button class="text-btn compact" id="weather" type="button">Use location</button>
      </section>

      <section class="hero" aria-label="Glz Radio">
        <img class="hero-image" src="/assets/header-banner.png" alt="Glz Radio — Puerto Rico Live Radio">
      </section>
    </div>

    <div class="dashboard">
      <section class="panel library">
        <div class="library-header">
          <div>
            <div class="eyebrow">Puerto Rico live radio</div>
            <h1>Find your signal</h1>
            <p class="lede">News, salsa, pop and local voices synced from GlzHub.</p>
          </div>
          <div class="view-toggle" role="group" aria-label="Station layout">
            <button class="view-btn" id="view-list" type="button" title="List view" aria-label="List view">${icons.list}</button>
            <button class="view-btn" id="view-grid" type="button" title="Grid view" aria-label="Grid view">${icons.grid}</button>
          </div>
        </div>

        <section class="presets-section" aria-label="Quick presets">
          <div class="section-mini-head">
            <span class="section-mini-title">Presets 1–6</span>
            <span class="section-mini-hint">Click to tune · Right-click or hold to save</span>
          </div>
          <div class="presets-grid" id="presets-grid"></div>
        </section>

        <section class="recent-section" id="recent-section" hidden aria-label="Recently played">
          <div class="section-mini-head">
            <span class="section-mini-title">Recently played</span>
          </div>
          <div class="recent-shelf" id="recent-shelf"></div>
        </section>

        <div class="toolbar">
          <div class="toolbar-top">
            <div class="search-wrap">
              <span class="search-icon">${icons.search}</span>
              <input id="search" class="search" type="search" placeholder="Search stations, dial, or city ( / )" aria-label="Search stations" autocomplete="off">
              <button id="search-clear" class="search-clear" type="button" aria-label="Clear search" hidden>${icons.clear}</button>
            </div>
            <select class="city-select" id="city-filters" aria-label="Filter stations by city"></select>
          </div>
          <div class="filters" id="filters"></div>
        </div>

        <div class="station-list" id="station-list"></div>
      </section>

      <aside class="side">
        <section class="panel now-playing" id="desktop-player" hidden>
          <div class="on-air">
            <span class="live idle" id="live-badge">STANDBY</span>
            <span class="clock" id="clock"></span>
          </div>
          <div class="cover-wrap"><img class="cover" id="cover" alt=""></div>
          <h2 class="now-title" id="now-title"></h2>
          <div class="now-meta" id="now-meta"></div>

          <div class="telemetry-row" id="telemetry-row"></div>

          <div class="visualizer-wrap" aria-hidden="true">
            <canvas class="visualizer-canvas" id="desktop-visualizer"></canvas>
          </div>

          <div class="dial-wrap" aria-label="Analog frequency tuner">
            <div class="dial-head">
              <span id="dial-band-label">FM DIAL</span>
              <span class="dial-freq-readout" id="dial-freq-readout">—</span>
            </div>
            <div class="dial-track" id="desktop-dial"></div>
          </div>

          <div class="rds" id="rds">RDS / Ready for station</div>

          <div class="transport-row">
            <button class="round-btn" id="desktop-prev" type="button" title="Previous station (←)" aria-label="Previous station">${icons.prev}</button>
            <button class="round-btn primary" id="play" type="button" title="Play / Pause (Space)" aria-label="Play or Pause">${icons.play}</button>
            <button class="round-btn" id="desktop-next" type="button" title="Next station (→)" aria-label="Next station">${icons.next}</button>
            <button class="round-btn danger" id="stop" type="button" title="Stop" aria-label="Stop">${icons.stop}</button>
          </div>

          <div class="volume-row">
            <button class="volume-btn" id="mute-btn" type="button" title="Mute / Unmute (M)" aria-label="Toggle mute">${icons.volume}</button>
            <input class="volume-slider" id="volume-slider" type="range" min="0" max="100" value="${Math.round(state.volume * 100)}" aria-label="Volume">
            <span class="volume-pct" id="volume-pct">${Math.round(state.volume * 100)}%</span>
          </div>

          <div class="controls-grid">
            <button class="text-btn" id="favorite-current" type="button">${icons.heartEmpty}<span>Favorite</span></button>
            <button class="text-btn" id="desktop-timer-trigger" type="button">${icons.moon}<span id="desktop-timer-label">Sleep</span></button>
            <button class="text-btn" id="share" type="button">${icons.share}<span>Share</span></button>
          </div>

          <p class="player-status" id="player-status">Ready to play</p>
        </section>

        <section class="panel player-prompt" id="player-prompt">
          <div class="eyebrow">Studio ready</div>
          <h2>Choose a station</h2>
          <p>Select any station or preset to stream live with dynamic artwork glow, spectrum visualizer, and frequency dial.</p>
          <div class="shortcut-hint-bar">
            <span class="kbd"><code>Space</code> Play</span>
            <span class="kbd"><code>←/→</code> Tune</span>
            <span class="kbd"><code>1–6</code> Presets</span>
            <span class="kbd"><code>/</code> Search</span>
          </div>
        </section>
      </aside>
    </div>
  </main>

  <!-- Mobile Floating Mini Player -->
  <div class="mobile-mini-player" id="mobile-mini-player" hidden role="region" aria-label="Now Playing Mini Player">
    <div class="thumb-wrap"><img id="mobile-cover" alt=""></div>
    <div class="mini-info">
      <div class="mobile-title" id="mobile-title"></div>
      <div class="mobile-meta">
        <span class="mini-live-dot" id="mobile-live-dot"></span>
        <span id="mobile-status-text">Live now</span>
      </div>
    </div>
    <div class="mobile-mini-controls">
      <button class="mini-play-btn" id="mobile-play" type="button" aria-label="Play or Pause">${icons.play}</button>
      <button class="mini-expand-btn" id="mobile-expand" type="button" aria-label="Expand player">${icons.chevronUp}</button>
    </div>
  </div>

  <!-- Mobile Full-Screen Player Sheet -->
  <div class="mobile-player-sheet" id="mobile-player-sheet" role="dialog" aria-modal="true" aria-label="Now Playing">
    <div class="sheet-handle-bar"></div>
    <div class="sheet-top">
      <button class="sheet-collapse-btn" id="sheet-collapse" type="button" aria-label="Close player">${icons.chevronDown}</button>
      <span class="sheet-live-badge" id="sheet-live-badge">LIVE ON AIR</span>
      <span class="clock" id="sheet-clock"></span>
    </div>

    <div class="sheet-cover-container">
      <div class="sheet-cover-glow"></div>
      <img class="sheet-cover-img" id="sheet-cover" alt="">
    </div>

    <div class="sheet-details">
      <h2 class="sheet-title" id="sheet-title">Station Name</h2>
      <div class="sheet-tagline" id="sheet-tagline">Tagline</div>
      <span class="sheet-meta-pill" id="sheet-meta">Frequency · Location</span>
    </div>

    <div class="visualizer-wrap" aria-hidden="true">
      <canvas class="visualizer-canvas" id="sheet-visualizer"></canvas>
    </div>

    <div class="dial-wrap" aria-label="Analog frequency tuner">
      <div class="dial-head">
        <span id="sheet-dial-band">FM DIAL</span>
        <span class="dial-freq-readout" id="sheet-dial-freq">—</span>
      </div>
      <div class="dial-track" id="sheet-dial"></div>
    </div>

    <div class="rds" id="sheet-rds">RDS / Connected</div>

    <div class="sheet-main-controls">
      <button class="round-btn" id="sheet-prev" type="button" aria-label="Previous station">${icons.prev}</button>
      <button class="sheet-play-btn" id="sheet-play" type="button" aria-label="Play or Pause">${icons.play}</button>
      <button class="round-btn" id="sheet-next" type="button" aria-label="Next station">${icons.next}</button>
    </div>

    <div class="sheet-actions">
      <button class="sheet-action-btn" id="sheet-fav" type="button">
        <span id="sheet-fav-icon">${icons.heartEmpty}</span>
        <span id="sheet-fav-label">Favorite</span>
      </button>
      <button class="sheet-action-btn" id="sheet-timer-trigger" type="button">
        ${icons.moon}
        <span id="sheet-timer-label">Sleep</span>
      </button>
      <button class="sheet-action-btn" id="sheet-share" type="button">
        ${icons.share}
        <span>Share</span>
      </button>
      <button class="sheet-action-btn" id="sheet-stop" type="button">
        ${icons.stop}
        <span>Stop</span>
      </button>
    </div>
  </div>

  <!-- Sleep Timer Modal -->
  <div class="modal-backdrop" id="timer-modal" role="dialog" aria-modal="true" aria-label="Sleep timer">
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Sleep Timer</h3>
        <button class="modal-close" data-close-modal="timer-modal" type="button" aria-label="Close">${icons.clear}</button>
      </div>
      <div class="timer-options" id="timer-options">
        <button class="timer-btn" data-minutes="15" type="button">15 minutes</button>
        <button class="timer-btn" data-minutes="30" type="button">30 minutes</button>
        <button class="timer-btn" data-minutes="45" type="button">45 minutes</button>
        <button class="timer-btn" data-minutes="60" type="button">60 minutes</button>
        <button class="timer-btn" data-minutes="0" type="button" style="grid-column: 1 / -1; color: var(--danger);">Turn off timer</button>
      </div>
    </div>
  </div>

  <!-- Theme & Accent Modal -->
  <div class="modal-backdrop" id="theme-modal" role="dialog" aria-modal="true" aria-label="Appearance settings">
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Look &amp; Feel</h3>
        <button class="modal-close" data-close-modal="theme-modal" type="button" aria-label="Close">${icons.clear}</button>
      </div>
      <div class="modal-section-label">Studio Theme</div>
      <div class="theme-grid" id="theme-grid"></div>
      <div class="modal-section-label">Signal Accent</div>
      <div class="accent-row" id="accent-row"></div>
    </div>
  </div>

  <!-- Signal & GlzHub Diagnostics Modal -->
  <div class="modal-backdrop" id="diagnostics-modal" role="dialog" aria-modal="true" aria-label="Signal health and catalog sync">
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Signal &amp; Catalog</h3>
        <button class="modal-close" data-close-modal="diagnostics-modal" type="button" aria-label="Close">${icons.clear}</button>
      </div>
      <p style="color: var(--muted); font-size: 0.84rem; margin-bottom: 12px;">
        Catalog source: <strong id="diag-source" style="color: var(--text);">—</strong>
      </p>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="text-btn primary" id="sync-catalog-btn" type="button">${icons.refresh}<span>Sync GlzHub</span></button>
        <button class="text-btn" id="test-streams-btn" type="button">${icons.signal}<span>Test All Streams</span></button>
      </div>
      <div class="health-list" id="health-list"></div>
    </div>
  </div>

  <!-- Keyboard Shortcuts Modal -->
  <div class="modal-backdrop" id="shortcuts-modal" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Keyboard Shortcuts</h3>
        <button class="modal-close" data-close-modal="shortcuts-modal" type="button" aria-label="Close">${icons.clear}</button>
      </div>
      <div class="shortcut-table">
        <div class="shortcut-row"><span>Play / Pause</span><span class="kbd"><code>Space</code></span></div>
        <div class="shortcut-row"><span>Previous / Next Station</span><span class="kbd"><code>←</code> / <code>→</code></span></div>
        <div class="shortcut-row"><span>Volume Up / Down</span><span class="kbd"><code>↑</code> / <code>↓</code></span></div>
        <div class="shortcut-row"><span>Mute / Unmute</span><span class="kbd"><code>M</code></span></div>
        <div class="shortcut-row"><span>Quick Presets</span><span class="kbd"><code>1</code> – <code>6</code></span></div>
        <div class="shortcut-row"><span>Focus Search</span><span class="kbd"><code>/</code></span></div>
        <div class="shortcut-row"><span>Close Modal / Sheet</span><span class="kbd"><code>Esc</code></span></div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast" role="status"></div>
`;

const $ = (selector) => document.querySelector(selector);

visualizer.attachCanvas($("#desktop-visualizer"));
visualizer.attachCanvas($("#sheet-visualizer"));

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => element.classList.remove("show"), 2300);
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

function closeAllModals() {
  document.querySelectorAll(".modal-backdrop.open").forEach((m) => m.classList.remove("open"));
}

function renderThemeModal() {
  $("#theme-grid").innerHTML = Object.entries(THEMES).map(([name, cfg]) => `
    <button class="swatch-btn ${state.theme === name ? "active" : ""}" data-theme-choice="${escapeHtml(name)}" type="button">
      <span class="swatch-dot" style="background:${cfg.swatch}"></span>
      <span>${escapeHtml(name)}</span>
    </button>
  `).join("");

  const isLight = Boolean(THEMES[state.theme]?.light);
  $("#accent-row").innerHTML = Object.entries(ACCENTS).map(([name, cfg]) => `
    <button class="swatch-btn ${state.accent === name ? "active" : ""}" data-accent-choice="${escapeHtml(name)}" type="button">
      <span class="swatch-dot" style="background:${isLight ? cfg.light : cfg.dark}"></span>
      <span>${escapeHtml(name)}</span>
    </button>
  `).join("");
}

function renderViewToggle() {
  $("#view-list").classList.toggle("active", state.viewMode === "list");
  $("#view-grid").classList.toggle("active", state.viewMode === "grid");
  $("#station-list").classList.toggle("grid-mode", state.viewMode === "grid");
}

function renderPresets() {
  $("#presets-grid").innerHTML = state.presets.map((stationName, index) => {
    const station = stationName ? state.stations.find((s) => s.name === stationName) : null;
    const isActive = station && state.selected?.name === station.name;
    if (!station) {
      return `
        <button class="preset-btn empty" data-preset="${index}" type="button" title="Save active station to Preset ${index + 1}">
          <span class="preset-slot">P${index + 1}</span>
          <span class="preset-label">+ Save</span>
          <span class="preset-sub">Empty slot</span>
        </button>
      `;
    }
    return `
      <button class="preset-btn ${isActive ? "active" : ""}" data-preset="${index}" type="button" title="${escapeHtml(station.name)} — Right-click to reassign">
        <span class="preset-slot">P${index + 1}</span>
        <span class="preset-label">${escapeHtml(station.name)}</span>
        <span class="preset-sub">${escapeHtml(station.frequency)}</span>
      </button>
    `;
  }).join("");
}

function assignPreset(slotIndex) {
  if (!state.selected) {
    toast("Pick a station first to save a preset");
    return;
  }
  if (state.presets[slotIndex] === state.selected.name) {
    state.presets[slotIndex] = null;
    toast(`Cleared Preset ${slotIndex + 1}`);
  } else {
    state.presets[slotIndex] = state.selected.name;
    toast(`Saved ${state.selected.name} to Preset ${slotIndex + 1}`);
  }
  localStorage.setItem("glz-presets", JSON.stringify(state.presets));
  renderPresets();
}

function triggerPreset(slotIndex) {
  const savedName = state.presets[slotIndex];
  const station = savedName ? state.stations.find((s) => s.name === savedName) : null;
  if (station) {
    selectStation(station.name, true);
  } else {
    assignPreset(slotIndex);
  }
}

function recordRecent(station) {
  state.recent = [station.name, ...state.recent.filter((n) => n !== station.name)].slice(0, 8);
  localStorage.setItem("glz-recent", JSON.stringify(state.recent));
  renderRecent();
}

function renderRecent() {
  const recentStations = state.recent
    .map((name) => state.stations.find((s) => s.name === name))
    .filter(Boolean);
  $("#recent-section").hidden = recentStations.length === 0;
  if (!recentStations.length) return;
  $("#recent-shelf").innerHTML = recentStations.map((station) => `
    <button class="recent-pill ${state.selected?.name === station.name ? "active" : ""}" data-recent="${escapeHtml(station.name)}" type="button">
      <img src="${station.logo}" alt="" loading="lazy">
      <span>${escapeHtml(station.name)}</span>
    </button>
  `).join("");
  $("#recent-shelf").querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => { img.src = fallbackLogo; }, { once: true });
  });
}

function renderFilters() {
  const filterList = ["All", "Favorites", "FM", "AM", "Satellite"];
  $("#filters").innerHTML = filterList.map((filter) => {
    const count = filter === "Favorites" ? ` (${state.favorites.size})` : "";
    return `<button class="chip ${state.filter === filter ? "active" : ""}" data-filter="${filter}" type="button">${filter}${count}</button>`;
  }).join("");
}

function renderCityFilters() {
  const cities = ["All Cities", ...new Set(state.stations.map(stationCity))].sort((a, b) => {
    if (a === "All Cities") return -1;
    if (b === "All Cities") return 1;
    return a.localeCompare(b);
  });
  $("#city-filters").innerHTML = cities.map((city) =>
    `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`
  ).join("");
  if (!cities.includes(state.city)) state.city = "All Cities";
  $("#city-filters").value = state.city;
}

function visibleStations() {
  const query = state.query.trim().toLowerCase();
  return state.stations.filter((station) => {
    const inFilter =
      state.filter === "All" ||
      (state.filter === "Favorites" ? state.favorites.has(station.name) : station.band === state.filter);
    const inCity = state.city === "All Cities" || stationCity(station) === state.city;
    const haystack = `${station.name} ${station.frequency} ${station.callSign} ${station.tagline} ${station.location}`.toLowerCase();
    return inFilter && inCity && haystack.includes(query);
  });
}

function renderStations() {
  const items = visibleStations();
  $("#station-list").innerHTML = items.length
    ? items.map((station) => {
        const isSelected = state.selected?.name === station.name;
        const isPlayingThis = isSelected && state.playing;
        const isFav = state.favorites.has(station.name);
        const health = state.health[station.name];
        const healthDot = health
          ? `<span class="health-dot ${health.status}" title="${escapeHtml(health.label)}"></span>`
          : "";

        return `
          <article class="station ${isSelected ? "selected" : ""}" data-station="${escapeHtml(station.name)}" tabindex="0" role="button" aria-label="Play ${escapeHtml(station.name)}">
            <div class="station-logo-wrap">
              <img class="station-logo" src="${station.logo}" alt="" loading="lazy">
              ${isPlayingThis ? `
                <div class="station-playing-badge" aria-label="Playing">
                  <div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>
                </div>
              ` : ""}
            </div>
            <div class="station-info">
              <div class="station-name-row">
                <div class="station-name">${escapeHtml(station.name)}</div>
                ${healthDot}
              </div>
              <div class="station-meta">${escapeHtml(station.frequency)}${station.callSign ? ` / ${escapeHtml(station.callSign)}` : ""} · ${escapeHtml(station.location)}</div>
            </div>
            <span class="station-band">${escapeHtml(station.band)}</span>
            <button class="station-fav-btn ${isFav ? "favorited" : ""}" data-favorite="${escapeHtml(station.name)}" type="button" aria-label="${isFav ? "Remove favorite" : "Add to favorites"}">
              ${isFav ? icons.heartFilled : icons.heartEmpty}
            </button>
          </article>
        `;
      }).join("")
    : `<div class="empty">${state.stations.length ? `No stations match "${escapeHtml(state.query || state.filter)}".` : "Loading stations from GlzHub…"}</div>`;

  document.querySelectorAll(".station-logo").forEach((img) => {
    img.addEventListener("error", () => { img.src = fallbackLogo; }, { once: true });
  });
}

function renderDial(containerSelector, bandLabelSelector, freqReadoutSelector) {
  const station = state.selected;
  const container = $(containerSelector);
  if (!station || !container) return;

  const bandStations = state.stations
    .filter((s) => s.band === station.band)
    .sort((a, b) => parseNumericFreq(a.frequency) - parseNumericFreq(b.frequency));

  $(bandLabelSelector).textContent = `${station.band.toUpperCase()} TUNER DIAL`;
  $(freqReadoutSelector).textContent = station.frequency;

  container.innerHTML = bandStations.map((s) => {
    const shortFreq = s.frequency.replace(/^(FM|AM)\s*/i, "") || s.name.slice(0, 6);
    const active = s.name === station.name;
    return `<button class="dial-tick ${active ? "active" : ""}" data-dial-station="${escapeHtml(s.name)}" type="button" title="${escapeHtml(s.name)} (${escapeHtml(s.frequency)})">${escapeHtml(shortFreq)}</button>`;
  }).join("");

  const activeTick = container.querySelector(".dial-tick.active");
  if (activeTick) {
    activeTick.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}

function renderPlayer() {
  const station = state.selected;
  const hasStation = Boolean(station);

  $("#desktop-player").hidden = !hasStation;
  $("#mobile-mini-player").hidden = !hasStation;
  $("#player-prompt").hidden = hasStation;

  if (!station) {
    document.title = "Glz Radio · Live Puerto Rico Radio";
    return;
  }

  const isFav = state.favorites.has(station.name);
  const liveBadge = $("#live-badge");
  liveBadge.textContent = state.playing ? "LIVE ON AIR" : "STANDBY";
  liveBadge.classList.toggle("idle", !state.playing);

  // Desktop player
  $("#cover").src = station.logo;
  $("#cover").onerror = (e) => { e.currentTarget.src = fallbackLogo; };
  $("#now-title").textContent = station.name;
  $("#now-meta").textContent = `${station.frequency}${station.callSign ? ` / ${station.callSign}` : ""} · ${station.tagline}`;
  $("#play").innerHTML = state.playing ? icons.pause : icons.play;
  $("#rds").textContent = `${state.playing ? "LIVE" : "RDS"} / ${station.name} · ${station.location}`;

  const favBtn = $("#favorite-current");
  favBtn.innerHTML = `${isFav ? icons.heartFilled : icons.heartEmpty}<span>${isFav ? "Saved" : "Favorite"}</span>`;
  favBtn.classList.toggle("active", isFav);

  // Telemetry pills
  const pills = [station.codec];
  if (station.bitrateKbps) pills.push(`${station.bitrateKbps} kbps`);
  if (state.streamLatencyMs != null) pills.push(`${state.streamLatencyMs} ms`);
  $("#telemetry-row").innerHTML = pills.map((p) => `<span class="telemetry-pill">${escapeHtml(p)}</span>`).join("");

  // Mobile Mini Player
  $("#mobile-cover").src = station.logo;
  $("#mobile-cover").onerror = (e) => { e.currentTarget.src = fallbackLogo; };
  $("#mobile-title").textContent = station.name;
  $("#mobile-play").innerHTML = state.playing ? icons.pause : icons.play;
  $("#mobile-live-dot").style.opacity = state.playing ? "1" : "0.35";

  // Mobile Expanded Sheet
  $("#sheet-cover").src = station.logo;
  $("#sheet-cover").onerror = (e) => { e.currentTarget.src = fallbackLogo; };
  $("#sheet-title").textContent = station.name;
  $("#sheet-tagline").textContent = station.tagline || station.name;
  $("#sheet-meta").textContent = `${station.frequency}${station.callSign ? ` / ${station.callSign}` : ""} · ${station.location}`;
  $("#sheet-play").innerHTML = state.playing ? icons.pause : icons.play;
  $("#sheet-rds").textContent = `${state.playing ? "LIVE" : "RDS"} / ${station.name} · ${station.frequency} · ${station.codec}`;
  $("#sheet-fav-icon").innerHTML = isFav ? icons.heartFilled : icons.heartEmpty;
  $("#sheet-fav-label").textContent = isFav ? "Saved" : "Favorite";
  $("#sheet-fav").className = `sheet-action-btn ${isFav ? "active" : ""}`;
  $("#sheet-live-badge").textContent = state.playing ? "LIVE ON AIR" : "PAUSED";

  renderDial("#desktop-dial", "#dial-band-label", "#dial-freq-readout");
  renderDial("#sheet-dial", "#sheet-dial-band", "#sheet-dial-freq");

  document.title = `${state.playing ? "▶ " : ""}${station.name} · Glz Radio`;
}

function syncVolumeUi() {
  const pct = state.muted ? 0 : Math.round(state.volume * 100);
  audio.volume = state.muted ? 0 : state.volume;
  $("#volume-slider").value = String(pct);
  $("#volume-pct").textContent = `${pct}%`;
  $("#mute-btn").innerHTML = state.muted || pct === 0 ? icons.muted : icons.volume;
  localStorage.setItem("glz-volume", String(state.volume));
  localStorage.setItem("glz-muted", String(state.muted));
}

function setStatus(message) {
  $("#player-status").textContent = message;
  $("#mobile-status-text").textContent = message;
}

function clearRetry() {
  if (state.retryTimerId) {
    clearTimeout(state.retryTimerId);
    state.retryTimerId = null;
  }
}

function updateDeepLink(station) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("station", station.slug);
    window.history.replaceState({}, "", url.toString());
  } catch {
    // Ignore history API restrictions
  }
}

function selectStation(name, autoplay = true) {
  const next = state.stations.find((s) => s.name === name);
  if (!next) return;

  clearRetry();
  state.retryAttempt = 0;
  state.intentionallyStopped = false;
  state.streamLatencyMs = null;

  if (state.selected?.name !== next.name) {
    audio.pause();
    audio.removeAttribute("src");
    state.playing = false;
  }

  state.selected = next;
  recordRecent(next);
  updateDeepLink(next);
  extractLogoGlowColor(next.logo, next.name, (color) => {
    document.documentElement.style.setProperty("--station-glow", color);
  });

  renderPresets();
  renderStations();
  renderPlayer();
  updateMediaSession();
  if (autoplay) {
    play();
  } else {
    setStatus("Ready — tap Play to tune in");
  }
}

function playAdjacentStation(direction) {
  if (!state.stations.length) return;
  const list = visibleStations().length ? visibleStations() : state.stations;
  if (!state.selected) {
    selectStation(list[0].name, true);
    return;
  }
  const idx = list.findIndex((s) => s.name === state.selected.name);
  const nextIdx = idx === -1 ? 0 : (idx + direction + list.length) % list.length;
  selectStation(list[nextIdx].name, true);
}

async function play(forceNoCors = false) {
  const station = state.selected;
  if (!station) return;
  clearRetry();
  state.intentionallyStopped = false;

  if (location.protocol === "https:" && station.stream.startsWith("http:")) {
    setStatus("Plain HTTP stream blocked on HTTPS. Update stream URL in GlzHub.");
    toast("HTTPS stream needed for browser playback");
    state.health[station.name] = { status: "warn", label: "HTTP only" };
    renderStations();
    return;
  }

  const useCors = !forceNoCors && !state.noCorsStreams.has(station.stream);
  try {
    if (useCors) {
      audio.crossOrigin = "anonymous";
    } else {
      audio.removeAttribute("crossorigin");
      audio.crossOrigin = null;
    }

    if (audio.src !== station.stream || forceNoCors) {
      audio.src = station.stream;
    }

    state.connectStartedAt = performance.now();
    setStatus(state.retryAttempt > 0 ? `Reconnecting (attempt ${state.retryAttempt})…` : "Connecting…");
    await audio.play();
    visualizer.tryConnectWebAudio(useCors);
  } catch (err) {
    if (useCors) {
      // Broadcaster likely omits CORS headers; retry cleanly without crossOrigin
      state.noCorsStreams.add(station.stream);
      return play(true);
    }
    state.playing = false;
    visualizer.setPlaying(false);
    renderStations();
    renderPlayer();
    if (err?.name === "NotAllowedError") {
      setStatus("Tap Play to start audio");
      return;
    }
    scheduleAutoReconnect();
  }
}

function scheduleAutoReconnect() {
  if (state.intentionallyStopped || !state.selected || !navigator.onLine) {
    setStatus("Stream unavailable. Try another station.");
    return;
  }
  const delay = RETRY_DELAYS_MS[Math.min(state.retryAttempt, RETRY_DELAYS_MS.length - 1)];
  state.retryAttempt += 1;
  state.health[state.selected.name] = { status: "warn", label: "Retrying" };
  renderStations();
  setStatus(`Signal dropped · Reconnecting in ${Math.round(delay / 1000)}s…`);
  clearRetry();
  state.retryTimerId = setTimeout(() => {
    if (!state.intentionallyStopped && state.selected) {
      play(state.noCorsStreams.has(state.selected.stream));
    }
  }, delay);
}

function togglePlayback() {
  if (!state.selected) return;
  if (state.playing) {
    state.intentionallyStopped = true;
    clearRetry();
    audio.pause();
  } else {
    play();
  }
}

function stopPlayback() {
  state.intentionallyStopped = true;
  clearRetry();
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  state.playing = false;
  visualizer.setPlaying(false);
  renderStations();
  renderPlayer();
  setStatus("Stopped");
}

function toggleFavorite(name) {
  if (state.favorites.has(name)) {
    state.favorites.delete(name);
    toast("Removed from favorites");
  } else {
    state.favorites.add(name);
    toast("Saved to favorites");
  }
  localStorage.setItem("glz-favorites", JSON.stringify([...state.favorites]));
  renderFilters();
  renderStations();
  if (state.selected) renderPlayer();
}

function updateMediaSession() {
  if (!("mediaSession" in navigator) || !state.selected) return;
  const station = state.selected;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: station.name,
    artist: `${station.frequency} · ${station.tagline}`,
    album: "Glz Radio",
    artwork: [{ src: station.logo, sizes: "512x512", type: "image/png" }]
  });
}

async function shareStation() {
  if (!state.selected) return;
  const shareUrl = `${window.location.origin}/?station=${encodeURIComponent(state.selected.slug)}`;
  const data = {
    title: `${state.selected.name} · Glz Radio`,
    text: `Listen live to ${state.selected.name} (${state.selected.frequency}) on Glz Radio:`,
    url: shareUrl
  };
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast(`Copied link for ${state.selected.name}`);
    }
  } catch {
    // User canceled native share dialog
  }
}

// Sleep Timer
function updateTimerLabels(text, active) {
  $("#sheet-timer-label").textContent = text;
  $("#desktop-timer-label").textContent = text;
  $("#desktop-timer-trigger").classList.toggle("active", active);
  $("#sheet-timer-trigger").classList.toggle("active", active);
  document.querySelectorAll("#timer-options [data-minutes]").forEach((btn) => {
    const mins = parseInt(btn.dataset.minutes, 10);
    btn.classList.toggle("active", active && mins === state.sleepTimerDuration);
  });
}

function setSleepTimer(minutes) {
  if (state.sleepTimerId) {
    clearInterval(state.sleepTimerId);
    state.sleepTimerId = null;
  }

  if (minutes <= 0) {
    state.sleepTimerEnd = null;
    state.sleepTimerDuration = 0;
    updateTimerLabels("Sleep", false);
    toast("Sleep timer turned off");
    closeModal("timer-modal");
    return;
  }

  state.sleepTimerDuration = minutes;
  state.sleepTimerEnd = Date.now() + minutes * 60 * 1000;
  updateTimerLabels(`${minutes}m`, true);
  toast(`Sleep timer set for ${minutes} min`);
  closeModal("timer-modal");

  state.sleepTimerId = setInterval(() => {
    const remainingMs = state.sleepTimerEnd - Date.now();
    if (remainingMs <= 0) {
      clearInterval(state.sleepTimerId);
      state.sleepTimerId = null;
      state.sleepTimerEnd = null;
      state.sleepTimerDuration = 0;
      updateTimerLabels("Sleep", false);
      stopPlayback();
      toast("Sleep timer ended");
      return;
    }
    const remainingMins = Math.ceil(remainingMs / 60000);
    updateTimerLabels(`${remainingMins}m`, true);
  }, 1000);
}

// Stream Health Diagnostics
function renderDiagnosticsList() {
  $("#diag-source").textContent = `${state.catalogSource} (${state.stations.length} stations)`;
  $("#health-list").innerHTML = state.stations.map((station) => {
    const h = state.health[station.name];
    const badgeClass = h ? h.status : "warn";
    const badgeLabel = h ? h.label : (location.protocol === "https:" && station.stream.startsWith("http:") ? "HTTP only" : "Untested");
    return `
      <div class="health-row">
        <span class="health-row-name">${escapeHtml(station.name)} <span style="color:var(--muted);font-weight:400;">(${escapeHtml(station.frequency)})</span></span>
        <span class="health-badge ${badgeClass}">${escapeHtml(badgeLabel)}</span>
      </div>
    `;
  }).join("");
}

async function probeStation(station) {
  if (location.protocol === "https:" && station.stream.startsWith("http:")) {
    return { status: "warn", label: "HTTP only" };
  }
  const start = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(station.stream, { method: "GET", mode: "no-cors", cache: "no-store", signal: controller.signal });
    const ms = Math.max(1, Math.round(performance.now() - start));
    return { status: "ok", label: `Online · ${ms}ms` };
  } catch (err) {
    return { status: "err", label: err?.name === "AbortError" ? "Timeout" : "Offline" };
  } finally {
    clearTimeout(timer);
  }
}

async function testAllStreams() {
  if (state.testingStreams) return;
  state.testingStreams = true;
  $("#test-streams-btn").disabled = true;
  toast("Testing station streams…");
  const batchSize = 5;
  for (let i = 0; i < state.stations.length; i += batchSize) {
    const batch = state.stations.slice(i, i + batchSize);
    await Promise.all(batch.map(async (station) => {
      state.health[station.name] = await probeStation(station);
    }));
    renderDiagnosticsList();
    renderStations();
  }
  state.testingStreams = false;
  $("#test-streams-btn").disabled = false;
  toast("Stream health check complete");
}

// Weather
function weatherDescription(code) {
  if (code === 0) return "Clear";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Cloudy";
  if (code <= 48) return "Fog";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorms";
  return "Current conditions";
}

async function loadWeather(useLocation = false) {
  $("#weather-copy").textContent = "Updating…";
  let latitude = 18.4655;
  let longitude = -66.1057;
  let place = "San Juan, PR";

  try {
    if (useLocation) {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, maximumAge: 600000 })
      );
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      place = "Your location";
      try {
        const reverse = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`);
        if (reverse.ok) {
          const geo = await reverse.json();
          const result = geo.results?.[0];
          if (result) place = [result.name, result.admin1].filter(Boolean).join(", ");
        }
      } catch {}
    }

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude,
      longitude,
      current: "temperature_2m,apparent_temperature,weather_code",
      temperature_unit: "fahrenheit",
      timezone: "auto"
    });
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather unavailable");
    const data = await response.json();
    $("#temperature").textContent = `${Math.round(data.current.temperature_2m)}°`;
    $("#weather-copy").textContent = `${place} · ${weatherDescription(data.current.weather_code)} · Feels ${Math.round(data.current.apparent_temperature)}°`;
  } catch {
    $("#weather-copy").textContent = useLocation ? "Location unavailable · San Juan shown" : "Weather unavailable";
    if (useLocation) loadWeather(false);
  }
}

// Mobile Bottom Sheet
function openMobileSheet() {
  state.sheetExpanded = true;
  $("#mobile-player-sheet").classList.add("expanded");
  document.body.style.overflow = "hidden";
}

function closeMobileSheet() {
  state.sheetExpanded = false;
  $("#mobile-player-sheet").classList.remove("expanded");
  document.body.style.overflow = "";
}

// Catalog Sync
async function syncCatalog(showToast = false) {
  $("#catalog-source-label").textContent = "SYNCING GLZHUB…";
  const result = await loadStationCatalog();
  state.stations = result.stations;
  state.catalogSource = result.source;
  $("#catalog-source-label").textContent = result.source.toUpperCase();

  renderCityFilters();
  renderFilters();
  renderPresets();
  renderRecent();
  renderStations();
  renderDiagnosticsList();

  if (showToast) {
    toast(`Synced ${state.stations.length} stations (${state.catalogSource})`);
  }

  // Deep-link cue on initial load
  if (!state.selected && state.stations.length > 0) {
    const param = new URLSearchParams(window.location.search).get("station");
    if (param) {
      const target = slugifyStation(param);
      const match = state.stations.find(
        (s) => s.slug === target || s.name.toLowerCase() === param.toLowerCase()
      );
      if (match) {
        selectStation(match.name, false);
        toast(`Cued ${match.name} — tap Play to listen`);
      }
    }
  }
}

// Event Listeners
$("#search").addEventListener("input", (e) => {
  state.query = e.target.value;
  $("#search-clear").hidden = state.query.length === 0;
  renderStations();
});

$("#search-clear").addEventListener("click", () => {
  $("#search").value = "";
  state.query = "";
  $("#search-clear").hidden = true;
  renderStations();
  $("#search").focus();
});

$("#filters").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  state.filter = btn.dataset.filter;
  renderFilters();
  renderStations();
});

$("#city-filters").addEventListener("change", (e) => {
  state.city = e.target.value;
  renderStations();
});

$("#view-list").addEventListener("click", () => {
  state.viewMode = "list";
  localStorage.setItem("glz-view", "list");
  renderViewToggle();
});

$("#view-grid").addEventListener("click", () => {
  state.viewMode = "grid";
  localStorage.setItem("glz-view", "grid");
  renderViewToggle();
});

// Presets click, right-click, and long-press
let presetPressTimer = null;
let presetLongPressed = false;

$("#presets-grid").addEventListener("pointerdown", (e) => {
  const btn = e.target.closest("[data-preset]");
  if (!btn) return;
  presetLongPressed = false;
  const idx = parseInt(btn.dataset.preset, 10);
  presetPressTimer = setTimeout(() => {
    presetLongPressed = true;
    assignPreset(idx);
  }, 550);
});

$("#presets-grid").addEventListener("pointerup", () => clearTimeout(presetPressTimer));
$("#presets-grid").addEventListener("pointerleave", () => clearTimeout(presetPressTimer));

$("#presets-grid").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-preset]");
  if (!btn) return;
  if (presetLongPressed) {
    presetLongPressed = false;
    return;
  }
  const idx = parseInt(btn.dataset.preset, 10);
  if (e.shiftKey) {
    assignPreset(idx);
  } else {
    triggerPreset(idx);
  }
});

$("#presets-grid").addEventListener("contextmenu", (e) => {
  const btn = e.target.closest("[data-preset]");
  if (!btn) return;
  e.preventDefault();
  assignPreset(parseInt(btn.dataset.preset, 10));
});

$("#recent-shelf").addEventListener("click", (e) => {
  const pill = e.target.closest("[data-recent]");
  if (pill) selectStation(pill.dataset.recent, true);
});

$("#station-list").addEventListener("click", (e) => {
  const favorite = e.target.closest("[data-favorite]");
  if (favorite) {
    e.stopPropagation();
    toggleFavorite(favorite.dataset.favorite);
    return;
  }
  const station = e.target.closest("[data-station]");
  if (station) selectStation(station.dataset.station, true);
});

$("#station-list").addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const station = e.target.closest("[data-station]");
  if (!station || e.target.closest("button")) return;
  e.preventDefault();
  selectStation(station.dataset.station, true);
});

// Dial interaction (both desktop & mobile)
document.addEventListener("click", (e) => {
  const dialTick = e.target.closest("[data-dial-station]");
  if (dialTick) selectStation(dialTick.dataset.dialStation, true);

  const closeId = e.target.closest("[data-close-modal]")?.dataset.closeModal;
  if (closeId) closeModal(closeId);
});

document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) backdrop.classList.remove("open");
  });
});

// Topbar modals
$("#open-theme").addEventListener("click", () => {
  renderThemeModal();
  openModal("theme-modal");
});

$("#open-diagnostics").addEventListener("click", () => {
  renderDiagnosticsList();
  openModal("diagnostics-modal");
});

$("#open-shortcuts").addEventListener("click", () => openModal("shortcuts-modal"));
$("#sync-catalog-btn").addEventListener("click", () => syncCatalog(true));
$("#test-streams-btn").addEventListener("click", testAllStreams);

$("#theme-modal").addEventListener("click", (e) => {
  const themeBtn = e.target.closest("[data-theme-choice]");
  if (themeBtn) {
    state.theme = themeBtn.dataset.themeChoice;
    localStorage.setItem("glz-theme", state.theme);
    applyTheme(state.theme, state.accent);
    renderThemeModal();
    return;
  }
  const accentBtn = e.target.closest("[data-accent-choice]");
  if (accentBtn) {
    state.accent = accentBtn.dataset.accentChoice;
    localStorage.setItem("glz-accent", state.accent);
    applyTheme(state.theme, state.accent);
    renderThemeModal();
  }
});

// Desktop & Mobile Controls
$("#play").addEventListener("click", togglePlayback);
$("#stop").addEventListener("click", stopPlayback);
$("#desktop-prev").addEventListener("click", () => playAdjacentStation(-1));
$("#desktop-next").addEventListener("click", () => playAdjacentStation(1));
$("#favorite-current").addEventListener("click", () => { if (state.selected) toggleFavorite(state.selected.name); });
$("#share").addEventListener("click", shareStation);
$("#desktop-timer-trigger").addEventListener("click", () => openModal("timer-modal"));
$("#weather").addEventListener("click", () => loadWeather(true));

$("#volume-slider").addEventListener("input", (e) => {
  state.volume = Number(e.target.value) / 100;
  state.muted = state.volume === 0;
  syncVolumeUi();
});

$("#mute-btn").addEventListener("click", () => {
  state.muted = !state.muted;
  if (!state.muted && state.volume === 0) state.volume = 0.7;
  syncVolumeUi();
});

$("#mobile-play").addEventListener("click", (e) => { e.stopPropagation(); togglePlayback(); });
$("#mobile-expand").addEventListener("click", (e) => { e.stopPropagation(); openMobileSheet(); });
$("#mobile-mini-player").addEventListener("click", openMobileSheet);
$("#sheet-collapse").addEventListener("click", closeMobileSheet);
$("#sheet-play").addEventListener("click", togglePlayback);
$("#sheet-prev").addEventListener("click", () => playAdjacentStation(-1));
$("#sheet-next").addEventListener("click", () => playAdjacentStation(1));
$("#sheet-fav").addEventListener("click", () => { if (state.selected) toggleFavorite(state.selected.name); });
$("#sheet-share").addEventListener("click", shareStation);
$("#sheet-timer-trigger").addEventListener("click", () => openModal("timer-modal"));
$("#sheet-stop").addEventListener("click", stopPlayback);

$("#timer-options").addEventListener("click", (e) => {
  const opt = e.target.closest("[data-minutes]");
  if (opt) setSleepTimer(parseInt(opt.dataset.minutes, 10));
});

// Swipe-to-dismiss on mobile sheet
let touchStartY = 0;
let touchCurrentY = 0;
$("#mobile-player-sheet").addEventListener("touchstart", (e) => {
  touchStartY = e.touches[0].clientY;
  touchCurrentY = touchStartY;
}, { passive: true });
$("#mobile-player-sheet").addEventListener("touchmove", (e) => {
  touchCurrentY = e.touches[0].clientY;
}, { passive: true });
$("#mobile-player-sheet").addEventListener("touchend", () => {
  if (touchCurrentY - touchStartY > 80) closeMobileSheet();
  touchStartY = 0;
  touchCurrentY = 0;
});

// Global Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  const tag = document.activeElement?.tagName;
  const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

  if (e.key === "Escape") {
    closeAllModals();
    if (state.sheetExpanded) closeMobileSheet();
    if (typing) document.activeElement.blur();
    return;
  }

  if (typing) return;

  if (e.key === "/") {
    e.preventDefault();
    $("#search").focus();
  } else if (e.key === "?") {
    e.preventDefault();
    openModal("shortcuts-modal");
  } else if (e.code === "Space") {
    e.preventDefault();
    if (state.selected) togglePlayback();
    else if (state.stations.length) selectStation(state.stations[0].name, true);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    playAdjacentStation(-1);
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    playAdjacentStation(1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    state.muted = false;
    state.volume = Math.min(1, Math.round((state.volume + 0.1) * 10) / 10);
    syncVolumeUi();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    state.volume = Math.max(0, Math.round((state.volume - 0.1) * 10) / 10);
    state.muted = state.volume === 0;
    syncVolumeUi();
  } else if (e.key.toLowerCase() === "m") {
    state.muted = !state.muted;
    syncVolumeUi();
  } else if (e.key >= "1" && e.key <= "6") {
    triggerPreset(parseInt(e.key, 10) - 1);
  }
});

// Audio Events
audio.addEventListener("playing", () => {
  clearRetry();
  state.retryAttempt = 0;
  state.playing = true;
  if (state.connectStartedAt > 0) {
    state.streamLatencyMs = Math.max(1, Math.round(performance.now() - state.connectStartedAt));
    state.connectStartedAt = 0;
  }
  if (state.selected) {
    state.health[state.selected.name] = {
      status: "ok",
      label: state.streamLatencyMs ? `Online · ${state.streamLatencyMs}ms` : "Online"
    };
  }
  visualizer.setPlaying(true);
  renderStations();
  renderPlayer();
  setStatus("Live now");
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
});

audio.addEventListener("pause", () => {
  state.playing = false;
  visualizer.setPlaying(false);
  renderStations();
  renderPlayer();
  if (!state.intentionallyStopped) setStatus("Paused");
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
});

audio.addEventListener("waiting", () => setStatus("Buffering…"));

audio.addEventListener("stalled", () => {
  if (state.playing && !state.intentionallyStopped) {
    setStatus("Signal stalled · Rebuffering…");
  }
});

audio.addEventListener("error", () => {
  state.playing = false;
  visualizer.setPlaying(false);
  if (state.selected && !state.noCorsStreams.has(state.selected.stream) && audio.crossOrigin === "anonymous") {
    state.noCorsStreams.add(state.selected.stream);
    play(true);
    return;
  }
  renderStations();
  renderPlayer();
  if (!state.intentionallyStopped) {
    scheduleAutoReconnect();
  }
});

if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("play", () => play());
  navigator.mediaSession.setActionHandler("pause", () => togglePlayback());
  navigator.mediaSession.setActionHandler("stop", stopPlayback);
  navigator.mediaSession.setActionHandler("previoustrack", () => playAdjacentStation(-1));
  navigator.mediaSession.setActionHandler("nexttrack", () => playAdjacentStation(1));
}

function syncNetworkBadge() {
  const online = navigator.onLine;
  $("#network-label").textContent = online ? "Connected" : "Offline";
  $("#network-dot").classList.toggle("offline", !online);
  if (online && state.selected && !state.playing && !state.intentionallyStopped) {
    play();
  }
}

window.addEventListener("online", syncNetworkBadge);
window.addEventListener("offline", syncNetworkBadge);

function updateClock() {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  $("#clock").textContent = time;
  $("#sheet-clock").textContent = time;
}

setInterval(updateClock, 1000);
updateClock();
syncNetworkBadge();
syncVolumeUi();
renderViewToggle();
renderFilters();
renderPresets();
renderPlayer();
loadWeather();
syncCatalog(false);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/service-worker.js"));
}

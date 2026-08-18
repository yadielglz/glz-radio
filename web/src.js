import "./styles.css";

const stations = [
  ["WKAQ 580", "https://i.iheart.com/v3/re/assets/images/77d5680e-688b-4488-8c56-9b4963cb0813.png", "https://tunein.cdnstream1.com/4851_128.mp3", "AM 580", "WKAQ AM", "News and talk", "San Juan, PR"],
  ["NOTIUNO 630", "https://www.unoradio.com/logos/logos/notiuno/notiuno630.png", "https://server20.servistreaming.com:9022/stream", "AM 630", "WUNO AM", "NotiUno 630", "San Juan, PR"],
  ["Radio Once", "https://radioisla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png", "http://49.13.212.200:14167/stream?type=http&nocache=21", "AM 1120", "WMSW AM", "Radio Once", "Hatillo, PR"],
  ["Radio Isla", "https://radioisla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png", "https://server7.servistreaming.com/proxy/radioisla?mp=%2Fstream%3Ftype%3D.mp3&_=1", "AM 1320", "WSKN AM", "Radio Isla", "San Juan, PR"],
  ["Radio Tiempo", "https://radiotiempo.net/wp-content/uploads/2022/08/tiempo-172x128.png", "https://server7.servistreaming.com/proxy/tiempo?mp=%2Fstream%3Ftype%3D.mp3&_=1", "AM 1430", "WNLE AM", "Radio Tiempo", "Caguas, PR"],
  ["Radio Cumbre", "https://i.ibb.co/5g2402Cc/wkum-png.png", "https://sp.unoredcdn.net/8158/stream/1/", "AM 1470", "WKUM AM", "Radio Cumbre", "Orocovis, PR"],
  ["Radio Oro", "https://cdn-profiles.tunein.com/s21791/images/logod.png?t=637238626060000000", "https://streams.proftsc.com/listen/woro/woro.mp3", "FM 92.5", "WORO FM", "Radio Oro", "Corozal, PR"],
  ["Z 93", "https://i.ibb.co/23BMsKBY/wznt-png.png", "https://liveaudio.lamusica.com/PR_WZNT_icy", "FM 93.7", "WZNT FM", "La Emisora Nacional", "San Juan, PR"],
  ["La Nueva 94", "https://i.ibb.co/sv1RBc08/wodalogo.png", "https://liveaudio.lamusica.com/PR_WODA_icy", "FM 94.7", "WODA FM", "Los #1 En Joda", "San Juan, PR"],
  ["Fidelity", "https://fidelitypr.com/wp-content/uploads/2022/01/cropped-Redisen%CC%83o-Logo-Fidelity-3-15-2048x677.png", "https://server7.servistreaming.com/proxy/fidelity?mp=%2Fstream%3Ftype%3D.mp3&_=1", "FM 95.7", "WFID FM", "Tu Vida En Música", "Río Piedras, PR"],
  ["Estereotempo", "https://i.ibb.co/F4GM0W81/wrxr.png", "https://liveaudio.lamusica.com/PR_WRXD_icy", "FM 96.5", "WRXD FM", "Estereotempo", "San Juan, PR"],
  ["Magic 97.3", "https://i.ibb.co/Z6WqXPzV/woye.png", "https://stream.eleden.com:8210/magic.aac", "FM 97.3", "WOYE FM", "Magic 97.3", "Río Grande, PR"],
  ["SalSoul", "https://salsoul.com/wp-content/uploads/2020/12/cropped-salsoul-2.png", "https://server20.servistreaming.com:9023/stream?type=.mp3&_=1", "FM 99.1", "WPRM FM", "SalSoul", "San Juan, PR"],
  ["La X", "https://i.ibb.co/zWDcRnBw/laxpng.png", "http://stream.eleden.com:8235/lax.ogg", "FM 100.7", "WXYX FM", "La X", "Bayamón, PR"],
  ["Hot102", "https://hot102pr.com/wp-content/uploads/2023/10/Artboard-4.png", "https://server7.servistreaming.com/proxy/hot?mp=%2Fstream%3Ftype%3D.mp3&_=1", "FM 102.5", "WTOK FM", "HOT 102", "San Juan, PR"],
  ["KQ105", "https://upload.wikimedia.org/wikipedia/en/8/80/KQ_105_WKAQ-FM_2014_logo.png", "https://televicentro.streamguys1.com/wkaqfm-icy?key=e018260d508e5b04e91a4d9a30f7ceea9b71bd86e2bfdb6fcc3bbd4928525c00", "FM 104.7", "WKAQ FM", "La Primera", "San Juan, PR"],
  ["La Mega 106.9", "https://i.ibb.co/Xrp2nhpQ/WMEG-PNG.png", "https://liveaudio.lamusica.com/PR_WMEG_icy", "FM 106.9", "WMEG FM", "La Mega 106.9", "San Juan, PR"],
  ["Latino 99", "https://mm.aiircdn.com/371/5928f28889f51.png", "https://lmmradiocast.com/latino99fm", "Satellite", "", "¡Pura Salsa!", "Kissimmee, FL"],
  ["Salseo", "https://static.wixstatic.com/media/8dfec0_3e265a2f0fb5417c90c55be4e4e7d3cf~mv2.png/v1/fill/w_276,h_120,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/LOGOSALSEORADIO_clipped_rev_2_v2%20(1).png", "https://listen.radioking.com/radio/399811/stream/452110", "Satellite", "", "Salseo Radio", "Quebradillas, PR"],
  ["La Vieja Z", "https://i.ibb.co/d4VZVjj2/LVZ8-removebg-preview.png", "https://s2.free-shoutcast.com/stream/18006", "Satellite", "", "¡Salsa!", "Central Florida"]
].map(([name, logo, stream, frequency, callSign, tagline, location]) => ({
  name, logo, stream, frequency, callSign, tagline, location,
  band: frequency.startsWith("AM") ? "AM" : frequency.startsWith("FM") ? "FM" : "Satellite"
}));

// SVG Icons
const icons = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  clear: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>`,
  prev: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></line></svg>`,
  next: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></line></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
  chevronUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`,
  heartEmpty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  heartFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`,
  stop: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>`
};

const state = {
  selected: null,
  playing: false,
  filter: "All",
  query: "",
  favorites: new Set(JSON.parse(localStorage.getItem("glz-favorites") || "[]")),
  sheetExpanded: false,
  sleepTimerEnd: null,
  sleepTimerDuration: 0,
  sleepTimerId: null
};

const audio = new Audio();
audio.preload = "none";
audio.crossOrigin = "anonymous";

const fallbackLogo = "/assets/app-icon.png";

document.querySelector("#app").innerHTML = `
  <main class="app">
    <header class="topbar">
      <div class="brand">
        <img src="/assets/app-icon.png" alt="GLZ Radio logo">
        <div><strong>GLZ RADIO</strong><span>LIVE SIGNAL</span></div>
      </div>
      <div class="status-pill"><span class="status-dot"></span><span id="network-label">Connected</span></div>
    </header>

    <section class="weather-strip" aria-label="Local weather">
      <div class="weather-summary">
        <span class="weather-label">San Juan weather</span>
        <strong class="temperature" id="temperature">--°</strong>
        <span class="weather-copy" id="weather-copy">Updating local conditions…</span>
      </div>
      <button class="text-btn compact" id="weather" type="button">Use my location</button>
    </section>

    <section class="hero" aria-label="GLZ Radio">
      <img class="hero-image" src="/assets/header-banner.png" alt="GLZ Radio — Tu música. Tu estación. Siempre contigo.">
    </section>

    <div class="dashboard">
      <section class="panel library">
        <div class="eyebrow">Puerto Rico live radio</div>
        <h1>Find your signal</h1>
        <p class="lede">News, salsa, pop and local voices. Pick a station and listen live.</p>

        <div class="toolbar">
          <div class="search-wrap">
            <span class="search-icon">${icons.search}</span>
            <input id="search" class="search" type="search" placeholder="Search stations, genres or dial" aria-label="Search stations" autocomplete="off">
            <button id="search-clear" class="search-clear" type="button" aria-label="Clear search" hidden>${icons.clear}</button>
          </div>
          <div class="filters" id="filters"></div>
        </div>

        <div class="station-list" id="station-list"></div>
      </section>

      <aside class="side">
        <section class="panel now-playing" id="desktop-player" hidden>
          <div class="on-air"><span class="live">LIVE</span><span class="clock" id="clock"></span></div>
          <div class="cover-wrap"><img class="cover" id="cover" alt=""></div>
          <h2 class="now-title" id="now-title"></h2>
          <div class="now-meta" id="now-meta"></div>
          <div class="rds" id="rds">RDS / Ready for station</div>
          <div class="controls">
            <button class="text-btn primary" id="play" type="button">Pause</button>
            <button class="text-btn danger-btn" id="stop" type="button">Stop</button>
            <button class="text-btn" id="favorite-current" type="button">Favorite</button>
            <button class="text-btn" id="share" type="button">Share</button>
          </div>
          <p class="player-status" id="player-status">Ready to play</p>
        </section>

        <section class="panel player-prompt" id="player-prompt">
          <div class="eyebrow">Ready when you are</div>
          <h2>Choose a station</h2>
          <p>Tap any station and GLZ Radio will start playing it automatically.</p>
        </section>
      </aside>
    </div>
  </main>

  <!-- Mobile Floating Mini Player -->
  <div class="mobile-mini-player" id="mobile-mini-player" hidden role="region" aria-label="Now Playing Mini Player">
    <div class="thumb-wrap">
      <img id="mobile-cover" alt="">
    </div>
    <div class="mini-info">
      <div class="mobile-title" id="mobile-title"></div>
      <div class="mobile-meta" id="mobile-meta">
        <span class="mini-live-dot"></span>
        <span id="mobile-status-text">Live now</span>
      </div>
    </div>
    <div class="mobile-mini-controls">
      <button class="mini-play-btn" id="mobile-play" type="button" aria-label="Play or Pause">${icons.play}</button>
      <button class="mini-expand-btn" id="mobile-expand" type="button" aria-label="Expand player">${icons.chevronUp}</button>
    </div>
  </div>

  <!-- Mobile Full-Screen / Bottom Sheet Player -->
  <div class="mobile-player-sheet" id="mobile-player-sheet" role="dialog" aria-modal="true" aria-label="Now Playing">
    <div class="sheet-handle-bar"></div>
    <div class="sheet-top">
      <button class="sheet-collapse-btn" id="sheet-collapse" type="button" aria-label="Close player">${icons.chevronDown}</button>
      <span class="sheet-live-badge">LIVE ON AIR</span>
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

    <div class="sheet-rds" id="sheet-rds">RDS / Connected</div>

    <div class="sheet-main-controls">
      <button class="sheet-skip-btn" id="sheet-prev" type="button" aria-label="Previous station">${icons.prev}</button>
      <button class="sheet-play-btn" id="sheet-play" type="button" aria-label="Play or Pause">${icons.play}</button>
      <button class="sheet-skip-btn" id="sheet-next" type="button" aria-label="Next station">${icons.next}</button>
    </div>

    <div class="sheet-actions">
      <button class="sheet-action-btn" id="sheet-fav" type="button">
        <span id="sheet-fav-icon">${icons.heartEmpty}</span>
        <span id="sheet-fav-label">Favorite</span>
      </button>
      <button class="sheet-action-btn" id="sheet-timer-trigger" type="button">
        ${icons.moon}
        <span id="sheet-timer-label">Sleep Timer</span>
      </button>
      <button class="sheet-action-btn" id="sheet-share" type="button">
        ${icons.share}
        <span>Share</span>
      </button>
    </div>
  </div>

  <!-- Sleep Timer Modal -->
  <div class="timer-modal" id="timer-modal" role="dialog" aria-modal="true" aria-label="Sleep timer">
    <div class="timer-card">
      <div class="timer-header">
        <h3 class="timer-title">Sleep Timer</h3>
        <button class="sheet-collapse-btn" id="timer-close" type="button" aria-label="Close sleep timer">${icons.clear}</button>
      </div>
      <div class="timer-options">
        <button class="timer-btn" data-minutes="15" type="button">15 minutes</button>
        <button class="timer-btn" data-minutes="30" type="button">30 minutes</button>
        <button class="timer-btn" data-minutes="45" type="button">45 minutes</button>
        <button class="timer-btn" data-minutes="60" type="button">60 minutes</button>
        <button class="timer-btn" data-minutes="0" type="button" style="grid-column: 1 / -1; color: var(--danger);">Turn off timer</button>
      </div>
    </div>
  </div>

  <div class="toast" id="toast" role="status"></div>
`;

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function renderFilters() {
  const filterList = ["All", "Favorites", "AM", "FM", "Satellite"];
  $("#filters").innerHTML = filterList.map((filter) => {
    let countBadge = "";
    if (filter === "Favorites") {
      countBadge = ` (${state.favorites.size})`;
    }
    return `<button class="chip ${state.filter === filter ? "active" : ""}" data-filter="${filter}" type="button">${filter}${countBadge}</button>`;
  }).join("");
}

function visibleStations() {
  const query = state.query.trim().toLowerCase();
  return stations.filter((station) => {
    const inFilter = state.filter === "All" || (state.filter === "Favorites" ? state.favorites.has(station.name) : station.band === state.filter);
    const haystack = `${station.name} ${station.frequency} ${station.callSign} ${station.tagline} ${station.location}`.toLowerCase();
    return inFilter && haystack.includes(query);
  });
}

function renderStations() {
  const items = visibleStations();
  $("#station-list").innerHTML = items.length ? items.map((station) => {
    const isSelected = state.selected?.name === station.name;
    const isPlayingThis = isSelected && state.playing;
    const isFav = state.favorites.has(station.name);

    return `
      <article class="station ${isSelected ? "selected" : ""}" data-station="${escapeHtml(station.name)}" tabindex="0" role="button" aria-label="Play ${escapeHtml(station.name)}">
        <div class="station-logo-wrap">
          <img class="station-logo" src="${station.logo}" alt="" loading="lazy">
          ${isPlayingThis ? `
            <div class="station-playing-badge" aria-label="Playing">
              <div class="eq-bar"></div>
              <div class="eq-bar"></div>
              <div class="eq-bar"></div>
            </div>
          ` : ""}
        </div>
        <div class="station-info">
          <div class="station-name">${escapeHtml(station.name)}</div>
          <div class="station-meta">${escapeHtml(station.frequency)}${station.callSign ? ` / ${escapeHtml(station.callSign)}` : ""} · ${escapeHtml(station.location)}</div>
        </div>
        <span class="station-band">${escapeHtml(station.band)}</span>
        <button class="station-fav-btn ${isFav ? "favorited" : ""}" data-favorite="${escapeHtml(station.name)}" type="button" aria-label="${isFav ? "Remove favorite" : "Add to favorites"}">
          ${isFav ? icons.heartFilled : icons.heartEmpty}
        </button>
      </article>
    `;
  }).join("") : `<div class="empty">No stations match "${escapeHtml(state.query)}".</div>`;

  document.querySelectorAll(".station-logo").forEach((image) => {
    image.addEventListener("error", () => { image.src = fallbackLogo; }, { once: true });
  });
}

function renderPlayer() {
  const station = state.selected;
  const hasStation = Boolean(station);

  $("#desktop-player").hidden = !hasStation;
  $("#mobile-mini-player").hidden = !hasStation;
  $("#player-prompt").hidden = hasStation;

  if (!station) {
    document.title = "GLZ Radio";
    return;
  }

  const isFav = state.favorites.has(station.name);

  // Desktop player
  $("#cover").src = station.logo;
  $("#cover").onerror = (e) => { e.currentTarget.src = fallbackLogo; };
  $("#now-title").textContent = station.name;
  $("#now-meta").textContent = `${station.frequency}${station.callSign ? ` / ${station.callSign}` : ""} · ${station.tagline}`;
  $("#favorite-current").textContent = isFav ? "Saved" : "Favorite";
  $("#play").textContent = state.playing ? "Pause" : "Play";
  $("#play").className = `text-btn ${state.playing ? "primary" : ""}`;
  $("#rds").textContent = `${state.playing ? "LIVE" : "RDS"} / ${station.name} / ${station.location}`;

  // Mobile Mini Player
  $("#mobile-cover").src = station.logo;
  $("#mobile-cover").onerror = (e) => { e.currentTarget.src = fallbackLogo; };
  $("#mobile-title").textContent = station.name;
  $("#mobile-status-text").textContent = state.playing ? "Live now" : station.frequency;
  $("#mobile-play").innerHTML = state.playing ? icons.pause : icons.play;

  // Mobile Expanded Sheet
  $("#sheet-cover").src = station.logo;
  $("#sheet-cover").onerror = (e) => { e.currentTarget.src = fallbackLogo; };
  $("#sheet-title").textContent = station.name;
  $("#sheet-tagline").textContent = station.tagline || station.name;
  $("#sheet-meta").textContent = `${station.frequency}${station.callSign ? ` / ${station.callSign}` : ""} · ${station.location}`;
  $("#sheet-play").innerHTML = state.playing ? icons.pause : icons.play;
  $("#sheet-rds").textContent = `RDS / ${station.name} · ${station.frequency} · ${station.location}`;
  $("#sheet-fav-icon").innerHTML = isFav ? icons.heartFilled : icons.heartEmpty;
  $("#sheet-fav-label").textContent = isFav ? "Saved" : "Favorite";
  $("#sheet-fav").className = `sheet-action-btn ${isFav ? "active" : ""}`;

  document.title = `${state.playing ? "▶ " : ""}${station.name} · GLZ Radio`;
}

function selectStation(name) {
  const next = stations.find((station) => station.name === name);
  if (!next) return;

  if (state.selected?.name !== next.name) {
    audio.pause();
    audio.removeAttribute("src");
    state.playing = false;
  }

  state.selected = next;
  renderStations();
  renderPlayer();
  updateMediaSession();
  play();
}

function getNextStationIndex(direction) {
  if (!state.selected) return 0;
  const currentList = visibleStations().length ? visibleStations() : stations;
  const currentIndex = currentList.findIndex((s) => s.name === state.selected.name);
  if (currentIndex === -1) return 0;
  const nextIndex = (currentIndex + direction + currentList.length) % currentList.length;
  return nextIndex;
}

function playAdjacentStation(direction) {
  const currentList = visibleStations().length ? visibleStations() : stations;
  const nextIndex = getNextStationIndex(direction);
  const nextStation = currentList[nextIndex];
  if (nextStation) {
    selectStation(nextStation.name);
  }
}

async function play() {
  const station = state.selected;
  if (!station) return;

  if (location.protocol === "https:" && station.stream.startsWith("http:")) {
    setStatus("This station requires HTTPS stream and cannot play in modern browsers.");
    toast("HTTPS stream needed for this station");
    return;
  }

  try {
    if (audio.src !== station.stream) audio.src = station.stream;
    setStatus("Connecting…");
    await audio.play();
  } catch {
    state.playing = false;
    renderStations();
    renderPlayer();
    setStatus("Stream unavailable in this browser. Try another station.");
  }
}

function togglePlayback() {
  if (!state.selected) return;
  if (state.playing) {
    audio.pause();
  } else {
    play();
  }
}

function stopPlayback() {
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  state.playing = false;
  renderStations();
  renderPlayer();
  setStatus("Stopped");
}

function setStatus(message) {
  $("#player-status").textContent = message;
  $("#mobile-status-text").textContent = message;
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
    album: "GLZ Radio",
    artwork: [{ src: station.logo, sizes: "512x512", type: "image/png" }]
  });
}

async function shareStation() {
  if (!state.selected) return;
  const data = {
    title: state.selected.name,
    text: `Listen to ${state.selected.name} (${state.selected.frequency}) live on GLZ Radio:`,
    url: window.location.origin
  };
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(window.location.origin);
      toast("Link copied to clipboard");
    }
  } catch {}
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => element.classList.remove("show"), 2200);
}

// Sleep Timer
function setSleepTimer(minutes) {
  if (state.sleepTimerId) {
    clearInterval(state.sleepTimerId);
    state.sleepTimerId = null;
  }

  if (minutes <= 0) {
    state.sleepTimerEnd = null;
    state.sleepTimerDuration = 0;
    $("#sheet-timer-label").textContent = "Sleep Timer";
    toast("Sleep timer turned off");
    closeTimerModal();
    return;
  }

  state.sleepTimerDuration = minutes;
  state.sleepTimerEnd = Date.now() + minutes * 60 * 1000;
  toast(`Sleep timer set for ${minutes} min`);
  closeTimerModal();

  state.sleepTimerId = setInterval(() => {
    const remainingMs = state.sleepTimerEnd - Date.now();
    if (remainingMs <= 0) {
      clearInterval(state.sleepTimerId);
      state.sleepTimerId = null;
      state.sleepTimerEnd = null;
      state.sleepTimerDuration = 0;
      $("#sheet-timer-label").textContent = "Sleep Timer";
      stopPlayback();
      toast("Sleep timer ended");
      return;
    }
    const remainingMins = Math.ceil(remainingMs / 60000);
    $("#sheet-timer-label").textContent = `${remainingMins}m left`;
  }, 1000);
}

function openTimerModal() {
  $("#timer-modal").classList.add("open");
}

function closeTimerModal() {
  $("#timer-modal").classList.remove("open");
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
    }

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude, longitude,
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

// Search
$("#search").addEventListener("input", (event) => {
  state.query = event.target.value;
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

// Filters
$("#filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  state.filter = button.dataset.filter;
  renderFilters();
  renderStations();
});

// Station List Interaction
$("#station-list").addEventListener("click", (event) => {
  const favorite = event.target.closest("[data-favorite]");
  if (favorite) {
    event.stopPropagation();
    toggleFavorite(favorite.dataset.favorite);
    return;
  }
  const station = event.target.closest("[data-station]");
  if (station) selectStation(station.dataset.station);
});

$("#station-list").addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const station = event.target.closest("[data-station]");
  if (!station || event.target.closest("button")) return;
  event.preventDefault();
  selectStation(station.dataset.station);
});

// Playback controls
$("#play").addEventListener("click", togglePlayback);
$("#stop").addEventListener("click", stopPlayback);
$("#favorite-current").addEventListener("click", () => {
  if (state.selected) toggleFavorite(state.selected.name);
});
$("#share").addEventListener("click", shareStation);
$("#weather").addEventListener("click", () => loadWeather(true));

// Mobile Mini Player triggers
$("#mobile-play").addEventListener("click", (e) => {
  e.stopPropagation();
  togglePlayback();
});

$("#mobile-expand").addEventListener("click", (e) => {
  e.stopPropagation();
  openMobileSheet();
});

$("#mobile-mini-player").addEventListener("click", () => {
  openMobileSheet();
});

// Mobile Bottom Sheet controls
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

$("#sheet-collapse").addEventListener("click", closeMobileSheet);
$("#sheet-play").addEventListener("click", togglePlayback);
$("#sheet-prev").addEventListener("click", () => playAdjacentStation(-1));
$("#sheet-next").addEventListener("click", () => playAdjacentStation(1));
$("#sheet-fav").addEventListener("click", () => {
  if (state.selected) toggleFavorite(state.selected.name);
});
$("#sheet-share").addEventListener("click", shareStation);
$("#sheet-timer-trigger").addEventListener("click", openTimerModal);

// Sleep timer modal events
$("#timer-close").addEventListener("click", closeTimerModal);
$("#timer-modal").addEventListener("click", (event) => {
  if (event.target === $("#timer-modal")) closeTimerModal();
  const option = event.target.closest("[data-minutes]");
  if (option) {
    setSleepTimer(parseInt(option.dataset.minutes, 10));
  }
});

// Swipe-to-dismiss gesture on mobile sheet
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
  if (touchCurrentY - touchStartY > 75) {
    closeMobileSheet();
  }
  touchStartY = 0;
  touchCurrentY = 0;
});

// Audio event handlers
audio.addEventListener("playing", () => {
  state.playing = true;
  renderStations();
  renderPlayer();
  setStatus("Live now");
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
});

audio.addEventListener("pause", () => {
  state.playing = false;
  renderStations();
  renderPlayer();
  setStatus("Paused");
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
});

audio.addEventListener("waiting", () => setStatus("Buffering…"));

audio.addEventListener("error", () => {
  state.playing = false;
  renderStations();
  renderPlayer();
  setStatus("Stream unavailable. Try another station.");
});

if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("play", play);
  navigator.mediaSession.setActionHandler("pause", () => audio.pause());
  navigator.mediaSession.setActionHandler("stop", stopPlayback);
  navigator.mediaSession.setActionHandler("previoustrack", () => playAdjacentStation(-1));
  navigator.mediaSession.setActionHandler("nexttrack", () => playAdjacentStation(1));
}

window.addEventListener("online", () => { $("#network-label").textContent = "Connected"; });
window.addEventListener("offline", () => { $("#network-label").textContent = "Offline"; });

function updateClock() {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  $("#clock").textContent = time;
  const sheetClock = $("#sheet-clock");
  if (sheetClock) sheetClock.textContent = time;
}

setInterval(updateClock, 1000);
updateClock();

renderFilters();
renderStations();
renderPlayer();
updateMediaSession();
loadWeather();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/service-worker.js"));
}

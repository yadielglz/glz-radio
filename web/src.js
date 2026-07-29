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

const state = {
  selected: null,
  playing: false,
  filter: "All",
  query: "",
  favorites: new Set(JSON.parse(localStorage.getItem("glz-favorites") || "[]"))
};

const audio = new Audio();
audio.preload = "none";
audio.crossOrigin = "anonymous";

document.querySelector("#app").innerHTML = `
  <main class="app">
    <header class="topbar">
      <div class="brand"><img src="/assets/app-icon.png" alt=""><div><strong>GLZ RADIO</strong><span>LIVE SIGNAL</span></div></div>
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
          <label class="search-wrap"><span>⌕</span><input id="search" class="search" type="search" placeholder="Search stations, cities or frequencies" aria-label="Search stations"></label>
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
            <button class="text-btn" id="play" type="button">Pause</button>
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
  <div class="mobile-player" id="mobile-player" hidden>
    <img id="mobile-cover" alt=""><div><div class="mobile-title" id="mobile-title"></div><div class="mobile-meta" id="mobile-meta">Ready</div></div>
    <div class="mobile-controls">
      <button class="text-btn compact" id="mobile-play" type="button">Pause</button>
      <button class="text-btn compact danger-btn" id="mobile-stop" type="button">Stop</button>
    </div>
  </div>
  <div class="toast" id="toast" role="status"></div>
`;

const $ = (selector) => document.querySelector(selector);
const fallbackLogo = "/assets/app-icon.png";

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function renderFilters() {
  $("#filters").innerHTML = ["All", "Favorites", "AM", "FM", "Satellite"].map((filter) =>
    `<button class="chip ${state.filter === filter ? "active" : ""}" data-filter="${filter}" type="button">${filter}</button>`
  ).join("");
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
  $("#station-list").innerHTML = items.length ? items.map((station) => `
    <article class="station ${state.selected?.name === station.name ? "selected" : ""}" data-station="${escapeHtml(station.name)}" tabindex="0" role="button" aria-label="Play ${escapeHtml(station.name)}">
      <img class="station-logo" src="${station.logo}" alt="" loading="lazy">
      <div><div class="station-name">${escapeHtml(station.name)}</div><div class="station-meta">${escapeHtml(station.frequency)}${station.callSign ? ` / ${escapeHtml(station.callSign)}` : ""} · ${escapeHtml(station.location)}</div></div>
      <span class="station-band">${escapeHtml(station.band)}</span>
      <button class="station-action favorite" data-favorite="${escapeHtml(station.name)}" type="button">${state.favorites.has(station.name) ? "Saved" : "Favorite"}</button>
    </article>
  `).join("") : `<div class="empty">No stations match this view.</div>`;

  document.querySelectorAll(".station-logo").forEach((image) => image.addEventListener("error", () => { image.src = fallbackLogo; }, { once: true }));
}

function renderPlayer() {
  const station = state.selected;
  const hasStation = Boolean(station);
  $("#desktop-player").hidden = !hasStation;
  $("#mobile-player").hidden = !hasStation;
  $("#player-prompt").hidden = hasStation;
  if (!station) {
    document.title = "GLZ Radio";
    return;
  }
  $("#cover").src = station.logo;
  $("#mobile-cover").src = station.logo;
  $("#cover").onerror = $("#mobile-cover").onerror = (event) => { event.currentTarget.src = fallbackLogo; };
  $("#now-title").textContent = station.name;
  $("#now-meta").textContent = `${station.frequency}${station.callSign ? ` / ${station.callSign}` : ""} · ${station.tagline}`;
  $("#mobile-title").textContent = station.name;
  $("#mobile-meta").textContent = state.playing ? "Live now" : station.frequency;
  $("#favorite-current").textContent = state.favorites.has(station.name) ? "Saved" : "Favorite";
  $("#play").textContent = $("#mobile-play").textContent = state.playing ? "Pause" : "Play";
  $("#rds").textContent = `${state.playing ? "LIVE" : "RDS"} / ${station.name} / ${station.location}`;
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

async function play() {
  const station = state.selected;
  if (location.protocol === "https:" && station.stream.startsWith("http:")) {
    setStatus("This station uses an insecure stream and cannot play on the web.");
    toast("HTTPS stream needed for this station");
    return;
  }
  try {
    if (audio.src !== station.stream) audio.src = station.stream;
    setStatus("Connecting…");
    await audio.play();
  } catch {
    state.playing = false;
    renderPlayer();
    setStatus("Stream unavailable in this browser. Try another station.");
  }
}

function togglePlayback() {
  if (!state.selected) return;
  if (state.playing) audio.pause();
  else play();
}

function stopPlayback() {
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  state.playing = false;
  renderPlayer();
  setStatus("Stopped");
}

function setStatus(message) {
  $("#player-status").textContent = message;
  $("#mobile-meta").textContent = message;
}

function toggleFavorite(name) {
  if (state.favorites.has(name)) state.favorites.delete(name);
  else state.favorites.add(name);
  localStorage.setItem("glz-favorites", JSON.stringify([...state.favorites]));
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
    artwork: [{ src: station.logo }]
  });
}

async function shareStation() {
  const data = { title: state.selected.name, text: `Listen to ${state.selected.name} on GLZ Radio`, url: location.href };
  try {
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(location.href);
      toast("Link copied");
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

$("#search").addEventListener("input", (event) => { state.query = event.target.value; renderStations(); });
$("#filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  state.filter = button.dataset.filter;
  renderFilters();
  renderStations();
});
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
$("#play").addEventListener("click", togglePlayback);
$("#mobile-play").addEventListener("click", togglePlayback);
$("#stop").addEventListener("click", stopPlayback);
$("#mobile-stop").addEventListener("click", stopPlayback);
$("#favorite-current").addEventListener("click", () => toggleFavorite(state.selected.name));
$("#share").addEventListener("click", shareStation);
$("#weather").addEventListener("click", () => loadWeather(true));

audio.addEventListener("playing", () => {
  state.playing = true;
  renderPlayer();
  setStatus("Live now");
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
});
audio.addEventListener("pause", () => {
  state.playing = false;
  renderPlayer();
  setStatus("Paused");
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
});
audio.addEventListener("waiting", () => setStatus("Buffering…"));
audio.addEventListener("error", () => {
  state.playing = false;
  renderPlayer();
  setStatus("Stream unavailable. Try another station.");
});

if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("play", play);
  navigator.mediaSession.setActionHandler("pause", () => audio.pause());
  navigator.mediaSession.setActionHandler("stop", stopPlayback);
}

window.addEventListener("online", () => { $("#network-label").textContent = "Connected"; });
window.addEventListener("offline", () => { $("#network-label").textContent = "Offline"; });
setInterval(() => { $("#clock").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }, 1000);

renderFilters();
renderStations();
renderPlayer();
updateMediaSession();
loadWeather();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/service-worker.js"));
}

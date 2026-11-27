export const GLZHUB_CATALOG_URL = "https://glzhub.glztech.com/api/v1/radio/stations";
export const LOCAL_CATALOG_URL = "/stations.json";
const CACHE_KEY = "glz-catalog-cache-v2";

export function slugifyStation(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function detectBand(frequency, genre = "") {
  const freq = String(frequency || "").trim().toUpperCase();
  const gen = String(genre || "").trim().toUpperCase();
  if (freq.startsWith("AM") || gen.includes("AM")) return "AM";
  if (freq.startsWith("FM") || gen.includes("FM")) return "FM";
  return "Satellite";
}

export function detectCodec(url) {
  const lower = String(url || "").toLowerCase();
  if (lower.includes(".m3u8")) return "HLS";
  if (lower.includes(".aac") || lower.includes("aac")) return "AAC";
  if (lower.includes(".ogg") || lower.includes("ogg")) return "OGG";
  return "MP3";
}

export function parseNumericFreq(frequency) {
  const match = String(frequency || "").match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 9999;
}

export function stationCity(station) {
  const loc = String(station.location || "").trim();
  if (!loc) return "Puerto Rico";
  return loc
    .replace(/,\s*(PR|Puerto Rico|FL|Florida)$/i, "")
    .trim() || loc;
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function parseCatalogPayload(payload, enrichmentList = []) {
  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.stations)
      ? payload.stations
      : [];

  const enrichByStream = new Map();
  const enrichByName = new Map();
  const enrichByFreq = new Map();

  for (const item of enrichmentList) {
    if (item.streamUrl) enrichByStream.set(item.streamUrl.trim(), item);
    if (item.name) enrichByName.set(normalizeKey(item.name), item);
    if (item.frequency && item.frequency !== "Satellite") {
      enrichByFreq.set(normalizeKey(item.frequency), item);
    }
  }

  return rawList
    .map((entry) => {
      const stream = String(entry.streamUrl || entry.stream || "").trim();
      const rawName = String(entry.name || "").trim();
      if (!stream || !rawName) return null;

      const genre = String(entry.genre || "").trim();
      let name = rawName;
      let frequency = String(entry.frequency || "").trim();
      let callSign = String(entry.callSign || "").trim();
      let tagline = String(entry.tagline || "").trim();
      let location = String(entry.location || "").trim();

      if (!frequency && rawName.includes("|")) {
        const [prefixRaw, suffixRaw] = rawName.split("|", 2);
        const prefix = prefixRaw.trim();
        const suffix = suffixRaw.trim();
        if (/^(FM|AM)\b/i.test(prefix)) {
          frequency = prefix.toUpperCase();
        } else if (/^ONLINE$/i.test(prefix)) {
          frequency = "Satellite";
        } else {
          frequency = genre || "Live";
        }
        name = suffix || rawName;
      } else if (!frequency) {
        frequency = detectBand("", genre);
      }

      // Enrich missing metadata (city, callSign, tagline, logo) from stations.json lookup
      const ref =
        enrichByStream.get(stream) ||
        enrichByName.get(normalizeKey(name)) ||
        enrichByFreq.get(normalizeKey(frequency));

      if (ref) {
        if (!callSign && ref.callSign) callSign = ref.callSign;
        if (!tagline && ref.tagline) tagline = ref.tagline;
        if (!location && ref.location) location = ref.location;
      }

      if (!callSign && /\b(AM|FM)$/i.test(name)) {
        callSign = name;
      }
      if (!tagline) tagline = name;
      if (!location) location = frequency === "Satellite" ? "Online" : "Puerto Rico";

      const logo = String(entry.logoUrl || entry.logo || ref?.logoUrl || "/assets/app-icon.png").trim();
      const bitrateKbps = Number(entry.bitrateKbps) || null;
      const band = detectBand(frequency, genre);

      return {
        name,
        slug: slugifyStation(name),
        logo,
        stream,
        frequency,
        callSign,
        tagline,
        location,
        band,
        bitrateKbps,
        codec: detectCodec(stream)
      };
    })
    .filter(Boolean);
}

async function fetchJsonWithTimeout(url, timeoutMs = 6500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function loadStationCatalog() {
  let localRaw = [];
  try {
    const localData = await fetchJsonWithTimeout(LOCAL_CATALOG_URL, 4000);
    if (Array.isArray(localData)) localRaw = localData;
  } catch {
    // Offline fallback handled via cache below
  }

  try {
    const hubData = await fetchJsonWithTimeout(GLZHUB_CATALOG_URL, 6000);
    const parsed = parseCatalogPayload(hubData, localRaw);
    if (parsed.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ source: "GlzHub", updatedAt: Date.now(), stations: parsed }));
      return { stations: parsed, source: "GlzHub Live", updatedAt: Date.now() };
    }
  } catch {
    // Fall back to local stations.json or cached catalog
  }

  if (localRaw.length > 0) {
    const parsedLocal = parseCatalogPayload(localRaw, []);
    if (parsedLocal.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ source: "Catalog", updatedAt: Date.now(), stations: parsedLocal }));
      return { stations: parsedLocal, source: "Local Catalog", updatedAt: Date.now() };
    }
  }

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (cached?.stations?.length) {
      return { stations: cached.stations, source: `${cached.source} (Cached)`, updatedAt: cached.updatedAt };
    }
  } catch {
    // Ignore malformed cache
  }

  return { stations: [], source: "Unavailable", updatedAt: Date.now() };
}

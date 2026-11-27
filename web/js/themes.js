export const THEMES = {
  "Signal Noir": {
    bg: "#050a0c",
    surface: "#0b1114",
    card: "#11181c",
    field: "#070d10",
    stroke: "#243137",
    text: "#f8fafc",
    muted: "#94a3b8",
    swatch: "#050a0c",
    light: false
  },
  "Signal Light": {
    bg: "#f7f4ed",
    surface: "#fffdf8",
    card: "#ffffff",
    field: "#f0ece3",
    stroke: "#d8d2c7",
    text: "#172124",
    muted: "#5e6a6e",
    swatch: "#f7f4ed",
    light: true
  },
  "Midnight Radio": {
    bg: "#071113",
    surface: "#0e1e21",
    card: "#12262a",
    field: "#0b191c",
    stroke: "#234348",
    text: "#ecfdf5",
    muted: "#94a3b8",
    swatch: "#071113",
    light: false
  },
  "Coastal Night": {
    bg: "#061720",
    surface: "#0b2430",
    card: "#11313e",
    field: "#071d27",
    stroke: "#285163",
    text: "#e6f7ff",
    muted: "#8cafc1",
    swatch: "#061720",
    light: false
  },
  "Graphite Studio": {
    bg: "#111315",
    surface: "#1a1d20",
    card: "#23272b",
    field: "#151719",
    stroke: "#3f454b",
    text: "#f1f5f9",
    muted: "#a1a1aa",
    swatch: "#111315",
    light: false
  },
  "Tropical Dark": {
    bg: "#11140d",
    surface: "#1a2012",
    card: "#222b18",
    field: "#151a10",
    stroke: "#3e4b2b",
    text: "#f7fee7",
    muted: "#b7be92",
    swatch: "#11140d",
    light: false
  }
};

export const ACCENTS = {
  Amber: { dark: "#f59e0b", light: "#b45309", onDark: "#101416", onLight: "#ffffff" },
  Teal: { dark: "#14b8a6", light: "#0f766e", onDark: "#041615", onLight: "#ffffff" },
  Cyan: { dark: "#22d3ee", light: "#0e7490", onDark: "#04161c", onLight: "#ffffff" },
  Lime: { dark: "#84cc16", light: "#4d7c0f", onDark: "#0e1704", onLight: "#ffffff" },
  Coral: { dark: "#fb7185", light: "#be123c", onDark: "#1c050a", onLight: "#ffffff" }
};

export function applyTheme(themeName, accentName) {
  const theme = THEMES[themeName] || THEMES["Signal Noir"];
  const accent = ACCENTS[accentName] || ACCENTS.Amber;
  const root = document.documentElement;
  root.dataset.theme = themeName in THEMES ? themeName : "Signal Noir";
  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--surface", theme.surface);
  root.style.setProperty("--card", theme.card);
  root.style.setProperty("--field", theme.field);
  root.style.setProperty("--stroke", theme.stroke);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--accent", theme.light ? accent.light : accent.dark);
  root.style.setProperty("--on-accent", theme.light ? accent.onLight : accent.onDark);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme.bg);
}

const STUDIO_HUES = [
  "#f59e0b", "#14b8a6", "#38bdf8", "#fb7185",
  "#a3e635", "#f97316", "#2dd4bf", "#eab308"
];

export function deterministicStationColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return STUDIO_HUES[hash % STUDIO_HUES.length];
}

export function extractLogoGlowColor(logoUrl, stationName, onColor) {
  const fallback = deterministicStationColor(stationName || "Glz");
  onColor(fallback);
  if (!logoUrl) return;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      const size = 24;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);
      let bestScore = -1;
      let bestRgb = null;
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < 180) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (lum < 0.15 || lum > 0.92) continue;
        const score = sat * 2 + (1 - Math.abs(lum - 0.55));
        if (score > bestScore) {
          bestScore = score;
          bestRgb = [r, g, b];
        }
      }
      if (bestRgb && bestScore > 0.65) {
        onColor(`rgb(${bestRgb[0]}, ${bestRgb[1]}, ${bestRgb[2]})`);
      }
    } catch {
      // Non-CORS logo image; deterministic fallback already applied.
    }
  };
  img.src = logoUrl;
}

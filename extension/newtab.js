(() => {
  "use strict";

  /* ───────────── Basis ───────────── */

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const uid = () => crypto.randomUUID();
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pad = (n) => String(n).padStart(2, "0");
  const hasChrome = typeof chrome !== "undefined" && !!chrome.storage?.local;

  const KEY = "tab";
  const CACHE_KEY = "tab-cache";
  const BG_KEY = "tab-bg";
  const COLS = 12;
  const ROW = 30;
  const GAP = 12;
  const STACK_BELOW = 760;

  const SWATCHES = ["#ff0000", "#f97316", "#f5b301", "#22c55e", "#14b8a6", "#3b82f6", "#6366f1", "#a78bfa", "#ec4899", "#d4d4d8"];

  /* ───────────── Icons ───────────── */

  const CLOUD_UP = '<path d="M7 15h10a4 4 0 0 0 .6-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 15z"/>';
  const ICONS = {
    home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/>',
    badge: '<path d="M12 2.8l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8z"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
    finger: '<path d="M12 11v3a8 8 0 0 1-2 5.5M8.5 7.5A5 5 0 0 1 17 11v2a13 13 0 0 1-.7 4M6.3 10A6 6 0 0 0 6 11v2.5a6 6 0 0 1-1 3.3M15 14.5a11 11 0 0 1-2.4 6M4.5 6.5A9 9 0 0 1 20.5 9M9.3 11a2.7 2.7 0 0 1 5.4 0v2"/>',
    scale: '<path d="M12 4v16M7 20h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    heart: '<path d="M12 20s-7-4.4-9-9a4.6 4.6 0 0 1 9-2 4.6 4.6 0 0 1 9 2c-2 4.6-9 9-9 9z"/>',
    cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
    wrench: '<path d="M15 4a5 5 0 0 0-4.6 6.9L3 18.3 5.7 21l7.4-7.4A5 5 0 0 0 20 9l-3 3-3-1-1-3 3-3a5 5 0 0 0-1-1z"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    partly: '<path d="M8 3v1.5M3.5 8H2M4.8 4.8l1 1M13.6 5.6A5 5 0 0 0 5.2 9.4"/><path d="M9 20h8.5a3.5 3.5 0 0 0 .5-7 5 5 0 0 0-9.6 1.2A2.9 2.9 0 0 0 9 20z"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .6-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 18z"/>',
    rain: CLOUD_UP + '<path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
    snow: CLOUD_UP + '<path d="M8 19h.01M12 21h.01M16 19h.01"/>',
    storm: CLOUD_UP + '<path d="M13 16l-2 3h3l-2 3"/>',
    fog: '<path d="M4 9h16M3 13h18M5 17h14"/>',
    note: '<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8 12h8M8 16h5"/>',
    check: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 12.5l2.8 2.8L16.5 9"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    pulse: '<path d="M3 12h4l2.5-6 5 12L17 12h4"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    timer: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 1.5M9.5 2.5h5"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6L3.5 8.5"/><path d="M3.5 4v4.5H8M12 8v4.5l3 1.5"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    inbox: '<path d="M3.5 13.5l2.5-8h12l2.5 8v5a1.5 1.5 0 0 1-1.5 1.5h-14a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    dots: '<g fill="currentColor" stroke="none"><circle cx="5.5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.5" cy="12" r="1.5"/></g>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
    left: '<path d="M15 6l-6 6 6 6"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    up: '<path d="M6 15l6-6 6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    git: '<circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="8" r="2.2"/><path d="M6 8.2v7.6M18 10.2c0 4.2-6.2 3-10.6 6.3"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/>',
    issue: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="1.8"/>',
  };
  const ico = (name, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.link}</svg>`;
  const SPACE_ICONS = ["home", "shield", "code", "git", "badge", "target", "finger", "scale", "cross", "wrench", "bolt", "heart", "folder", "grid"];

  /* ───────────── Widget-Typen ───────────── */

  const KINDS = {
    links: { name: "Links", blurb: "Lesezeichen als Liste oder Kacheln", icon: "link", w: 3, h: 6, minW: 2, minH: 3 },
    repos: { name: "Repos", blurb: "GitHub-Repos mit Issues, PRs, Actions", icon: "git", w: 6, h: 10, minW: 3, minH: 4 },
    clock: { name: "Uhr", blurb: "Zeit, Datum, Kalenderwoche", icon: "clock", w: 4, h: 5, minW: 2, minH: 3 },
    weather: { name: "Wetter", blurb: "Jetzt und die nächsten Tage", icon: "partly", w: 4, h: 6, minW: 3, minH: 4 },
    calendar: { name: "Kalender", blurb: "Monatsansicht mit KW", icon: "cal", w: 4, h: 9, minW: 3, minH: 7 },
    todos: { name: "Aufgaben", blurb: "Abhaken, nichts vergessen", icon: "check", w: 4, h: 6, minW: 2, minH: 3 },
    notes: { name: "Notizen", blurb: "Freitext, speichert sofort", icon: "note", w: 4, h: 6, minW: 2, minH: 3 },
    clips: { name: "Snippets", blurb: "Ein Klick kopiert den Text", icon: "copy", w: 3, h: 6, minW: 2, minH: 3 },
    calc: { name: "Rechner", blurb: "Bußgelder und Summen, mit Verlauf", icon: "calc", w: 3, h: 7, minW: 2, minH: 4 },
    timer: { name: "Timer", blurb: "Kurzzeitwecker mit Ton", icon: "timer", w: 3, h: 5, minW: 2, minH: 4 },
    countdown: { name: "Countdown", blurb: "Restzeit bis zu einem Termin", icon: "flag", w: 3, h: 4, minW: 2, minH: 3 },
    status: { name: "Status", blurb: "Sind deine Seiten erreichbar?", icon: "pulse", w: 4, h: 7, minW: 3, minH: 3 },
    topsites: { name: "Meistbesucht", blurb: "Deine häufigsten Seiten", icon: "grid", w: 4, h: 5, minW: 2, minH: 3 },
    recent: { name: "Zuletzt geschlossen", blurb: "Geschlossene Tabs zurückholen", icon: "history", w: 4, h: 6, minW: 3, minH: 3 },
    fivem: { name: "FiveM", blurb: "Per CFX-Code direkt verbinden", icon: "play", w: 3, h: 5, minW: 2, minH: 4 },
  };

  const WMO = {
    0: ["Klar", "sun"], 1: ["Meist klar", "sun"], 2: ["Leicht bewölkt", "partly"], 3: ["Bedeckt", "cloud"],
    45: ["Nebel", "fog"], 48: ["Reifnebel", "fog"],
    51: ["Niesel", "rain"], 53: ["Niesel", "rain"], 55: ["Starker Niesel", "rain"], 56: ["Eisniesel", "rain"], 57: ["Eisniesel", "rain"],
    61: ["Leichter Regen", "rain"], 63: ["Regen", "rain"], 65: ["Starkregen", "rain"], 66: ["Eisregen", "rain"], 67: ["Eisregen", "rain"],
    71: ["Leichter Schnee", "snow"], 73: ["Schnee", "snow"], 75: ["Starker Schnee", "snow"], 77: ["Graupel", "snow"],
    80: ["Schauer", "rain"], 81: ["Schauer", "rain"], 82: ["Heftige Schauer", "rain"], 85: ["Schneeschauer", "snow"], 86: ["Schneeschauer", "snow"],
    95: ["Gewitter", "storm"], 96: ["Gewitter, Hagel", "storm"], 99: ["Gewitter, Hagel", "storm"],
  };

  /* ───────────── Standard-Daten ───────────── */

  const L = (title, url) => ({ id: uid(), title, url });

  function W(kind, x, y, w, h, extra = {}) {
    const k = KINDS[kind];
    const widget = { id: uid(), kind, title: k.name, x, y, w: w || k.w, h: h || k.h };
    return Object.assign(widget, blankData(kind), extra);
  }

  function blankData(kind) {
    switch (kind) {
      case "links": return { links: [], view: "list" };
      case "repos": return { repos: [] };
      case "notes": return { note: "" };
      case "todos": return { todos: [] };
      case "clips": return { clips: [] };
      case "status": return { hosts: [] };
      case "calc": return { hist: [] };
      case "timer": return { timer: { end: null, dur: 0 } };
      case "countdown": return { countdown: { label: "", at: "" } };
      case "fivem": return { fivem: { name: "", code: "" } };
      default: return {};
    }
  }

  const R = (owner, name, lang, desc) => ({ id: uid(), owner, name, lang, private: false, desc });

  // Beispiel-Einrichtung beim ersten Start. Alles lässt sich umbenennen, verschieben oder löschen.
  function defaults() {
    return {
      version: 7,
      activeSpace: "s-start",
      settings: defaultSettings(),
      spaces: [
        {
          id: "s-start", name: "Start", group: "", color: "#f97316", icon: "home",
          widgets: [
            W("clock", 0, 0, 4, 6, { id: "w-clock" }),
            W("weather", 4, 0, 4, 6, { id: "w-weather" }),
            W("calendar", 8, 0, 4, 9, { id: "w-cal" }),
            W("links", 0, 6, 4, 7, { title: "Google", links: [
              L("Gmail", "https://mail.google.com/"),
              L("Drive", "https://drive.google.com/"),
              L("Docs", "https://docs.google.com/document/"),
              L("Sheets", "https://docs.google.com/spreadsheets/"),
              L("Kalender", "https://calendar.google.com/"),
            ] }),
            W("links", 4, 6, 4, 7, { title: "Alltag", links: [
              L("YouTube", "https://www.youtube.com/"),
              L("Discord", "https://discord.com/app"),
              L("Twitch", "https://www.twitch.tv/"),
              L("Reddit", "https://www.reddit.com/"),
            ] }),
            W("todos", 8, 9, 4, 6, { title: "Heute", todos: [
              { id: uid(), text: "Widget am Kopf ziehen und verschieben", done: false },
              { id: uid(), text: "Ecke unten rechts ziehen: Größe ändern", done: false },
              { id: uid(), text: "Rechtsklick auf einen Space: Farbe und Symbol", done: false },
            ] }),
            W("notes", 0, 13, 4, 6, { id: "w-notes" }),
            W("links", 4, 13, 4, 6, { id: "w-inbox", title: "Inbox", links: [] }),
            W("links", 8, 15, 4, 4, { title: "KI", view: "tiles", links: [
              L("ChatGPT", "https://chatgpt.com/"),
              L("Claude", "https://claude.ai/"),
              L("Gemini", "https://gemini.google.com/"),
            ] }),
            W("topsites", 0, 19, 4, 5),
            W("recent", 4, 19, 4, 6),
          ],
        },
        {
          id: "s-dev", name: "Entwicklung", group: "", color: "#14b8a6", icon: "code",
          widgets: [
            W("repos", 0, 0, 6, 8, { title: "Repos", repos: [
              R("EinfachFelix1301", "zentrale", "JavaScript", "Dieser neue Tab"),
            ] }),
            W("links", 6, 0, 6, 5, { title: "GitHub", view: "tiles", links: [
              L("Pull Requests", "https://github.com/pulls"),
              L("Issues", "https://github.com/issues"),
              L("Meldungen", "https://github.com/notifications"),
              L("Neues Repo", "https://github.com/new"),
            ] }),
            W("status", 6, 5, 3, 7, { hosts: [
              { id: uid(), name: "GitHub", url: "https://github.com/" },
              { id: uid(), name: "Google", url: "https://www.google.com/" },
            ] }),
            W("clips", 9, 5, 3, 7, { clips: [
              { id: uid(), label: "Clone", value: "git clone https://github.com/EinfachFelix1301/zentrale.git" },
            ] }),
            W("notes", 0, 8, 6, 6),
          ],
        },
        {
          id: "s-rp-pol", name: "Polizei", group: "Roleplay", color: "#3b82f6", icon: "badge",
          widgets: [
            W("links", 0, 0, 4, 6, { title: "Dienst", links: [] }),
            W("notes", 4, 0, 4, 8),
            W("calc", 8, 0, 4, 8, { title: "Bußgeldrechner" }),
            W("timer", 0, 6, 4, 5),
          ],
        },
        {
          id: "s-rp-recht", name: "Justiz", group: "Roleplay", color: "#a78bfa", icon: "scale",
          widgets: [
            W("links", 0, 0, 4, 6, { title: "Akten", links: [] }),
            W("calc", 4, 0, 4, 8, { title: "Strafmaß" }),
            W("notes", 8, 0, 4, 8),
            W("fivem", 0, 6, 4, 5),
          ],
        },
      ],
    };
  }

  function defaultSettings() {
    return {
      name: "",
      bg: "grid",
      newTab: false,
      compact: true,
      locked: false,
      privacy: false,
      rail: "wide",
      weather: { name: "Berlin", lat: 52.52, lon: 13.405 },
    };
  }

  function normalize(raw) {
    const s = raw && typeof raw === "object" ? raw : defaults();
    s.settings = Object.assign(defaultSettings(), s.settings || {});
    s.settings.weather = Object.assign(defaultSettings().weather, s.settings.weather || {});
    s.spaces = Array.isArray(s.spaces) && s.spaces.length ? s.spaces : defaults().spaces;
    s.version = 7;
    for (const sp of s.spaces) {
      sp.id = sp.id || uid();
      sp.name = sp.name || "Space";
      sp.color = sp.color || "#f97316";
      sp.icon = sp.icon || "folder";
      sp.group = sp.group || "";
      sp.widgets = (sp.widgets || []).filter((w) => KINDS[w.kind]);
      for (const w of sp.widgets) {
        const k = KINDS[w.kind];
        const blank = blankData(w.kind);
        for (const key of Object.keys(blank)) if (w[key] == null) w[key] = blank[key];
        w.id = w.id || uid();
        w.title = w.title ?? k.name;
        w.w = clamp(Math.round(+w.w || k.w), k.minW, COLS);
        w.h = clamp(Math.round(+w.h || k.h), k.minH, 60);
        w.x = clamp(Math.round(+w.x || 0), 0, COLS - w.w);
        w.y = Math.max(0, Math.round(+w.y || 0));
      }
    }
    for (const sp of s.spaces) {
      unstack(sp.widgets);
      if (s.settings.compact) compact(sp.widgets);
    }
    if (!s.spaces.some((sp) => sp.id === s.activeSpace)) s.activeSpace = s.spaces[0].id;
    return s;
  }

  /* ───────────── Speicher ───────────── */

  let state = defaults();
  let lastRev = "";
  let cache = { weather: null };

  async function load() {
    try {
      if (hasChrome) {
        const data = await chrome.storage.local.get([KEY, CACHE_KEY]);
        state = normalize(data[KEY]?.spaces?.length ? data[KEY] : defaults());
        cache = Object.assign({ weather: null }, data[CACHE_KEY] || {});
      } else {
        const raw = localStorage.getItem(KEY);
        state = normalize(raw ? JSON.parse(raw) : defaults());
        cache = Object.assign({ weather: null }, JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"));
      }
    } catch {
      state = normalize(defaults());
    }
    await save();
  }

  async function save() {
    state._rev = uid();
    lastRev = state._rev;
    try {
      if (hasChrome) await chrome.storage.local.set({ [KEY]: state });
      else localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      toastMsg("Speichern fehlgeschlagen");
    }
  }

  let saveTimer = 0;
  function saveSoon(ms = 300) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, ms);
  }

  async function saveCache() {
    try {
      if (hasChrome) await chrome.storage.local.set({ [CACHE_KEY]: cache });
      else localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      /* Cache ist optional */
    }
  }

  async function getBgImage() {
    try {
      if (hasChrome) return (await chrome.storage.local.get(BG_KEY))[BG_KEY] || "";
      return localStorage.getItem(BG_KEY) || "";
    } catch {
      return "";
    }
  }

  async function setBgImage(data) {
    if (hasChrome) await chrome.storage.local.set({ [BG_KEY]: data });
    else localStorage.setItem(BG_KEY, data);
  }

  /* ───────────── Hilfen ───────────── */

  const space = () => state.spaces.find((s) => s.id === state.activeSpace) || state.spaces[0];
  const spaceIndex = () => state.spaces.indexOf(space());

  function findWidget(id) {
    for (const sp of state.spaces) {
      const w = sp.widgets.find((x) => x.id === id);
      if (w) return { space: sp, w };
    }
    return null;
  }

  function findLink(wid, lid) {
    const hit = findWidget(wid);
    const link = hit?.w.links?.find((l) => l.id === lid);
    return link ? { ...hit, link } : null;
  }

  function isoWeek(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  }

  function weekStart(d = new Date()) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return x;
  }

  function dur(ms, withSec = false) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return withSec ? `${pad(h)}:${pad(m)}:${pad(s % 60)}` : `${h}:${pad(m)}`;
  }

  const hm = (ts) => {
    const d = new Date(ts);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const dayShort = (ts) => new Date(ts).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });

  function greeting() {
    const h = new Date().getHours();
    const part = h < 5 ? "Gute Nacht" : h < 11 ? "Guten Morgen" : h < 17 ? "Hallo" : h < 22 ? "Guten Abend" : "Gute Nacht";
    const name = state.settings.name?.trim();
    return name ? `${part}, ${name}` : part;
  }

  function hostOf(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  }

  function normalizeUrl(raw) {
    let u = String(raw || "").trim();
    if (!u) throw new Error("leer");
    if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = "https://" + u;
    const parsed = new URL(u);
    if (!/^(https?|fivem):$/.test(parsed.protocol)) throw new Error("Protokoll");
    return parsed.href;
  }

  function letterFav(title, url, color) {
    const ch = ((title || hostOf(url) || "?").trim().charAt(0) || "?").toUpperCase();
    const c = color || "#8a8f98";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" rx="8" fill="${c}" fill-opacity=".18"/><text x="16" y="21.5" text-anchor="middle" font-size="15" font-weight="700" font-family="Instrument Sans,Segoe UI,sans-serif" fill="${c}">${esc(ch)}</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  const FAV_OVERRIDES = [
    [(h, p) => h === "docs.google.com" && p.startsWith("/spreadsheets"), "https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico"],
    [(h, p) => h === "docs.google.com" && p.startsWith("/document"), "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico"],
    [(h, p) => h === "docs.google.com" && p.startsWith("/presentation"), "https://ssl.gstatic.com/docs/presentations/images/favicon5.ico"],
    [(h) => h === "drive.google.com", "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png"],
    [(h) => h === "mail.google.com", "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"],
    [(h) => h === "sites.google.com", "https://www.gstatic.com/images/branding/productlogos/sites_2026/v3/ico/sites_2026_16dp.ico"],
    [(h) => h === "github.com", "https://github.githubassets.com/favicons/favicon-dark.svg"],
    [(h) => h === "calendar.google.com", `https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_${new Date().getDate()}_2x.png`],
  ];

  // Reihenfolge: festes Icon > Icon der Seite selbst > Google-Dienst > Buchstabe.
  // Google liefert für unbekannte Seiten einen Globus ohne Fehler, darum steht die Seite selbst davor.
  function faviconChain(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      const google = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
      for (const [test, src] of FAV_OVERRIDES) if (test(host, u.pathname)) return [src, "check:" + google];
      if (!/^https?:$/.test(u.protocol)) return [];
      return [`${u.origin}/favicon.ico`, "check:" + google];
    } catch {
      return [];
    }
  }

  // Google liefert für unbekannte Seiten einen Globus mit Status 404 – das Bild lädt trotzdem.
  // Darum den Status vorher prüfen und nur echte Icons übernehmen.
  const iconOk = new Map();
  function checkIcon(url) {
    if (!iconOk.has(url)) {
      iconOk.set(url, fetch(url, { cache: "force-cache" }).then((r) => r.ok).catch(() => false));
    }
    return iconOk.get(url);
  }

  async function nextIcon(img) {
    const [next, ...rest] = img.dataset.fb.split(" ");
    img.dataset.fb = rest.join(" ");
    if (!next) return;
    if (next.startsWith("check:")) {
      const url = next.slice(6);
      if (await checkIcon(url)) img.src = url;
      else if (img.dataset.fb) nextIcon(img);
      return;
    }
    img.src = next;
  }

  function favImg(title, url, color, size = 16) {
    const chain = [...faviconChain(url), letterFav(title, url, color)];
    const key = chain[0];
    const known = cache.icons?.[key];
    if (known) chain.unshift(known);
    return `<img class="fav" src="${esc(chain[0])}" data-fb="${esc(chain.slice(1).join(" "))}" data-key="${esc(key)}" alt="" width="${size}" height="${size}">`;
  }

  // Gefundene Icons merken, damit der nächste Tab sie sofort zeigt
  let iconSaveTimer = 0;
  function rememberIcon(img) {
    const key = img.dataset.key;
    const src = img.currentSrc || img.src;
    if (!key || !src || src.startsWith("data:") || src.startsWith("check:")) return;
    cache.icons = cache.icons || {};
    if (cache.icons[key] === src) return;
    cache.icons[key] = src;
    clearTimeout(iconSaveTimer);
    iconSaveTimer = setTimeout(saveCache, 800);
  }

  function openUrl(url, newTab = state.settings.newTab) {
    if (!url) return;
    if (/^fivem:/i.test(url)) {
      location.href = url;
      return;
    }
    if (newTab) {
      if (hasChrome && chrome.tabs?.create) chrome.tabs.create({ url, active: true });
      else window.open(url, "_blank", "noopener");
    } else {
      location.href = url;
    }
  }

  function openBackground(urls) {
    for (const url of urls) {
      if (hasChrome && chrome.tabs?.create) chrome.tabs.create({ url, active: false });
      else window.open(url, "_blank", "noopener");
    }
  }

  async function copyText(text, msg = "Kopiert") {
    try {
      await navigator.clipboard.writeText(text);
      toastMsg(msg);
    } catch {
      toastMsg("Zwischenablage blockiert");
    }
  }

  /* ───────────── DOM-Refs ───────────── */

  const spacesEl = $("#spaces");
  const canvas = $("#canvas");
  const overlay = $("#overlay");
  const menu = $("#menu");
  const toast = $("#toast");

  /* ───────────── Rendering ───────────── */

  function applyTheme() {
    const sp = space();
    document.documentElement.style.setProperty("--accent", sp.color);
    document.body.classList.toggle("privacy", !!state.settings.privacy);
    document.body.classList.toggle("locked", !!state.settings.locked);
    document.body.classList.toggle("slim", state.settings.rail === "slim");
    $("[data-act=privacy]")?.classList.toggle("on", !!state.settings.privacy);
    $("[data-act=lock]")?.classList.toggle("on", !!state.settings.locked);
    applyBg();
  }

  async function applyBg() {
    const bg = $("#bg");
    const mode = state.settings.bg || "grid";
    bg.dataset.mode = mode;
    if (mode === "image") {
      const img = await getBgImage();
      bg.style.setProperty("--img", img ? `url("${img}")` : "none");
    } else {
      bg.style.removeProperty("--img");
    }
  }

  function renderRail() {
    $("#greet").innerHTML = `<div class="greet-l">${esc(greeting())}</div><div class="greet-s" data-clock="long"></div>`;
    let html = "";
    let group = null;
    state.spaces.forEach((sp, i) => {
      if (sp.group !== group) {
        if (group !== null) html += "</div>";
        group = sp.group;
        html += `<div class="sp-group">${group ? `<div class="sp-label"><span>${esc(group)}</span></div>` : ""}`;
      }
      html += `<button class="sp${sp.id === state.activeSpace ? " active" : ""}" type="button" data-act="space" data-id="${esc(sp.id)}" style="--c:${esc(sp.color)}" title="${esc(sp.name)}">
        <span class="sp-ico">${ico(sp.icon)}</span>
        <span class="sp-name">${esc(sp.name)}</span>
        <span class="sp-key">${i < 9 ? i + 1 : ""}</span>
      </button>`;
    });
    if (group !== null) html += "</div>";
    spacesEl.innerHTML = html;
  }

  function renderHead() {
    const sp = space();
    const links = sp.widgets.reduce((n, w) => n + (w.links?.length || 0), 0);
    const bits = [`${pad(spaceIndex() + 1)} / ${pad(state.spaces.length)}`];
    if (sp.group) bits.push(sp.group);
    bits.push(`${sp.widgets.length} Widgets`);
    if (links) bits.push(`${links} Links`);
    $("#space-kicker").innerHTML = bits.map((b) => `<span>${esc(b)}</span>`).join("");
    $("#space-name").innerHTML = `<span class="sn-ico">${ico(sp.icon)}</span><span class="sn-txt" title="Doppelklick: umbenennen">${esc(sp.name)}</span>`;
  }

  function widgetHtml(w, i) {
    const k = KINDS[w.kind];
    return `<article class="w" data-id="${esc(w.id)}" data-kind="${w.kind}" style="--d:${i}">
      <header class="w-head">
        <span class="w-ico">${ico(k.icon)}</span>
        <h3 class="w-title" data-id="${esc(w.id)}">${esc(w.title)}</h3>
        <span class="w-meta" data-meta>${esc(metaText(w))}</span>
        <div class="w-acts">${actsHtml(w)}</div>
      </header>
      <div class="w-body" data-body>${bodyHtml(w)}</div>
      <span class="w-rs" data-rs title="Größe ändern" aria-hidden="true"></span>
    </article>`;
  }

  function actsHtml(w) {
    const btn = (act, icon, title) =>
      `<button class="ib" type="button" data-act="${act}" data-w="${esc(w.id)}" title="${title}" aria-label="${title}">${ico(icon)}</button>`;
    let extra = "";
    switch (w.kind) {
      case "links":
        extra = btn("w-add", "plus", "Link hinzufügen");
        break;
      case "clips":
        extra = btn("w-add", "plus", "Snippet hinzufügen");
        break;
      case "repos":
        extra = btn("w-add", "plus", "Repo hinzufügen");
        break;
      case "status":
        extra = btn("w-refresh", "refresh", "Neu prüfen") + btn("w-add", "plus", "Seite hinzufügen");
        break;
      case "weather":
      case "topsites":
      case "recent":
        extra = btn("w-refresh", "refresh", "Aktualisieren");
        break;
    }
    return extra + btn("w-menu", "dots", "Optionen");
  }

  function metaText(w) {
    switch (w.kind) {
      case "links":
        return w.links.length ? String(w.links.length) : "";
      case "repos":
        return w.repos.length ? String(w.repos.length) : "";
      case "todos": {
        const open = w.todos.filter((t) => !t.done).length;
        return w.todos.length ? `${open} offen` : "";
      }
      case "clock":
        return "KW " + isoWeek(new Date());
      case "weather":
        return state.settings.weather.name || "";
      case "status": {
        const res = w.hosts.map((h) => statusCache[h.url]).filter(Boolean);
        if (!res.length) return "";
        const ok = res.filter((r) => r.ok).length;
        return `${ok}/${w.hosts.length} online`;
      }
      default:
        return "";
    }
  }

  function renderCanvas(animate = false) {
    const sp = space();
    canvas.classList.toggle("enter", animate);
    if (!sp.widgets.length) {
      canvas.innerHTML = `<div class="empty-space">
        <div class="es-ico">${ico(sp.icon)}</div>
        <h2>${esc(sp.name)} ist noch leer</h2>
        <p>Leg dein erstes Widget an. Alles lässt sich danach frei verschieben und in der Größe ändern.</p>
        <button class="btn primary" type="button" data-act="add-widget">${ico("plus")}<span>Widget hinzufügen</span></button>
      </div>`;
      canvas.style.height = "";
      return;
    }
    canvas.innerHTML = sp.widgets.map(widgetHtml).join("");
    place();
    afterRender();
  }

  function renderAll(animate = false) {
    applyTheme();
    renderRail();
    renderHead();
    renderCanvas(animate);
    tick();
  }

  function updateWidget(id) {
    if (!id) return;
    const hit = findWidget(id);
    const el = canvas.querySelector(`.w[data-id="${CSS.escape(id)}"]`);
    if (!hit || !el) return;
    const body = el.querySelector("[data-body]");
    const scroll = body.scrollTop;
    body.innerHTML = bodyHtml(hit.w);
    body.scrollTop = scroll;
    el.querySelector("[data-meta]").textContent = metaText(hit.w);
    el.querySelector(".w-title").textContent = hit.w.title;
    el.querySelector(".w-acts").innerHTML = actsHtml(hit.w);
    focusForm(el);
  }

  function focusForm(root = canvas) {
    root.querySelector("form[data-autofocus] input")?.focus();
  }

  function afterRender() {
    focusForm();
    const kinds = new Set(space().widgets.map((w) => w.kind));
    if (kinds.has("weather")) loadWeather();
    if (kinds.has("status")) refreshStatus();
    if (kinds.has("topsites")) loadTopSites();
    if (kinds.has("recent")) loadRecent();
  }

  /* ───────────── Widget-Inhalte ───────────── */

  const ui = {
    adding: null,
    editLink: null,
    calOffset: {},
    cdEdit: {},
    calcDraft: {},
  };

  function bodyHtml(w) {
    switch (w.kind) {
      case "links": return bodyLinks(w);
      case "repos": return bodyRepos(w);
      case "clock": return bodyClock();
      case "weather": return bodyWeather();
      case "calendar": return bodyCalendar(w);
      case "todos": return bodyTodos(w);
      case "notes": return `<textarea class="note" data-note="${esc(w.id)}" placeholder="Schreib einfach los …" spellcheck="true">${esc(w.note)}</textarea>`;
      case "clips": return bodyClips(w);
      case "calc": return bodyCalc(w);
      case "timer": return bodyTimer(w);
      case "countdown": return bodyCountdown(w);
      case "status": return bodyStatus(w);
      case "topsites": return bodyTopSites();
      case "recent": return bodyRecent();
      case "fivem": return bodyFivem(w);
      default: return "";
    }
  }

  function linkForm(w) {
    const edit = ui.editLink && ui.editLink.w === w.id ? w.links.find((l) => l.id === ui.editLink.l) : null;
    return `<form class="mini-form" data-form="link" data-w="${esc(w.id)}" data-autofocus>
      <input name="title" placeholder="Name" maxlength="80" value="${esc(edit?.title || "")}">
      <input name="url" placeholder="https://…" required value="${esc(edit?.url || "")}">
      <div class="row"><button class="btn primary sm" type="submit">${edit ? "Speichern" : "Hinzufügen"}</button><button class="btn sm" type="button" data-act="add-cancel">Fertig</button></div>
    </form>`;
  }

  function bodyLinks(w) {
    const sp = findWidget(w.id)?.space || space();
    const target = state.settings.newTab ? ` target="_blank" rel="noopener"` : "";
    const tiles = w.view === "tiles";
    const items = w.links
      .map(
        (l) => `<a class="lk" href="${esc(l.url)}"${target} data-w="${esc(w.id)}" data-l="${esc(l.id)}" title="${esc(l.title)} · ${esc(hostOf(l.url))}" draggable="false">
          <span class="lk-fav">${favImg(l.title, l.url, sp.color, tiles ? 22 : 16)}</span>
          <span class="lk-t">${esc(l.title)}</span>
          ${tiles ? "" : `<span class="lk-h">${esc(hostOf(l.url))}</span>`}
          <button class="ib lk-m" type="button" data-act="l-menu" data-w="${esc(w.id)}" data-l="${esc(l.id)}" aria-label="Link-Optionen">${ico("dots")}</button>
        </a>`
      )
      .join("");
    const form = ui.adding === w.id ? linkForm(w) : "";
    const empty = !w.links.length && !form ? `<div class="empty">Leer. Tab oder Link hierher ziehen oder <button class="inline" type="button" data-act="w-add" data-w="${esc(w.id)}">einen anlegen</button>.</div>` : "";
    return `<div class="links ${tiles ? "tiles" : "list"}">${items}</div>${empty}${form}`;
  }

  const LANG_COLORS = {
    JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572a5", Lua: "#6b7cff",
    Astro: "#ff5a03", HTML: "#e34c26", CSS: "#663399", PHP: "#4f5d95", "C#": "#178600", Go: "#00add8", Rust: "#dea584",
  };

  const repoUrl = (r) => `https://github.com/${r.owner}/${r.name}`;

  // Nur ein Name ohne Besitzer: Besitzer des letzten Repos im Widget übernehmen.
  function parseRepo(raw, fallbackOwner = "") {
    const t = String(raw || "").trim().replace(/\.git$/i, "").replace(/\/+$/, "");
    const m = t.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/i) || t.match(/^([\w.-]+)\/([\w.-]+)$/);
    if (m) return { owner: m[1], name: m[2] };
    if (fallbackOwner && /^[\w.-]+$/.test(t)) return { owner: fallbackOwner, name: t };
    return null;
  }

  function bodyRepos(w) {
    const target = state.settings.newTab ? ` target="_blank" rel="noopener"` : "";
    const rows = w.repos
      .map((r) => {
        const url = repoUrl(r);
        const lang = r.lang ? `<span class="rp-lang"><i style="--lc:${esc(LANG_COLORS[r.lang] || "#8a8f98")}"></i>${esc(r.lang)}</span>` : "";
        return `<div class="rp">
          <a class="rp-main" href="${esc(url)}"${target} title="${esc(r.owner)}/${esc(r.name)}">
            <span class="rp-ico${r.private ? " priv" : ""}" title="${r.private ? "Privat" : "Öffentlich"}">${ico(r.private ? "lock" : "book")}</span>
            <span class="rp-t"><b>${esc(r.name)}</b>${r.desc ? `<span>${esc(r.desc)}</span>` : ""}</span>
            ${lang}
          </a>
          <span class="rp-acts">
            <a class="ib" href="${esc(url)}/issues"${target} title="Issues" aria-label="Issues">${ico("issue")}</a>
            <a class="ib" href="${esc(url)}/pulls"${target} title="Pull Requests" aria-label="Pull Requests">${ico("git")}</a>
            <a class="ib" href="${esc(url)}/actions"${target} title="Actions" aria-label="Actions">${ico("play")}</a>
            <button class="ib" type="button" data-act="rp-menu" data-w="${esc(w.id)}" data-id="${esc(r.id)}" aria-label="Repo-Optionen">${ico("dots")}</button>
          </span>
        </div>`;
      })
      .join("");
    const form = ui.adding === w.id
      ? `<form class="mini-form" data-form="repo" data-w="${esc(w.id)}" data-autofocus>
          <input name="repo" placeholder="besitzer/name oder GitHub-Link" required>
          <input name="desc" placeholder="Beschreibung (optional)" maxlength="120">
          <div class="row"><button class="btn primary sm" type="submit">Hinzufügen</button><button class="btn sm" type="button" data-act="add-cancel">Fertig</button></div>
        </form>`
      : "";
    const empty = !w.repos.length && !form ? `<div class="empty">Noch keine Repos.</div>` : "";
    return `<div class="repos">${rows}</div>${empty}${form}`;
  }

  function bodyClock() {
    return `<div class="clock">
      <div class="clock-t"><span data-clock="hm">--:--</span><span class="clock-s" data-clock="s">--</span></div>
      <div class="clock-d" data-clock="long"></div>
      <div class="clock-bar"><i data-clock="bar"></i></div>
      <div class="clock-m"><span data-clock="kw"></span><span data-clock="doy"></span><span data-clock="left"></span></div>
    </div>`;
  }

  function bodyWeather() {
    const wc = cache.weather;
    const loc = state.settings.weather;
    const key = `${loc.lat},${loc.lon}`;
    if (!wc || wc.key !== key) return `<div class="empty">Lade Wetter für ${esc(loc.name)} …</div>`;
    if (wc.error) return `<div class="empty">Wetter gerade nicht erreichbar.</div>`;
    const d = wc.data;
    const [desc, icon] = WMO[d.code] || ["Wetter", "cloud"];
    const days = (d.days || []).slice(1, 5)
      .map((day) => {
        const [dd, di] = WMO[day.code] || ["", "cloud"];
        return `<div class="fc-d" title="${esc(dd)}"><span>${esc(new Date(day.date).toLocaleDateString("de-DE", { weekday: "short" }))}</span>${ico(di)}<b>${Math.round(day.max)}°</b><em>${Math.round(day.min)}°</em></div>`;
      })
      .join("");
    const today = d.days?.[0];
    return `<div class="wx">
      <div class="wx-now">
        <div class="wx-ico">${ico(icon)}</div>
        <div class="wx-temp">${Math.round(d.temp)}<span>°</span></div>
        <div class="wx-txt">
          <b>${esc(desc)}</b>
          <span>Gefühlt ${Math.round(d.feels)}°${today ? ` · ${Math.round(today.min)}° bis ${Math.round(today.max)}°` : ""}</span>
          <span>Wind ${Math.round(d.wind)} km/h · Luft ${d.hum} %</span>
        </div>
      </div>
      <div class="fc">${days}</div>
    </div>`;
  }

  function bodyCalendar(w) {
    const off = ui.calOffset[w.id] || 0;
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth() + off, 1);
    const title = base.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    const first = weekStart(base);
    let cells = `<span class="cal-h kw">KW</span>` + ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => `<span class="cal-h">${d}</span>`).join("");
    const cur = new Date(first);
    for (let r = 0; r < 6; r++) {
      cells += `<span class="cal-kw">${isoWeek(cur)}</span>`;
      for (let c = 0; c < 7; c++) {
        const other = cur.getMonth() !== base.getMonth();
        const today = cur.toDateString() === now.toDateString();
        cells += `<span class="cal-c${other ? " o" : ""}${today ? " t" : ""}${c >= 5 ? " we" : ""}">${cur.getDate()}</span>`;
        cur.setDate(cur.getDate() + 1);
      }
    }
    return `<div class="cal">
      <div class="cal-top">
        <b>${esc(title)}</b>
        <span class="cal-nav">
          <button class="ib" type="button" data-act="cal-nav" data-w="${esc(w.id)}" data-dir="-1" aria-label="Vorheriger Monat">${ico("left")}</button>
          <button class="chip" type="button" data-act="cal-nav" data-w="${esc(w.id)}" data-dir="0">Heute</button>
          <button class="ib" type="button" data-act="cal-nav" data-w="${esc(w.id)}" data-dir="1" aria-label="Nächster Monat">${ico("right")}</button>
        </span>
      </div>
      <div class="cal-g">${cells}</div>
    </div>`;
  }

  function bodyTodos(w) {
    const items = w.todos
      .map(
        (t) => `<label class="todo${t.done ? " done" : ""}">
          <input type="checkbox" data-todo="${esc(t.id)}" data-w="${esc(w.id)}" ${t.done ? "checked" : ""}>
          <span class="box" aria-hidden="true"></span>
          <span class="todo-t">${esc(t.text)}</span>
          <button class="ib" type="button" data-act="todo-del" data-w="${esc(w.id)}" data-id="${esc(t.id)}" aria-label="Aufgabe löschen">${ico("x")}</button>
        </label>`
      )
      .join("");
    return `<div class="todos">${items}</div>
      <form class="todo-add" data-form="todo" data-w="${esc(w.id)}">
        <span>${ico("plus")}</span><input name="text" placeholder="Aufgabe hinzufügen" maxlength="140" autocomplete="off">
      </form>`;
  }

  function bodyClips(w) {
    const items = w.clips
      .map(
        (c) => `<div class="clip">
          <button class="clip-b" type="button" data-act="clip-copy" data-w="${esc(w.id)}" data-id="${esc(c.id)}" title="Kopieren">
            <span class="clip-l">${esc(c.label)}</span><span class="clip-v">${esc(c.value)}</span>
          </button>
          <button class="ib" type="button" data-act="clip-del" data-w="${esc(w.id)}" data-id="${esc(c.id)}" aria-label="Snippet löschen">${ico("x")}</button>
        </div>`
      )
      .join("");
    const form = ui.adding === w.id
      ? `<form class="mini-form" data-form="clip" data-w="${esc(w.id)}" data-autofocus>
          <input name="label" placeholder="Name" maxlength="24" required>
          <input name="value" placeholder="Text oder URL" required>
          <div class="row"><button class="btn primary sm" type="submit">Hinzufügen</button><button class="btn sm" type="button" data-act="add-cancel">Abbrechen</button></div>
        </form>`
      : "";
    const empty = !w.clips.length && !form ? `<div class="empty">Noch keine Snippets.</div>` : "";
    return items + empty + form;
  }

  function bodyCalc(w) {
    const draft = ui.calcDraft[w.id] || "";
    const hist = w.hist.slice(-8).reverse()
      .map((h) => `<button class="ch" type="button" data-act="calc-hist" data-v="${esc(h.r)}" title="Ergebnis kopieren"><span>${esc(h.e)}</span><b>${esc(h.r)}</b></button>`)
      .join("");
    return `<form class="calc" data-form="calc" data-w="${esc(w.id)}">
      <input name="e" value="${esc(draft)}" placeholder="z. B. 2.500 + 3 × 750" autocomplete="off" spellcheck="false" data-calc="${esc(w.id)}">
      <div class="calc-r" data-calc-r="${esc(w.id)}">${esc(calcPreview(draft))}</div>
    </form>
    <div class="calc-h">${hist || `<div class="empty">Enter speichert die Rechnung. Komma, Tausenderpunkte, × und % gehen.</div>`}</div>`;
  }

  function bodyTimer(w) {
    const t = w.timer;
    const left = t.end ? Math.max(0, t.end - Date.now()) : 0;
    const running = t.end && left > 0;
    const presets = [1, 3, 5, 10, 15, 30]
      .map((m) => `<button class="chip" type="button" data-act="timer-set" data-w="${esc(w.id)}" data-min="${m}">${m} min</button>`)
      .join("");
    return `<div class="timer${running ? " on" : ""}">
      <div class="timer-t" data-timer="${esc(w.id)}">${running ? dur(left, true).replace(/^00:/, "") : "00:00"}</div>
      <div class="timer-bar"><i data-timer-bar="${esc(w.id)}" style="width:${running && t.dur ? (100 * left) / t.dur : 0}%"></i></div>
      ${running
        ? `<button class="btn sm" type="button" data-act="timer-stop" data-w="${esc(w.id)}">Stopp</button>`
        : `<div class="chips">${presets}</div>
           <form class="timer-f" data-form="timer" data-w="${esc(w.id)}"><input name="m" inputmode="decimal" placeholder="Minuten" autocomplete="off"><button class="btn primary sm" type="submit">Start</button></form>`}
    </div>`;
  }

  function countdownLeft(at) {
    if (!at) return null;
    const t = new Date(at).getTime() - Date.now();
    if (Number.isNaN(t)) return null;
    if (t <= 0) return "Jetzt";
    const s = Math.floor(t / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return d ? `${d}T ${pad(h)}:${pad(m)}` : `${pad(h)}:${pad(m)}:${pad(s % 60)}`;
  }

  function bodyCountdown(w) {
    const c = w.countdown;
    if (ui.cdEdit[w.id] || !c.at) {
      return `<form class="mini-form" data-form="countdown" data-w="${esc(w.id)}">
        <input name="label" placeholder="Wofür?" value="${esc(c.label)}">
        <input name="at" type="datetime-local" required value="${esc(c.at)}">
        <div class="row"><button class="btn primary sm" type="submit">Speichern</button></div>
      </form>`;
    }
    const when = new Date(c.at).toLocaleString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    return `<div class="cd">
      <div class="cd-t" data-cd="${esc(w.id)}">${esc(countdownLeft(c.at) || "–")}</div>
      <div class="cd-l"><b>${esc(c.label || "Termin")}</b><span>${esc(when)}</span></div>
    </div>`;
  }

  const statusCache = {};

  function bodyStatus(w) {
    const rows = w.hosts
      .map((h) => {
        const st = statusCache[h.url];
        const cls = !st ? "wait" : st.ok ? "ok" : "bad";
        const txt = !st ? "prüfe" : st.ok ? `${st.ms} ms` : "offline";
        return `<div class="st ${cls}">
          <i class="dot"></i>
          <a class="st-n" href="${esc(h.url)}">${esc(h.name)}</a>
          <span class="st-h">${esc(hostOf(h.url))}</span>
          <span class="st-ms">${esc(txt)}</span>
          <button class="ib" type="button" data-act="status-del" data-w="${esc(w.id)}" data-id="${esc(h.id)}" aria-label="Entfernen">${ico("x")}</button>
        </div>`;
      })
      .join("");
    const form = ui.adding === w.id
      ? `<form class="mini-form" data-form="status" data-w="${esc(w.id)}" data-autofocus>
          <input name="name" placeholder="Name" maxlength="30" required>
          <input name="url" placeholder="https://…" required>
          <div class="row"><button class="btn primary sm" type="submit">Hinzufügen</button><button class="btn sm" type="button" data-act="add-cancel">Abbrechen</button></div>
        </form>`
      : "";
    return (rows || (form ? "" : `<div class="empty">Keine Seiten eingetragen.</div>`)) + form;
  }

  let topSites = null;
  function bodyTopSites() {
    if (!hasChrome || !chrome.topSites) return `<div class="empty">Nur in der Erweiterung verfügbar.</div>`;
    if (!topSites) return `<div class="empty">Lade …</div>`;
    if (!topSites.length) return `<div class="empty">Noch keine Daten.</div>`;
    const target = state.settings.newTab ? ` target="_blank" rel="noopener"` : "";
    return `<div class="links tiles">${topSites.slice(0, 12)
      .map((s) => `<a class="lk" href="${esc(s.url)}"${target} title="${esc(s.title)}"><span class="lk-fav">${favImg(s.title, s.url, space().color, 22)}</span><span class="lk-t">${esc(s.title || hostOf(s.url))}</span></a>`)
      .join("")}</div>`;
  }

  let recent = null;
  function bodyRecent() {
    if (!hasChrome || !chrome.sessions) return `<div class="empty">Nur in der Erweiterung verfügbar.</div>`;
    if (!recent) return `<div class="empty">Lade …</div>`;
    const rows = recent
      .map((r) => {
        const tab = r.tab;
        const win = r.window;
        const sid = tab?.sessionId || win?.sessionId;
        if (!sid) return "";
        const lm = r.lastModified > 1e12 ? r.lastModified : r.lastModified * 1000;
        const ago = r.lastModified ? agoText(lm) : "";
        if (tab) {
          return `<button class="rc" type="button" data-act="recent-open" data-sid="${esc(sid)}" title="${esc(tab.url)}">
            ${favImg(tab.title, tab.url, space().color)}<span class="rc-t">${esc(tab.title || tab.url)}</span><span class="rc-a">${esc(ago)}</span></button>`;
        }
        return `<button class="rc" type="button" data-act="recent-open" data-sid="${esc(sid)}">
          ${ico("grid", "i fav")}<span class="rc-t">Fenster mit ${win.tabs?.length || 0} Tabs</span><span class="rc-a">${esc(ago)}</span></button>`;
      })
      .join("");
    return rows || `<div class="empty">Nichts geschlossen.</div>`;
  }

  function agoText(ts) {
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return "gerade";
    if (m < 60) return `${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h} h`;
    return `${Math.round(h / 24)} T`;
  }

  function bodyFivem(w) {
    const f = w.fivem;
    return `<form class="fivem" data-form="fivem" data-w="${esc(w.id)}">
      <input name="name" placeholder="Server" value="${esc(f.name)}" autocomplete="off">
      <input name="code" placeholder="CFX-Code oder cfx.re/join/…" value="${esc(f.code)}" autocomplete="off" spellcheck="false">
      <div class="row">
        <button class="btn primary grow" type="submit">${ico("play")}<span>Verbinden</span></button>
        <button class="btn" type="button" data-act="fivem-copy" data-w="${esc(w.id)}" title="F8-Befehl kopieren" aria-label="F8-Befehl kopieren">${ico("copy")}</button>
      </div>
    </form>`;
  }

  function fivemToken(code) {
    const raw = String(code || "").trim();
    if (!raw) return "";
    const join = raw.match(/cfx\.re\/join\/([a-z0-9]+)/i);
    return join ? join[1] : raw.replace(/^fivem:\/\/connect\//i, "").replace(/^\/+/, "");
  }

  /* ───────────── Rechner ───────────── */

  function calcEval(src) {
    const s = String(src)
      .replace(/(\d)\.(?=\d{3}(?!\d))/g, "$1")
      .replace(/,/g, ".")
      .replace(/[x×]/gi, "*")
      .replace(/÷|:/g, "/")
      .replace(/[€\s]/g, "");
    if (!s) throw new Error("leer");
    let i = 0;
    const peek = () => s[i];
    const num = () => {
      const m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i);
      if (!m) throw new Error("Zahl");
      i += m[0].length;
      return parseFloat(m[0]);
    };
    const post = (v) => {
      if (peek() === "%") {
        i++;
        return v / 100;
      }
      return v;
    };
    const factor = () => {
      if (peek() === "+") { i++; return factor(); }
      if (peek() === "-") { i++; return -factor(); }
      if (peek() === "(") {
        i++;
        const v = expr();
        if (s[i] !== ")") throw new Error("Klammer");
        i++;
        return post(v);
      }
      return post(num());
    };
    const power = () => {
      const v = factor();
      if (peek() === "^") {
        i++;
        return Math.pow(v, power());
      }
      return v;
    };
    const term = () => {
      let v = power();
      while (peek() === "*" || peek() === "/") {
        const op = s[i++];
        const r = power();
        v = op === "*" ? v * r : v / r;
      }
      return v;
    };
    const expr = () => {
      let v = term();
      while (peek() === "+" || peek() === "-") {
        const op = s[i++];
        const r = term();
        v = op === "+" ? v + r : v - r;
      }
      return v;
    };
    const v = expr();
    if (i !== s.length || !Number.isFinite(v)) throw new Error("Syntax");
    return v;
  }

  const fmtNum = (v) => v.toLocaleString("de-DE", { maximumFractionDigits: 6 });

  function calcPreview(expr) {
    if (!expr.trim()) return "0";
    try {
      return fmtNum(calcEval(expr));
    } catch {
      return "…";
    }
  }

  /* ───────────── Grid-Engine ───────────── */

  const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

  function resolve(items, fixed) {
    const queue = [fixed];
    let guard = 0;
    while (queue.length && guard++ < 5000) {
      const m = queue.shift();
      for (const o of items) {
        if (o === m || !overlap(m, o)) continue;
        if (o === fixed) {
          m.y = o.y + o.h;
          queue.push(m);
          break;
        }
        o.y = m.y + m.h;
        queue.push(o);
      }
    }
  }

  function compact(items) {
    const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
    const placed = [];
    for (const it of sorted) {
      while (it.y > 0 && !placed.some((p) => overlap({ x: it.x, y: it.y - 1, w: it.w, h: it.h }, p))) it.y--;
      placed.push(it);
    }
  }

  function unstack(items) {
    const placed = [];
    for (const it of [...items].sort((a, b) => a.y - b.y || a.x - b.x)) {
      while (placed.some((p) => overlap(it, p))) it.y++;
      placed.push(it);
    }
  }

  function settle(items, fixed) {
    if (fixed) resolve(items, fixed);
    if (state.settings.compact) compact(items);
  }

  function findFree(items, w, h) {
    for (let y = 0; y < 500; y++) {
      for (let x = 0; x <= COLS - w; x++) {
        const probe = { x, y, w, h };
        if (!items.some((it) => overlap(probe, it))) return { x, y };
      }
    }
    return { x: 0, y: items.reduce((m, it) => Math.max(m, it.y + it.h), 0) };
  }

  const isStack = () => canvas.clientWidth < STACK_BELOW;

  function metrics() {
    const width = canvas.clientWidth;
    return { colW: (width - GAP * (COLS - 1)) / COLS, width };
  }

  function rectOf(it, m) {
    return {
      left: it.x * (m.colW + GAP),
      top: it.y * (ROW + GAP),
      width: it.w * m.colW + (it.w - 1) * GAP,
      height: it.h * ROW + (it.h - 1) * GAP,
    };
  }

  function widgetEl(id) {
    return canvas.querySelector(`.w[data-id="${CSS.escape(id)}"]`);
  }

  function place(items = space().widgets, skipId = null) {
    const m = metrics();
    let bottom = 0;
    if (isStack()) {
      const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
      for (const it of sorted) {
        const el = widgetEl(it.id);
        if (!el) continue;
        const h = it.h * ROW + (it.h - 1) * GAP;
        el.style.transform = `translate(0px, ${bottom}px)`;
        el.style.width = m.width + "px";
        el.style.height = h + "px";
        bottom += h + GAP;
      }
    } else {
      for (const it of items) {
        const r = rectOf(it, m);
        bottom = Math.max(bottom, r.top + r.height);
        if (it.id === skipId) continue;
        const el = widgetEl(it.id);
        if (!el) continue;
        el.style.transform = `translate(${r.left}px, ${r.top}px)`;
        el.style.width = r.width + "px";
        el.style.height = r.height + "px";
      }
    }
    canvas.style.height = bottom + 48 + "px";
  }

  let placeRaf = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(placeRaf);
    placeRaf = requestAnimationFrame(() => {
      if (!drag && space().widgets.length) place();
    });
  }).observe(canvas);

  /* ───────────── Drag & Resize ───────────── */

  let drag = null;
  let suppressClick = false;

  function placeGhost(it) {
    let g = $(".ghost", canvas);
    if (!g) {
      g = document.createElement("div");
      g.className = "ghost";
      canvas.appendChild(g);
    }
    const r = rectOf(it, metrics());
    g.style.transform = `translate(${r.left}px, ${r.top}px)`;
    g.style.width = r.width + "px";
    g.style.height = r.height + "px";
  }

  function applyLayout(items) {
    const byId = new Map(items.map((i) => [i.id, i]));
    for (const w of space().widgets) {
      const it = byId.get(w.id);
      if (it) Object.assign(w, { x: it.x, y: it.y, w: it.w, h: it.h });
    }
  }

  function spaceUnder(x, y) {
    const el = document.elementFromPoint(x, y)?.closest(".sp");
    return el && el.dataset.id !== state.activeSpace ? el : null;
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const wEl = e.target.closest(".w");
    if (!wEl) return;

    const rs = e.target.closest("[data-rs]");
    const head = e.target.closest(".w-head");
    const link = e.target.closest(".lk[data-l]");

    if (link && !e.target.closest("button")) {
      drag = { type: "link", wid: link.dataset.w, lid: link.dataset.l, sx: e.clientX, sy: e.clientY, active: false, src: link };
      return;
    }
    if (state.settings.locked || isStack()) return;
    if (!rs && (!head || e.target.closest("button, [contenteditable=true]"))) return;

    const id = wEl.dataset.id;
    const w = space().widgets.find((x) => x.id === id);
    if (!w) return;
    e.preventDefault();
    drag = {
      type: rs ? "resize" : "move",
      id,
      el: wEl,
      sx: e.clientX,
      sy: e.clientY,
      rect: rectOf(w, metrics()),
      snap: space().widgets.map((x) => ({ id: x.id, x: x.x, y: x.y, w: x.w, h: x.h })),
      active: false,
    };
  });

  document.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    if (!drag.active) {
      if (Math.hypot(dx, dy) < 5) return;
      drag.active = true;
      document.body.classList.add("dragging", drag.type === "resize" ? "resizing" : "moving");
      closeMenu();
      if (drag.type === "link") {
        const link = findLink(drag.wid, drag.lid)?.link;
        const chip = document.createElement("div");
        chip.className = "drag-chip";
        chip.innerHTML = `${favImg(link?.title, link?.url, space().color)}<span>${esc(link?.title || "")}</span>`;
        document.body.appendChild(chip);
        drag.chip = chip;
        drag.src.classList.add("is-dragging");
      } else {
        drag.el.classList.add("is-dragging");
        placeGhost(drag.snap.find((i) => i.id === drag.id));
      }
    }

    if (drag.type === "link") {
      drag.chip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 12}px)`;
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const target = under?.closest(".sp") || under?.closest('.w[data-kind="links"]');
      $$(".drop-ok").forEach((el) => el !== target && el.classList.remove("drop-ok"));
      target?.classList.add("drop-ok");
      const over = under?.closest(".lk[data-l]");
      $$(".lk.drop-before").forEach((el) => el !== over && el.classList.remove("drop-before"));
      if (over && over !== drag.src) over.classList.add("drop-before");
      return;
    }

    const m = metrics();
    const items = drag.snap.map((i) => ({ ...i }));
    const me = items.find((i) => i.id === drag.id);
    const k = KINDS[findWidget(drag.id).w.kind];

    if (drag.type === "move") {
      const left = drag.rect.left + dx;
      const top = drag.rect.top + dy;
      drag.el.style.transform = `translate(${left}px, ${top}px)`;
      me.x = clamp(Math.round(left / (m.colW + GAP)), 0, COLS - me.w);
      me.y = Math.max(0, Math.round(top / (ROW + GAP)));
      const target = spaceUnder(e.clientX, e.clientY);
      $$(".sp.drop-ok").forEach((el) => el !== target && el.classList.remove("drop-ok"));
      target?.classList.add("drop-ok");
      drag.toSpace = target?.dataset.id || null;
    } else {
      const width = Math.max(60, drag.rect.width + dx);
      const height = Math.max(60, drag.rect.height + dy);
      drag.el.style.width = width + "px";
      drag.el.style.height = height + "px";
      me.w = clamp(Math.round((width + GAP) / (m.colW + GAP)), k.minW, COLS - me.x);
      me.h = clamp(Math.round((height + GAP) / (ROW + GAP)), k.minH, 60);
    }

    settle(items, me);
    drag.layout = items;
    placeGhost(me);
    place(items, drag.id);
  });

  document.addEventListener("pointerup", async (e) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    document.body.classList.remove("dragging", "resizing", "moving");
    if (!d.active) return;
    suppressClick = true;
    setTimeout(() => (suppressClick = false), 0);

    if (d.type === "link") {
      d.chip?.remove();
      d.src.classList.remove("is-dragging");
      $$(".drop-ok, .drop-before").forEach((el) => el.classList.remove("drop-ok", "drop-before"));
      await dropLink(d, document.elementFromPoint(e.clientX, e.clientY));
      return;
    }

    $(".ghost", canvas)?.remove();
    d.el.classList.remove("is-dragging");
    $$(".sp.drop-ok").forEach((el) => el.classList.remove("drop-ok"));

    if (d.type === "move" && d.toSpace) {
      await moveWidgetTo(d.id, d.toSpace);
      return;
    }
    if (d.layout) applyLayout(d.layout);
    place();
    if (d.type === "resize") updateWidget(d.id);
    await save();
  });

  document.addEventListener(
    "click",
    (e) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  async function dropLink(d, under) {
    const src = findLink(d.wid, d.lid);
    if (!src) return;
    const spEl = under?.closest(".sp");
    let dst = null;
    let beforeId = null;
    if (spEl) {
      const sp = state.spaces.find((s) => s.id === spEl.dataset.id);
      if (!sp || sp === src.space) return;
      dst = sp.widgets.find((w) => w.id === "w-inbox") || sp.widgets.find((w) => w.kind === "links");
      if (!dst) {
        const pos = findFree(sp.widgets, 3, 6);
        dst = W("links", pos.x, pos.y, 3, 6, { title: "Links" });
        sp.widgets.push(dst);
      }
    } else {
      const wEl = under?.closest('.w[data-kind="links"]');
      if (!wEl) return;
      dst = findWidget(wEl.dataset.id)?.w;
      beforeId = under.closest(".lk[data-l]")?.dataset.l || null;
    }
    if (!dst || (beforeId === src.link.id && dst === src.w)) return;
    src.w.links = src.w.links.filter((l) => l.id !== src.link.id);
    const idx = beforeId ? dst.links.findIndex((l) => l.id === beforeId) : -1;
    if (idx >= 0) dst.links.splice(idx, 0, src.link);
    else dst.links.push(src.link);
    await save();
    if (spEl) {
      renderAll();
      toastMsg(`„${src.link.title}“ → ${state.spaces.find((s) => s.id === spEl.dataset.id)?.name}`);
    } else {
      updateWidget(src.w.id);
      if (dst !== src.w) updateWidget(dst.id);
      renderHead();
    }
  }

  async function moveWidgetTo(id, spaceId) {
    const hit = findWidget(id);
    const dest = state.spaces.find((s) => s.id === spaceId);
    if (!hit || !dest || hit.space === dest) return;
    hit.space.widgets = hit.space.widgets.filter((w) => w.id !== id);
    Object.assign(hit.w, findFree(dest.widgets, hit.w.w, hit.w.h));
    dest.widgets.push(hit.w);
    settle(hit.space.widgets);
    await save();
    renderAll();
    toastMsg(`„${hit.w.title}“ → ${dest.name}`);
  }

  /* Links aus Tabs/Seiten in ein Links-Widget ziehen */
  canvas.addEventListener("dragover", (e) => {
    const wEl = e.target.closest('.w[data-kind="links"]');
    if (!wEl || !e.dataTransfer.types.some((t) => t === "text/uri-list" || t === "text/plain")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    $$(".w.drop-ok").forEach((el) => el !== wEl && el.classList.remove("drop-ok"));
    wEl.classList.add("drop-ok");
  });
  canvas.addEventListener("dragleave", (e) => {
    const wEl = e.target.closest(".w");
    if (wEl && !wEl.contains(e.relatedTarget)) wEl.classList.remove("drop-ok");
  });
  canvas.addEventListener("drop", async (e) => {
    const wEl = e.target.closest('.w[data-kind="links"]');
    $$(".w.drop-ok").forEach((el) => el.classList.remove("drop-ok"));
    if (!wEl) return;
    e.preventDefault();
    const raw = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    const url = raw.split(/\r?\n/).find((l) => l && !l.startsWith("#"));
    let href;
    try {
      href = normalizeUrl(url);
    } catch {
      toastMsg("Keine gültige Adresse");
      return;
    }
    const html = e.dataTransfer.getData("text/html");
    const title = (html && new DOMParser().parseFromString(html, "text/html").body.textContent.trim()) || hostOf(href);
    const hit = findWidget(wEl.dataset.id);
    hit.w.links.push({ id: uid(), title: title.slice(0, 80), url: href });
    await save();
    updateWidget(hit.w.id);
    renderHead();
    toastMsg("Link hinzugefügt");
  });

  /* ───────────── Laufende Anzeigen ───────────── */

  function tick() {
    const now = new Date();
    const set = (sel, txt) => $$(sel).forEach((el) => el.textContent !== txt && (el.textContent = txt));
    set('[data-clock="hm"]', `${pad(now.getHours())}:${pad(now.getMinutes())}`);
    set('[data-clock="s"]', pad(now.getSeconds()));
    set('[data-clock="long"]', now.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    set('[data-clock="short"]', `${now.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })} · KW ${isoWeek(now)}`);
    set('[data-clock="kw"]', `KW ${isoWeek(now)}`);
    const doy = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 86400000) + 1;
    set('[data-clock="doy"]', `Tag ${doy}`);
    const secs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    $$('[data-clock="bar"]').forEach((el) => (el.style.width = ((secs / 86400) * 100).toFixed(2) + "%"));
    const left = 1440 - (now.getHours() * 60 + now.getMinutes());
    set('[data-clock="left"]', `noch ${Math.floor(left / 60)}:${pad(left % 60)} h`);

    const g = $(".greet-l");
    if (g && g.textContent !== greeting()) g.textContent = greeting();

    for (const sp of state.spaces) {
      for (const w of sp.widgets) {
        if (w.kind === "countdown") {
          set(`[data-cd="${w.id}"]`, countdownLeft(w.countdown.at) || "–");
        } else if (w.kind === "timer" && w.timer.end) {
          const rest = w.timer.end - Date.now();
          if (rest <= 0) finishTimer(w);
          else {
            set(`[data-timer="${w.id}"]`, dur(rest, true).replace(/^00:/, ""));
            const bar = $(`[data-timer-bar="${w.id}"]`);
            if (bar && w.timer.dur) bar.style.width = ((100 * rest) / w.timer.dur).toFixed(2) + "%";
          }
        }
      }
    }
  }

  const ringing = new Set();
  async function finishTimer(w) {
    if (ringing.has(w.id)) return;
    ringing.add(w.id);
    w.timer.end = null;
    await save();
    if (findWidget(w.id)?.space === space()) updateWidget(w.id);
    toastMsg(`⏰ ${w.title} abgelaufen`, 6000);
    beep();
    const title = document.title;
    let n = 0;
    const iv = setInterval(() => {
      document.title = n++ % 2 ? title : "⏰ Timer fertig";
      if (n > 12) {
        clearInterval(iv);
        document.title = title;
      }
    }, 700);
    setTimeout(() => ringing.delete(w.id), 1500);
  }

  function beep() {
    try {
      const ctx = new AudioContext();
      [0, 0.35, 0.7].forEach((t) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.28);
        o.connect(g).connect(ctx.destination);
        o.start(ctx.currentTime + t);
        o.stop(ctx.currentTime + t + 0.3);
      });
    } catch {
      /* kein Audio */
    }
  }

  /* ───────────── Daten laden ───────────── */

  let weatherBusy = false;
  async function loadWeather(force = false) {
    const loc = state.settings.weather;
    const key = `${loc.lat},${loc.lon}`;
    const fresh = cache.weather && cache.weather.key === key && !cache.weather.error && Date.now() - cache.weather.at < 20 * 60 * 1000;
    if (fresh && !force) return;
    if (weatherBusy) return;
    weatherBusy = true;
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}` +
        "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=Europe%2FBerlin";
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      const j = await res.json();
      cache.weather = {
        key,
        at: Date.now(),
        data: {
          temp: j.current.temperature_2m,
          feels: j.current.apparent_temperature,
          code: j.current.weather_code,
          wind: j.current.wind_speed_10m,
          hum: j.current.relative_humidity_2m,
          days: j.daily.time.map((date, i) => ({
            date,
            code: j.daily.weather_code[i],
            max: j.daily.temperature_2m_max[i],
            min: j.daily.temperature_2m_min[i],
          })),
        },
      };
      saveCache();
    } catch {
      if (!cache.weather || cache.weather.key !== key) cache.weather = { key, at: Date.now(), error: true };
    } finally {
      weatherBusy = false;
    }
    paintKind("weather");
  }

  function paintKind(kind) {
    for (const w of space().widgets) if (w.kind === kind) updateWidget(w.id);
  }

  async function ping(url) {
    const t0 = performance.now();
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 6000);
    try {
      await fetch(url, { method: "HEAD", mode: "no-cors", cache: "no-store", signal: ctl.signal });
      return { ok: true, ms: Math.round(performance.now() - t0), at: Date.now() };
    } catch {
      return { ok: false, ms: 0, at: Date.now() };
    } finally {
      clearTimeout(to);
    }
  }

  async function refreshStatus(force = false) {
    const hosts = space().widgets.filter((w) => w.kind === "status").flatMap((w) => w.hosts);
    const todo = hosts.filter((h) => force || !statusCache[h.url] || Date.now() - statusCache[h.url].at > 55000);
    if (!todo.length) return;
    if (force) {
      todo.forEach((h) => delete statusCache[h.url]);
      paintKind("status");
    }
    await Promise.all(todo.map(async (h) => (statusCache[h.url] = await ping(h.url))));
    paintKind("status");
  }

  function loadTopSites() {
    if (!hasChrome || !chrome.topSites) return;
    chrome.topSites.get((list) => {
      topSites = list || [];
      paintKind("topsites");
    });
  }

  function loadRecent() {
    if (!hasChrome || !chrome.sessions) return;
    chrome.sessions.getRecentlyClosed({ maxResults: 12 }, (list) => {
      recent = (list || []).filter((r) => {
        const u = r.tab?.url || "";
        return !/^(chrome|brave|chrome-extension|edge):/.test(u);
      });
      paintKind("recent");
    });
  }

  if (hasChrome && chrome.sessions?.onChanged) chrome.sessions.onChanged.addListener(loadRecent);

  async function geocode(q) {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=de&format=json`);
    const j = await res.json();
    const r = j.results?.[0];
    if (!r) throw new Error("nicht gefunden");
    return { name: r.name, lat: +r.latitude.toFixed(3), lon: +r.longitude.toFixed(3) };
  }

  /* ───────────── Menü, Overlay, Toast ───────────── */

  function toastMsg(text, ms = 1900) {
    toast.textContent = text;
    toast.hidden = false;
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
    clearTimeout(toastMsg.t);
    toastMsg.t = setTimeout(() => (toast.hidden = true), ms);
  }

  function closeMenu() {
    menu.hidden = true;
    menu.innerHTML = "";
  }

  function showMenu(x, y, html) {
    menu.innerHTML = html;
    menu.hidden = false;
    const r = menu.getBoundingClientRect();
    menu.style.left = clamp(x, 8, innerWidth - r.width - 8) + "px";
    menu.style.top = clamp(y, 8, innerHeight - r.height - 8) + "px";
  }

  const mi = (act, label, attrs = "", icon = "", cls = "") =>
    `<button type="button" class="mi ${cls}" data-act="${act}" ${attrs}>${icon ? ico(icon) : "<span class='mi-sp'></span>"}<span>${label}</span></button>`;

  function widgetMenu(w, x, y) {
    const a = `data-w="${esc(w.id)}"`;
    let extra = "";
    if (w.kind === "links") {
      extra += mi("w-add", "Link hinzufügen", a, "plus");
      extra += mi("w-view", w.view === "tiles" ? "Als Liste zeigen" : "Als Kacheln zeigen", a, "grid");
      if (w.links.length > 1) extra += mi("w-openall", `Alle ${w.links.length} öffnen`, a, "ext");
    }
    if (w.kind === "todos" && w.todos.some((t) => t.done)) extra += mi("todo-clear", "Erledigte entfernen", a, "check");
    if (w.kind === "calc" && w.hist.length) extra += mi("calc-clear", "Verlauf leeren", a, "x");
    if (w.kind === "countdown") extra += mi("cd-edit", "Termin ändern", a, "flag");
    if (w.kind === "status") extra += mi("w-add", "Seite hinzufügen", a, "plus");
    const others = state.spaces.filter((s) => s.id !== state.activeSpace);
    const moves = others
      .map((s) => `<button type="button" class="mi" data-act="w-move" ${a} data-to="${esc(s.id)}" style="--c:${esc(s.color)}"><span class="mi-dot"></span><span>${esc(s.name)}</span></button>`)
      .join("");
    showMenu(
      x,
      y,
      `${extra}${extra ? '<div class="mi-sep"></div>' : ""}
       ${mi("w-rename", "Umbenennen", a, "note")}
       ${mi("w-dup", "Duplizieren", a, "copy")}
       ${others.length ? `<div class="mi-label">Verschieben nach</div>${moves}<div class="mi-sep"></div>` : ""}
       ${mi("w-del", "Widget entfernen", a + " data-confirm", "x", "warn")}`
    );
  }

  function linkMenu(wid, lid, x, y) {
    const a = `data-w="${esc(wid)}" data-l="${esc(lid)}"`;
    showMenu(
      x,
      y,
      `${mi("l-newtab", "In neuem Tab", a, "ext")}
       ${mi("l-copy", "Adresse kopieren", a, "copy")}
       ${mi("l-edit", "Bearbeiten", a, "note")}
       <div class="mi-sep"></div>
       ${mi("l-del", "Löschen", a, "x", "warn")}`
    );
  }

  function spaceMenu(id, x, y) {
    const sp = state.spaces.find((s) => s.id === id);
    if (!sp) return;
    const a = `data-id="${esc(id)}"`;
    const sw = SWATCHES.map((c) => `<button type="button" class="sw${c === sp.color ? " on" : ""}" data-act="sp-color" ${a} data-c="${c}" style="--c:${c}" aria-label="Farbe ${c}"></button>`).join("");
    const icons = SPACE_ICONS.map((i) => `<button type="button" class="sw-i${i === sp.icon ? " on" : ""}" data-act="sp-icon" ${a} data-i="${i}" aria-label="Symbol ${i}">${ico(i)}</button>`).join("");
    showMenu(
      x,
      y,
      `${mi("sp-rename", "Umbenennen", a, "note")}
       <div class="mi-label">Farbe</div><div class="swatches">${sw}</div>
       <div class="mi-label">Symbol</div><div class="swatches icons">${icons}</div>
       <div class="mi-label">Gruppe <em>Enter speichert</em></div>
       <form class="mi-form" data-form="sp-group" ${a}><input name="g" value="${esc(sp.group)}" placeholder="z. B. Roleplay" maxlength="24"></form>
       <div class="mi-sep"></div>
       ${mi("sp-up", "Nach oben", a, "up")}
       ${mi("sp-down", "Nach unten", a, "down")}
       ${state.spaces.length > 1 ? mi("sp-del", "Space löschen", a + " data-confirm", "x", "warn") : ""}`
    );
  }

  function openOverlay(html, cls = "") {
    overlay.innerHTML = html;
    overlay.className = "overlay " + cls;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("open"));
  }

  function closeOverlay() {
    overlay.hidden = true;
    overlay.classList.remove("open");
    overlay.innerHTML = "";
  }

  function openPicker() {
    const cards = Object.entries(KINDS)
      .map(([k, v]) => `<button class="pk" type="button" data-act="pick-kind" data-kind="${k}">
          <span class="pk-ico">${ico(v.icon)}</span>
          <span class="pk-t"><b>${esc(v.name)}</b><span>${esc(v.blurb)}</span></span>
        </button>`)
      .join("");
    openOverlay(
      `<div class="sheet picker" role="dialog" aria-label="Widget hinzufügen">
        <div class="sheet-h"><div><div class="kick">${esc(space().name)}</div><h2>Widget hinzufügen</h2></div><button class="ib" type="button" data-act="close" aria-label="Schließen">${ico("x")}</button></div>
        <div class="pk-grid">${cards}</div>
      </div>`,
      "center"
    );
  }

  function seg(act, value, options) {
    return `<div class="seg">${options.map(([v, l]) => `<button type="button" class="${String(v) === String(value) ? "on" : ""}" data-act="${act}" data-v="${v}">${l}</button>`).join("")}</div>`;
  }

  function openSettings() {
    const s = state.settings;
    const scroll = $(".drawer", overlay)?.scrollTop || 0;
    openOverlay(
      `<aside class="sheet drawer" role="dialog" aria-label="Einstellungen">
        <div class="sheet-h"><div><div class="kick">Zentrale</div><h2>Einstellungen</h2></div><button class="ib" type="button" data-act="close" aria-label="Schließen">${ico("x")}</button></div>

        <div class="set-sec">Allgemein</div>
        <label class="set"><span>Dein Name</span><input class="in" data-set="name" value="${esc(s.name)}" maxlength="30" placeholder="für die Begrüßung"></label>
        <div class="set"><span>Links öffnen</span>${seg("set-newtab", s.newTab ? 1 : 0, [[0, "Gleicher Tab"], [1, "Neuer Tab"]])}</div>
        <div class="set"><span>Privatmodus</span>${seg("set-privacy", s.privacy ? 1 : 0, [[0, "Aus"], [1, "Unscharf"]])}</div>

        <div class="set-sec">Aussehen</div>
        <div class="set col"><span>Hintergrund</span>${seg("set-bg", s.bg, [["grid", "Raster"], ["plain", "Schlicht"], ["image", "Eigenes Bild"]])}</div>
        ${s.bg === "image" ? `<div class="set"><span>Bild</span><button class="btn sm" type="button" data-act="bg-file">Datei wählen</button></div>` : ""}
        <div class="set"><span>Seitenleiste</span>${seg("set-rail", s.rail, [["wide", "Breit"], ["slim", "Schmal"]])}</div>

        <div class="set-sec">Layout</div>
        <div class="set"><span>Widgets rücken nach oben</span>${seg("set-compact", s.compact ? 1 : 0, [[1, "An"], [0, "Frei"]])}</div>
        <div class="set"><span>Layout sperren</span>${seg("set-lock", s.locked ? 1 : 0, [[0, "Offen"], [1, "Gesperrt"]])}</div>

        <div class="set-sec">Wetter</div>
        <form class="set" data-form="geo"><span>Ort</span><span class="set-r"><input class="in" name="q" value="${esc(s.weather.name)}" placeholder="Stadt"><button class="btn sm" type="submit">Setzen</button></span></form>

        <div class="set-sec">Daten</div>
        <div class="set"><span>Browser-Lesezeichen</span><button class="btn sm" type="button" data-act="import-bm">Als Space holen</button></div>
        <div class="set"><span>Backup</span><span class="set-r"><button class="btn sm" type="button" data-act="export">Exportieren</button><button class="btn sm" type="button" data-act="import-json">Einlesen</button></span></div>
        <div class="set"><span>Alles zurücksetzen</span><button class="btn sm warn" type="button" data-act="reset" data-confirm><span>Zurücksetzen</span></button></div>

        <div class="set-sec">Tasten</div>
        <div class="keys">
          <span><kbd>1</kbd>–<kbd>9</kbd> Space wechseln</span>
          <span><kbd>/</kbd> oder <kbd>Strg</kbd><kbd>K</kbd> Suche</span>
          <span><kbd>N</kbd> Widget hinzufügen</span>
          <span><kbd>L</kbd> Layout sperren</span>
          <span><kbd>P</kbd> Privatmodus</span>
          <span><kbd>Strg</kbd><kbd>⇧</kbd><kbd>B</kbd> Tab in die Inbox</span>
          <span>Rechtsklick auf Space: Farbe, Symbol, Gruppe</span>
          <span>Widget am Kopf ziehen, unten rechts Größe ändern</span>
        </div>
        <div class="set-foot">Zentrale 1.0 · alles lokal gespeichert, kein Konto · github.com/EinfachFelix1301/zentrale</div>
      </aside>`,
      "right"
    );
    const dr = $(".drawer", overlay);
    if (dr) dr.scrollTop = scroll;
  }

  /* ───────────── Suche / Befehlspalette ───────────── */

  const cmdForm = $("#cmd");
  const cmdQ = $("#cmd-q");
  const cmdHits = $("#cmd-hits");
  let cmdItems = [];
  let cmdActive = 0;

  function looksLikeUrl(q) {
    return !/\s/.test(q) && (/^https?:\/\//i.test(q) || /^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/i.test(q));
  }

  function cmdSearch() {
    const q = cmdQ.value.trim();
    const ql = q.toLowerCase();
    if (!q) {
      cmdHits.hidden = true;
      cmdItems = [];
      return;
    }
    const scored = [];
    for (const sp of state.spaces) {
      const sName = sp.name.toLowerCase();
      if (sName.includes(ql)) scored.push({ kind: "space", sp, score: sName.startsWith(ql) ? 95 : 60 });
      for (const w of sp.widgets) {
        const items = w.links || (w.repos || []).map((r) => ({ id: r.id, title: r.name, url: repoUrl(r) }));
        for (const l of items) {
          const t = l.title.toLowerCase();
          let score = 0;
          if (t.startsWith(ql)) score = 100;
          else if (t.split(/\s+/).some((p) => p.startsWith(ql))) score = 85;
          else if (t.includes(ql)) score = 70;
          else if (l.url.toLowerCase().includes(ql)) score = 50;
          else if (w.title.toLowerCase().includes(ql) || sName.includes(ql)) score = 35;
          if (score) scored.push({ kind: "link", sp, w, l, score: score + (sp.id === state.activeSpace ? 3 : 0) });
        }
      }
    }
    scored.sort((a, b) => b.score - a.score);
    cmdItems = scored.slice(0, 8);
    if (looksLikeUrl(q)) cmdItems.unshift({ kind: "url", url: /^https?:/i.test(q) ? q : "https://" + q });
    cmdItems.push({ kind: "web", q });
    cmdActive = 0;
    cmdHits.innerHTML =
      cmdItems
        .map((it, i) => {
          const cls = `hit${i === cmdActive ? " on" : ""}`;
          if (it.kind === "link")
            return `<button type="button" class="${cls}" data-i="${i}" style="--c:${esc(it.sp.color)}">${favImg(it.l.title, it.l.url, it.sp.color)}<span class="hit-t">${esc(it.l.title)}</span><span class="hit-m"><i></i>${esc(it.sp.name)} · ${esc(it.w.title)}</span></button>`;
          if (it.kind === "space")
            return `<button type="button" class="${cls}" data-i="${i}" style="--c:${esc(it.sp.color)}"><span class="hit-sp">${ico(it.sp.icon)}</span><span class="hit-t">${esc(it.sp.name)}</span><span class="hit-m">Space öffnen</span></button>`;
          if (it.kind === "url")
            return `<button type="button" class="${cls}" data-i="${i}">${ico("ext", "i fav")}<span class="hit-t">${esc(hostOf(it.url))}</span><span class="hit-m">Adresse öffnen</span></button>`;
          return `<button type="button" class="${cls}" data-i="${i}">${ico("ext", "i fav")}<span class="hit-t">„${esc(it.q)}“</span><span class="hit-m">Bei Google suchen</span></button>`;
        })
        .join("") + `<div class="hit-foot"><span><kbd>↵</kbd> öffnen</span><span><kbd>⇧</kbd><kbd>↵</kbd> neuer Tab</span><span><kbd>Alt</kbd><kbd>↵</kbd> Google</span></div>`;
    cmdHits.hidden = false;
  }

  function cmdRun(i, newTab = false) {
    const it = cmdItems[i];
    if (!it) return;
    cmdQ.value = "";
    cmdHits.hidden = true;
    cmdQ.blur();
    const nt = newTab || state.settings.newTab;
    if (it.kind === "link") openUrl(it.l.url, nt);
    else if (it.kind === "url") openUrl(it.url, nt);
    else if (it.kind === "space") switchSpace(it.sp.id);
    else openUrl("https://www.google.com/search?q=" + encodeURIComponent(it.q), nt);
  }

  function paintCmdActive() {
    $$(".hit", cmdHits).forEach((el, i) => el.classList.toggle("on", i === cmdActive));
    $(".hit.on", cmdHits)?.scrollIntoView({ block: "nearest" });
  }

  cmdQ.addEventListener("input", cmdSearch);
  cmdQ.addEventListener("focus", () => cmdQ.value && cmdSearch());
  cmdQ.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cmdQ.value = "";
      cmdHits.hidden = true;
      cmdQ.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cmdActive = Math.min(cmdActive + 1, cmdItems.length - 1);
      paintCmdActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      cmdActive = Math.max(cmdActive - 1, 0);
      paintCmdActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!cmdItems.length) cmdSearch();
      if (e.altKey) cmdRun(cmdItems.length - 1, e.shiftKey);
      else cmdRun(cmdActive, e.shiftKey);
    }
  });
  cmdForm.addEventListener("submit", (e) => e.preventDefault());
  cmdHits.addEventListener("click", (e) => {
    const b = e.target.closest(".hit");
    if (b) cmdRun(+b.dataset.i, e.ctrlKey || e.shiftKey);
  });
  cmdHits.addEventListener("mousemove", (e) => {
    const b = e.target.closest(".hit");
    if (b && +b.dataset.i !== cmdActive) {
      cmdActive = +b.dataset.i;
      paintCmdActive();
    }
  });
  document.addEventListener("pointerdown", (e) => {
    if (!cmdForm.contains(e.target)) cmdHits.hidden = true;
  });

  /* ───────────── Aktionen ───────────── */

  async function switchSpace(id) {
    if (!state.spaces.some((s) => s.id === id) || id === state.activeSpace) return;
    state.activeSpace = id;
    ui.adding = null;
    ui.editLink = null;
    renderAll(true);
    await save();
  }

  function startRename(el, onDone) {
    const prev = el.textContent;
    el.contentEditable = "true";
    el.spellcheck = false;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
    const finish = () => {
      el.contentEditable = "false";
      el.removeEventListener("blur", finish);
      el.removeEventListener("keydown", onKey);
      onDone(el.textContent.trim().slice(0, 60) || prev);
    };
    const onKey = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        el.blur();
      } else if (e.key === "Escape") {
        el.textContent = prev;
        el.blur();
      }
    };
    el.addEventListener("blur", finish);
    el.addEventListener("keydown", onKey);
  }

  function renameWidget(id) {
    const el = canvas.querySelector(`.w-title[data-id="${CSS.escape(id)}"]`);
    if (!el) return;
    startRename(el, async (name) => {
      const hit = findWidget(id);
      if (!hit) return;
      hit.w.title = name;
      await save();
    });
  }

  function renameSpace(id) {
    const sp = state.spaces.find((s) => s.id === id);
    if (!sp) return;
    if (id !== state.activeSpace) {
      state.activeSpace = id;
      renderAll();
    }
    startRename($(".sn-txt"), async (name) => {
      sp.name = name;
      await save();
      renderRail();
      renderHead();
    });
  }

  async function addWidget(kind) {
    const k = KINDS[kind];
    const sp = space();
    const pos = findFree(sp.widgets, k.w, k.h);
    const w = W(kind, pos.x, pos.y, k.w, k.h);
    if (kind === "status") w.hosts = [{ id: uid(), name: "Portal", url: OD("portal") }];
    sp.widgets.push(w);
    settle(sp.widgets);
    if (kind === "links" || kind === "clips") ui.adding = w.id;
    await save();
    closeOverlay();
    renderAll();
    const el = widgetEl(w.id);
    if (el) {
      el.classList.add("fresh");
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  async function addSpace() {
    const sp = { id: uid(), name: "Neuer Space", group: "", color: SWATCHES[state.spaces.length % SWATCHES.length], icon: "folder", widgets: [] };
    state.spaces.push(sp);
    state.activeSpace = sp.id;
    await save();
    renderAll(true);
    renameSpace(sp.id);
  }

  async function importBookmarks() {
    if (!hasChrome || !chrome.bookmarks) {
      toastMsg("Nur in der Erweiterung");
      return;
    }
    const tree = await chrome.bookmarks.getTree();
    const sp = { id: uid(), name: "Lesezeichen", group: "", color: "#d4d4d8", icon: "folder", widgets: [] };
    const walk = (nodes, title) => {
      const links = [];
      const folders = [];
      for (const n of nodes || []) {
        if (n.url && /^https?:/i.test(n.url)) links.push({ id: uid(), title: n.title || hostOf(n.url), url: n.url });
        else if (n.children) folders.push(n);
      }
      if (links.length) {
        const h = clamp(Math.ceil(links.length * 1.25) + 2, 4, 14);
        const pos = findFree(sp.widgets, 3, h);
        sp.widgets.push(W("links", pos.x, pos.y, 3, h, { title: title || "Lesezeichen", links }));
      }
      for (const f of folders) walk(f.children, f.title);
    };
    walk(tree[0]?.children || [], "Lesezeichen");
    if (!sp.widgets.length) {
      toastMsg("Keine Lesezeichen gefunden");
      return;
    }
    state.spaces.push(sp);
    state.activeSpace = sp.id;
    await save();
    closeOverlay();
    renderAll(true);
    toastMsg(`${sp.widgets.length} Ordner importiert`);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `zentrale-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function importJson() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (data.spaces?.length) state = normalize(data);
        else throw new Error("Format");
        await save();
        closeOverlay();
        renderAll(true);
        toastMsg("Backup eingelesen");
      } catch {
        toastMsg("Datei passt nicht");
      }
    };
    input.click();
  }

  function pickBgFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const fr = new FileReader();
      fr.onload = async () => {
        await setBgImage(String(fr.result));
        state.settings.bg = "image";
        await save();
        applyBg();
        toastMsg("Hintergrund gesetzt");
      };
      fr.readAsDataURL(file);
    };
    input.click();
  }

  /* Zweistufige Bestätigung statt confirm() */
  function confirmed(el) {
    if (!el.hasAttribute("data-confirm") || el.dataset.armed === "1") return true;
    el.dataset.armed = "1";
    el.classList.add("armed");
    const label = el.querySelector("span:last-child") || el;
    const prev = label.textContent;
    label.textContent = "Sicher? Nochmal klicken";
    setTimeout(() => {
      if (!el.isConnected) return;
      el.dataset.armed = "";
      el.classList.remove("armed");
      label.textContent = prev;
    }, 3000);
    return false;
  }

  document.addEventListener("click", async (e) => {
    const el = e.target.closest("[data-act]");
    if (!menu.hidden && !e.target.closest(".menu")) closeMenu();
    if (e.target === overlay) {
      closeOverlay();
      return;
    }
    if (!el) return;
    const act = el.dataset.act;
    const wid = el.dataset.w;
    const hit = wid ? findWidget(wid) : null;
    const w = hit?.w;
    if (wid && !w && act !== "add-cancel") return;

    switch (act) {
      case "space":
        switchSpace(el.dataset.id);
        break;
      case "add-space":
        addSpace();
        break;
      case "fold":
        state.settings.rail = state.settings.rail === "slim" ? "wide" : "slim";
        applyTheme();
        await save();
        break;
      case "settings":
        openSettings();
        break;
      case "close":
        closeOverlay();
        break;
      case "privacy":
        state.settings.privacy = !state.settings.privacy;
        applyTheme();
        await save();
        break;
      case "lock":
        state.settings.locked = !state.settings.locked;
        applyTheme();
        toastMsg(state.settings.locked ? "Layout gesperrt" : "Layout frei");
        await save();
        break;
      case "add-widget":
        openPicker();
        break;
      case "pick-kind":
        addWidget(el.dataset.kind);
        break;

      /* Widget-Menü */
      case "w-menu": {
        e.preventDefault();
        e.stopPropagation();
        const r = el.getBoundingClientRect();
        widgetMenu(w, r.right - 210, r.bottom + 6);
        break;
      }
      case "w-add":
        e.preventDefault();
        closeMenu();
        ui.adding = wid;
        ui.editLink = null;
        updateWidget(wid);
        break;
      case "add-cancel":
        ui.adding = null;
        ui.editLink = null;
        updateWidget(el.closest(".w")?.dataset.id);
        break;
      case "w-refresh":
        if (w.kind === "weather") loadWeather(true);
        else if (w.kind === "status") refreshStatus(true);
        else if (w.kind === "topsites") loadTopSites();
        else if (w.kind === "recent") loadRecent();
        break;
      case "w-rename":
        closeMenu();
        renameWidget(wid);
        break;
      case "w-view":
        closeMenu();
        w.view = w.view === "tiles" ? "list" : "tiles";
        await save();
        updateWidget(wid);
        break;
      case "w-openall":
        closeMenu();
        openBackground(w.links.map((l) => l.url));
        break;
      case "w-dup": {
        closeMenu();
        const copy = JSON.parse(JSON.stringify(w));
        copy.id = uid();
        copy.title = w.title + " (Kopie)";
        (copy.links || []).forEach((l) => (l.id = uid()));
        (copy.todos || []).forEach((t) => (t.id = uid()));
        (copy.clips || []).forEach((c) => (c.id = uid()));
        (copy.hosts || []).forEach((h) => (h.id = uid()));
        Object.assign(copy, findFree(hit.space.widgets, copy.w, copy.h));
        hit.space.widgets.push(copy);
        await save();
        renderAll();
        break;
      }
      case "w-move":
        closeMenu();
        moveWidgetTo(wid, el.dataset.to);
        break;
      case "w-del":
        if (!confirmed(el)) return;
        closeMenu();
        hit.space.widgets = hit.space.widgets.filter((x) => x.id !== wid);
        settle(hit.space.widgets);
        await save();
        renderAll();
        toastMsg("Widget entfernt");
        break;

      /* Links */
      case "l-menu": {
        e.preventDefault();
        e.stopPropagation();
        const r = el.getBoundingClientRect();
        linkMenu(wid, el.dataset.l, r.right - 190, r.bottom + 4);
        break;
      }
      case "l-newtab": {
        closeMenu();
        const l = findLink(wid, el.dataset.l)?.link;
        if (l) openUrl(l.url, true);
        break;
      }
      case "l-copy": {
        closeMenu();
        const l = findLink(wid, el.dataset.l)?.link;
        if (l) copyText(l.url, "Adresse kopiert");
        break;
      }
      case "l-edit":
        closeMenu();
        ui.adding = wid;
        ui.editLink = { w: wid, l: el.dataset.l };
        updateWidget(wid);
        break;
      case "l-del":
        closeMenu();
        w.links = w.links.filter((l) => l.id !== el.dataset.l);
        await save();
        updateWidget(wid);
        renderHead();
        break;

      /* Repos */
      case "rp-menu": {
        e.preventDefault();
        e.stopPropagation();
        const r = el.getBoundingClientRect();
        const a = `data-w="${esc(wid)}" data-id="${esc(el.dataset.id)}"`;
        showMenu(
          r.right - 210,
          r.bottom + 4,
          `${mi("rp-open", "In neuem Tab", a, "ext")}
           ${mi("rp-clone", "Clone-Befehl kopieren", a, "copy")}
           ${mi("rp-url", "Adresse kopieren", a, "link")}
           <div class="mi-sep"></div>
           ${mi("rp-del", "Entfernen", a, "x", "warn")}`
        );
        break;
      }
      case "rp-open":
      case "rp-clone":
      case "rp-url":
      case "rp-del": {
        closeMenu();
        const repo = w.repos.find((x) => x.id === el.dataset.id);
        if (!repo) break;
        if (act === "rp-open") openUrl(repoUrl(repo), true);
        else if (act === "rp-clone") copyText(`git clone ${repoUrl(repo)}.git`, "Clone-Befehl kopiert");
        else if (act === "rp-url") copyText(repoUrl(repo), "Adresse kopiert");
        else {
          w.repos = w.repos.filter((x) => x.id !== repo.id);
          await save();
          updateWidget(wid);
        }
        break;
      }

      /* Aufgaben */
      case "todo-del":
        e.preventDefault();
        w.todos = w.todos.filter((t) => t.id !== el.dataset.id);
        await save();
        updateWidget(wid);
        break;
      case "todo-clear":
        closeMenu();
        w.todos = w.todos.filter((t) => !t.done);
        await save();
        updateWidget(wid);
        break;

      /* Snippets */
      case "clip-copy": {
        const c = w.clips.find((x) => x.id === el.dataset.id);
        if (c) copyText(c.value, `„${c.label}“ kopiert`);
        break;
      }
      case "clip-del":
        w.clips = w.clips.filter((c) => c.id !== el.dataset.id);
        await save();
        updateWidget(wid);
        break;

      /* Status */
      case "status-del":
        w.hosts = w.hosts.filter((h) => h.id !== el.dataset.id);
        await save();
        updateWidget(wid);
        break;

      /* Rechner */
      case "calc-hist":
        copyText(el.dataset.v.replace(/\./g, ""), "Ergebnis kopiert");
        break;
      case "calc-clear":
        closeMenu();
        w.hist = [];
        await save();
        updateWidget(wid);
        break;

      /* Timer */
      case "timer-set": {
        const ms = +el.dataset.min * 60000;
        w.timer = { end: Date.now() + ms, dur: ms };
        await save();
        updateWidget(wid);
        break;
      }
      case "timer-stop":
        w.timer = { end: null, dur: 0 };
        await save();
        updateWidget(wid);
        break;

      /* Countdown */
      case "cd-edit":
        closeMenu();
        ui.cdEdit[wid] = true;
        updateWidget(wid);
        break;

      /* FiveM */
      case "fivem-copy": {
        const token = fivemToken(el.closest("form")?.code.value || w.fivem.code);
        if (!token) {
          toastMsg("CFX-Code fehlt");
          break;
        }
        copyText(`connect cfx.re/join/${token}`, "F8-Befehl kopiert");
        break;
      }

      /* Kalender */
      case "cal-nav": {
        const dir = +el.dataset.dir;
        ui.calOffset[wid] = dir === 0 ? 0 : (ui.calOffset[wid] || 0) + dir;
        updateWidget(wid);
        break;
      }

      /* Zuletzt geschlossen */
      case "recent-open":
        if (hasChrome && chrome.sessions) chrome.sessions.restore(el.dataset.sid);
        break;

      /* Space-Menü */
      case "sp-rename":
        closeMenu();
        renameSpace(el.dataset.id);
        break;
      case "sp-color": {
        const sp = state.spaces.find((s) => s.id === el.dataset.id);
        sp.color = el.dataset.c;
        await save();
        closeMenu();
        renderAll();
        break;
      }
      case "sp-icon": {
        const sp = state.spaces.find((s) => s.id === el.dataset.id);
        sp.icon = el.dataset.i;
        await save();
        closeMenu();
        renderRail();
        renderHead();
        break;
      }
      case "sp-up":
      case "sp-down": {
        const i = state.spaces.findIndex((s) => s.id === el.dataset.id);
        const j = act === "sp-up" ? i - 1 : i + 1;
        if (i < 0 || j < 0 || j >= state.spaces.length) return;
        [state.spaces[i], state.spaces[j]] = [state.spaces[j], state.spaces[i]];
        await save();
        closeMenu();
        renderRail();
        renderHead();
        break;
      }
      case "sp-del": {
        if (!confirmed(el)) return;
        closeMenu();
        state.spaces = state.spaces.filter((s) => s.id !== el.dataset.id);
        if (!state.spaces.some((s) => s.id === state.activeSpace)) state.activeSpace = state.spaces[0].id;
        await save();
        renderAll(true);
        toastMsg("Space gelöscht");
        break;
      }

      /* Einstellungen */
      case "set-newtab":
        state.settings.newTab = el.dataset.v === "1";
        await save();
        renderCanvas();
        openSettings();
        break;
      case "set-privacy":
        state.settings.privacy = el.dataset.v === "1";
        applyTheme();
        await save();
        openSettings();
        break;
      case "set-bg":
        state.settings.bg = el.dataset.v;
        await save();
        applyBg();
        openSettings();
        if (el.dataset.v === "image" && !(await getBgImage())) pickBgFile();
        break;
      case "bg-file":
        pickBgFile();
        break;
      case "set-rail":
        state.settings.rail = el.dataset.v;
        applyTheme();
        await save();
        openSettings();
        break;
      case "set-compact":
        state.settings.compact = el.dataset.v === "1";
        if (state.settings.compact) for (const sp of state.spaces) compact(sp.widgets);
        await save();
        place();
        openSettings();
        break;
      case "set-lock":
        state.settings.locked = el.dataset.v === "1";
        applyTheme();
        await save();
        openSettings();
        break;
      case "import-bm":
        importBookmarks();
        break;
      case "export":
        exportJson();
        break;
      case "import-json":
        importJson();
        break;
      case "reset":
        if (!confirmed(el)) return;
        state = normalize(defaults());
        await save();
        closeOverlay();
        renderAll(true);
        toastMsg("Zurückgesetzt");
        break;
    }
  });

  /* Formulare */
  document.addEventListener("submit", async (e) => {
    const form = e.target.closest("form[data-form]");
    if (!form) return;
    e.preventDefault();
    const kind = form.dataset.form;
    const hit = form.dataset.w ? findWidget(form.dataset.w) : null;
    const w = hit?.w;
    if (form.dataset.w && !w) return;

    if (kind === "link") {
      let url;
      try {
        url = normalizeUrl(form.url.value);
      } catch {
        form.url.classList.add("bad");
        form.url.focus();
        return;
      }
      const title = form.title.value.trim() || hostOf(url);
      const edit = ui.editLink && w.links.find((l) => l.id === ui.editLink.l);
      if (edit) {
        Object.assign(edit, { title, url });
        ui.adding = null;
      } else {
        w.links.push({ id: uid(), title, url });
      }
      ui.editLink = null;
      await save();
      updateWidget(w.id);
      renderHead();
    } else if (kind === "repo") {
      const parsed = parseRepo(form.repo.value, w.repos[w.repos.length - 1]?.owner);
      if (!parsed) {
        form.repo.classList.add("bad");
        return;
      }
      w.repos.push({ id: uid(), ...parsed, lang: "", private: false, desc: form.desc.value.trim() });
      await save();
      updateWidget(w.id);
    } else if (kind === "todo") {
      const text = form.text.value.trim();
      if (!text) return;
      w.todos.push({ id: uid(), text, done: false });
      await save();
      updateWidget(w.id);
      widgetEl(w.id)?.querySelector('form[data-form="todo"] input')?.focus();
    } else if (kind === "clip") {
      w.clips.push({ id: uid(), label: form.label.value.trim(), value: form.value.value.trim() });
      ui.adding = null;
      await save();
      updateWidget(w.id);
    } else if (kind === "status") {
      try {
        w.hosts.push({ id: uid(), name: form.name.value.trim(), url: normalizeUrl(form.url.value) });
      } catch {
        form.url.classList.add("bad");
        return;
      }
      ui.adding = null;
      await save();
      updateWidget(w.id);
      refreshStatus();
    } else if (kind === "calc") {
      const expr = form.e.value.trim();
      if (!expr) return;
      try {
        w.hist.push({ e: expr, r: fmtNum(calcEval(expr)) });
        w.hist = w.hist.slice(-30);
        ui.calcDraft[w.id] = "";
        await save();
        updateWidget(w.id);
        widgetEl(w.id)?.querySelector("[data-calc]")?.focus();
      } catch {
        form.e.classList.add("bad");
      }
    } else if (kind === "timer") {
      const m = parseFloat(String(form.m.value).replace(",", "."));
      if (!(m > 0)) {
        form.m.focus();
        return;
      }
      const ms = Math.round(m * 60000);
      w.timer = { end: Date.now() + ms, dur: ms };
      await save();
      updateWidget(w.id);
    } else if (kind === "countdown") {
      w.countdown = { label: form.label.value.trim(), at: form.at.value };
      ui.cdEdit[w.id] = false;
      await save();
      updateWidget(w.id);
    } else if (kind === "fivem") {
      w.fivem = { name: form.name.value.trim(), code: form.code.value.trim() };
      await save();
      const token = fivemToken(w.fivem.code);
      if (!token) {
        toastMsg("CFX-Code fehlt");
        return;
      }
      location.href = "fivem://connect/cfx.re/join/" + token;
    } else if (kind === "geo") {
      const q = form.q.value.trim();
      if (!q) return;
      try {
        state.settings.weather = await geocode(q);
        await save();
        toastMsg(`Wetter: ${state.settings.weather.name}`);
        paintKind("weather");
        loadWeather(true);
        openSettings();
      } catch {
        toastMsg("Ort nicht gefunden");
      }
    } else if (kind === "sp-group") {
      const sp = state.spaces.find((s) => s.id === form.dataset.id);
      if (!sp) return;
      sp.group = form.g.value.trim();
      if (sp.group) {
        // Gruppe zusammenhalten: hinter das letzte Mitglied derselben Gruppe setzen
        const others = state.spaces.filter((s) => s !== sp);
        const lastIdx = others.map((s) => s.group).lastIndexOf(sp.group);
        if (lastIdx >= 0) {
          others.splice(lastIdx + 1, 0, sp);
          state.spaces = others;
        }
      }
      await save();
      closeMenu();
      renderAll();
    }
  });

  /* Eingaben */
  document.addEventListener("input", (e) => {
    const t = e.target;
    t.classList?.remove("bad");
    if (t.matches("[data-note]")) {
      const hit = findWidget(t.dataset.note);
      if (!hit) return;
      hit.w.note = t.value;
      saveSoon(350);
    } else if (t.matches("[data-calc]")) {
      ui.calcDraft[t.dataset.calc] = t.value;
      const out = $(`[data-calc-r="${CSS.escape(t.dataset.calc)}"]`);
      if (out) out.textContent = calcPreview(t.value);
    } else if (t.matches("[data-set=name]")) {
      state.settings.name = t.value;
      const g = $(".greet-l");
      if (g) g.textContent = greeting();
      saveSoon(400);
    }
  });

  document.addEventListener("change", async (e) => {
    const t = e.target;
    if (!t.matches("[data-todo]")) return;
    const hit = findWidget(t.dataset.w);
    const todo = hit?.w.todos.find((x) => x.id === t.dataset.todo);
    if (!todo) return;
    todo.done = t.checked;
    t.closest(".todo")?.classList.toggle("done", todo.done);
    const meta = widgetEl(hit.w.id)?.querySelector("[data-meta]");
    if (meta) meta.textContent = metaText(hit.w);
    await save();
  });

  /* Rechtsklick-Menüs */
  document.addEventListener("contextmenu", (e) => {
    const link = e.target.closest(".lk[data-l]");
    const sp = e.target.closest(".sp");
    const head = e.target.closest(".w-head");
    if (link) {
      e.preventDefault();
      linkMenu(link.dataset.w, link.dataset.l, e.clientX, e.clientY);
    } else if (sp) {
      e.preventDefault();
      spaceMenu(sp.dataset.id, e.clientX, e.clientY);
    } else if (head) {
      e.preventDefault();
      const w = findWidget(head.closest(".w").dataset.id)?.w;
      if (w) widgetMenu(w, e.clientX, e.clientY);
    }
  });

  /* Doppelklick = Umbenennen */
  document.addEventListener("dblclick", (e) => {
    const title = e.target.closest(".w-title");
    if (title) return renameWidget(title.dataset.id);
    if (e.target.closest(".sn-txt")) return renameSpace(state.activeSpace);
    const sp = e.target.closest(".sp");
    if (sp) renameSpace(sp.dataset.id);
  });

  document.addEventListener(
    "load",
    (e) => {
      if (e.target?.tagName === "IMG" && e.target.classList.contains("fav")) rememberIcon(e.target);
    },
    true
  );

  /* Favicon-Fallback */
  document.addEventListener(
    "error",
    (e) => {
      const img = e.target;
      if (img?.tagName !== "IMG" || !img.dataset.fb) return;
      const key = img.dataset.key;
      if (key && cache.icons?.[key] === img.src) delete cache.icons[key];
      nextIcon(img);
    },
    true
  );

  /* Tastatur */
  document.addEventListener("keydown", (e) => {
    const typing = /^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable;
    if (e.key === "Escape") {
      closeMenu();
      if (!overlay.hidden) return closeOverlay();
      if (ui.adding) {
        const id = ui.adding;
        ui.adding = null;
        ui.editLink = null;
        updateWidget(id);
      }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      cmdQ.focus();
      cmdQ.select();
      return;
    }
    if (typing || e.ctrlKey || e.metaKey || e.altKey || !overlay.hidden) return;
    if (e.key === "/") {
      e.preventDefault();
      cmdQ.focus();
    } else if (/^[1-9]$/.test(e.key)) {
      const sp = state.spaces[+e.key - 1];
      if (sp) switchSpace(sp.id);
    } else if (e.key.toLowerCase() === "n") {
      openPicker();
    } else if (e.key.toLowerCase() === "l") {
      $("[data-act=lock]").click();
    } else if (e.key.toLowerCase() === "p") {
      $("[data-act=privacy]").click();
    }
  });

  /* Sync zwischen offenen Tabs */
  let pendingRender = false;
  const busy = () => {
    if (drag) return true;
    const a = document.activeElement;
    return !!(a && a !== document.body && a.closest(".w, .overlay, .cmd, .menu, .head-title"));
  };

  if (hasChrome && chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      if (changes[KEY]?.newValue) {
        const nv = changes[KEY].newValue;
        if (nv._rev === lastRev) return;
        const active = state.activeSpace;
        state = normalize(nv);
        if (state.spaces.some((s) => s.id === active)) state.activeSpace = active;
        lastRev = nv._rev;
        if (busy()) pendingRender = true;
        else renderAll();
      }
      if (changes[BG_KEY]) applyBg();
    });
  }

  document.addEventListener("focusout", () => {
    setTimeout(() => {
      if (pendingRender && !busy()) {
        pendingRender = false;
        renderAll();
      }
    }, 60);
  });

  setInterval(tick, 1000);
  setInterval(() => {
    if (document.hidden) return;
    if (space().widgets.some((w) => w.kind === "status")) refreshStatus();
    if (space().widgets.some((w) => w.kind === "weather")) loadWeather();
  }, 60000);

  load().then(() => {
    renderAll(true);
    document.body.classList.add("ready");
  });
})();

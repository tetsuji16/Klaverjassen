import { restoreMatch, serializeMatch } from "../game/engine";
import type { MatchState, TutorialProgress, UserSettings } from "../game/types";

const SETTINGS_KEY = "klaverjassen.settings.v1";
const MATCH_KEY = "klaverjassen.match.v1";
const TUTORIAL_KEY = "klaverjassen.tutorial.v1";

export const defaultSettings: UserSettings = {
  playerName: "あなた",
  confirmCard: false,
  sound: false,
  vibration: true,
  reduceMotion: false,
  highContrast: false,
  assist: true,
};

export function loadSettings(): UserSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") as Partial<UserSettings> | null;
    if (!parsed || typeof parsed !== "object") return defaultSettings;
    const settings = { ...defaultSettings };
    if (typeof parsed.playerName === "string" && parsed.playerName.trim()) settings.playerName = parsed.playerName.trim().slice(0, 16);
    for (const key of ["confirmCard", "sound", "vibration", "reduceMotion", "highContrast", "assist"] as const) {
      if (typeof parsed[key] === "boolean") settings[key] = parsed[key];
    }
    return settings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: UserSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Settings remain active for this session when storage is unavailable.
  }
}

export function saveMatch(state: MatchState) {
  try {
    localStorage.setItem(MATCH_KEY, serializeMatch(state));
  } catch {
    // The current game remains playable even when storage is unavailable.
  }
}

export function loadMatch(): MatchState | null {
  try {
    const raw = localStorage.getItem(MATCH_KEY);
    return raw ? restoreMatch(raw) : null;
  } catch {
    return null;
  }
}

export function clearMatch() {
  try {
    localStorage.removeItem(MATCH_KEY);
  } catch {
    // Nothing else is required when storage is unavailable.
  }
}

export function loadTutorialProgress(): TutorialProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(TUTORIAL_KEY) || "{}") as Partial<TutorialProgress>;
    const completed = Array.isArray(parsed.completed)
      ? [...new Set(parsed.completed.filter((lesson) => Number.isInteger(lesson) && lesson >= 0))]
      : [];
    const attempts = parsed.attempts && typeof parsed.attempts === "object"
      ? Object.fromEntries(Object.entries(parsed.attempts).filter(([, count]) => Number.isInteger(count) && count >= 0))
      : {};
    return { completed, attempts };
  } catch {
    return { completed: [], attempts: {} };
  }
}

export function saveTutorialProgress(progress: TutorialProgress) {
  try {
    localStorage.setItem(TUTORIAL_KEY, JSON.stringify(progress));
  } catch {
    // Progress remains active for this session when storage is unavailable.
  }
}

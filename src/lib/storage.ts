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
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function saveMatch(state: MatchState) {
  try {
    localStorage.setItem(MATCH_KEY, serializeMatch(state));
  } catch {
    // The current game remains playable even when storage is unavailable.
  }
}

export function loadMatch(): MatchState | null {
  const raw = localStorage.getItem(MATCH_KEY);
  return raw ? restoreMatch(raw) : null;
}

export function clearMatch() {
  localStorage.removeItem(MATCH_KEY);
}

export function loadTutorialProgress(): TutorialProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(TUTORIAL_KEY) || "{}") as Partial<TutorialProgress>;
    return { completed: parsed.completed || [], attempts: parsed.attempts || {} };
  } catch {
    return { completed: [], attempts: {} };
  }
}

export function saveTutorialProgress(progress: TutorialProgress) {
  localStorage.setItem(TUTORIAL_KEY, JSON.stringify(progress));
}

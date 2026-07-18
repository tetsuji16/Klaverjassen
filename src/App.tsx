import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import { createMatch } from "./game/engine";
import type { Difficulty, MatchLength, MatchState, Seat, TutorialProgress, UserSettings } from "./game/types";
import GamePage from "./pages/GamePage";
import HomePage from "./pages/HomePage";
import RulesPage from "./pages/RulesPage";
import SettingsPage from "./pages/SettingsPage";
import { CpuSetup, PassPlaySetup } from "./pages/SetupPages";
import TutorialPage from "./pages/TutorialPage";
import { clearMatch, loadMatch, loadSettings, loadTutorialProgress, saveMatch, saveSettings, saveTutorialProgress } from "./lib/storage";

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [match, setMatch] = useState<MatchState | null>(() => loadMatch());
  const [progress, setProgress] = useState<TutorialProgress>(() => loadTutorialProgress());
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.contrast = settings.highContrast ? "high" : "normal";
    document.documentElement.dataset.motion = settings.reduceMotion ? "reduced" : "normal";
    saveSettings(settings);
  }, [settings]);

  const updateMatch = useCallback((next: MatchState) => {
    setMatch(next);
    saveMatch(next);
  }, []);
  const updateProgress = (next: TutorialProgress) => { setProgress(next); saveTutorialProgress(next); };
  const startCpu = (difficulty: Difficulty, length: MatchLength) => updateMatch(createMatch({ mode: "cpu", difficulty, matchLength: length, names: { south: settings.playerName } }));
  const startPass = (names: Record<Seat, string>, length: MatchLength) => updateMatch(createMatch({ mode: "pass-and-play", matchLength: length, names }));
  const finishMatch = () => { clearMatch(); setMatch(null); navigate("/"); };

  return <Layout><Routes>
    <Route path="/" element={<HomePage savedMatch={match} progress={progress} onResume={() => navigate("/game")} />} />
    <Route path="/tutorial" element={<TutorialPage progress={progress} onProgress={updateProgress} />} />
    <Route path="/cpu" element={<CpuSetup settings={settings} onStart={startCpu} />} />
    <Route path="/pass-play" element={<PassPlaySetup onStart={startPass} />} />
    <Route path="/game" element={<GamePage match={match} settings={settings} onUpdate={updateMatch} onQuit={finishMatch} />} />
    <Route path="/rules" element={<RulesPage />} />
    <Route path="/settings" element={<SettingsPage settings={settings} onChange={setSettings} />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Layout>;
}

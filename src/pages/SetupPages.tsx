import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Difficulty, MatchLength, Seat, UserSettings } from "../game/types";

export function CpuSetup({ settings, onStart }: { settings: UserSettings; onStart: (difficulty: Difficulty, length: MatchLength) => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [length, setLength] = useState<MatchLength>(4);
  const navigate = useNavigate();
  const start = () => { onStart(difficulty, length); navigate("/game"); };
  return <div className="page narrow setup-page">
    <p className="eyebrow">CPU MATCH</p><h1>対戦の準備</h1><p className="intro">南席の{settings.playerName}さんと、3人のCPUで遊びます。</p>
    <fieldset><legend>CPUの強さ</legend><div className="segmented three">
      {(["easy", "normal", "hard"] as const).map((value, index) => <button key={value} className={difficulty === value ? "active" : ""} onClick={() => setDifficulty(value)}><b>{["初級", "中級", "上級"][index]}</b><small>{["ヒント向き", "読み合い", "じっくり"][index]}</small></button>)}
    </div></fieldset>
    <fieldset><legend>試合の長さ</legend><div className="choice-row">
      <button className={`choice-tile ${length === 4 ? "active" : ""}`} onClick={() => setLength(4)}><b>4ディール</b><span>約10分 · 短縮戦</span></button>
      <button className={`choice-tile ${length === 16 ? "active" : ""}`} onClick={() => setLength(16)}><b>16ディール</b><span>約35分 · 標準戦</span></button>
    </div></fieldset>
    <div className="note"><span>i</span><p><b>学習アシスト</b><br />設定画面で、推奨手と理由の表示を切り替えられます。</p></div>
    <button className="button primary wide" onClick={start}>対戦をはじめる <span>→</span></button>
  </div>;
}

export function PassPlaySetup({ onStart }: { onStart: (names: Record<Seat, string>, length: MatchLength) => void }) {
  const [names, setNames] = useState<Record<Seat, string>>({ north: "北プレイヤー", east: "東プレイヤー", south: "南プレイヤー", west: "西プレイヤー" });
  const [length, setLength] = useState<MatchLength>(4);
  const navigate = useNavigate();
  const update = (seat: Seat, value: string) => setNames((current) => ({ ...current, [seat]: value.slice(0, 16) }));
  return <div className="page narrow setup-page">
    <p className="eyebrow">PASS & PLAY</p><h1>4人の席を決める</h1><p className="intro">向かい同士がチームです。手番ごとに画面を隠して端末を渡します。</p>
    <div className="seat-form">
      {(["north", "east", "south", "west"] as Seat[]).map((seat) => <label key={seat}><span>{({ north: "北 · チームA", east: "東 · チームB", south: "南 · チームA", west: "西 · チームB" })[seat]}</span><input value={names[seat]} onChange={(event) => update(seat, event.target.value)} /></label>)}
    </div>
    <fieldset><legend>試合の長さ</legend><div className="segmented"><button className={length === 4 ? "active" : ""} onClick={() => setLength(4)}>4ディール</button><button className={length === 16 ? "active" : ""} onClick={() => setLength(16)}>16ディール</button></div></fieldset>
    <button className="button primary wide" onClick={() => { onStart(names, length); navigate("/game"); }}>席について始める <span>→</span></button>
  </div>;
}

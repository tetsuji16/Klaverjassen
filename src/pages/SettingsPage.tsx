import type { UserSettings } from "../game/types";

export default function SettingsPage({ settings, onChange }: { settings: UserSettings; onChange: (settings: UserSettings) => void }) {
  const toggle = (key: keyof UserSettings) => onChange({ ...settings, [key]: !settings[key] });
  return <div className="page narrow settings-page"><p className="eyebrow">PREFERENCES</p><h1>設定</h1>
    <label className="name-field"><span>プレイヤー名</span><input value={settings.playerName} maxLength={16} onChange={(event) => onChange({ ...settings, playerName: event.target.value || "あなた" })} /></label>
    <div className="settings-list">
      {([
        ["confirmCard", "カードを2回タップで確定", "誤タップを防ぎます"], ["assist", "学習アシスト", "CPU戦で推奨手と理由を表示"], ["sound", "効果音", "初期状態はオフ"], ["vibration", "振動", "対応端末で短くフィードバック"], ["reduceMotion", "アニメーションを減らす", "動きを抑えて表示"], ["highContrast", "高コントラスト", "輪郭と文字をより明確に"],
      ] as Array<[keyof UserSettings, string, string]>).map(([key, title, text]) => <button key={key} className="setting-row" role="switch" aria-checked={Boolean(settings[key])} onClick={() => toggle(key)}><span><b>{title}</b><small>{text}</small></span><i className={settings[key] ? "on" : ""}><u /></i></button>)}
    </div>
    <div className="privacy-note"><b>データについて</b><p>設定、進捗、対戦データはこの端末だけに保存されます。外部への送信はありません。</p></div>
  </div>;
}

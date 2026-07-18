import { Link } from "react-router-dom";
import type { MatchState } from "../game/types";
import { lessons } from "../tutorial/lessons";
import type { TutorialProgress } from "../game/types";

export default function HomePage({ savedMatch, progress, onResume }: { savedMatch: MatchState | null; progress: TutorialProgress; onResume: () => void }) {
  const learned = progress.completed.length;
  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">オランダのトリックテイキング</p>
          <h1>一枚ずつ、<br /><em>読み合いが深くなる。</em></h1>
          <p className="hero-lead">Klaverjassenを、ルールの最初から実戦まで。登録も通信もいりません。</p>
          <div className="hero-actions">
            <Link className="button primary" to="/tutorial">初めて遊ぶ <span>→</span></Link>
            <Link className="button secondary" to="/cpu">CPUと対戦</Link>
          </div>
        </div>
        <div className="hero-table" aria-label="カードテーブルのイメージ">
          <div className="mini-card c1"><span>J</span><b>♣</b></div>
          <div className="mini-card c2 red"><span>9</span><b>♥</b></div>
          <div className="mini-card c3"><span>A</span><b>♠</b></div>
          <div className="table-copy"><small>TROEF</small><strong>J · 9 · A</strong><span>切り札の順番</span></div>
        </div>
      </section>

      {savedMatch && <section className="resume-banner">
        <div><span className="status-dot" /> 保存された対戦</div>
        <strong>{savedMatch.dealNumber}/{savedMatch.matchLength}ディール · {savedMatch.totalScore[0]}–{savedMatch.totalScore[1]}</strong>
        <button className="button small primary" onClick={onResume}>つづきから</button>
      </section>}

      <section className="mode-grid" aria-label="ゲームモード">
        <Link to="/tutorial" className="mode-card featured">
          <span className="mode-number">01</span><span className="mode-icon">◎</span>
          <h2>学ぶ</h2><p>11の短いレッスンと実技で、迷いやすい切り札ルールまで。</p>
          <div className="progress-line"><i style={{ width: `${(learned / lessons.length) * 100}%` }} /><span>{learned}/{lessons.length}</span></div>
        </Link>
        <Link to="/cpu" className="mode-card">
          <span className="mode-number">02</span><span className="mode-icon">♟</span>
          <h2>CPUと対戦</h2><p>初級・中級・上級。ヒントを見ながらでも遊べます。</p><b className="card-link">対戦設定へ →</b>
        </Link>
        <Link to="/pass-play" className="mode-card">
          <span className="mode-number">03</span><span className="mode-icon">4</span>
          <h2>4人で遊ぶ</h2><p>1台を手番ごとに渡して、向かい同士のチームで対戦。</p><b className="card-link">席を決める →</b>
        </Link>
      </section>

      <section className="learn-strip">
        <div><p className="eyebrow">AMSTERDAM REGELS</p><h2>覚えるのは、まず3つ。</h2></div>
        <ol>
          <li><b>01</b><span><strong>同じスートを出す</strong>持っているなら必ずフォロー。</span></li>
          <li><b>02</b><span><strong>切り札のJが最強</strong>次に9、A、10と続きます。</span></li>
          <li><b>03</b><span><strong>向かいがパートナー</strong>2人の合計点で競います。</span></li>
        </ol>
        <Link to="/rules" className="text-link">ルール辞典をひらく →</Link>
      </section>
    </div>
  );
}

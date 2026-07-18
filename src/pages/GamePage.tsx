import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CardView from "../components/CardView";
import { applyAction, explainIllegalCard, getLegalActions, legalCards, suitName, suitSymbol, teamOf } from "../game/engine";
import { chooseCpuAction, recommendation } from "../game/cpu";
import type { GameAction, MatchState, Seat, Suit, UserSettings } from "../game/types";

const seatLabel: Record<Seat, string> = { north: "北", east: "東", south: "南", west: "西" };

export default function GamePage({ match, settings, onUpdate, onRematch, onQuit }: { match: MatchState | null; settings: UserSettings; onUpdate: (state: MatchState) => void; onRematch: () => void; onQuit: () => void }) {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [thinking, setThinking] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const currentIsHuman = match?.players[match.currentPlayer].human ?? false;
  const needsPrivacy = match?.mode === "pass-and-play" && currentIsHuman && match.phase !== "deal-result" && match.phase !== "match-result";

  useEffect(() => {
    setSelected(null);
    if (match?.mode === "pass-and-play") setRevealed(false);
  }, [match?.currentPlayer, match?.dealNumber, match?.phase, match?.mode]);

  useEffect(() => {
    if (!match || match.phase === "deal-result" || match.phase === "match-result" || match.players[match.currentPlayer].human) return;
    let disposed = false;
    let responseTimer: number | undefined;
    setThinking(true);
    let worker: Worker;
    try {
      worker = new Worker(new URL("../workers/cpu.worker.ts", import.meta.url), { type: "module" });
    } catch {
      onUpdate(applyAction(match, chooseCpuAction(match)));
      setThinking(false);
      return;
    }
    workerRef.current = worker;
    const timer = window.setTimeout(() => worker.postMessage(match), 320);
    worker.onmessage = (event: MessageEvent<GameAction>) => {
      responseTimer = window.setTimeout(() => {
        if (disposed) return;
        onUpdate(applyAction(match, event.data));
        setThinking(false);
        worker.terminate();
      }, 180);
    };
    worker.onerror = () => {
      if (disposed) return;
      window.clearTimeout(timer);
      if (responseTimer !== undefined) window.clearTimeout(responseTimer);
      worker.terminate();
      try {
        onUpdate(applyAction(match, chooseCpuAction(match)));
      } finally {
        setThinking(false);
      }
    };
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      if (responseTimer !== undefined) window.clearTimeout(responseTimer);
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
    };
  }, [match, onUpdate]);

  const hint = useMemo(() => match && match.mode === "cpu" && match.currentPlayer === "south" && settings.assist ? recommendation(match) : null, [match, settings.assist]);
  if (!match) return <div className="page empty-state"><span>♣</span><h1>対戦がありません</h1><p>ホームから新しい対戦を始めてください。</p><Link className="button primary" to="/">ホームへ</Link></div>;

  const act = (action: GameAction) => {
    try {
      const next = applyAction(match, action);
      if (settings.vibration && navigator.vibrate) navigator.vibrate(20);
      if (match.mode === "pass-and-play") setRevealed(false);
      setMessage(""); setSelected(null); onUpdate(next);
    } catch { setMessage("その操作はできません。"); }
  };
  const hand = match.hands[match.currentPlayer];
  const legal = match.phase === "playing" && match.trump ? legalCards(hand, match.trick, match.trump, match.currentPlayer) : [];
  const playCard = (cardId: string) => {
    const card = hand.find((item) => item.id === cardId)!;
    const allowed = legal.some((item) => item.id === cardId);
    if (!allowed) { setMessage(explainIllegalCard(match, card)); return; }
    if (settings.confirmCard && selected !== cardId) { setSelected(cardId); setMessage("もう一度タップして確定"); return; }
    act({ kind: "play", cardId });
  };

  if (needsPrivacy && !revealed) return <div className="privacy-screen"><div className="privacy-suit">♣</div><p>端末を渡してください</p><h1>{match.players[match.currentPlayer].name}さんの手番</h1><span>{seatLabel[match.currentPlayer]}席 · チーム{teamOf(match.currentPlayer) === 0 ? "A" : "B"}</span><button className="button light wide" onClick={() => setRevealed(true)}>本人が「手札を見る」</button><small>ほかの人は画面を見ないでください</small></div>;

  if (match.phase === "deal-result" || match.phase === "match-result") {
    const score = match.lastDealScore!;
    const ended = match.phase === "match-result";
    const winner = match.totalScore[0] === match.totalScore[1] ? null : match.totalScore[0] > match.totalScore[1] ? 0 : 1;
    const humanWon = match.mode === "cpu" && winner === 0;
    const resultTitle = score.pit ? "Pit! 完全勝利" : score.nat ? "Nat · 契約失敗" : ended ? winner === null ? "好勝負、引き分け" : humanWon ? "あなたのチームが勝利" : `チーム${winner === 0 ? "A" : "B"}の勝利` : "ディール終了";
    return <div className={`page result-page ${ended ? "match-finished" : ""}`}>
      <div className="result-emblem" aria-hidden="true"><span>{score.pit ? "★" : ended ? "♣" : match.dealNumber}</span></div>
      <p className="eyebrow">{ended ? "MATCH RESULT" : `DEAL ${match.dealNumber} RESULT`}</p>
      <h1>{resultTitle}</h1>
      <p className="result-lead">{ended ? `${match.matchLength}ディールを戦い抜きました。` : score.nat ? "契約側が必要点に届かず、相手チームが全得点を獲得しました。" : `チーム${score.awarded[0] > score.awarded[1] ? "A" : "B"}がこのディールを制しました。`}</p>
      <div className="result-score"><div className={winner === 0 ? "winner" : ""}><small>TEAM A · 北／南</small><b>{score.awarded[0]}</b><span>累計 {match.totalScore[0]}</span></div><i>–</i><div className={winner === 1 ? "winner" : ""}><small>TEAM B · 東／西</small><b>{score.awarded[1]}</b><span>累計 {match.totalScore[1]}</span></div></div>
      <div className="score-breakdown"><div><span>カード点</span><b>{score.cardPoints[0]} — {score.cardPoints[1]}</b></div><div><span>roem</span><b>{score.roem[0]} — {score.roem[1]}</b></div>{score.nat && <div className="result-bonus"><span>nat</span><b>契約側 0点</b></div>}{score.pit && <div className="result-bonus"><span>pit</span><b>+100</b></div>}</div>
      {ended ? <div className="result-actions"><button className="button primary wide" onClick={onRematch}>同じ設定でもう一戦</button><button className="button secondary wide" onClick={onQuit}>ホームへ戻る</button></div> : <button className="button primary wide" onClick={() => act({ kind: "continue" })}>次のディールへ <span>→</span></button>}
    </div>;
  }

  const legalActions = getLegalActions(match);
  const trickWins = match.completedTricks.reduce<[number, number]>((wins, trick) => {
    wins[trick.result.team] += 1;
    return wins;
  }, [0, 0]);
  const lastTrick = match.completedTricks.at(-1);
  const contractTeam = match.contractor ? teamOf(match.contractor) : null;
  return <div className="game-page">
    <div className="game-status"><div><small>DEAL</small><b>{match.dealNumber}<i>/{match.matchLength}</i></b></div><div className="score-pill"><span>TEAM A <b>{match.totalScore[0]}</b></span><i>—</i><span><b>{match.totalScore[1]}</b> TEAM B</span></div><div><small>TROEF</small><b className={match.trump === "hearts" || match.trump === "diamonds" ? "red-text" : ""}>{match.trump ? suitSymbol(match.trump) : "—"}</b></div></div>
    <div className="table-area">
      <div className="deal-progress" aria-label={`全8トリック中${match.completedTricks.length}トリック完了`}>
        <span>TRICK <b>{Math.min(match.completedTricks.length + 1, 8)}</b>/8</span>
        <div>{Array.from({ length: 8 }, (_, index) => <i key={index} className={index < match.completedTricks.length ? `won team-${match.completedTricks[index].result.team}` : index === match.completedTricks.length ? "current" : ""} />)}</div>
      </div>
      {(["north", "east", "south", "west"] as Seat[]).map((seat) => <div key={seat} className={`seat seat-${seat} ${match.currentPlayer === seat ? "turn" : ""}`}><span className="avatar">{match.players[seat].name.slice(0, 1)}</span><b>{match.players[seat].name}</b><small>{match.hands[seat].length}枚</small></div>)}
      <div className="trick-area">{match.trick.length ? match.trick.map((play) => <div className={`trick-card trick-${play.seat}`} key={play.card.id}><CardView card={play.card} compact /></div>) : <div className="lead-prompt"><span>♣</span><small>{match.phase === "playing" ? `${match.players[match.currentPlayer].name}がリード` : "切り札を選択中"}</small></div>}</div>
      {lastTrick && match.trick.length === 0 && <div className="trick-toast"><small>LAST TRICK</small><b>{match.players[lastTrick.result.winner].name}</b><span>{lastTrick.result.cardPoints}点{lastTrick.result.roem > 0 ? ` · roem +${lastTrick.result.roem}` : ""}</span></div>}
      {contractTeam !== null && <div className="contract-badge"><small>CONTRACT</small><b>TEAM {contractTeam === 0 ? "A" : "B"}</b></div>}
    </div>
    <section className="player-panel">
      <div className="turn-line"><div><span className="status-dot" /><b>{thinking ? "CPUが考えています…" : `${match.players[match.currentPlayer].name}の手番`}</b></div><span>{match.phase === "bidding" ? "spelen / passen" : currentIsHuman ? `出せるカード ${legal.length}枚` : match.trump ? `${suitName(match.trump)}が切り札` : ""}</span></div>
      {match.phase === "playing" && <div className="trick-score" aria-label={`獲得トリック数 チームA ${trickWins[0]}、チームB ${trickWins[1]}`}><span>TEAM A <b>{trickWins[0]}</b></span><i>獲得トリック</i><span><b>{trickWins[1]}</b> TEAM B</span></div>}
      {match.phase === "bidding" && currentIsHuman && <div className="bid-panel"><p>切り札を選ぶ、またはパス</p><div className="suit-buttons">{legalActions.filter((a): a is Extract<GameAction, { kind: "bid" }> => a.kind === "bid").map((action) => <button key={action.suit} className={action.suit === "hearts" || action.suit === "diamonds" ? "red-text" : ""} onClick={() => act(action)}><b>{suitSymbol(action.suit)}</b><span>{suitName(action.suit)}</span></button>)}</div>{legalActions.some((a) => a.kind === "pass") && <button className="button secondary wide" onClick={() => act({ kind: "pass" })}>パス · passen</button>}</div>}
      {match.phase === "playing" && currentIsHuman && <><div className="hand" aria-label={`${match.players[match.currentPlayer].name}の手札`}>{hand.map((card) => { const disabled = !legal.some((item) => item.id === card.id); return <CardView key={card.id} card={card} disabled={disabled} selected={selected === card.id} reason={disabled ? explainIllegalCard(match, card) : undefined} onClick={() => playCard(card.id)} />; })}</div>{hint?.action.kind === "play" && <div className="hint"><span>HINT</span><p><b>{hint.action.cardId.replace("-", " ")}がおすすめ</b>{hint.reason}</p></div>}</>}
      {message && <div className="game-message" role="status">{message}</div>}
      <button className="game-exit" onClick={() => navigate("/")}>対戦を保存してホームへ</button>
    </section>
  </div>;
}

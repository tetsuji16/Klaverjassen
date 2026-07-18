import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CardView from "../components/CardView";
import { applyAction, explainIllegalCard, getLegalActions, legalCards, suitName, suitSymbol, teamOf } from "../game/engine";
import { recommendation } from "../game/cpu";
import type { GameAction, MatchState, Seat, Suit, UserSettings } from "../game/types";

const seatLabel: Record<Seat, string> = { north: "北", east: "東", south: "南", west: "西" };

export default function GamePage({ match, settings, onUpdate, onQuit }: { match: MatchState | null; settings: UserSettings; onUpdate: (state: MatchState) => void; onQuit: () => void }) {
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
    setThinking(true);
    const worker = new Worker(new URL("../workers/cpu.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;
    const timer = window.setTimeout(() => worker.postMessage(match), 320);
    worker.onmessage = (event: MessageEvent<GameAction>) => {
      window.setTimeout(() => { onUpdate(applyAction(match, event.data)); setThinking(false); worker.terminate(); }, 180);
    };
    return () => { window.clearTimeout(timer); worker.terminate(); };
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
    return <div className="page result-page"><p className="eyebrow">{ended ? "MATCH RESULT" : `DEAL ${match.dealNumber} RESULT`}</p><h1>{score.pit ? "Pit! 完全勝利" : score.nat ? "Nat — 契約失敗" : "ディール終了"}</h1><div className="result-score"><div><small>TEAM A · 北／南</small><b>{score.awarded[0]}</b><span>累計 {match.totalScore[0]}</span></div><i>–</i><div><small>TEAM B · 東／西</small><b>{score.awarded[1]}</b><span>累計 {match.totalScore[1]}</span></div></div><div className="score-breakdown"><div><span>カード点</span><b>{score.cardPoints[0]} — {score.cardPoints[1]}</b></div><div><span>ローム</span><b>{score.roem[0]} — {score.roem[1]}</b></div>{score.nat && <div><span>nat</span><b>契約側 0点</b></div>}{score.pit && <div><span>pit</span><b>+100</b></div>}</div>{ended ? <><h2>勝者：チーム{match.totalScore[0] > match.totalScore[1] ? "A" : match.totalScore[1] > match.totalScore[0] ? "B" : " — 引き分け"}</h2><button className="button primary wide" onClick={onQuit}>ホームへ</button></> : <button className="button primary wide" onClick={() => act({ kind: "continue" })}>次のディールへ →</button>}</div>;
  }

  const legalActions = getLegalActions(match);
  return <div className="game-page">
    <div className="game-status"><div><small>DEAL</small><b>{match.dealNumber}<i>/{match.matchLength}</i></b></div><div className="score-pill"><span>TEAM A <b>{match.totalScore[0]}</b></span><i>—</i><span><b>{match.totalScore[1]}</b> TEAM B</span></div><div><small>TROEF</small><b className={match.trump === "hearts" || match.trump === "diamonds" ? "red-text" : ""}>{match.trump ? suitSymbol(match.trump) : "—"}</b></div></div>
    <div className="table-area">
      {(["north", "east", "south", "west"] as Seat[]).map((seat) => <div key={seat} className={`seat seat-${seat} ${match.currentPlayer === seat ? "turn" : ""}`}><span className="avatar">{match.players[seat].name.slice(0, 1)}</span><b>{match.players[seat].name}</b><small>{match.hands[seat].length}枚</small></div>)}
      <div className="trick-area">{match.trick.length ? match.trick.map((play) => <div className={`trick-card trick-${play.seat}`} key={play.card.id}><CardView card={play.card} compact /></div>) : <div className="lead-prompt"><span>♣</span><small>{match.phase === "playing" ? `${match.players[match.currentPlayer].name}がリード` : "切り札を選択中"}</small></div>}</div>
      {match.completedTricks.at(-1)?.result.roem ? <div className="roem-toast">ROEM +{match.completedTricks.at(-1)!.result.roem}</div> : null}
    </div>
    <section className="player-panel">
      <div className="turn-line"><div><span className="status-dot" /><b>{thinking ? "CPUが考えています…" : `${match.players[match.currentPlayer].name}の手番`}</b></div><span>{match.phase === "bidding" ? "spelen / passen" : match.trump ? `${suitName(match.trump)}が切り札` : ""}</span></div>
      {match.phase === "bidding" && currentIsHuman && <div className="bid-panel"><p>切り札を選ぶ、またはパス</p><div className="suit-buttons">{legalActions.filter((a): a is Extract<GameAction, { kind: "bid" }> => a.kind === "bid").map((action) => <button key={action.suit} className={action.suit === "hearts" || action.suit === "diamonds" ? "red-text" : ""} onClick={() => act(action)}><b>{suitSymbol(action.suit)}</b><span>{suitName(action.suit)}</span></button>)}</div>{legalActions.some((a) => a.kind === "pass") && <button className="button secondary wide" onClick={() => act({ kind: "pass" })}>パス · passen</button>}</div>}
      {match.phase === "playing" && currentIsHuman && <><div className="hand" aria-label={`${match.players[match.currentPlayer].name}の手札`}>{hand.map((card) => { const disabled = !legal.some((item) => item.id === card.id); return <CardView key={card.id} card={card} disabled={disabled} selected={selected === card.id} reason={disabled ? explainIllegalCard(match, card) : undefined} onClick={() => playCard(card.id)} />; })}</div>{hint?.action.kind === "play" && <div className="hint"><span>HINT</span><p><b>{hint.action.cardId.replace("-", " ")}がおすすめ</b>{hint.reason}</p></div>}</>}
      {message && <div className="game-message" role="status">{message}</div>}
      <button className="game-exit" onClick={() => navigate("/")}>対戦を保存してホームへ</button>
    </section>
  </div>;
}

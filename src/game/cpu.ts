import { cardPoints, createDeck, currentTrickWinner, getLegalActions, nextSeat, resolveTrick, teamOf } from "./engine";
import type { Card, GameAction, MatchState, Suit } from "./types";

function bidValue(hand: Card[], suit: Suit) {
  return hand.reduce((score, card) => score + (card.suit === suit ? cardPoints(card, suit) + 4 : cardPoints(card, suit) * 0.2), 0);
}

function simulatedValue(state: MatchState, candidate: Card): number {
  if (!state.trump) return 0;
  const known = new Set([
    ...state.hands[state.currentPlayer].map((card) => card.id),
    ...state.trick.map((item) => item.card.id),
    ...state.completedTricks.flatMap((trick) => trick.cards.map((item) => item.card.id)),
  ]);
  const unseen = createDeck().filter((card) => !known.has(card.id));
  let seed = state.seed + candidate.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) + state.completedTricks.length * 97;
  const random = () => {
    seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
    return ((seed ^ (seed >>> 16)) >>> 0) / 4294967296;
  };
  let total = 0;
  for (let sample = 0; sample < 48; sample += 1) {
    const pool = [...unseen];
    const simulated = [...state.trick, { seat: state.currentPlayer, card: candidate }];
    let seat = nextSeat(state.currentPlayer);
    while (simulated.length < 4) {
      const lead = simulated[0].card.suit;
      const matching = pool.filter((card) => card.suit === lead);
      const choices = matching.length ? matching : pool;
      const picked = choices[Math.floor(random() * choices.length)];
      simulated.push({ seat, card: picked });
      pool.splice(pool.findIndex((card) => card.id === picked.id), 1);
      seat = nextSeat(seat);
    }
    const result = resolveTrick(simulated, state.trump);
    total += result.team === teamOf(state.currentPlayer) ? result.cardPoints + result.roem * 0.35 : -(result.cardPoints + result.roem * 0.35);
  }
  return total / 48;
}

export function chooseCpuAction(state: MatchState): GameAction {
  const legal = getLegalActions(state);
  if (!legal.length) throw new Error("CPU has no action");
  if (state.phase === "bidding") {
    const bids = legal.filter((action): action is Extract<GameAction, { kind: "bid" }> => action.kind === "bid");
    const ranked = bids.map((action) => ({ action, value: bidValue(state.hands[state.currentPlayer], action.suit) })).sort((a, b) => b.value - a.value);
    const threshold = state.difficulty === "easy" ? 38 : state.difficulty === "normal" ? 43 : 47;
    const pass = legal.find((action) => action.kind === "pass");
    if (pass && ranked[0].value < threshold) return pass;
    return ranked[0].action;
  }

  const plays = legal.filter((action): action is Extract<GameAction, { kind: "play" }> => action.kind === "play");
  if (!state.trump || !plays.length) return legal[0];
  if (state.difficulty === "easy") return plays[(state.seed + state.completedTricks.length + state.trick.length) % plays.length];
  const hand = state.hands[state.currentPlayer];
  const scored = plays.map((action) => {
    const card = hand.find((item) => item.id === action.cardId)!;
    const hypothetical = [...state.trick, { seat: state.currentPlayer, card }];
    const winner = currentTrickWinner(hypothetical, state.trump!);
    const winning = winner && teamOf(winner.seat) === teamOf(state.currentPlayer);
    const value = cardPoints(card, state.trump!);
    let score = winning ? 20 - value * 0.25 : -value;
    if (!state.trick.length) score += value > 10 ? 4 : 0;
    if (state.difficulty === "hard") {
      const remainingSuit = hand.filter((item) => item.suit === card.suit).length;
      score += remainingSuit === 1 && card.suit !== state.trump ? 4 : 0;
      score += card.suit === state.trump && value >= 14 ? (state.completedTricks.length < 3 ? -2 : 3) : 0;
      score += simulatedValue(state, card) * 0.45;
    }
    return { action, score };
  });
  return scored.sort((a, b) => b.score - a.score)[0].action;
}

export function recommendation(state: MatchState): { action: GameAction; reason: string } | null {
  if (state.phase !== "playing") return null;
  const action = chooseCpuAction({ ...state, difficulty: "hard" });
  if (action.kind !== "play") return null;
  const card = state.hands[state.currentPlayer].find((item) => item.id === action.cardId);
  return card ? { action, reason: state.trick.length ? "合法手の中で、トリックの勝ちやすさと失点の少なさを両立します。" : "次の展開を作りやすく、カード点を守れるリードです。" } : null;
}

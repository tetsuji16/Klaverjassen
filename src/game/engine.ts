import {
  RANKS,
  SEATS,
  SUITS,
  type Card,
  type DealScore,
  type GameAction,
  type MatchState,
  type PlayedCard,
  type Rank,
  type Seat,
  type Suit,
  type Team,
  type TrickResult,
} from "./types";

const TRUMP_ORDER: Rank[] = ["J", "9", "A", "10", "K", "Q", "8", "7"];
const PLAIN_ORDER: Rank[] = ["A", "10", "K", "Q", "J", "9", "8", "7"];
const SEQUENCE_ORDER: Rank[] = ["7", "8", "9", "10", "J", "Q", "K", "A"];
const TRUMP_POINTS: Record<Rank, number> = { J: 20, "9": 14, A: 11, "10": 10, K: 4, Q: 3, "8": 0, "7": 0 };
const PLAIN_POINTS: Record<Rank, number> = { A: 11, "10": 10, K: 4, Q: 3, J: 2, "9": 0, "8": 0, "7": 0 };

export const teamOf = (seat: Seat): Team => (seat === "north" || seat === "south" ? 0 : 1);
export const nextSeat = (seat: Seat): Seat => SEATS[(SEATS.indexOf(seat) + 1) % 4];
export const partnerOf = (seat: Seat): Seat => SEATS[(SEATS.indexOf(seat) + 2) % 4];
export const suitSymbol = (suit: Suit) => ({ clubs: "♣", diamonds: "♦", hearts: "♥", spades: "♠" })[suit];
export const suitName = (suit: Suit) => ({ clubs: "クラブ", diamonds: "ダイヤ", hearts: "ハート", spades: "スペード" })[suit];

export function createDeck(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank, id: `${suit}-${rank}` })));
}

function seeded(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffledDeck(seed: number): Card[] {
  const cards = createDeck();
  const random = seeded(seed);
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function deal(seed: number): Record<Seat, Card[]> {
  const deck = shuffledDeck(seed);
  return Object.fromEntries(SEATS.map((seat, index) => [seat, deck.slice(index * 8, index * 8 + 8)])) as Record<Seat, Card[]>;
}

export function createMatch(options: {
  mode: MatchState["mode"];
  difficulty?: MatchState["difficulty"];
  matchLength: MatchState["matchLength"];
  names?: Partial<Record<Seat, string>>;
  seed?: number;
}): MatchState {
  const seed = options.seed ?? Math.floor(Date.now() % 2_147_483_647);
  const players = Object.fromEntries(SEATS.map((seat) => [seat, {
    seat,
    name: options.names?.[seat] || ({ north: "Noord", east: "Oost", south: "あなた", west: "West" })[seat],
    human: options.mode === "pass-and-play" || seat === "south",
  }])) as MatchState["players"];
  const dealer: Seat = "north";
  return {
    schemaVersion: 1,
    mode: options.mode,
    difficulty: options.difficulty ?? "normal",
    matchLength: options.matchLength,
    players,
    phase: "bidding",
    dealer,
    currentPlayer: nextSeat(dealer),
    contractor: null,
    trump: null,
    passes: 0,
    dealNumber: 1,
    seed,
    hands: deal(seed),
    trick: [],
    completedTricks: [],
    dealCardPoints: [0, 0],
    dealRoem: [0, 0],
    totalScore: [0, 0],
    lastDealScore: null,
  };
}

export function cardPoints(card: Card, trump: Suit): number {
  return card.suit === trump ? TRUMP_POINTS[card.rank] : PLAIN_POINTS[card.rank];
}

function rankStrength(card: Card, trump: Suit): number {
  const order = card.suit === trump ? TRUMP_ORDER : PLAIN_ORDER;
  return order.length - order.indexOf(card.rank);
}

export function currentTrickWinner(trick: PlayedCard[], trump: Suit): PlayedCard | null {
  if (!trick.length) return null;
  const lead = trick[0].card.suit;
  return trick.reduce((best, candidate) => {
    const bestTrump = best.card.suit === trump;
    const candidateTrump = candidate.card.suit === trump;
    if (candidateTrump !== bestTrump) return candidateTrump ? candidate : best;
    if (candidate.card.suit !== best.card.suit) return best;
    if (candidate.card.suit !== lead && !candidateTrump) return best;
    return rankStrength(candidate.card, trump) > rankStrength(best.card, trump) ? candidate : best;
  });
}

export function legalCards(hand: Card[], trick: PlayedCard[], trump: Suit, seat: Seat): Card[] {
  if (!trick.length) return hand;
  const leadSuit = trick[0].card.suit;
  const follows = hand.filter((card) => card.suit === leadSuit);
  const winner = currentTrickWinner(trick, trump)!;
  const winningTrump = winner.card.suit === trump ? winner.card : null;

  if (follows.length) {
    if (leadSuit !== trump || !winningTrump) return follows;
    const higher = follows.filter((card) => rankStrength(card, trump) > rankStrength(winningTrump, trump));
    return higher.length ? higher : follows;
  }

  const trumps = hand.filter((card) => card.suit === trump);
  if (!trumps.length) return hand;
  const partnerWinning = winner.seat === partnerOf(seat);

  if (partnerWinning) {
    if (!winningTrump) return hand;
    const nonTrumps = hand.filter((card) => card.suit !== trump);
    const higher = trumps.filter((card) => rankStrength(card, trump) > rankStrength(winningTrump, trump));
    return [...nonTrumps, ...higher].length ? [...nonTrumps, ...higher] : trumps;
  }

  if (!winningTrump) return trumps;
  const higher = trumps.filter((card) => rankStrength(card, trump) > rankStrength(winningTrump, trump));
  if (higher.length) return higher;
  const nonTrumps = hand.filter((card) => card.suit !== trump);
  return nonTrumps.length ? nonTrumps : trumps;
}

export function explainIllegalCard(state: MatchState, card: Card): string {
  if (state.phase !== "playing" || !state.trump) return "今はカードを出す場面ではありません。";
  const legal = legalCards(state.hands[state.currentPlayer], state.trick, state.trump, state.currentPlayer);
  if (legal.some((item) => item.id === card.id)) return "出せるカードです。";
  const lead = state.trick[0]?.card.suit;
  if (lead && state.hands[state.currentPlayer].some((item) => item.suit === lead)) return `${suitName(lead)}を持っているため、同じスートを出します。`;
  if (legal.every((item) => item.suit === state.trump)) return "相手が勝っているため、切り札を出す必要があります。";
  return "より強い切り札を出せるため、オーバートランプが必要です。";
}

export function detectRoem(cards: PlayedCard[], trump: Suit): { points: number; labels: string[] } {
  const labels: string[] = [];
  let points = 0;
  const sameRank = cards.every((play) => play.card.rank === cards[0]?.card.rank);
  if (cards.length === 4 && sameRank) {
    const fourKind = cards[0].card.rank === "J" ? 200 : 100;
    points += fourKind;
    labels.push(`同ランク4枚 +${fourKind}`);
  }
  for (const suit of SUITS) {
    const ranks = cards.filter((play) => play.card.suit === suit).map((play) => SEQUENCE_ORDER.indexOf(play.card.rank)).sort((a, b) => a - b);
    if (ranks.length >= 3 && ranks.every((rank, index) => index === 0 || rank === ranks[index - 1] + 1)) {
      const sequence = ranks.length === 4 ? 50 : 20;
      points += sequence;
      labels.push(`連続${ranks.length}枚 +${sequence}`);
    }
  }
  const hasStuk = cards.some((play) => play.card.suit === trump && play.card.rank === "K") && cards.some((play) => play.card.suit === trump && play.card.rank === "Q");
  if (hasStuk) {
    points += 20;
    labels.push("stuk +20");
  }
  return { points, labels };
}

export function resolveTrick(cards: PlayedCard[], trump: Suit): TrickResult {
  if (cards.length !== 4) throw new Error("A trick needs four cards");
  const winner = currentTrickWinner(cards, trump)!;
  const roem = detectRoem(cards, trump);
  return {
    winner: winner.seat,
    team: teamOf(winner.seat),
    cardPoints: cards.reduce((sum, play) => sum + cardPoints(play.card, trump), 0),
    roem: roem.points,
    roemLabels: roem.labels,
  };
}

export function getLegalActions(state: MatchState): GameAction[] {
  if (state.phase === "bidding") {
    const bids: GameAction[] = SUITS.map((suit) => ({ kind: "bid", suit }));
    return state.passes >= 4 ? bids : [{ kind: "pass" }, ...bids];
  }
  if (state.phase === "playing" && state.trump) {
    return legalCards(state.hands[state.currentPlayer], state.trick, state.trump, state.currentPlayer).map((card) => ({ kind: "play", cardId: card.id }));
  }
  if (state.phase === "deal-result") return [{ kind: "continue" }];
  return [];
}

export function scoreDeal(state: MatchState): DealScore {
  if (!state.contractor) throw new Error("Missing contractor");
  const contractTeam = teamOf(state.contractor);
  const other = (1 - contractTeam) as Team;
  const cardPoints: [number, number] = [...state.dealCardPoints];
  const roem: [number, number] = [...state.dealRoem];
  const contractTotal = cardPoints[contractTeam] + roem[contractTeam];
  const otherTotal = cardPoints[other] + roem[other];
  const nat = contractTotal <= otherTotal;
  const contractTricks = state.completedTricks.filter((trick) => trick.result.team === contractTeam).length;
  const pit = !nat && contractTricks === 8;
  const awarded: [number, number] = [cardPoints[0] + roem[0], cardPoints[1] + roem[1]];
  if (nat) {
    awarded[contractTeam] = 0;
    awarded[other] = 162 + roem[0] + roem[1];
  } else if (pit) {
    awarded[contractTeam] += 100;
  }
  return { cardPoints, roem, awarded, nat, pit, contractTeam };
}

function beginNextDeal(state: MatchState): MatchState {
  const dealNumber = state.dealNumber + 1;
  const dealer = nextSeat(state.dealer);
  const seed = (state.seed + 0x9e3779b9) >>> 0;
  return {
    ...state,
    dealNumber,
    dealer,
    currentPlayer: nextSeat(dealer),
    contractor: null,
    trump: null,
    passes: 0,
    phase: "bidding",
    seed,
    hands: deal(seed),
    trick: [],
    completedTricks: [],
    dealCardPoints: [0, 0],
    dealRoem: [0, 0],
    lastDealScore: null,
  };
}

export function applyAction(state: MatchState, action: GameAction): MatchState {
  if (!getLegalActions(state).some((legal) => JSON.stringify(legal) === JSON.stringify(action))) throw new Error("Illegal action");
  if (state.phase === "bidding") {
    if (action.kind === "pass") return { ...state, passes: state.passes + 1, currentPlayer: nextSeat(state.currentPlayer) };
    if (action.kind === "bid") return { ...state, contractor: state.currentPlayer, trump: action.suit, phase: "playing", currentPlayer: nextSeat(state.dealer) };
  }
  if (state.phase === "playing" && action.kind === "play" && state.trump) {
    const hand = state.hands[state.currentPlayer];
    const card = hand.find((item) => item.id === action.cardId)!;
    const hands = { ...state.hands, [state.currentPlayer]: hand.filter((item) => item.id !== card.id) };
    const trick = [...state.trick, { seat: state.currentPlayer, card }];
    if (trick.length < 4) return { ...state, hands, trick, currentPlayer: nextSeat(state.currentPlayer) };
    const result = resolveTrick(trick, state.trump);
    const isLast = state.completedTricks.length === 7;
    const dealCardPoints: [number, number] = [...state.dealCardPoints];
    const dealRoem: [number, number] = [...state.dealRoem];
    dealCardPoints[result.team] += result.cardPoints + (isLast ? 10 : 0);
    dealRoem[result.team] += result.roem;
    const progressed: MatchState = {
      ...state,
      hands,
      trick: [],
      currentPlayer: result.winner,
      completedTricks: [...state.completedTricks, { cards: trick, result }],
      dealCardPoints,
      dealRoem,
    };
    if (!isLast) return progressed;
    const lastDealScore = scoreDeal(progressed);
    const totalScore: [number, number] = [state.totalScore[0] + lastDealScore.awarded[0], state.totalScore[1] + lastDealScore.awarded[1]];
    return { ...progressed, totalScore, lastDealScore, phase: state.dealNumber >= state.matchLength ? "match-result" : "deal-result" };
  }
  if (state.phase === "deal-result" && action.kind === "continue") return beginNextDeal(state);
  throw new Error("Illegal action");
}

export function serializeMatch(state: MatchState): string {
  return JSON.stringify(state);
}

export function restoreMatch(raw: string): MatchState | null {
  try {
    const parsed = JSON.parse(raw) as MatchState;
    const isSeat = (value: unknown): value is Seat => SEATS.includes(value as Seat);
    const isSuit = (value: unknown): value is Suit => SUITS.includes(value as Suit);
    const isCard = (value: unknown): value is Card => {
      if (!value || typeof value !== "object") return false;
      const item = value as Card;
      return isSuit(item.suit) && RANKS.includes(item.rank) && item.id === `${item.suit}-${item.rank}`;
    };
    const isPlay = (value: unknown): value is PlayedCard => {
      if (!value || typeof value !== "object") return false;
      const item = value as PlayedCard;
      return isSeat(item.seat) && isCard(item.card);
    };
    const isScorePair = (value: unknown): value is [number, number] => Array.isArray(value)
      && value.length === 2
      && value.every((item) => Number.isFinite(item) && item >= 0);
    const isTrickResult = (value: unknown): value is TrickResult => {
      if (!value || typeof value !== "object") return false;
      const result = value as TrickResult;
      return isSeat(result.winner)
        && (result.team === 0 || result.team === 1)
        && Number.isFinite(result.cardPoints) && result.cardPoints >= 0
        && Number.isFinite(result.roem) && result.roem >= 0
        && Array.isArray(result.roemLabels) && result.roemLabels.every((label) => typeof label === "string");
    };
    const isDealScore = (value: unknown): value is DealScore => {
      if (!value || typeof value !== "object") return false;
      const score = value as DealScore;
      return isScorePair(score.cardPoints) && isScorePair(score.roem) && isScorePair(score.awarded)
        && typeof score.nat === "boolean" && typeof score.pit === "boolean"
        && (score.contractTeam === 0 || score.contractTeam === 1);
    };

    if (!parsed || typeof parsed !== "object"
      || parsed.schemaVersion !== 1
      || !["cpu", "pass-and-play", "tutorial"].includes(parsed.mode)
      || !["easy", "normal", "hard"].includes(parsed.difficulty)
      || ![4, 16].includes(parsed.matchLength)
      || !["bidding", "playing", "deal-result", "match-result"].includes(parsed.phase)
      || !isSeat(parsed.dealer)
      || !isSeat(parsed.currentPlayer)
      || (parsed.contractor !== null && !isSeat(parsed.contractor))
      || (parsed.trump !== null && !isSuit(parsed.trump))
      || !Number.isInteger(parsed.passes) || parsed.passes < 0 || parsed.passes > 4
      || !Number.isInteger(parsed.dealNumber) || parsed.dealNumber < 1 || parsed.dealNumber > parsed.matchLength
      || !Number.isInteger(parsed.seed)
      || !isScorePair(parsed.dealCardPoints)
      || !isScorePair(parsed.dealRoem)
      || !isScorePair(parsed.totalScore)
      || !SEATS.every((seat) => {
        const player = parsed.players?.[seat];
        return player?.seat === seat && typeof player.name === "string" && player.name.length > 0 && player.name.length <= 16 && typeof player.human === "boolean";
      })
      || !SEATS.every((seat) => Array.isArray(parsed.hands?.[seat]) && parsed.hands[seat].length <= 8 && parsed.hands[seat].every(isCard))
      || !Array.isArray(parsed.trick) || parsed.trick.length > 3 || !parsed.trick.every(isPlay)
      || new Set(parsed.trick.map((play) => play.seat)).size !== parsed.trick.length
      || !Array.isArray(parsed.completedTricks) || parsed.completedTricks.length > 8
      || !parsed.completedTricks.every((trick) => Array.isArray(trick?.cards) && trick.cards.length === 4 && trick.cards.every(isPlay) && isTrickResult(trick.result))
      || (parsed.lastDealScore !== null && !isDealScore(parsed.lastDealScore))
      || (parsed.phase === "playing" && (!parsed.trump || !parsed.contractor))
      || (["deal-result", "match-result"].includes(parsed.phase) && !parsed.lastDealScore)) return null;

    const dealtCards = [
      ...SEATS.flatMap((seat) => parsed.hands[seat]),
      ...parsed.trick.map((play) => play.card),
      ...parsed.completedTricks.flatMap((trick) => trick.cards.map((play) => play.card)),
    ];
    if (dealtCards.length !== 32 || new Set(dealtCards.map((card) => card.id)).size !== 32) return null;
    return parsed;
  } catch {
    return null;
  }
}

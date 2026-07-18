export const SUITS = ["clubs", "diamonds", "hearts", "spades"] as const;
export const RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7"] as const;
export const SEATS = ["north", "east", "south", "west"] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];
export type Seat = (typeof SEATS)[number];
export type Team = 0 | 1;
export type MatchLength = 4 | 16;
export type GameMode = "cpu" | "pass-and-play" | "tutorial";
export type Difficulty = "easy" | "normal" | "hard";
export type GamePhase = "bidding" | "playing" | "deal-result" | "match-result";

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export interface Player {
  seat: Seat;
  name: string;
  human: boolean;
}

export interface PlayedCard {
  seat: Seat;
  card: Card;
}

export interface TrickResult {
  winner: Seat;
  team: Team;
  cardPoints: number;
  roem: number;
  roemLabels: string[];
}

export interface DealScore {
  cardPoints: [number, number];
  roem: [number, number];
  awarded: [number, number];
  nat: boolean;
  pit: boolean;
  contractTeam: Team;
}

export interface MatchState {
  schemaVersion: 1;
  mode: GameMode;
  difficulty: Difficulty;
  matchLength: MatchLength;
  players: Record<Seat, Player>;
  phase: GamePhase;
  dealer: Seat;
  currentPlayer: Seat;
  contractor: Seat | null;
  trump: Suit | null;
  passes: number;
  dealNumber: number;
  seed: number;
  hands: Record<Seat, Card[]>;
  trick: PlayedCard[];
  completedTricks: Array<{ cards: PlayedCard[]; result: TrickResult }>;
  dealCardPoints: [number, number];
  dealRoem: [number, number];
  totalScore: [number, number];
  lastDealScore: DealScore | null;
}

export type BidAction = { kind: "pass" } | { kind: "bid"; suit: Suit };
export type PlayCardAction = { kind: "play"; cardId: string };
export type GameAction = BidAction | PlayCardAction | { kind: "continue" };

export interface UserSettings {
  playerName: string;
  confirmCard: boolean;
  sound: boolean;
  vibration: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  assist: boolean;
}

export interface TutorialProgress {
  completed: number[];
  attempts: Record<number, number>;
}

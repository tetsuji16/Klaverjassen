import { describe, expect, it } from "vitest";
import { applyAction, cardPoints, createDeck, createMatch, detectRoem, getLegalActions, legalCards, resolveTrick, restoreMatch, serializeMatch, shuffledDeck, teamOf } from "./engine";
import type { Card, GameAction, PlayedCard, Rank, Seat, Suit } from "./types";

const card = (suit: Suit, rank: Rank): Card => ({ suit, rank, id: `${suit}-${rank}` });
const play = (seat: Seat, suit: Suit, rank: Rank): PlayedCard => ({ seat, card: card(suit, rank) });

describe("deck and scoring", () => {
  it("creates 32 unique cards and deterministic shuffles", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(32);
    expect(new Set(deck.map((item) => item.id)).size).toBe(32);
    expect(shuffledDeck(42).map((item) => item.id)).toEqual(shuffledDeck(42).map((item) => item.id));
    expect(shuffledDeck(42).map((item) => item.id)).not.toEqual(shuffledDeck(43).map((item) => item.id));
  });

  it("uses the special trump order and totals 152 card points", () => {
    expect(cardPoints(card("clubs", "J"), "clubs")).toBe(20);
    expect(cardPoints(card("clubs", "9"), "clubs")).toBe(14);
    expect(cardPoints(card("hearts", "J"), "clubs")).toBe(2);
    expect(createDeck().reduce((sum, item) => sum + cardPoints(item, "clubs"), 0)).toBe(152);
  });

  it("resolves trump over a higher plain card", () => {
    const result = resolveTrick([
      play("north", "hearts", "A"), play("east", "hearts", "10"), play("south", "clubs", "7"), play("west", "hearts", "K"),
    ], "clubs");
    expect(result.winner).toBe("south");
    expect(result.cardPoints).toBe(25);
  });
});

describe("Amsterdam legal play", () => {
  it("requires following the lead suit", () => {
    const hand = [card("hearts", "7"), card("clubs", "J"), card("spades", "A")];
    expect(legalCards(hand, [play("north", "hearts", "A")], "clubs", "east").map((item) => item.id)).toEqual(["hearts-7"]);
  });

  it("requires overtrumping an opponent where possible", () => {
    const hand = [card("clubs", "J"), card("clubs", "7"), card("spades", "A")];
    const trick = [play("north", "hearts", "A"), play("east", "clubs", "9")];
    expect(legalCards(hand, trick, "clubs", "south").map((item) => item.id)).toEqual(["clubs-J"]);
  });

  it("allows a discard when the partner is winning", () => {
    const hand = [card("clubs", "7"), card("spades", "A")];
    const trick = [play("north", "hearts", "A"), play("east", "hearts", "7")];
    expect(legalCards(hand, trick, "clubs", "south").map((item) => item.id).sort()).toEqual(["clubs-7", "spades-A"]);
  });

  it("forbids an undertrump while a non-trump discard exists", () => {
    const hand = [card("clubs", "7"), card("spades", "A")];
    const trick = [play("north", "hearts", "A"), play("east", "clubs", "9")];
    expect(legalCards(hand, trick, "clubs", "south").map((item) => item.id)).toEqual(["spades-A"]);
  });
});

describe("roem", () => {
  it("detects a three-card run", () => {
    const result = detectRoem([play("north", "hearts", "9"), play("east", "hearts", "10"), play("south", "hearts", "J"), play("west", "clubs", "7")], "clubs");
    expect(result.points).toBe(20);
  });

  it("combines a four-card run with stuk", () => {
    const result = detectRoem([play("north", "clubs", "10"), play("east", "clubs", "J"), play("south", "clubs", "Q"), play("west", "clubs", "K")], "clubs");
    expect(result.points).toBe(70);
    expect(result.labels).toHaveLength(2);
  });

  it("detects four equal ranks", () => {
    const result = detectRoem([play("north", "clubs", "A"), play("east", "diamonds", "A"), play("south", "hearts", "A"), play("west", "spades", "A")], "clubs");
    expect(result.points).toBe(100);
  });

  it("awards 200 roem for four jacks", () => {
    const result = detectRoem([play("north", "clubs", "J"), play("east", "diamonds", "J"), play("south", "hearts", "J"), play("west", "spades", "J")], "clubs");
    expect(result.points).toBe(200);
  });
});

describe("full matches and persistence", () => {
  it("plays a deterministic short match without illegal actions", () => {
    let state = createMatch({ mode: "cpu", matchLength: 4, seed: 2026 });
    let safety = 0;
    while (state.phase !== "match-result" && safety < 500) {
      const legal = getLegalActions(state);
      const action: GameAction = legal.find((item) => item.kind === "bid") || legal[0];
      state = applyAction(state, action);
      safety += 1;
    }
    expect(state.phase).toBe("match-result");
    expect(state.dealNumber).toBe(4);
    expect(state.totalScore[0] + state.totalScore[1]).toBeGreaterThanOrEqual(4 * 162);
    expect(state.completedTricks).toHaveLength(8);
  });

  it("round-trips saved state and rejects broken data", () => {
    const state = createMatch({ mode: "pass-and-play", matchLength: 16, seed: 7 });
    expect(restoreMatch(serializeMatch(state))).toEqual(state);
    expect(restoreMatch("not json")).toBeNull();
    expect(restoreMatch('{"schemaVersion":99}')).toBeNull();
  });

  it("rejects structurally corrupt saved matches", () => {
    const state = createMatch({ mode: "cpu", matchLength: 4, seed: 9 });
    expect(restoreMatch(JSON.stringify({ ...state, currentPlayer: "invalid" }))).toBeNull();
    expect(restoreMatch(JSON.stringify({ ...state, hands: { ...state.hands, north: [] } }))).toBeNull();
    expect(restoreMatch(JSON.stringify({ ...state, phase: "playing", trump: null }))).toBeNull();
  });

  it("uses opposite seats as partners", () => {
    expect(teamOf("north")).toBe(teamOf("south"));
    expect(teamOf("east")).toBe(teamOf("west"));
    expect(teamOf("north")).not.toBe(teamOf("east"));
  });
});

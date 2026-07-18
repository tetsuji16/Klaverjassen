/// <reference lib="webworker" />
import { chooseCpuAction } from "../game/cpu";
import type { MatchState } from "../game/types";

self.onmessage = (event: MessageEvent<MatchState>) => {
  const state = event.data;
  const privateView: MatchState = {
    ...state,
    hands: {
      north: state.currentPlayer === "north" ? state.hands.north : [],
      east: state.currentPlayer === "east" ? state.hands.east : [],
      south: state.currentPlayer === "south" ? state.hands.south : [],
      west: state.currentPlayer === "west" ? state.hands.west : [],
    },
  };
  self.postMessage(chooseCpuAction(privateView));
};

export {};

import { create } from 'zustand';

interface GameState {
  currentElixir: number;
  seenCards: string[]; // Stores card names
  isPlaying: boolean;
  isOverlayMode: boolean;
  definitiveDeck: string[] | null;
  gameTime: number; // Elapsed time in seconds

  // Actions
  addSeenCard: (cardName: string, elixirCost: number) => void;
  tick: (deltaSeconds: number) => void;
  resetGame: () => void;
  setElixir: (value: number) => void;
  togglePlay: () => void;
  toggleOverlayMode: () => void;
  setOverlayMode: (value: boolean) => void;
  overlayScale: number;
  setOverlayScale: (scale: number) => void;
}

// Base rate: 0.266 elixir per second (as originally requested/configured)
const BASE_ELIXIR_RATE = 0.266;
const MAX_ELIXIR = 10;
const START_ELIXIR = 5;

export const useGameStore = create<GameState>((set) => ({
  currentElixir: START_ELIXIR,
  seenCards: [],
  isPlaying: false,
  isOverlayMode: false,
  gameTime: 0,
  overlayScale: 1.0,

  addSeenCard: (cardName, elixirCost) => set((state) => {
    if (state.definitiveDeck && !state.definitiveDeck.includes(cardName)) {
      return {};
    }

    const newSeen = [...state.seenCards, cardName];
    let definitiveDeck = state.definitiveDeck;

    if (!definitiveDeck) {
      const uniqueInOrder: string[] = [];
      for (const card of newSeen) {
        if (!uniqueInOrder.includes(card)) {
          uniqueInOrder.push(card);
        }
      }

      if (uniqueInOrder.length >= 8) {
        definitiveDeck = uniqueInOrder.slice(0, 8);
      }
    }

    let newElixir = state.currentElixir - elixirCost;
    if (newElixir < 0) newElixir = 0;

    return {
      seenCards: newSeen,
      currentElixir: newElixir,
      isPlaying: true,
      definitiveDeck,
    };
  }),

  tick: (deltaSeconds) => set((state) => {
    if (!state.isPlaying) return {};

    const nextTime = state.gameTime + deltaSeconds;

    // Determine Multiplier
    // 0-120s (First 2 mins): 1x
    // 120s-240s (Last min regular + First min OT): 2x
    // 240s+ (Last min OT): 3x
    let multiplier = 1;
    if (nextTime >= 240) {
      multiplier = 3;
    } else if (nextTime >= 120) {
      multiplier = 2;
    }

    const regen = deltaSeconds * BASE_ELIXIR_RATE * multiplier;
    let nextElixir = state.currentElixir + regen;
    if (nextElixir > MAX_ELIXIR) nextElixir = MAX_ELIXIR;

    return {
      currentElixir: nextElixir,
      gameTime: nextTime
    };
  }),

  resetGame: () => set({
    currentElixir: START_ELIXIR,
    seenCards: [],
    isPlaying: false,
    definitiveDeck: null,
    gameTime: 0,
  }),

  setElixir: (value) => set({
    currentElixir: Math.min(Math.max(value, 0), MAX_ELIXIR)
  }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  toggleOverlayMode: () => set((state) => ({ isOverlayMode: !state.isOverlayMode })),

  setOverlayMode: (value: boolean) => set({ isOverlayMode: value }),

  setOverlayScale: (scale: number) => set({ overlayScale: Math.min(Math.max(scale, 0.5), 1.0) })
}));
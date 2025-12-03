import { create } from 'zustand';

interface GameState {
  currentElixir: number;
  seenCards: string[]; // Stores card names
  isPlaying: boolean;
  isOverlayMode: boolean;
  definitiveDeck: string[] | null;
  
  // Actions
  addSeenCard: (cardName: string, elixirCost: number) => void;
  tick: (deltaSeconds: number) => void;
  resetGame: () => void;
  setElixir: (value: number) => void;
  togglePlay: () => void;
  toggleOverlayMode: () => void;
}

// 0.266 elixir per second as requested
const ELIXIR_REGEN_RATE = 0.266;
const MAX_ELIXIR = 10;
const START_ELIXIR = 5;

export const useGameStore = create<GameState>((set) => ({
  currentElixir: START_ELIXIR,
  seenCards: [],
  isPlaying: false,
  isOverlayMode: false,
  definitiveDeck: null,

  addSeenCard: (cardName, elixirCost) => set((state) => {
    // Once the definitive deck is known, ignore clicks outside of it
    if (state.definitiveDeck && !state.definitiveDeck.includes(cardName)) {
      return {};
    }

    // Prevent duplicate entries if you only want unique seen cards,
    // but in CR you cycle cards. The prompt implies "seen cards" for prediction.
    // We will maintain a list of all cards played in order, but for prediction we just look at unique ones.
    const newSeen = [...state.seenCards, cardName];

    // Determine definitive deck when 8 unique cards have been clicked
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

    // Deduct elixir logic
    let newElixir = state.currentElixir - elixirCost;
    if (newElixir < 0) newElixir = 0; // Can't have negative elixir really, but opponent might have leaked

    return {
      seenCards: newSeen,
      currentElixir: newElixir,
      isPlaying: true, // Start game if not started
      definitiveDeck,
    };
  }),

  tick: (deltaSeconds) => set((state) => {
    if (!state.isPlaying) return {};
    
    let nextElixir = state.currentElixir + (deltaSeconds * ELIXIR_REGEN_RATE);
    if (nextElixir > MAX_ELIXIR) nextElixir = MAX_ELIXIR;

    return { currentElixir: nextElixir };
  }),

  resetGame: () => set({
    currentElixir: START_ELIXIR,
    seenCards: [],
    isPlaying: false,
    definitiveDeck: null,
  }),

  setElixir: (value) => set({
    currentElixir: Math.min(Math.max(value, 0), MAX_ELIXIR)
  }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  toggleOverlayMode: () => set((state) => ({ isOverlayMode: !state.isOverlayMode }))
}));
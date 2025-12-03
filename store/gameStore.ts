import { create } from 'zustand';

interface GameState {
  currentElixir: number;
  seenCards: string[]; // Stores card names
  isPlaying: boolean;
  isOverlayMode: boolean;
  
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

  addSeenCard: (cardName, elixirCost) => set((state) => {
    // Prevent duplicate entries if you only want unique seen cards, 
    // but in CR you cycle cards. The prompt implies "seen cards" for prediction.
    // We will maintain a list of all cards played in order, but for prediction we just look at unique ones.
    const newSeen = [...state.seenCards, cardName];
    
    // Deduct elixir logic
    let newElixir = state.currentElixir - elixirCost;
    if (newElixir < 0) newElixir = 0; // Can't have negative elixir really, but opponent might have leaked

    return {
      seenCards: newSeen,
      currentElixir: newElixir,
      isPlaying: true, // Start game if not started
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
    isPlaying: false
  }),

  setElixir: (value) => set({
    currentElixir: Math.min(Math.max(value, 0), MAX_ELIXIR)
  }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  toggleOverlayMode: () => set((state) => ({ isOverlayMode: !state.isOverlayMode }))
}));
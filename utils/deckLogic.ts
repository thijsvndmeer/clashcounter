import { Deck, META_DECKS } from '../data/decks';

export interface DeckPrediction {
  deck: Deck;
  matchScore: number; // Number of matching cards
  missingCards: string[]; // Cards in the deck the opponent hasn't played yet
}

export const predictDecks = (seenCards: string[]): DeckPrediction[] => {
  // Use a Set for unique seen cards to avoid double counting if opponent cycles
  const uniqueSeen = new Set(seenCards);

  const predictions = META_DECKS.map((deck) => {
    const deckCardsSet = new Set(deck.cards);
    let matchCount = 0;
    const missing: string[] = [];

    // Calculate matches
    uniqueSeen.forEach((seenCard) => {
      if (deckCardsSet.has(seenCard)) {
        matchCount++;
      }
    });

    // Calculate missing
    deck.cards.forEach((card) => {
      if (!uniqueSeen.has(card)) {
        missing.push(card);
      }
    });

    return {
      deck,
      matchScore: matchCount,
      missingCards: missing
    };
  });

  // Sort by match score descending
  return predictions.sort((a, b) => b.matchScore - a.matchScore);
};
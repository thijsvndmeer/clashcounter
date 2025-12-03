import { Deck, META_DECKS } from '../data/decks';

export interface DeckPrediction {
  deck: Deck;
  matchScore: number; // Number of matching cards
  missingCards: string[]; // Cards in the deck the opponent hasn't played yet
}

export interface CardLikelihoods {
  /**
   * Raw likelihood score per card aggregated across all plausible decks.
   * Higher is more likely; values are relative and later normalized by the UI.
   */
  scores: Record<string, number>;
  /**
   * Normalized 0-100 rating per card so the UI can surface a quick "likeliness" read.
   */
  normalized: Record<string, number>;
  maxScore: number;
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

/**
 * Calculate how likely each card is to appear next based on:
 * - Deck confidence (matches vs. mismatches)
 * - Rotation math (cards come back after ~4 plays)
 * - Missing card urgency (cards we haven't seen yet get a bump)
 * - Recency penalty/bonus (recently cycled cards are more imminent)
 */
export const calculateCardLikelihoods = (seenCards: string[]): CardLikelihoods => {
  const predictions = predictDecks(seenCards);
  const uniqueSeen = new Set(seenCards);
  const lastSeenIndex = new Map<string, number>();

  seenCards.forEach((card, idx) => {
    lastSeenIndex.set(card, idx);
  });

  const likelihoodAccumulator: Record<string, number> = {};
  const totalPlays = seenCards.length;

  predictions.forEach((prediction, predictionIndex) => {
    const mismatches = Math.max(0, uniqueSeen.size - prediction.matchScore);
    const matchRatio = prediction.matchScore / prediction.deck.cards.length;

    // Deck confidence rewards strong matches and penalizes mismatches,
    // with a slight boost for the most likely deck in the list.
    const deckConfidence = Math.max(matchRatio - mismatches * 0.07, 0);
    const topDeckBoost = predictionIndex === 0 ? 1.15 : 1;
    const deckWeight = Math.pow(deckConfidence + 0.08, 2) * topDeckBoost;

    prediction.deck.cards.forEach((cardName) => {
      const lastSeen = lastSeenIndex.has(cardName) ? lastSeenIndex.get(cardName)! : -1;
      const playsSinceSeen = lastSeen === -1 ? totalPlays : totalPlays - lastSeen - 1;

      // A card returns to hand roughly 4 plays after being used. The closer
      // we are to that point, the higher the cycleFactor becomes.
      const distanceToCycle = lastSeen === -1 ? 3 : Math.max(0, 4 - playsSinceSeen);
      const cycleFactor = 1 / (1 + distanceToCycle);

      // Unseen cards are urgent to surface; cards missing from the deck get a bump.
      const unseenBonus = lastSeen === -1 ? 1.2 : 1;
      const missingBonus = prediction.missingCards.includes(cardName) ? 1.1 : 0.95;

      // Long downtime after being seen suggests a hand backfill is imminent but
      // we avoid runaway growth by slightly damping extremely old sightings.
      const fatiguePenalty = Math.max(0.7, 1 - Math.max(0, playsSinceSeen - 8) * 0.02);

      const cardScore = deckWeight * cycleFactor * unseenBonus * missingBonus * fatiguePenalty;

      likelihoodAccumulator[cardName] = (likelihoodAccumulator[cardName] || 0) + cardScore;
    });
  });

  const maxScore = Math.max(0, ...Object.values(likelihoodAccumulator));
  const normalized: Record<string, number> = {};

  Object.entries(likelihoodAccumulator).forEach(([card, score]) => {
    normalized[card] = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  });

  return {
    scores: likelihoodAccumulator,
    normalized,
    maxScore,
  };
};
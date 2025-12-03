import { Deck, META_DECKS } from '../data/decks';
import { CARD_USAGE_STATS } from '../data/cardUsageStats';

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
    const deckConfidence = Math.max(matchRatio - mismatches * 0.09, 0);
    const topDeckBoost = predictionIndex === 0 ? 1.18 : 1;
    const mismatchDrag = 1 - Math.min(0.35, mismatches * 0.07);
    const deckWeight = Math.pow(deckConfidence + 0.1, 2) * topDeckBoost * mismatchDrag;

    prediction.deck.cards.forEach((cardName) => {
      const lastSeen = lastSeenIndex.has(cardName) ? lastSeenIndex.get(cardName)! : -1;
      const playsSinceSeen = lastSeen === -1 ? totalPlays : totalPlays - lastSeen - 1;
      const usageStats = CARD_USAGE_STATS[cardName];
      const popularity = usageStats?.usageRate ?? 0.18;
      const expectedCycle = usageStats?.avgCycleLength ?? 4.0;

      // Respect the Clash Royale draw rule: a card cannot be redrawn until four
      // other cards have been played. While unseen cards are exempt, recently used
      // cards are clamped to zero probability until their cooldown expires.
      const requiredGap = Math.max(4, Math.round(expectedCycle));
      const cycleReady = lastSeen === -1 ? true : playsSinceSeen >= requiredGap;
      const cooldownPenalty = cycleReady ? 1 : 0;

      // Once the card clears the hard gate, ramp its urgency as it approaches
      // the expected cycle point and taper it as it lingers deep in the deck.
      const overshoot = lastSeen === -1 ? 0 : Math.max(0, playsSinceSeen - requiredGap);
      const cycleMomentum = lastSeen === -1 ? 1.05 : 1 + Math.min(0.6, overshoot * 0.12);

      // Unseen cards are urgent to surface; cards missing from the deck get a bump.
      const unseenBonus = lastSeen === -1 ? 1.25 : 1;
      const missingBonus = prediction.missingCards.includes(cardName) ? 1.2 : 0.9;

      // Long downtime after being seen suggests a hand backfill is imminent but
      // we avoid runaway growth by slightly damping extremely old sightings.
      const fatiguePenalty = Math.max(0.65, 1 - Math.max(0, playsSinceSeen - 9) * 0.03);

      // Popular, frequently cycled cards should start with a stronger prior.
      const popularityPrior = 0.65 + popularity * 0.8;

      const cardScore =
        deckWeight *
        cooldownPenalty *
        cycleMomentum *
        unseenBonus *
        missingBonus *
        fatiguePenalty *
        popularityPrior;

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
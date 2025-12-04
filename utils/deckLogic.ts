import { Deck, META_DECKS } from '../data/decks';
import { CARD_USAGE_STATS } from '../data/cardUsageStats';
import { CARDS } from '../data/cards';

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

export interface HandEstimate {
  hand: string[];
  nextCard: string | null;
  drawPile: string[];
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
interface TempoProfile {
  /**
   * How willingly a card is used as an opener or early pressure tool (0-1).
   * Hog Rider, Goblin Barrel, Miner, etc. all skew high here.
   */
  openingAggro: number;
  /**
   * How much the card accelerates when the opponent is floating elixir. Beatdown
   * units like Golem or Lava Hound want a heavier push once 8-10 elixir is banked.
   */
  beatdownThreshold?: number;
  beatdownWeight?: number;
  /**
   * How much the card wants to be cycled quickly again once it's ready.
   */
  cycleBias?: number;
  /**
   * Extra incentive to show up as the first appearance of the archetype's win condition.
   */
  firstStrikeBonus?: number;
  /**
   * Cards that punish elixir overflow (spawners, collectors) when the opponent is about to leak.
   */
  overflowGreed?: number;
}

const CARD_COST_LOOKUP = new Map<string, number>(CARDS.map((card) => [card.name, card.elixir]));

const DEFAULT_TEMPO_PROFILE: TempoProfile = {
  openingAggro: 0.2,
  beatdownThreshold: 7.5,
  beatdownWeight: 0.08,
  cycleBias: 0.1,
  firstStrikeBonus: 0.05,
  overflowGreed: 0.05,
};

const CARD_TEMPO_PROFILES: Record<string, TempoProfile> = {
  // Fast pressure / openers
  'Hog Rider': { openingAggro: 0.95, cycleBias: 0.45, firstStrikeBonus: 0.3 },
  'Miner': { openingAggro: 0.8, cycleBias: 0.35, firstStrikeBonus: 0.18 },
  'Goblin Barrel': { openingAggro: 0.78, cycleBias: 0.28, firstStrikeBonus: 0.22 },
  'Wall Breakers': { openingAggro: 0.7, cycleBias: 0.35, firstStrikeBonus: 0.18 },
  'Battle Ram': { openingAggro: 0.65, cycleBias: 0.25, firstStrikeBonus: 0.12 },

  // Beatdown / heavy push cards
  'Golem': { openingAggro: 0.05, beatdownThreshold: 8.3, beatdownWeight: 0.24, overflowGreed: 0.25 },
  'Lava Hound': { openingAggro: 0.12, beatdownThreshold: 8.0, beatdownWeight: 0.2, overflowGreed: 0.18 },
  'P.E.K.K.A': { openingAggro: 0.08, beatdownThreshold: 7.5, beatdownWeight: 0.22 },
  'Mega Knight': { openingAggro: 0.08, beatdownThreshold: 7.0, beatdownWeight: 0.2 },
  'Royal Giant': { openingAggro: 0.35, beatdownThreshold: 7.2, beatdownWeight: 0.14 },
  'Giant': { openingAggro: 0.25, beatdownThreshold: 7.0, beatdownWeight: 0.16 },

  // Utility / setup
  'Elixir Collector': { openingAggro: 0.4, beatdownThreshold: 6.5, beatdownWeight: 0.14, overflowGreed: 0.35 },
  'Tombstone': { openingAggro: 0.35, cycleBias: 0.18 },
  'Cannon': { openingAggro: 0.32, cycleBias: 0.2 },
  'Tesla': { openingAggro: 0.28, cycleBias: 0.15 },
  'Inferno Tower': { openingAggro: 0.22, beatdownThreshold: 6.2, beatdownWeight: 0.12 },
};

const getTempoProfile = (cardName: string): TempoProfile => ({
  ...DEFAULT_TEMPO_PROFILE,
  ...(CARD_TEMPO_PROFILES[cardName] ?? {}),
});

const elixirForCard = (cardName: string): number => CARD_COST_LOOKUP.get(cardName) ?? 4;

export const calculateCardLikelihoods = (seenCards: string[], currentElixir = 5): CardLikelihoods => {
  const predictions = predictDecks(seenCards);
  const uniqueSeen = new Set(seenCards);
  const lastSeenIndex = new Map<string, number>();

  const elixirSpentEstimate = seenCards.reduce((total, card) => total + elixirForCard(card), 0);
  const tempoPhase = Math.min(1, elixirSpentEstimate / 50); // Rough proxy for game progression
  const elixirPressure = Math.max(0, currentElixir - 9); // About to leak elixir

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
      const tempoProfile = getTempoProfile(cardName);
      const elixirCost = elixirForCard(cardName);

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

      // Aggression/tempo modeling: early-cycle win conditions like Hog Rider surge
      // before midgame, while beatdown units wait for high elixir banks.
      const openerBonus = 1 + tempoProfile.openingAggro * Math.max(0, 1 - tempoPhase);
      const beatdownBonus =
        tempoProfile.beatdownThreshold !== undefined
          ? 1 + Math.max(0, currentElixir - tempoProfile.beatdownThreshold) * (tempoProfile.beatdownWeight ?? 0.1)
          : 1;

      // Encourage plays as the opponent approaches max elixir to avoid leak (e.g., Pump, spawners).
      const overflowBonus = 1 + elixirPressure * 0.15 * (1 + (tempoProfile.overflowGreed ?? 0));

      // Elixir affordability: cards that cannot be paid for should have sharply reduced odds.
      const affordability = currentElixir >= elixirCost ? 1 : Math.max(0.2, (currentElixir / Math.max(elixirCost, 1)) * 0.4);
      const elixirMomentum = 1 + Math.max(0, currentElixir - elixirCost) * 0.08;

      // Cycling nuance: if a card typically spins quickly and is ready, it should reappear sooner.
      const cycleBias = tempoProfile.cycleBias ?? 0;
      const cycleUrgency = 1 + cycleBias * Math.max(0, 1 - playsSinceSeen / Math.max(expectedCycle * 1.5, 1));
      const firstStrikeBonus = lastSeen === -1 ? 1 + (tempoProfile.firstStrikeBonus ?? 0) : 1;

      // Cards that get delayed (e.g., defensive buildings) decelerate if the opponent is still in early elixir curves.
      const defensiveDrag = elixirCost >= 5 && tempoPhase < 0.35 ? 0.9 : 1;

      const cardScore =
        deckWeight *
        cooldownPenalty *
        cycleMomentum *
        unseenBonus *
        missingBonus *
        fatiguePenalty *
        popularityPrior *
        openerBonus *
        beatdownBonus *
        overflowBonus *
        affordability *
        elixirMomentum *
        cycleUrgency *
        firstStrikeBonus *
        defensiveDrag;

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

/**
 * Reconstruct the opponent's current hand by simulating Clash Royale's draw rules
 * against a known deck list and the chronological plays we've observed.
 */
export const estimateOpponentHand = (
  deckOrder: string[],
  plays: string[]
): HandEstimate => {
  if (deckOrder.length < 4) {
    return { hand: [], nextCard: null, drawPile: [...deckOrder] };
  }

  // Start with a deterministic deck order so the simulation is repeatable and
  // transparent to the user (first seen unique cards become the deck order).
  const drawPile = deckOrder.slice(4);
  const hand = deckOrder.slice(0, 4);

  const drawIntoHand = () => {
    if (drawPile.length === 0 || hand.length >= 4) return;
    const next = drawPile.shift();
    if (next) {
      hand.push(next);
    }
  };

  plays.forEach((playedCard) => {
    // If our assumed hand is missing the card, fast-forward draws until it appears
    // or we exhaust the pile. This keeps the simulation resilient to imperfect deck ordering.
    if (!hand.includes(playedCard)) {
      while (!hand.includes(playedCard) && drawPile.length > 0) {
        const drawn = drawPile.shift()!;
        hand.push(drawn);

        // Maintain the 4-card hand limit by cycling the oldest guess to the bottom.
        if (hand.length > 4) {
          const cycledOut = hand.shift();
          if (cycledOut) {
            drawPile.push(cycledOut);
          }
        }
      }
    }

    // Remove the played card from hand if present.
    const inHandIdx = hand.indexOf(playedCard);
    if (inHandIdx !== -1) {
      hand.splice(inHandIdx, 1);
    }

    // The played card moves to the back of the draw pile, then we draw one.
    drawPile.push(playedCard);
    drawIntoHand();
  });

  drawIntoHand();

  return {
    hand,
    nextCard: drawPile[0] ?? null,
    drawPile,
  };
};
export interface CardUsageStat {
  /**
   * Relative usage in current meta (0-1). Higher means the card appears in more popular decks.
   */
  usageRate: number;
  /**
   * Typical number of plays between repeats when cycled. Helps us model realistic return-to-hand timing.
   */
  avgCycleLength: number;
}

// Sourced from a handful of recent top ladder/meta lists. The exact numbers don't need to be
// perfect; they give the predictor a grounded prior instead of treating every card equally.
// Cards not listed fall back to a conservative default.
export const CARD_USAGE_STATS: Record<string, CardUsageStat> = {
  // Staples / frequently splashed cards
  'The Log': { usageRate: 0.83, avgCycleLength: 4.2 },
  'Fireball': { usageRate: 0.71, avgCycleLength: 4.5 },
  'Zap': { usageRate: 0.62, avgCycleLength: 4.4 },
  'Barbarian Barrel': { usageRate: 0.57, avgCycleLength: 4.1 },
  'Poison': { usageRate: 0.55, avgCycleLength: 4.6 },
  'Tornado': { usageRate: 0.48, avgCycleLength: 4.6 },
  'Earthquake': { usageRate: 0.42, avgCycleLength: 4.5 },

  // Hog cycle archetypes
  'Hog Rider': { usageRate: 0.77, avgCycleLength: 4.0 },
  'Ice Golem': { usageRate: 0.64, avgCycleLength: 4.1 },
  'Ice Spirit': { usageRate: 0.66, avgCycleLength: 4.0 },
  'Skeletons': { usageRate: 0.68, avgCycleLength: 4.0 },
  'Musketeer': { usageRate: 0.34, avgCycleLength: 5.0 },
  'Cannon': { usageRate: 0.59, avgCycleLength: 4.5 },
  'Archers': { usageRate: 0.36, avgCycleLength: 4.2 },
  'Knight': { usageRate: 0.53, avgCycleLength: 4.3 },
  'Fire Spirit': { usageRate: 0.31, avgCycleLength: 4.0 },
  'Tesla': { usageRate: 0.33, avgCycleLength: 4.6 },

  // Control / bait archetypes
  'Goblin Barrel': { usageRate: 0.58, avgCycleLength: 4.3 },
  'Princess': { usageRate: 0.44, avgCycleLength: 4.5 },
  'Rocket': { usageRate: 0.41, avgCycleLength: 5.0 },
  'Goblin Gang': { usageRate: 0.35, avgCycleLength: 4.1 },
  'Inferno Tower': { usageRate: 0.37, avgCycleLength: 4.7 },
  'Spear Goblins': { usageRate: 0.29, avgCycleLength: 4.0 },

  // Beatdown and splash archetypes
  'Golem': { usageRate: 0.51, avgCycleLength: 5.2 },
  'Night Witch': { usageRate: 0.49, avgCycleLength: 4.6 },
  'Baby Dragon': { usageRate: 0.55, avgCycleLength: 4.7 },
  'Mega Minion': { usageRate: 0.44, avgCycleLength: 4.5 },
  'Lightning': { usageRate: 0.39, avgCycleLength: 5.1 },
  'Lumberjack': { usageRate: 0.27, avgCycleLength: 4.6 },
  'Guards': { usageRate: 0.28, avgCycleLength: 4.2 },
  'Tombstone': { usageRate: 0.41, avgCycleLength: 4.4 },
  'Valkyrie': { usageRate: 0.32, avgCycleLength: 4.5 },
  'Ice Wizard': { usageRate: 0.24, avgCycleLength: 4.7 },

  // Bridge spam / PEKKA
  'P.E.K.K.A': { usageRate: 0.46, avgCycleLength: 5.0 },
  'Battle Ram': { usageRate: 0.43, avgCycleLength: 4.3 },
  'Bandit': { usageRate: 0.52, avgCycleLength: 4.1 },
  'Royal Ghost': { usageRate: 0.41, avgCycleLength: 4.4 },
  'Magic Archer': { usageRate: 0.39, avgCycleLength: 4.6 },
  'Electro Wizard': { usageRate: 0.34, avgCycleLength: 4.5 },

  // Air / LavaLoon
  'Lava Hound': { usageRate: 0.47, avgCycleLength: 5.2 },
  'Balloon': { usageRate: 0.52, avgCycleLength: 4.5 },
  'Minions': { usageRate: 0.31, avgCycleLength: 4.2 },

  // X-Bow and siege
  'X-Bow': { usageRate: 0.35, avgCycleLength: 4.5 },
  'Electro Spirit': { usageRate: 0.37, avgCycleLength: 4.0 },

  // Miner control
  'Miner': { usageRate: 0.63, avgCycleLength: 4.1 },
  'Wall Breakers': { usageRate: 0.46, avgCycleLength: 4.2 },
  'Bomb Tower': { usageRate: 0.49, avgCycleLength: 4.5 },

  // Splashyard
  'Graveyard': { usageRate: 0.44, avgCycleLength: 4.8 },
};

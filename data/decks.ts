export interface Deck {
  id: string;
  name: string;
  cards: string[]; // List of card names
}

export const META_DECKS: Deck[] = [
  // --- Cycle Decks ---
  {
    id: 'hog_2.6',
    name: 'Hog 2.6 Cycle',
    cards: ['Hog Rider', 'Fireball', 'The Log', 'Ice Golem', 'Ice Spirit', 'Skeletons', 'Musketeer', 'Cannon']
  },
  {
    id: 'hog_eq',
    name: 'Hog EQ Cycle',
    cards: ['Hog Rider', 'Earthquake', 'Knight', 'Archers', 'Tesla', 'The Log', 'Fire Spirit', 'Skeletons']
  },
  {
    id: 'log_bait',
    name: 'Classic Log Bait',
    cards: ['Goblin Barrel', 'Princess', 'The Log', 'Rocket', 'Knight', 'Ice Spirit', 'Inferno Tower', 'Goblin Gang']
  },
  {
    id: 'miner_wb_magic_archer',
    name: 'Miner Wall Breakers',
    cards: ['Miner', 'Wall Breakers', 'Magic Archer', 'Tornado', 'Bomb Tower', 'Valkyrie', 'Spear Goblins', 'Fireball']
  },
  {
    id: 'miner_mortar',
    name: 'Miner Mortar Control',
    cards: ['Miner', 'Mortar', 'Poison', 'The Log', 'Musketeer', 'Skeletons', 'Knight', 'Spear Goblins']
  },
  {
    id: 'royal_hogs_aq',
    name: 'Royal Hogs AQ Cycle',
    cards: ['Royal Hogs', 'Archer Queen', 'Earthquake', 'Royal Delivery', 'Skeletons', 'Electro Spirit', 'The Log', 'Cannon']
  },
  {
    id: 'xbow_3.0',
    name: 'X-Bow 3.0',
    cards: ['X-Bow', 'Tesla', 'Archers', 'Knight', 'Skeletons', 'Electro Spirit', 'Fireball', 'The Log']
  },
  {
    id: 'ice_bow',
    name: 'IceBow',
    cards: ['X-Bow', 'Ice Wizard', 'Rocket', 'Tornado', 'Tesla', 'Skeletons', 'The Log', 'Knight']
  },
  
  // --- Beatdown Decks ---
  {
    id: 'golem_nw',
    name: 'Golem Night Witch',
    cards: ['Golem', 'Night Witch', 'Baby Dragon', 'Mega Minion', 'Lightning', 'Barbarian Barrel', 'Tornado', 'Lumberjack']
  },
  {
    id: 'golem_edrag',
    name: 'Golem Electro Dragon',
    cards: ['Golem', 'Electro Dragon', 'Dark Prince', 'Cannon Cart', 'Tornado', 'Lightning', 'Barbarian Barrel', 'Baby Dragon']
  },
  {
    id: 'lavaloon',
    name: 'LavaLoon',
    cards: ['Lava Hound', 'Balloon', 'Mega Minion', 'Minions', 'Barbarian Barrel', 'Fireball', 'Tombstone', 'Guards']
  },
  {
    id: 'lava_miner',
    name: 'Lava Miner',
    cards: ['Lava Hound', 'Miner', 'Flying Machine', 'Skeleton Dragons', 'Barbarian Barrel', 'Fireball', 'Tombstone', 'Mega Minion']
  },
  {
    id: 'egiant_lightning',
    name: 'Electro Giant Lightning',
    cards: ['Electro Giant', 'Lightning', 'Tornado', 'Golden Knight', 'Cannon', 'Bomber', 'Barbarian Barrel', 'Inferno Dragon']
  },
  {
    id: 'goblin_giant_sparky',
    name: 'Goblin Giant Sparky',
    cards: ['Goblin Giant', 'Sparky', 'Rage', 'Mini P.E.K.K.A', 'Electro Wizard', 'Dark Prince', 'Zap', 'Minions']
  },
  {
    id: 'giant_double_prince',
    name: 'Giant Double Prince',
    cards: ['Giant', 'Prince', 'Dark Prince', 'Mega Minion', 'Electro Wizard', 'Fireball', 'Zap', 'Miner']
  },
  {
    id: 'elixir_golem_healer',
    name: 'Elixir Golem Battle Healer',
    cards: ['Elixir Golem', 'Battle Healer', 'Electro Dragon', 'Tornado', 'Rage', 'Barbarian Barrel', 'Night Witch', 'Lumberjack']
  },

  // --- Control / Bridge Spam ---
  {
    id: 'pekka_bs',
    name: 'PEKKA Bridge Spam',
    cards: ['P.E.K.K.A', 'Battle Ram', 'Bandit', 'Royal Ghost', 'Magic Archer', 'Electro Wizard', 'Zap', 'Poison']
  },
  {
    id: 'splashyard',
    name: 'Splashyard',
    cards: ['Graveyard', 'Baby Dragon', 'Ice Wizard', 'Valkyrie', 'Tombstone', 'Poison', 'Tornado', 'Barbarian Barrel']
  },
  {
    id: 'gy_freeze',
    name: 'Graveyard Freeze',
    cards: ['Graveyard', 'Freeze', 'Bowler', 'Valkyrie', 'Inferno Tower', 'Baby Dragon', 'Tornado', 'Barbarian Barrel']
  },
  {
    id: 'miner_poison_control',
    name: 'Miner Poison Control',
    cards: ['Miner', 'Poison', 'The Log', 'Bomb Tower', 'Wall Breakers', 'Knight', 'Skeletons', 'Spear Goblins']
  },
  {
    id: 'mk_wall_breakers',
    name: 'Mega Knight Wall Breakers',
    cards: ['Mega Knight', 'Wall Breakers', 'Miner', 'Bandit', 'Musketeer', 'Zap', 'Bats', 'Prince']
  },
  {
    id: 'mk_zap_bait',
    name: 'Mega Knight Zap Bait',
    cards: ['Mega Knight', 'Skeleton Barrel', 'Goblin Gang', 'Spear Goblins', 'Bats', 'Inferno Dragon', 'Miner', 'Zap']
  },
  {
    id: 'rg_fishboy',
    name: 'Royal Giant Fisherman',
    cards: ['Royal Giant', 'Fisherman', 'Hunter', 'Electro Spirit', 'The Log', 'Fireball', 'Skeletons', 'Royal Ghost']
  },
  {
    id: 'rg_lightning',
    name: 'Royal Giant Lightning',
    cards: ['Royal Giant', 'Lightning', 'The Log', 'Fisherman', 'Hunter', 'Electro Spirit', 'Skeletons', 'Mother Witch']
  },
  {
    id: 'drill_cycle',
    name: 'Goblin Drill Cycle',
    cards: ['Goblin Drill', 'Wall Breakers', 'Bomber', 'Fire Spirit', 'Tornado', 'Magic Archer', 'Valkyrie', 'Tesla']
  },
  {
    id: '3m_pump',
    name: 'Three Musketeers Pump',
    cards: ['Three Musketeers', 'Elixir Collector', 'Battle Ram', 'Bandit', 'Royal Ghost', 'Ice Golem', 'Barbarian Barrel', 'Heal Spirit']
  }
];

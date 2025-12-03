export interface Deck {
  id: string;
  name: string;
  cards: string[]; // List of card names
}

export const META_DECKS: Deck[] = [
  {
    id: 'hog_2.6',
    name: 'Hog 2.6 Cycle',
    cards: ['Hog Rider', 'Fireball', 'The Log', 'Ice Golem', 'Ice Spirit', 'Skeletons', 'Musketeer', 'Cannon']
  },
  {
    id: 'log_bait',
    name: 'Classic Log Bait',
    cards: ['Goblin Barrel', 'Princess', 'The Log', 'Rocket', 'Knight', 'Ice Spirit', 'Inferno Tower', 'Goblin Gang'] // Substituted Gang for Guards/Skeletons if generic
  },
  {
    id: 'golem_beatdown',
    name: 'Golem Beatdown',
    cards: ['Golem', 'Night Witch', 'Baby Dragon', 'Mega Minion', 'Lightning', 'Barbarian Barrel', 'Tornado', 'Lumberjack']
  },
  {
    id: 'pekka_bs',
    name: 'PEKKA Bridge Spam',
    cards: ['P.E.K.K.A', 'Battle Ram', 'Bandit', 'Royal Ghost', 'Magic Archer', 'Electro Wizard', 'Zap', 'Poison']
  },
  {
    id: 'lavaloon',
    name: 'LavaLoon',
    cards: ['Lava Hound', 'Balloon', 'Mega Minion', 'Minions', 'Barbarian Barrel', 'Fireball', 'Tombstone', 'Guards']
  },
  {
    id: 'xbow_3.0',
    name: 'X-Bow 3.0',
    cards: ['X-Bow', 'Tesla', 'Archers', 'Knight', 'Skeletons', 'Electro Spirit', 'Fireball', 'The Log']
  },
  {
    id: 'hog_eq',
    name: 'Hog EQ Cycle',
    cards: ['Hog Rider', 'Earthquake', 'Knight', 'Archers', 'Tesla', 'The Log', 'Fire Spirit', 'Skeletons']
  },
  {
    id: 'miner_poison',
    name: 'Miner Poison',
    cards: ['Miner', 'Poison', 'The Log', 'Bomb Tower', 'Wall Breakers', 'Knight', 'Skeletons', 'Spear Goblins']
  },
  {
    id: 'splashyard',
    name: 'Splashyard',
    cards: ['Graveyard', 'Baby Dragon', 'Ice Wizard', 'Valkyrie', 'Tombstone', 'Poison', 'Tornado', 'Barbarian Barrel']
  }
];
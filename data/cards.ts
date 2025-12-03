export interface Card {
  id: string;
  name: string;
  elixir: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Champion';
}

export const CARDS: Card[] = [
  // Win Conditions
  { id: 'hog_rider', name: 'Hog Rider', elixir: 4, rarity: 'Rare' },
  { id: 'giant', name: 'Giant', elixir: 5, rarity: 'Rare' },
  { id: 'golem', name: 'Golem', elixir: 8, rarity: 'Epic' },
  { id: 'lava_hound', name: 'Lava Hound', elixir: 7, rarity: 'Legendary' },
  { id: 'balloon', name: 'Balloon', elixir: 5, rarity: 'Epic' },
  { id: 'x_bow', name: 'X-Bow', elixir: 6, rarity: 'Epic' },
  { id: 'miner', name: 'Miner', elixir: 3, rarity: 'Legendary' },
  { id: 'goblin_barrel', name: 'Goblin Barrel', elixir: 3, rarity: 'Epic' },
  { id: 'royal_giant', name: 'Royal Giant', elixir: 6, rarity: 'Common' },
  { id: 'graveyard', name: 'Graveyard', elixir: 5, rarity: 'Legendary' },
  { id: 'battle_ram', name: 'Battle Ram', elixir: 4, rarity: 'Rare' },

  // Spells
  { id: 'fireball', name: 'Fireball', elixir: 4, rarity: 'Rare' },
  { id: 'arrows', name: 'Arrows', elixir: 3, rarity: 'Common' },
  { id: 'zap', name: 'Zap', elixir: 2, rarity: 'Common' },
  { id: 'the_log', name: 'The Log', elixir: 2, rarity: 'Legendary' },
  { id: 'poison', name: 'Poison', elixir: 4, rarity: 'Epic' },
  { id: 'lightning', name: 'Lightning', elixir: 6, rarity: 'Epic' },
  { id: 'rocket', name: 'Rocket', elixir: 6, rarity: 'Rare' },
  { id: 'earthquake', name: 'Earthquake', elixir: 3, rarity: 'Rare' },
  { id: 'tornado', name: 'Tornado', elixir: 3, rarity: 'Epic' },
  { id: 'barbarian_barrel', name: 'Barbarian Barrel', elixir: 2, rarity: 'Epic' },
  { id: 'snowball', name: 'Giant Snowball', elixir: 2, rarity: 'Common' },

  // Troops - Cheap/Cycle
  { id: 'skeletons', name: 'Skeletons', elixir: 1, rarity: 'Common' },
  { id: 'ice_spirit', name: 'Ice Spirit', elixir: 1, rarity: 'Common' },
  { id: 'fire_spirit', name: 'Fire Spirit', elixir: 1, rarity: 'Common' },
  { id: 'electro_spirit', name: 'Electro Spirit', elixir: 1, rarity: 'Common' },
  { id: 'goblins', name: 'Goblins', elixir: 2, rarity: 'Common' },
  { id: 'spear_goblins', name: 'Spear Goblins', elixir: 2, rarity: 'Common' },
  { id: 'bats', name: 'Bats', elixir: 2, rarity: 'Common' },
  
  // Troops - Support/Defense
  { id: 'knight', name: 'Knight', elixir: 3, rarity: 'Common' },
  { id: 'archers', name: 'Archers', elixir: 3, rarity: 'Common' },
  { id: 'minions', name: 'Minions', elixir: 3, rarity: 'Common' },
  { id: 'bomber', name: 'Bomber', elixir: 2, rarity: 'Common' },
  { id: 'musketeer', name: 'Musketeer', elixir: 4, rarity: 'Rare' },
  { id: 'valkyrie', name: 'Valkyrie', elixir: 4, rarity: 'Rare' },
  { id: 'mini_pekka', name: 'Mini P.E.K.K.A', elixir: 4, rarity: 'Rare' },
  { id: 'mega_minion', name: 'Mega Minion', elixir: 3, rarity: 'Rare' },
  { id: 'ice_golem', name: 'Ice Golem', elixir: 2, rarity: 'Rare' },
  { id: 'baby_dragon', name: 'Baby Dragon', elixir: 4, rarity: 'Epic' },
  { id: 'dark_prince', name: 'Dark Prince', elixir: 4, rarity: 'Epic' },
  { id: 'prince', name: 'Prince', elixir: 5, rarity: 'Epic' },
  { id: 'witch', name: 'Witch', elixir: 5, rarity: 'Epic' },
  { id: 'executioner', name: 'Executioner', elixir: 5, rarity: 'Epic' },
  { id: 'bowler', name: 'Bowler', elixir: 5, rarity: 'Epic' },
  { id: 'electro_wizard', name: 'Electro Wizard', elixir: 4, rarity: 'Legendary' },
  { id: 'ice_wizard', name: 'Ice Wizard', elixir: 3, rarity: 'Legendary' },
  { id: 'princess', name: 'Princess', elixir: 3, rarity: 'Legendary' },
  { id: 'bandit', name: 'Bandit', elixir: 3, rarity: 'Legendary' },
  { id: 'royal_ghost', name: 'Royal Ghost', elixir: 3, rarity: 'Legendary' },
  { id: 'lumberjack', name: 'Lumberjack', elixir: 4, rarity: 'Legendary' },
  { id: 'night_witch', name: 'Night Witch', elixir: 4, rarity: 'Legendary' },
  { id: 'magic_archer', name: 'Magic Archer', elixir: 4, rarity: 'Legendary' },
  { id: 'pekka', name: 'P.E.K.K.A', elixir: 7, rarity: 'Epic' },
  { id: 'mega_knight', name: 'Mega Knight', elixir: 7, rarity: 'Legendary' },
  { id: 'guards', name: 'Guards', elixir: 3, rarity: 'Epic' },

  // Buildings
  { id: 'cannon', name: 'Cannon', elixir: 3, rarity: 'Common' },
  { id: 'tesla', name: 'Tesla', elixir: 4, rarity: 'Common' },
  { id: 'inferno_tower', name: 'Inferno Tower', elixir: 5, rarity: 'Rare' },
  { id: 'bomb_tower', name: 'Bomb Tower', elixir: 4, rarity: 'Rare' },
  { id: 'tombstone', name: 'Tombstone', elixir: 3, rarity: 'Rare' },
  { id: 'furnace', name: 'Furnace', elixir: 4, rarity: 'Rare' },
  { id: 'goblin_cage', name: 'Goblin Cage', elixir: 4, rarity: 'Rare' },
  { id: 'elixir_collector', name: 'Elixir Collector', elixir: 6, rarity: 'Rare' },
];

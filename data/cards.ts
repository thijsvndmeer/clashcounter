export interface Card {
  id: string;
  name: string;
  elixir: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Champion';
  icon: string;
}

const cardIcon = (slug: string) =>
  `https://cdn.jsdelivr.net/gh/RoyaleAPI/cr-api-assets@master/cards-256/${slug}.png`;

export const CARDS: Card[] = [
  // Win Conditions
  { id: 'hog_rider', name: 'Hog Rider', elixir: 4, rarity: 'Rare', icon: cardIcon('hog-rider') },
  { id: 'giant', name: 'Giant', elixir: 5, rarity: 'Rare', icon: cardIcon('giant') },
  { id: 'golem', name: 'Golem', elixir: 8, rarity: 'Epic', icon: cardIcon('golem') },
  { id: 'lava_hound', name: 'Lava Hound', elixir: 7, rarity: 'Legendary', icon: cardIcon('lava-hound') },
  { id: 'balloon', name: 'Balloon', elixir: 5, rarity: 'Epic', icon: cardIcon('balloon') },
  { id: 'x_bow', name: 'X-Bow', elixir: 6, rarity: 'Epic', icon: cardIcon('x-bow') },
  { id: 'miner', name: 'Miner', elixir: 3, rarity: 'Legendary', icon: cardIcon('miner') },
  { id: 'goblin_barrel', name: 'Goblin Barrel', elixir: 3, rarity: 'Epic', icon: cardIcon('goblin-barrel') },
  { id: 'royal_giant', name: 'Royal Giant', elixir: 6, rarity: 'Common', icon: cardIcon('royal-giant') },
  { id: 'graveyard', name: 'Graveyard', elixir: 5, rarity: 'Legendary', icon: cardIcon('graveyard') },
  { id: 'battle_ram', name: 'Battle Ram', elixir: 4, rarity: 'Rare', icon: cardIcon('battle-ram') },

  // Spells
  { id: 'fireball', name: 'Fireball', elixir: 4, rarity: 'Rare', icon: cardIcon('fireball') },
  { id: 'arrows', name: 'Arrows', elixir: 3, rarity: 'Common', icon: cardIcon('arrows') },
  { id: 'zap', name: 'Zap', elixir: 2, rarity: 'Common', icon: cardIcon('zap') },
  { id: 'the_log', name: 'The Log', elixir: 2, rarity: 'Legendary', icon: cardIcon('log') },
  { id: 'poison', name: 'Poison', elixir: 4, rarity: 'Epic', icon: cardIcon('poison') },
  { id: 'lightning', name: 'Lightning', elixir: 6, rarity: 'Epic', icon: cardIcon('lightning') },
  { id: 'rocket', name: 'Rocket', elixir: 6, rarity: 'Rare', icon: cardIcon('rocket') },
  { id: 'earthquake', name: 'Earthquake', elixir: 3, rarity: 'Rare', icon: cardIcon('earthquake') },
  { id: 'tornado', name: 'Tornado', elixir: 3, rarity: 'Epic', icon: cardIcon('tornado') },
  { id: 'barbarian_barrel', name: 'Barbarian Barrel', elixir: 2, rarity: 'Epic', icon: cardIcon('barbarian-barrel') },
  { id: 'snowball', name: 'Giant Snowball', elixir: 2, rarity: 'Common', icon: cardIcon('snowball') },

  // Troops - Cheap/Cycle
  { id: 'skeletons', name: 'Skeletons', elixir: 1, rarity: 'Common', icon: cardIcon('skeletons') },
  { id: 'ice_spirit', name: 'Ice Spirit', elixir: 1, rarity: 'Common', icon: cardIcon('ice-spirit') },
  { id: 'fire_spirit', name: 'Fire Spirit', elixir: 1, rarity: 'Common', icon: cardIcon('fire-spirit') },
  { id: 'electro_spirit', name: 'Electro Spirit', elixir: 1, rarity: 'Common', icon: cardIcon('electro-spirit') },
  { id: 'goblins', name: 'Goblins', elixir: 2, rarity: 'Common', icon: cardIcon('goblins') },
  { id: 'spear_goblins', name: 'Spear Goblins', elixir: 2, rarity: 'Common', icon: cardIcon('spear-goblins') },
  { id: 'bats', name: 'Bats', elixir: 2, rarity: 'Common', icon: cardIcon('bats') },
  
  // Troops - Support/Defense
  { id: 'knight', name: 'Knight', elixir: 3, rarity: 'Common', icon: cardIcon('knight') },
  { id: 'archers', name: 'Archers', elixir: 3, rarity: 'Common', icon: cardIcon('archers') },
  { id: 'minions', name: 'Minions', elixir: 3, rarity: 'Common', icon: cardIcon('minions') },
  { id: 'bomber', name: 'Bomber', elixir: 2, rarity: 'Common', icon: cardIcon('bomber') },
  { id: 'musketeer', name: 'Musketeer', elixir: 4, rarity: 'Rare', icon: cardIcon('musketeer') },
  { id: 'valkyrie', name: 'Valkyrie', elixir: 4, rarity: 'Rare', icon: cardIcon('valkyrie') },
  { id: 'mini_pekka', name: 'Mini P.E.K.K.A', elixir: 4, rarity: 'Rare', icon: cardIcon('mini-pekka') },
  { id: 'mega_minion', name: 'Mega Minion', elixir: 3, rarity: 'Rare', icon: cardIcon('mega-minion') },
  { id: 'ice_golem', name: 'Ice Golem', elixir: 2, rarity: 'Rare', icon: cardIcon('ice-golem') },
  { id: 'baby_dragon', name: 'Baby Dragon', elixir: 4, rarity: 'Epic', icon: cardIcon('baby-dragon') },
  { id: 'dark_prince', name: 'Dark Prince', elixir: 4, rarity: 'Epic', icon: cardIcon('dark-prince') },
  { id: 'prince', name: 'Prince', elixir: 5, rarity: 'Epic', icon: cardIcon('prince') },
  { id: 'witch', name: 'Witch', elixir: 5, rarity: 'Epic', icon: cardIcon('witch') },
  { id: 'executioner', name: 'Executioner', elixir: 5, rarity: 'Epic', icon: cardIcon('executioner') },
  { id: 'bowler', name: 'Bowler', elixir: 5, rarity: 'Epic', icon: cardIcon('bowler') },
  { id: 'electro_wizard', name: 'Electro Wizard', elixir: 4, rarity: 'Legendary', icon: cardIcon('electro-wizard') },
  { id: 'ice_wizard', name: 'Ice Wizard', elixir: 3, rarity: 'Legendary', icon: cardIcon('ice-wizard') },
  { id: 'princess', name: 'Princess', elixir: 3, rarity: 'Legendary', icon: cardIcon('princess') },
  { id: 'bandit', name: 'Bandit', elixir: 3, rarity: 'Legendary', icon: cardIcon('bandit') },
  { id: 'royal_ghost', name: 'Royal Ghost', elixir: 3, rarity: 'Legendary', icon: cardIcon('royal-ghost') },
  { id: 'lumberjack', name: 'Lumberjack', elixir: 4, rarity: 'Legendary', icon: cardIcon('lumberjack') },
  { id: 'night_witch', name: 'Night Witch', elixir: 4, rarity: 'Legendary', icon: cardIcon('night-witch') },
  { id: 'magic_archer', name: 'Magic Archer', elixir: 4, rarity: 'Legendary', icon: cardIcon('magic-archer') },
  { id: 'pekka', name: 'P.E.K.K.A', elixir: 7, rarity: 'Epic', icon: cardIcon('pekka') },
  { id: 'mega_knight', name: 'Mega Knight', elixir: 7, rarity: 'Legendary', icon: cardIcon('mega-knight') },
  { id: 'guards', name: 'Guards', elixir: 3, rarity: 'Epic', icon: cardIcon('guards') },

  // Buildings
  { id: 'cannon', name: 'Cannon', elixir: 3, rarity: 'Common', icon: cardIcon('cannon') },
  { id: 'tesla', name: 'Tesla', elixir: 4, rarity: 'Common', icon: cardIcon('tesla') },
  { id: 'inferno_tower', name: 'Inferno Tower', elixir: 5, rarity: 'Rare', icon: cardIcon('inferno-tower') },
  { id: 'bomb_tower', name: 'Bomb Tower', elixir: 4, rarity: 'Rare', icon: cardIcon('bomb-tower') },
  { id: 'tombstone', name: 'Tombstone', elixir: 3, rarity: 'Rare', icon: cardIcon('tombstone') },
  { id: 'furnace', name: 'Furnace', elixir: 4, rarity: 'Rare', icon: cardIcon('furnace') },
  { id: 'goblin_cage', name: 'Goblin Cage', elixir: 4, rarity: 'Rare', icon: cardIcon('goblin-cage') },
  { id: 'elixir_collector', name: 'Elixir Collector', elixir: 6, rarity: 'Rare', icon: cardIcon('elixir-collector') },
];

import { GENERATED_DECKS } from './generatedDecks';

export interface Deck {
  id: string;
  name: string;
  cards: string[]; // List of card names
}

export const META_DECKS: Deck[] = GENERATED_DECKS;

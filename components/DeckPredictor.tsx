import React, { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { calculateCardLikelihoods, estimateOpponentHand, predictDecks } from '../utils/deckLogic';
import { CARDS } from '../data/cards';

export const DeckPredictor: React.FC = () => {
  const { seenCards, isOverlayMode, currentElixir, definitiveDeck } = useGameStore();

  // Recompute predictions every whole elixir to mirror in-game timing cadence
  const elixirPulse = Math.floor(currentElixir);

  const predictions = useMemo(() => predictDecks(seenCards), [seenCards]);
  const likelihoods = useMemo(
    () => calculateCardLikelihoods(seenCards, currentElixir),
    [seenCards, elixirPulse]
  );

  const cardLookup = useMemo(() => new Map(CARDS.map((card) => [card.name, card])), []);
  
  // Use only definitive deck for hand simulation
  const handEstimate = useMemo(() => {
    if (!definitiveDeck || definitiveDeck.length < 8) return null;
    return estimateOpponentHand(definitiveDeck, seenCards);
  }, [definitiveDeck, seenCards]);
  
  // COMPLETELY HIDE if deck is not locked or in Overlay Mode
  if (isOverlayMode || !definitiveDeck || definitiveDeck.length < 8) {
      return null;
  }

  // Normal Mode View (Only reached if deck is locked)
  const renderHandCard = (cardName: string, subtitle?: string) => {
    const card = cardLookup.get(cardName);
    const elixir = card?.elixir;
    const elixirIcon = typeof elixir === 'number' ? `${import.meta.env.BASE_URL}${elixir}.webp` : `${import.meta.env.BASE_URL}question_mark.webp`;

    return (
      <div
        key={`${cardName}-${subtitle ?? 'hand'}`}
        className="flex items-center gap-2 bg-gray-900/80 border border-gray-700 rounded p-2"
      >
        <div className="relative">
          <img
            src={card?.icon}
            alt={cardName}
            className="w-10 h-10 rounded object-cover shadow"
            loading="lazy"
          />
          <img
            src={elixirIcon}
            alt="Elixir"
            className="absolute -top-2 -left-2 w-4 h-4 drop-shadow-md z-10"
          />
        </div>
        <div className="flex flex-col leading-tight text-xs text-gray-200">
          <span className="font-semibold">{cardName}</span>
          {subtitle && <span className="text-[10px] text-amber-200 font-semibold">{subtitle}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-900 border-b border-gray-700">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Opponent Hand Analysis</h2>

      {handEstimate ? (
        <div className="rounded-lg border border-gray-700 bg-gray-800/80 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-200 uppercase tracking-wide">
              Estimated Hand
            </span>
            <span className="text-[10px] text-gray-500">
              {definitiveDeck ? 'Confirmed Deck' : 'Based on Likelihood'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {handEstimate.hand.map((cardName) => renderHandCard(cardName))}
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400">
            <span className="uppercase tracking-wide text-gray-500 font-semibold">Next</span>
            {handEstimate.nextCard ? (
              renderHandCard(handEstimate.nextCard, 'Next up')
            ) : (
              <span className="text-gray-500">Waiting for draws...</span>
            )}
          </div>
        </div>
      ) : (
          <div className="text-center p-6 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
              <p className="text-xs text-gray-500">Need more cards to estimate hand rotation...</p>
          </div>
      )}

      {/* Probable Upcoming Cards (Hidden Deck Names) */}
      {!definitiveDeck && predictions[0] && (
          <div className="mt-4">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Predicted upcoming cards:</p>
              <div className="flex flex-wrap gap-1">
                  {predictions[0].missingCards.slice(0, 5).map((card) => (
                      <span key={card} className="bg-gray-800 text-gray-300 text-[10px] px-2 py-1 rounded border border-gray-700">
                          {card}
                          <span className="ml-1 text-amber-200/50">{likelihoods.normalized[card]}%</span>
                      </span>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};
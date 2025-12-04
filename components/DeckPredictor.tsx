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
  const baseDeck = useMemo(
    () => definitiveDeck ?? predictions[0]?.deck.cards ?? [],
    [definitiveDeck, predictions]
  );
  const handEstimate = useMemo(() => {
    if (!baseDeck || baseDeck.length < 4) return null;
    return estimateOpponentHand(baseDeck, seenCards);
  }, [baseDeck, seenCards]);
  
  // COMPLETELY HIDE in Overlay Mode as requested
  if (isOverlayMode) {
      return null;
  }

  // Normal Mode View
  if (seenCards.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 m-4 text-center border border-gray-700">
        <h3 className="text-gray-400 text-sm font-semibold">Waiting for cards...</h3>
        <p className="text-xs text-gray-500 mt-1">Select cards to identify opponent deck</p>
      </div>
    );
  }

  const topMatch = predictions[0];
  const isStrongMatch = topMatch.matchScore >= 4;

  const rankedMissingCards = topMatch.missingCards
    .slice()
    .sort((a, b) => (likelihoods.scores[b] || 0) - (likelihoods.scores[a] || 0));

  const renderHandCard = (cardName: string, subtitle?: string) => {
    const card = cardLookup.get(cardName);
    const elixir = card?.elixir ?? '?';

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
          <span className="absolute -top-2 -right-2 bg-fuchsia-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
            {elixir}
          </span>
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
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Predicted Deck</h2>

      {handEstimate && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/80 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-200 uppercase tracking-wide">
              Opponent Hand (simulated)
            </span>
            <span className="text-[10px] text-gray-500">
              {definitiveDeck ? 'Locked deck' : 'Based on top prediction'}
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
      )}

      {/* Top Prediction */}
      <div className={`rounded-lg p-3 border ${isStrongMatch ? 'bg-green-900/20 border-green-500/50' : 'bg-gray-800 border-gray-700'}`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-white text-sm">{topMatch.deck.name}</h3>
            <span className={`text-xs px-1.5 py-0.5 rounded ${isStrongMatch ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
              {topMatch.matchScore}/8 Match
            </span>
          </div>
          {isStrongMatch && <span className="text-green-400 text-xs font-bold animate-pulse">STRONG MATCH</span>}
        </div>

        {/* Missing Cards Grid */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Likely upcoming cards:</p>
          <div className="flex flex-wrap gap-1">
            {topMatch.missingCards.length === 0 ? (
                <span className="text-xs text-green-400">Full deck rotation known!</span>
            ) : (
                rankedMissingCards.map((card) => (
                <span key={card} className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded border border-gray-600">
                    {card}
                    {likelihoods.normalized[card] !== undefined && (
                      <span className="ml-1 text-[10px] text-amber-200 font-semibold">{likelihoods.normalized[card]}%</span>
                    )}
                </span>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Runner ups */}
      {predictions.length > 1 && (
        <div className="mt-4">
          <h4 className="text-xs text-gray-500 font-semibold mb-2">Other Possibilities</h4>
          <div className="space-y-1">
            {predictions.slice(1, 3).map((pred) => (
              <div key={pred.deck.id} className="flex justify-between items-center text-xs text-gray-400 p-2 hover:bg-gray-800 rounded">
                <span>{pred.deck.name}</span>
                <span className="bg-gray-700 px-1.5 rounded">{pred.matchScore} / 8</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
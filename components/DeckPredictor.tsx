import React, { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { predictDecks } from '../utils/deckLogic';

export const DeckPredictor: React.FC = () => {
  const { seenCards, isOverlayMode } = useGameStore();

  const predictions = useMemo(() => predictDecks(seenCards), [seenCards]);
  
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

  return (
    <div className="p-4 bg-gray-900 border-b border-gray-700">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Predicted Deck</h2>
      
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
                topMatch.missingCards.map((card) => (
                <span key={card} className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded border border-gray-600">
                    {card}
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
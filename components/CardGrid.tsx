import React, { useState, useMemo } from 'react';
import { CARDS, Card } from '../data/cards';
import { useGameStore } from '../store/gameStore';
import { calculateCardLikelihoods } from '../utils/deckLogic';

export const CardGrid: React.FC = () => {
  const { seenCards, addSeenCard, isOverlayMode } = useGameStore();
  const [filter, setFilter] = useState('');

  const { sortedCards, likelihoodRatings } = useMemo(() => {
    // If game hasn't really started (no cards seen), default sort by Elixir -> Name
    if (seenCards.length === 0) {
      return {
        sortedCards: [...CARDS].sort((a, b) => a.elixir - b.elixir || a.name.localeCompare(b.name)),
        likelihoodRatings: {} as Record<string, number>,
      };
    }

    const { scores, normalized } = calculateCardLikelihoods(seenCards);

    const sorted = [...CARDS].sort((a, b) => {
      const weightA = scores[a.name] || 0;
      const weightB = scores[b.name] || 0;

      // Primary Sort: Weight Descending (Most likely first)
      if (weightA !== weightB) {
        return weightB - weightA;
      }

      // Secondary Sort: Elixir Ascending
      if (a.elixir !== b.elixir) {
        return a.elixir - b.elixir;
      }

      // Tertiary Sort: Name
      return a.name.localeCompare(b.name);
    });

    return { sortedCards: sorted, likelihoodRatings: normalized };
  }, [seenCards]);

  const filteredCards = sortedCards.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleCardClick = (card: Card) => {
    addSeenCard(card.name, card.elixir);
    if (filter) setFilter('');
  };

  // OVERLAY MODE LAYOUT (Horizontal Scroll)
  if (isOverlayMode) {
    return (
        <div className="w-full overflow-hidden">
            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto gap-1 p-1 scrollbar-hide snap-x">
                {filteredCards.map((card) => {
                    const isSeen = seenCards.includes(card.name);
                    const rating = likelihoodRatings[card.name];
                    return (
                        <button
                            key={card.id}
                            onClick={() => handleCardClick(card)}
                            className={`
                                flex-shrink-0 flex flex-col items-center justify-center rounded border transition-all active:scale-95 snap-start
                                w-12 h-14
                                ${isSeen
                                    ? 'bg-gray-800/80 border-fuchsia-500/50'
                                    : 'bg-black/40 border-gray-600/50 hover:bg-gray-700/50'}
                            `}
                        >
                             <span className={`font-bold text-[10px] ${isSeen ? 'text-fuchsia-300' : 'text-fuchsia-400'}`}>
                                {card.elixir}
                            </span>
                            <span className="text-[7px] text-center leading-none px-0.5 text-gray-200 mt-0.5 line-clamp-2">
                                {card.name}
                            </span>
                            {rating !== undefined && (
                              <span className="text-[8px] text-amber-200 font-semibold mt-0.5">{rating}%</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
  }

  const renderLikelihoodBadge = (cardName: string) => {
    const rating = likelihoodRatings[cardName];
    if (rating === undefined) return null;

    const intensity = rating >= 80 ? 'text-green-300' : rating >= 50 ? 'text-yellow-200' : 'text-gray-300';

    return (
      <span className={`text-[9px] font-semibold ${intensity}`}>{rating}%</span>
    );
  };

  // NORMAL MODE LAYOUT (Grid)
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
        <div className="p-2 border-b border-gray-800">
            <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-gray-800 text-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-sm px-3 py-2"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {filteredCards.map((card) => {
                  const isSeen = seenCards.includes(card.name);
                  const rating = likelihoodRatings[card.name];
                  return (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        className={`
                            flex flex-col items-center justify-between rounded border transition-all active:scale-95 p-1 aspect-[3/4]
                            ${isSeen 
                                ? 'bg-gray-800 border-fuchsia-500/50 shadow-[0_0_10px_rgba(192,38,211,0.15)]' 
                                : 'bg-gray-800 border-gray-700 hover:border-fuchsia-500 hover:bg-gray-750'}
                        `}
                        >
                            {/* Elixir Cost */}
                            <div className="w-full flex justify-end">
                                <span className={`font-bold drop-shadow-md text-[10px] ${isSeen ? 'text-fuchsia-200' : 'text-fuchsia-300'}`}>
                                    {card.elixir}
                                </span>
                            </div>

                            {/* Card Name */}
                            <div className={`text-center leading-tight font-medium line-clamp-2 text-[10px] ${isSeen ? 'text-white' : 'text-gray-300'}`}>
                                {card.name}
                            </div>

                            {/* Likelihood Badge */}
                            <div className="w-full flex justify-between items-center mt-1">
                              {renderLikelihoodBadge(card.name)}
                              <div className={`w-10 h-1 rounded-full ${
                                rating === undefined
                                  ? 'bg-gray-700'
                                  : rating >= 80
                                    ? 'bg-green-500'
                                    : rating >= 50
                                      ? 'bg-yellow-400'
                                      : 'bg-gray-500'
                              }`} />
                            </div>

                            {/* Rarity Bar */}
                            <div className={`w-full h-1 rounded-full mt-1 ${
                                card.rarity === 'Legendary' ? 'bg-gradient-to-r from-orange-400 to-purple-600' :
                            card.rarity === 'Epic' ? 'bg-purple-600' :
                            card.rarity === 'Rare' ? 'bg-orange-500' :
                            'bg-blue-400'
                        }`}></div>
                    </button>
                  );
                })}
            </div>
            
            {filteredCards.length === 0 && (
                <div className="text-center text-gray-500 mt-10">No cards</div>
            )}
      </div>
    </div>
  );
};
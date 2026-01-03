import React, { useState, useMemo } from 'react';
import { CARDS, Card } from '../data/cards';
import { useGameStore } from '../store/gameStore';
import { calculateCardLikelihoods, estimateOpponentHand, getLastCardElixirCost, predictDecks } from '../utils/deckLogic';

export const CardGrid: React.FC = () => {
  const { seenCards, addSeenCard, isOverlayMode, definitiveDeck, currentElixir } = useGameStore();
  const [filter, setFilter] = useState('');

  // Only refresh likelihood ordering whenever a full elixir is gained to mirror game pacing
  const elixirPulse = Math.floor(currentElixir);

  const isDeckLocked = Boolean(definitiveDeck && definitiveDeck.length === 8);

  const predictions = useMemo(() => predictDecks(seenCards), [seenCards]);

  const { sortedCards, likelihoodRatings } = useMemo(() => {
    // Note: We defer the rotation-based sort for Locked Decks to the 'displayCards' memo later
    // because it depends on 'handEstimate' which is calculated *after* this block.
    // For now, we return a basic Elixir sort for locked decks to satisfy the type requirement here,
    // but the actual rendering will use 'displayCards'.
    
    if (isDeckLocked && definitiveDeck) {
      const order = new Map(definitiveDeck.map((card, idx) => [card, idx]));
      const deckCards = CARDS
        .filter((card) => order.has(card.name))
        .sort((a, b) => {
            if (a.elixir !== b.elixir) return a.elixir - b.elixir;
            return a.name.localeCompare(b.name);
        });

      return {
        sortedCards: deckCards,
        likelihoodRatings: {} as Record<string, number>,
      };
    }

    // If game hasn't really started (no cards seen), default sort by Elixir -> Name
    if (seenCards.length === 0) {
      return {
        sortedCards: [...CARDS].sort((a, b) => a.elixir - b.elixir || a.name.localeCompare(b.name)),
        likelihoodRatings: {} as Record<string, number>,
      };
    }

    const { scores, normalized } = calculateCardLikelihoods(seenCards, currentElixir);

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
  }, [currentElixir, definitiveDeck, elixirPulse, isDeckLocked, seenCards]);

  // Use only definitive deck for hand simulation
  const handEstimate = useMemo(() => {
    if (!isDeckLocked || !definitiveDeck) return null;
    return estimateOpponentHand(definitiveDeck, seenCards);
  }, [isDeckLocked, definitiveDeck, seenCards]);

  const playableCards = useMemo(
    () => {
        if (isDeckLocked) return sortedCards;
        return sortedCards.filter((card) => {
            const cost = card.name === 'Mirror' ? getLastCardElixirCost(seenCards) : card.elixir;
            return cost <= currentElixir + 0.001;
        });
    },
    [currentElixir, sortedCards, isDeckLocked, seenCards]
  );

  const filteredCards = useMemo(() => {
    if (isDeckLocked) return playableCards; // No filter in locked mode

    // Cycle Logic for Unlocked Phase:
    // A card cannot be played again until 4 other cards have been played.
    // We identify the last 4 UNIQUE cards played and hide them.
    const cooldownCards = new Set<string>();
    const uniqueSeenInOrder: string[] = [];
    
    // Iterate backwards to find the most recent plays
    for (let i = seenCards.length - 1; i >= 0; i--) {
        const card = seenCards[i];
        if (!uniqueSeenInOrder.includes(card)) {
            uniqueSeenInOrder.push(card);
        }
        // Once we have 4 unique cards, these are the ones currently cycling back
        if (uniqueSeenInOrder.length >= 4) break;
    }
    
    uniqueSeenInOrder.forEach(c => cooldownCards.add(c));

    return playableCards.filter((card) => {
      // Mirror Rules:
      // 1. Cannot be played as the first card
      // 2. Cannot be played immediately after another Mirror
      if (card.name === 'Mirror') {
          if (seenCards.length === 0) return false;
          if (seenCards[seenCards.length - 1] === 'Mirror') return false;
      }
      
      return !cooldownCards.has(card.name) &&
             card.name.toLowerCase().includes(filter.toLowerCase());
    });
  }, [filter, isDeckLocked, playableCards, seenCards]);

  const displayCards = useMemo(() => {
    // If deck is locked (in either mode), use rotation order
    if (isDeckLocked && handEstimate) {
        const cardMap = new Map(sortedCards.map(c => [c.name, c]));
        
        // 1. Hand cards
        const inHand = handEstimate.hand
            .map(name => cardMap.get(name))
            .filter((c): c is Card => !!c);

        // 2. Draw pile (Next + others)
        const drawPile = handEstimate.drawPile
            .map(name => cardMap.get(name))
            .filter((c): c is Card => !!c);
        
        // Fallback for any cards missing from estimate (shouldn't happen with valid deck)
        const usedNames = new Set([...handEstimate.hand, ...handEstimate.drawPile]);
        const remaining = sortedCards.filter(c => !usedNames.has(c.name));

        return [...inHand, ...drawPile, ...remaining];
    }
    
    // Fallback/Default behavior
    return filteredCards;
  }, [filteredCards, handEstimate, isDeckLocked, isOverlayMode, sortedCards]);

  const handleCardClick = (card: Card) => {
    if (isDeckLocked && definitiveDeck && !definitiveDeck.includes(card.name)) return;
    addSeenCard(card.name, card.elixir);
    if (filter) setFilter('');
  };

  // OVERLAY MODE LAYOUT (Horizontal Scroll)
  if (isOverlayMode) {
    if (isDeckLocked) {
      return (
        <div className="w-full p-1">
          <div className="grid grid-cols-4 gap-1">
            {displayCards.map((originalCard) => {
              const lastCardWasMirror = seenCards.length > 0 && seenCards[seenCards.length - 1] === 'Mirror';
              const isMirrorInvalid = originalCard.name === 'Mirror' && lastCardWasMirror;

              const card = originalCard.name === 'Mirror' 
                ? { ...originalCard, elixir: getLastCardElixirCost(seenCards) } 
                : originalCard;

              const canAfford = currentElixir >= card.elixir;
              const isInHand = handEstimate?.hand.includes(card.name);
              const isNext = handEstimate?.nextCard === card.name;

              let containerStyle = (canAfford && !isMirrorInvalid)
                ? 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                : 'bg-black/40 border-gray-700 opacity-50 grayscale';

              if (isInHand && !isMirrorInvalid) {
                  containerStyle += ' shadow-[0_0_8px_rgba(34,197,94,0.4)] border-green-500/50';
              } else if (isNext && !isMirrorInvalid) {
                  containerStyle += ' shadow-[0_0_8px_rgba(245,158,11,0.4)] border-amber-500/50';
              }

              return (
                <button
                  key={card.id}
                  disabled={isMirrorInvalid}
                  onClick={() => !isMirrorInvalid && handleCardClick(card)}
                  className={`
                    relative flex flex-col items-center justify-center rounded border transition-all active:scale-95
                    w-full aspect-[3/4]
                    ${containerStyle}
                    ${isMirrorInvalid ? 'cursor-not-allowed' : ''}
                  `}
                >
                  {!isMirrorInvalid && (
                      <img
                        src={`${import.meta.env.BASE_URL}${card.elixir}.webp`}
                        alt={`${card.elixir} Elixir`}
                        className="absolute top-0.5 left-0.5 w-3 h-3 md:w-4 md:h-4 drop-shadow-md z-10"
                      />
                  )}
                  <img
                    src={card.icon}
                    alt={card.name}
                    loading="lazy"
                    className="w-12 h-12 object-contain drop-shadow"
                  />
                  <span className="text-[8px] text-center leading-tight px-0.5 text-gray-200 mt-0.5 line-clamp-2">
                    {card.name}
                  </span>
                  
                  {/* Indicators */}
                  {isInHand && !isMirrorInvalid && (
                    <span className="absolute top-0.5 right-0.5 text-[6px] font-bold text-green-300 bg-black/60 px-0.5 rounded backdrop-blur-sm z-10">
                        HAND
                    </span>
                  )}
                  {isNext && !isMirrorInvalid && (
                    <span className="absolute top-0.5 right-0.5 text-[6px] font-bold text-amber-300 bg-black/60 px-0.5 rounded backdrop-blur-sm z-10">
                        NEXT
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
        <div className="w-full overflow-hidden">
            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto gap-1 p-1 scrollbar-hide snap-x">
                {filteredCards.map((originalCard) => {
                    const card = originalCard.name === 'Mirror' 
                        ? { ...originalCard, elixir: getLastCardElixirCost(seenCards) } 
                        : originalCard;

                    const isSeen = seenCards.includes(card.name);
                    const isInHand = handEstimate?.hand.includes(card.name);
                    const isNext = handEstimate?.nextCard === card.name;

                    let containerStyle = isSeen
                        ? 'bg-gray-800/80 border-fuchsia-500/50'
                        : 'bg-black/40 border-gray-600/50 hover:bg-gray-700/50';

                    if (isInHand) {
                        containerStyle = 'bg-gray-800/80 shadow-[0_0_8px_rgba(34,197,94,0.4)] border-green-500/50';
                    } else if (isNext) {
                        containerStyle = 'bg-gray-800/80 shadow-[0_0_8px_rgba(245,158,11,0.4)] border-amber-500/50';
                    }

                    return (
                        <button
                            key={card.id}
                            onClick={() => handleCardClick(card)}
                        className={`
                                relative flex-shrink-0 flex flex-col items-center justify-center rounded border transition-all active:scale-95 snap-start
                                w-12 h-14
                                ${containerStyle}
                            `}
                        >
                            <img
                              src={`${import.meta.env.BASE_URL}${card.elixir}.webp`}
                              alt={`${card.elixir} Elixir`}
                              className="absolute top-0.5 left-0.5 w-3 h-3 drop-shadow-md z-10"
                            />
                            <img
                              src={card.icon}
                              alt={card.name}
                              loading="lazy"
                              className="w-10 h-10 object-contain drop-shadow"
                            />
                            <span className="text-[7px] text-center leading-none px-0.5 text-gray-200 mt-0.5 line-clamp-2">
                                {card.name}
                            </span>
                            {/* Indicators in scroll mode */}
                            {isInHand && (
                                <span className="absolute top-0.5 right-0.5 text-[5px] font-bold text-green-300 bg-black/60 px-0.5 rounded z-10">
                                    H
                                </span>
                            )}
                            {isNext && (
                                <span className="absolute top-0.5 right-0.5 text-[5px] font-bold text-amber-300 bg-black/60 px-0.5 rounded z-10">
                                    N
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
  }

  // NORMAL MODE LAYOUT (Grid)
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
        <div className="p-2 border-b border-gray-800">
          {isDeckLocked ? (
            <div className="flex items-center justify-between text-xs text-amber-200">
              <span>Opponent deck locked</span>
              <span className="text-[10px] text-gray-400">8 cards</span>
            </div>
          ) : (
            <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-800 text-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-sm px-3 py-2"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
          )}
        </div>

        <div className={`${isDeckLocked ? 'p-3' : 'flex-1 overflow-y-auto p-2'}`}>
            <div className={`grid ${isDeckLocked ? 'grid-cols-4 gap-3' : 'grid-cols-4 gap-2'}`}>
                {displayCards.map((originalCard) => {
                  const lastCardWasMirror = seenCards.length > 0 && seenCards[seenCards.length - 1] === 'Mirror';
                  const isMirrorInvalid = originalCard.name === 'Mirror' && lastCardWasMirror;

                  const card = originalCard.name === 'Mirror' 
                    ? { ...originalCard, elixir: getLastCardElixirCost(seenCards) } 
                    : originalCard;
                    
                  const isSeen = seenCards.includes(card.name);
                  const isInHand = handEstimate?.hand.includes(card.name);
                  const isNext = handEstimate?.nextCard === card.name;
                  
                  let containerStyle = (isSeen && !isMirrorInvalid)
                    ? 'bg-gray-800 border-fuchsia-500/50 shadow-[0_0_10px_rgba(192,38,211,0.15)]'
                    : 'bg-gray-800 border-gray-700 hover:border-fuchsia-500 hover:bg-gray-750';

                  if (isMirrorInvalid) {
                      containerStyle = 'bg-gray-800 border-gray-700 opacity-50 grayscale cursor-not-allowed';
                  } else if (isInHand) {
                    containerStyle = 'bg-gray-800 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
                  } else if (isNext) {
                    containerStyle = 'bg-gray-800 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
                  }

                  return (
                    <button
                        key={card.id}
                        disabled={isMirrorInvalid}
                        onClick={() => !isMirrorInvalid && handleCardClick(card)}
                        className={`
                            relative flex flex-col items-center justify-between rounded border transition-all active:scale-95 p-1 aspect-[3/4]
                            ${containerStyle}
                        `}
                        >
                            {/* Elixir Cost */}
                            {!isMirrorInvalid && (
                                <img
                                    src={`${import.meta.env.BASE_URL}${card.elixir}.webp`}
                                    alt={`${card.elixir} Elixir`}
                                    className="absolute top-1 left-1 w-4 h-4 md:w-5 md:h-5 drop-shadow-md z-10"
                                />
                            )}

                            {/* Card Icon */}
                            <div className="flex-1 flex items-center justify-center w-full">
                              <img
                                src={card.icon}
                                alt={card.name}
                                loading="lazy"
                                className={`h-20 w-20 object-contain drop-shadow ${isSeen && !isMirrorInvalid ? 'opacity-90' : 'opacity-100'}`}
                              />
                            </div>

                            {/* Card Name */}
                            <div className={`text-center leading-tight font-medium line-clamp-2 text-[10px] ${isSeen && !isMirrorInvalid ? 'text-white' : 'text-gray-300'}`}>
                                {card.name}
                            </div>
                            
                            {/* Hand Indicators for Main Grid */}
                            {isInHand && !isMirrorInvalid && (
                                <span className="absolute top-1 right-1 text-[7px] font-bold text-green-400 bg-black/40 px-1 rounded">HAND</span>
                            )}
                            {isNext && !isMirrorInvalid && (
                                <span className="absolute top-1 right-1 text-[7px] font-bold text-amber-400 bg-black/40 px-1 rounded">NEXT</span>
                            )}
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

import React, { useState, useMemo, memo } from 'react';
import { CARDS, Card } from '../data/cards';
import { useGameStore } from '../store/gameStore';
import { calculateCardLikelihoods, estimateOpponentHand, getLastCardElixirCost, predictDecks } from '../utils/deckLogic';

// MEMOIZED CARD BUTTON COMPONENT
// This component only re-renders if its specific props change, ignoring parent re-renders.
interface CardButtonProps {
  card: Card;
  isOverlayMode: boolean;
  canAfford: boolean;
  isSeen: boolean;
  isInHand: boolean;
  isNext: boolean;
  isMirrorInvalid: boolean;
  onClick: (card: Card) => void;
}

const CardButton = memo(({
  card,
  isOverlayMode,
  canAfford,
  isSeen,
  isInHand,
  isNext,
  isMirrorInvalid,
  onClick
}: CardButtonProps) => {

  const handleClick = () => {
    if (!isMirrorInvalid) {
      onClick(card);
    }
  };

  // --- OVERLAY MODE STYLE ---
  if (isOverlayMode) {
    let containerStyle = (canAfford && !isMirrorInvalid)
      ? 'bg-[#2B3545] border-[#4B5563] hover:border-gray-400'
      : 'bg-black/60 border-[#374151] opacity-50 grayscale';

    // Override if previously seen (in filtered list) vs simply afford check
    if (isSeen) {
      containerStyle = 'bg-[#2B3545] border-[#4C8BD9] shadow-[0_0_10px_rgba(76,139,217,0.4)]';
    }

    if (isInHand && !isMirrorInvalid) {
      containerStyle = 'bg-[#2B3545] border-[#374151] shadow-[0_0_6px_rgba(76,139,217,0.15)]';
    } else if (isNext && !isMirrorInvalid) {
      containerStyle = 'bg-[#2B3545] border-[#374151] shadow-[0_0_6px_rgba(255,208,0,0.15)]';
    }

    // "Small Mode" specific: Transparent borders request
    const borderClass = isOverlayMode ? '!border-transparent' : '';

    return (
      <button
        disabled={isMirrorInvalid}
        onClick={handleClick}
        className={`
          relative flex-shrink-0 flex flex-col items-center justify-center rounded-lg border-2 transition-all active:scale-95 snap-start
          ${isOverlayMode ? 'w-14 h-16' : 'w-full aspect-[3/4]'} overflow-hidden animate-fade-in
          ${containerStyle}
          ${isMirrorInvalid ? 'cursor-not-allowed' : ''}
          ${borderClass}
        `}
      >
        {!isMirrorInvalid && (
          <img src={`${import.meta.env.BASE_URL}${card.elixir}.webp`} alt={`${card.elixir}`} className="absolute top-0.5 left-0.5 w-4 h-4 drop-shadow-md z-10" />
        )}
        <img src={card.icon} alt={card.name} loading="lazy" className="w-full h-full object-contain drop-shadow-lg" />

        {isInHand && !isMirrorInvalid && (
          <span className="absolute top-0 right-0 text-[7px] font-bold tracking-wide text-white bg-[#4C8BD9]/60 px-1 rounded-bl shadow-sm">HAND</span>
        )}
        {isNext && !isMirrorInvalid && (
          <span className="absolute top-0 right-0 text-[7px] font-bold tracking-wide text-[#1C212E] bg-[#FFD000]/60 px-1 rounded-bl shadow-sm">NEXT</span>
        )}
      </button>
    );
  }

  // --- NORMAL MODE STYLE ---
  let containerStyle = (isSeen && !isMirrorInvalid)
    ? 'bg-[#2B3545] border-[#4C8BD9] shadow-[0_0_10px_rgba(76,139,217,0.3)]'
    : 'bg-[#2B3545] border-[#374151] hover:border-gray-500 hover:bg-[#374151]';

  // Apply greyscale if unaffordable or mirror invalid
  if (isMirrorInvalid || !canAfford) {
    containerStyle = 'bg-[#151B26] border-[#374151] opacity-40 grayscale' + (isMirrorInvalid ? ' cursor-not-allowed' : '');
  } else if (isInHand) {
    containerStyle = 'bg-[#2B3545] border-[#374151] shadow-[0_0_6px_rgba(76,139,217,0.15)]';
  } else if (isNext) {
    containerStyle = 'bg-[#2B3545] border-[#374151] shadow-[0_0_6px_rgba(255,208,0,0.15)]';
  }

  return (
    <button
      disabled={isMirrorInvalid}
      onClick={handleClick}
      className={`
        relative flex flex-col items-center justify-between rounded-xl border-2 transition-all active:scale-95 aspect-[3/4] overflow-hidden animate-fade-in
        ${containerStyle}
      `}
    >
      {/* Elixir Cost */}
      {!isMirrorInvalid && (
        <img src={`${import.meta.env.BASE_URL}${card.elixir}.webp`} alt={`${card.elixir}`} className="absolute top-1 left-1 w-5 h-5 drop-shadow-md z-10" />
      )}

      {/* Card Icon */}
      <div className="flex-1 flex items-center justify-center w-full">
        <img
          src={card.icon}
          alt={card.name}
          loading="lazy"
          className={`w-full h-full object-contain drop-shadow-xl transform transition-transform group-hover:scale-105 ${isSeen && !isMirrorInvalid ? 'opacity-100' : 'opacity-90'}`}
        />
      </div>

      {/* Card Name */}
      <div className="w-full bg-black/40 backdrop-blur-sm rounded-b-lg py-0.5 mt-[-10px] z-10">
        <div className={`text-center leading-tight text-[10px] font-bold uppercase tracking-tight text-white text-shadow-sm line-clamp-1 px-1`}>
          {card.name}
        </div>
      </div>

      {/* Hand Indicators for Main Grid */}
      {isInHand && !isMirrorInvalid && (
        <span className="absolute top-0 right-0 text-[7px] font-bold tracking-wide text-white bg-[#4C8BD9]/60 px-1.5 py-0.5 rounded-bl-md shadow-sm z-20">HAND</span>
      )}
      {isNext && !isMirrorInvalid && (
        <span className="absolute top-0 right-0 text-[7px] font-bold tracking-wide text-[#1C212E] bg-[#FFD000]/60 px-1.5 py-0.5 rounded-bl-md shadow-sm z-20">NEXT</span>
      )}
    </button>
  );
}, (prev, next) => {
  // Custom comparison to ensure strict equality performance
  return (
    prev.card.id === next.card.id &&
    prev.isOverlayMode === next.isOverlayMode &&
    prev.canAfford === next.canAfford &&
    prev.isSeen === next.isSeen &&
    prev.isInHand === next.isInHand &&
    prev.isNext === next.isNext &&
    prev.isMirrorInvalid === next.isMirrorInvalid
  );
});

export const CardGrid: React.FC = React.memo(() => {
  // OPTIMIZED SELECTORS
  // We explicitly select only what we need to avoid re-rendering on every store update (like gameTime)
  const seenCards = useGameStore(state => state.seenCards);
  const addSeenCard = useGameStore(state => state.addSeenCard);
  const isOverlayMode = useGameStore(state => state.isOverlayMode);
  const definitiveDeck = useGameStore(state => state.definitiveDeck);

  // CRITICAL OPTIMIZATION:
  // Subscribe ONLY to the FLOOR of currentElixir.
  // Affordability logic (canAfford = current >= cost) only changes at integer boundaries.
  // This prevents CardGrid from re-rendering 60 times a second.
  const elixirPulse = useGameStore(state => Math.floor(state.currentElixir));

  // We still need the exact value for the render pass? 
  // Actually, CardButton needs canAfford.
  // If we only pass elixirPulse to CardButton logic, canAfford = elixirPulse >= card.elixir
  // This is mathematically correct for integers: 4.5 >= 4 is true, 4 >= 4 is true. 3.9 >= 4 is false.
  // So elixirPulse is SUFFICIENT for the logic! We don't need the float currentElixir.

  const [filter, setFilter] = useState('');

  const isDeckLocked = Boolean(definitiveDeck && definitiveDeck.length === 8);

  // Predictions are purely based on seenCards, so this is already efficient.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _predictions = useMemo(() => predictDecks(seenCards), [seenCards]);

  const { sortedCards } = useMemo(() => {
    if (isDeckLocked && definitiveDeck) {
      const order = new Map(definitiveDeck.map((card, idx) => [card, idx]));
      const deckCards = CARDS
        .filter((card) => order.has(card.name))
        .sort((a, b) => {
          if (a.elixir !== b.elixir) return a.elixir - b.elixir;
          return a.name.localeCompare(b.name);
        });

      return { sortedCards: deckCards };
    }

    if (seenCards.length === 0) {
      return { sortedCards: [...CARDS].sort((a, b) => a.elixir - b.elixir || a.name.localeCompare(b.name)) };
    }

    // Heavy Calculation - Throttled by elixirPulse
    const { scores } = calculateCardLikelihoods(seenCards, elixirPulse);

    const sorted = [...CARDS].sort((a, b) => {
      const weightA = scores[a.name] || 0;
      const weightB = scores[b.name] || 0;
      if (weightA !== weightB) return weightB - weightA;
      if (a.elixir !== b.elixir) return a.elixir - b.elixir;
      return a.name.localeCompare(b.name);
    });

    return { sortedCards: sorted };
  }, [elixirPulse, definitiveDeck, isDeckLocked, seenCards]);

  const handEstimate = useMemo(() => {
    if (!isDeckLocked || !definitiveDeck) return null;
    return estimateOpponentHand(definitiveDeck, seenCards);
  }, [isDeckLocked, definitiveDeck, seenCards]);

  // Filters logic - depends on sortedCards
  const displayCards = useMemo(() => {
    if (isDeckLocked && handEstimate) {
      // Locked Deck Logic
      const cardMap = new Map(sortedCards.map(c => [c.name, c]));
      const inHand = handEstimate.hand.map(name => cardMap.get(name)).filter((c): c is Card => !!c);
      const drawPile = handEstimate.drawPile.map(name => cardMap.get(name)).filter((c): c is Card => !!c);
      const usedNames = new Set([...handEstimate.hand, ...handEstimate.drawPile]);
      const remaining = sortedCards.filter(c => !usedNames.has(c.name));
      const allCards = [...inHand, ...drawPile, ...remaining];

      const mirrorCost = getLastCardElixirCost(seenCards);
      return allCards;
    } else {
      // Normal / Prediction Mode logic
      const playable = sortedCards.filter((card) => {
        // In filtered mode, we show everything but respect cooldowns
        // Use currentElixir for affordability check to be responsive, 
        // but this runs on the already-sorted list so it's cheap.
        return true;
      });

      // Apply filters
      const cooldownCards = new Set<string>();
      const uniqueSeenInOrder: string[] = [];
      for (let i = seenCards.length - 1; i >= 0; i--) {
        const card = seenCards[i];
        if (!uniqueSeenInOrder.includes(card)) uniqueSeenInOrder.push(card);
        if (uniqueSeenInOrder.length >= 4) break;
      }
      uniqueSeenInOrder.forEach(c => cooldownCards.add(c));

      return playable.filter((card) => {
        const cost = card.name === 'Mirror' ? getLastCardElixirCost(seenCards) : card.elixir;

        // In Small Mode (Overlay), we show all cards regardless of cost
        if (!isOverlayMode && cost > elixirPulse) return false;

        if (card.name === 'Mirror') {
          if (seenCards.length === 0) return false;
          if (seenCards[seenCards.length - 1] === 'Mirror') return false;
        }
        if (!isDeckLocked) {
          // Hide cards in cooldown unless explicitly searching
          if (cooldownCards.has(card.name) && !filter) return false;
        }
        return card.name.toLowerCase().includes(filter.toLowerCase());
      });
    }
  }, [sortedCards, isDeckLocked, handEstimate, seenCards, filter, elixirPulse]);


  const handleCardClick = (card: Card) => {
    if (isDeckLocked && definitiveDeck && !definitiveDeck.includes(card.name)) return;
    addSeenCard(card.name, card.elixir);
    if (filter) setFilter('');
  };

  // --- RENDER ---

  // Common Props for logic
  const lastCardWasMirror = seenCards.length > 0 && seenCards[seenCards.length - 1] === 'Mirror';
  const mirrorCost = getLastCardElixirCost(seenCards);

  // Overlay Mode
  if (isOverlayMode) {
    if (isDeckLocked) {
      // Locked Overlay Layout
      return (
        <div className="w-full p-1 bg-clash-bg">
          <div className="grid grid-cols-4 gap-1.5">
            {displayCards.map((originalCard) => {
              const isMirror = originalCard.name === 'Mirror';
              const card = isMirror ? { ...originalCard, elixir: mirrorCost } : originalCard;
              const isMirrorInvalid = isMirror && lastCardWasMirror;

              return (
                <CardButton
                  key={originalCard.id}
                  card={card}
                  isOverlayMode={true}
                  canAfford={elixirPulse >= card.elixir}
                  isSeen={true} // In locked mode, all are visible
                  isInHand={handEstimate?.hand.includes(originalCard.name) ?? false}
                  isNext={handEstimate?.nextCard === originalCard.name}
                  isMirrorInvalid={isMirrorInvalid}
                  onClick={handleCardClick}
                />
              );
            })}
          </div>
        </div>
      );
    }

    // Unlocked Overlay (Predictions) Layout
    // Enable smooth horizontal scrolling and snapping
    return (
      <div className="w-full overflow-hidden bg-clash-bg">
        <div className="flex overflow-x-auto gap-1.5 p-1.5 scrollbar-hide snap-x scroll-smooth">
          {displayCards.map((originalCard) => {
            const isMirror = originalCard.name === 'Mirror';
            const card = isMirror ? { ...originalCard, elixir: mirrorCost } : originalCard;
            const isMirrorInvalid = isMirror && lastCardWasMirror;
            const isSeen = seenCards.includes(originalCard.name);

            return (
              <CardButton
                key={originalCard.id}
                card={card}
                isOverlayMode={true}
                canAfford={elixirPulse >= card.elixir}
                isSeen={isSeen}
                isInHand={false}
                isNext={false}
                isMirrorInvalid={isMirrorInvalid}
                onClick={handleCardClick}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Normal Mode Layout
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-clash-bg">
      {/* Header/Filter */}
      <div className="p-3 border-b-2 border-black/20 bg-clash-panel shadow-md z-10">
        {isDeckLocked ? (
          <div className="flex items-center justify-between text-xs text-[#FFD000] font-heading tracking-wide">
            <span className="drop-shadow-sm">OPPONENT DECK LOCKED</span>
            <span className="text-[#AAB4C5] font-body">8/8 CARDS</span>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              placeholder="Search Cards..."
              className="w-full bg-[#0D1117] text-white rounded-lg border-2 border-[#2B3545] focus:outline-none focus:border-[#4C8BD9] text-sm px-4 py-2 placeholder-gray-500 font-bold"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <svg className="w-4 h-4 absolute right-3 top-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        )}
      </div>

      {/* Grid Area */}
      <div className={`${isDeckLocked ? 'p-4' : 'flex-1 overflow-y-auto p-2'}`}>
        <div className={`grid ${isDeckLocked ? 'grid-cols-4 gap-3' : 'grid-cols-4 gap-2'}`}>
          {displayCards.map((originalCard) => {
            const isMirror = originalCard.name === 'Mirror';
            const card = isMirror ? { ...originalCard, elixir: mirrorCost } : originalCard;
            const isMirrorInvalid = isMirror && lastCardWasMirror;
            const isSeen = seenCards.includes(originalCard.name);

            return (
              <CardButton
                key={originalCard.id}
                card={card}
                isOverlayMode={false}
                canAfford={elixirPulse >= card.elixir}
                isSeen={isDeckLocked || isSeen}
                isInHand={handEstimate?.hand.includes(originalCard.name) ?? false}
                isNext={handEstimate?.nextCard === originalCard.name}
                isMirrorInvalid={isMirrorInvalid}
                onClick={handleCardClick}
              />
            );
          })}
        </div>

        {!isDeckLocked && displayCards.length === 0 && (
          <div className="text-center text-[#4B5563] mt-10 font-bold font-heading text-lg">NO CARDS FOUND</div>
        )}
      </div>
    </div>
  );
});
import React from 'react';
import { useGameStore } from '../store/gameStore';

export const ElixirBar: React.FC = React.memo(() => {
  const isOverlayMode = useGameStore((state) => state.isOverlayMode);

  const barRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);

  // Direct subscription to store for 60fps updates without re-renders
  React.useEffect(() => {
    const update = (currentElixir: number) => {
      const widthPercentage = (currentElixir / 10) * 100;

      // Update Bar Width
      if (barRef.current) {
        barRef.current.style.width = `${widthPercentage}%`;

        // Update color class manually if needed, or keep it simple (gradient is constant usually)
        // For max elixir pulse, we can toggle classes, but let's stick to the gradient for smoothness first
        // If we really need the red pulse, we can do classList manipulation here.
        const isMax = currentElixir >= 10;
        if (isMax) {
          barRef.current.className = `h-full bg-red-500 animate-pulse transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(213,96,224,0.6)]`;
        } else {
          barRef.current.className = `h-full bg-gradient-to-b from-[#D560E0] to-[#A82CC2] transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(213,96,224,0.6)]`;
        }
      }

      // Update Text
      if (textRef.current) {
        textRef.current.textContent = currentElixir.toFixed(1);
      }
    };

    // Initial sync
    update(useGameStore.getState().currentElixir);

    return useGameStore.subscribe((state) => {
      update(state.currentElixir);
    });
  }, [isOverlayMode]); // Re-subscribe if mode changes (element recreation)

  if (isOverlayMode) {
    return (
      <div className="w-full relative h-full flex items-center overflow-hidden bg-clash-bg/50 border-2 border-clash-panel shadow-inner rounded-md">
        {/* Fill Bar */}
        <div className="absolute inset-0 w-full h-full">
          <div
            ref={barRef}
            className="h-full bg-gradient-to-b from-[#D560E0] to-[#A82CC2] transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(213,96,224,0.6)]"
            style={{ width: '50%' }} // Initial value, immediately updated by effect
          />
          {/* Gloss Shine */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-white/30 animate-shimmer opacity-50"></div>
        </div>

        {/* Tick marks */}
        <div className="absolute inset-0 flex justify-between px-0 pointer-events-none">
          {[...Array(11)].map((_, i) => (
            <div key={i} className={`h-full w-[2px] ${i === 0 || i === 10 ? 'bg-transparent' : 'bg-black/20 shadow-sm'}`}></div>
          ))}
        </div>

        {/* Number Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span ref={textRef} className="text-white font-heading text-base drop-shadow-[0_1px_1px_rgba(0,0,0,1)] drop-shadow-[0_0_2px_rgba(0,0,0,1)] z-10">
            5.0
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-clash-bg p-4 border-b-2 border-black/20 shadow-lg">
      <div className="flex justify-between items-end mb-2 px-1">
        <span className="text-[#AAB4C5] text-xs font-bold uppercase tracking-wider font-heading">Opponent Elixir</span>
        <span ref={textRef} className={`text-2xl font-heading text-stroke-black text-white drop-shadow-md`}>
          5.0
        </span>
      </div>

      {/* Bar container */}
      <div className="h-8 w-full bg-clash-bg/50 rounded-lg overflow-hidden relative border-2 border-clash-panel shadow-inner">
        {/* Fill */}
        <div
          ref={barRef}
          className="h-full bg-gradient-to-b from-[#D560E0] to-[#A82CC2] transition-all duration-75 ease-linear relative"
          style={{ width: '50%' }}
        >
          {/* Gloss Shine */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-white/30 animate-shimmer opacity-50"></div>
        </div>

        {/* Tick marks */}
        <div className="absolute inset-0 flex justify-between px-0 pointer-events-none">
          {[...Array(11)].map((_, i) => (
            <div key={i} className={`h-full w-[2px] ${i === 0 || i === 10 ? 'bg-transparent' : 'bg-black/20 shadow-sm'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
});
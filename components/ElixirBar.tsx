import React from 'react';
import { useGameStore } from '../store/gameStore';

export const ElixirBar: React.FC = () => {
  const { currentElixir, isOverlayMode } = useGameStore();

  // Calculate percentage width (0 to 100)
  const widthPercentage = (currentElixir / 10) * 100;
  
  // Warning color when at max
  const isMax = currentElixir >= 10;
  const barColor = isMax ? 'bg-red-500 animate-pulse' : 'bg-fuchsia-600';

  if (isOverlayMode) {
    return (
      <div className="w-full relative h-6 flex items-center bg-black/40 backdrop-blur-sm">
        {/* Background Bar */}
        <div className="absolute inset-0 w-full h-full">
            <div 
                className={`h-full ${barColor} transition-all duration-100 ease-linear opacity-90`}
                style={{ width: `${widthPercentage}%` }}
            />
        </div>
        
        {/* Ticks */}
        <div className="absolute inset-0 flex justify-between px-0 pointer-events-none">
            {[...Array(11)].map((_, i) => (
                <div key={i} className={`h-full w-[1px] ${i === 0 || i === 10 ? 'bg-transparent' : 'bg-black/30'}`}></div>
            ))}
        </div>

        {/* Number Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <span className="text-white font-black text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {currentElixir.toFixed(1)}
             </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 p-4 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
      <div className="flex justify-between items-end mb-1">
        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Opponent Elixir</span>
        <span className={`text-2xl font-black ${isMax ? 'text-red-500' : 'text-fuchsia-400'}`}>
          {currentElixir.toFixed(1)}
        </span>
      </div>

      {/* Bar container */}
      <div className="h-6 w-full bg-gray-800 rounded-full overflow-hidden relative border border-gray-700">
        {/* Fill */}
        <div 
          className={`h-full ${barColor} transition-all duration-100 ease-linear`}
          style={{ width: `${widthPercentage}%` }}
        />
        
        {/* Tick marks for individual elixir points */}
        <div className="absolute inset-0 flex justify-between px-0">
            {[...Array(11)].map((_, i) => (
                <div key={i} className={`h-full w-[1px] ${i === 0 || i === 10 ? 'bg-transparent' : 'bg-black/30'}`}></div>
            ))}
        </div>
      </div>
    </div>
  );
};
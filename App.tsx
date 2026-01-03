import React, { useEffect, useState, useRef } from 'react';
import { ElixirBar } from './components/ElixirBar';
import { DeckPredictor } from './components/DeckPredictor';
import { CardGrid } from './components/CardGrid';
import { useGameStore } from './store/gameStore';

const App: React.FC = () => {
  const { tick, isPlaying, resetGame, togglePlay, isOverlayMode, toggleOverlayMode, definitiveDeck, gameTime } = useGameStore();

  const isDeckLocked = Boolean(definitiveDeck && definitiveDeck.length === 8);

  // The Game Loop
  useEffect(() => {
    let lastTime = Date.now();
    const intervalId = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTime;
      const deltaSec = deltaMs / 1000;
      
      // Update lastTime for next tick
      lastTime = now;

      // Only tick if playing to avoid accumulators when paused (though store checks isPlaying too)
      if (isPlaying) {
        tick(deltaSec);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [tick, isPlaying]);

  // Draggable Logic for Overlay Mode
  const [position, setPosition] = useState({ x: 20, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only allow dragging from the header/elixir bar area
    const target = e.target as HTMLElement;
    
    // Check if we are clicking a button (Close, Start)
    if (target.closest('button')) return;

    // Check if the click is within the header row (the first child of the draggable container)
    // We can check if the target is inside the div with the elixir bar
    const header = e.currentTarget.querySelector('.drag-handle');
    if (header && !header.contains(target)) return;

    setIsDragging(true);
    // e.clientX is global, position.x is current offset
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const formatGameTime = (seconds: number) => {
    // Total duration cap logic
    // 0-3 mins (180s): Regular Time
    // 3-5 mins (300s): Overtime
    const isOvertime = seconds >= 180;
    
    // Remaining seconds calculation
    let remaining = 0;
    if (!isOvertime) {
        remaining = 180 - seconds;
    } else {
        remaining = 300 - seconds;
    }
    
    // Clamp to 0
    if (remaining < 0) remaining = 0;

    const m = Math.floor(remaining / 60);
    const s = Math.floor(remaining % 60);
    return {
        text: `${m}:${s.toString().padStart(2, '0')}`,
        isOvertime,
        multiplier: seconds >= 240 ? 3 : seconds >= 120 ? 2 : 1
    };
  };

  const timerDisplay = formatGameTime(gameTime);

  // --- OVERLAY MODE RENDER ---
  if (isOverlayMode) {
    return (
      // Full-screen transparent overlay so the widget floats above the game on Android
      <div className="fixed inset-0 z-50 bg-transparent pointer-events-none">
        <div
            className={`
              absolute flex flex-col w-64 rounded-xl border bg-black/85 backdrop-blur-md shadow-2xl overflow-hidden touch-none pointer-events-auto transition-colors duration-500
              ${isDeckLocked 
                ? 'border-fuchsia-500 shadow-[0_0_15px_rgba(192,38,211,0.3)]' 
                : 'border-gray-600/50'}
            `}
            style={{
                left: position.x,
                top: position.y,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {/* Row 1: Integrated Elixir Bar & Controls */}
            <div className="drag-handle relative h-8 bg-gray-800/60 border-b border-gray-700/50 select-none overflow-hidden">
                {/* Integrated Elixir Bar */}
                <div className="absolute inset-0">
                  <ElixirBar />
                </div>
                
                {/* Header Controls (Overlaid) */}
                <div className="relative z-10 h-full flex justify-between items-center px-2 pointer-events-none">
                    {/* Left: Start Button OR Timer */}
                    <div className="flex items-center gap-2 pointer-events-auto">
                        {!isPlaying ? (
                             <button
                                onClick={togglePlay}
                                className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-400 shadow-md transition-all active:scale-95"
                                aria-label="Start Game"
                             >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 ml-0.5">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                             </button>
                        ) : (
                            <div className="flex items-center gap-1.5 bg-black/40 rounded px-1.5 py-0.5 backdrop-blur-sm">
                                <span className={`text-[10px] font-mono font-bold ${timerDisplay.isOvertime ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                    {timerDisplay.text}
                                </span>
                                {timerDisplay.multiplier > 1 && (
                                    <span className="text-[9px] font-black text-amber-400 leading-none">
                                        {timerDisplay.multiplier}x
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Close Overlay */}
                    <button
                      onClick={toggleOverlayMode}
                      className="w-6 h-6 rounded-full bg-black/40 text-gray-100 flex items-center justify-center text-[10px] font-bold pointer-events-auto hover:bg-black/60 transition-colors"
                      aria-label="Close overlay"
                    >
                      ✕
                    </button>
                </div>
            </div>

            {/* Row 2: Cards (Horizontal) */}
            <CardGrid />
            
            {/* DeckPredictor is hidden in this mode */}
        </div>
      </div>
    );
  }

  // --- NORMAL MODE RENDER ---
  return (
    <div className="h-screen w-full flex flex-col bg-gray-950 mx-auto shadow-2xl overflow-hidden relative max-w-lg">
      
      {/* Header / Controls */}
      <header className="flex justify-between items-center bg-gray-900 border-b border-gray-800 p-3">
        <div className="flex flex-col">
            <h1 className="text-fuchsia-500 font-black italic tracking-tighter text-lg leading-none">
                CR <span className="text-white not-italic font-normal">TRACKER</span>
            </h1>
            {isPlaying && (
                 <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                    {timerDisplay.text} {timerDisplay.isOvertime ? '(OT)' : ''} {timerDisplay.multiplier > 1 ? `• ${timerDisplay.multiplier}x` : ''}
                 </span>
            )}
        </div>
       
        <div className="flex gap-2 justify-end">
            <div className="flex gap-1">
                 {/* Play/Pause */}
                <button 
                    onClick={togglePlay}
                    className={`rounded font-bold uppercase transition-colors flex items-center justify-center px-3 py-1 text-xs ${isPlaying ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'}`}
                >
                    {isPlaying ? 'Pause' : 'Start'}
                </button>

                {/* Reset */}
                <button 
                    onClick={resetGame}
                    className="rounded bg-gray-700 text-gray-300 font-bold uppercase hover:bg-gray-600 flex items-center justify-center px-3 py-1 text-xs"
                >
                    Reset
                </button>
            </div>

            {/* Toggle Overlay Mode */}
            <button
                onClick={toggleOverlayMode}
                className="rounded border border-gray-700 text-gray-400 hover:text-white flex items-center justify-center px-3 py-1"
                title="Compact Mode"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                </svg>
            </button>
        </div>
      </header>

      {/* Main Section 1: Elixir Bar (Sticky Top) */}
      <div className="flex-none flex flex-col">
        <ElixirBar />
      </div>

      {/* Main Section 2: Card Grid (Scrollable) */}
      <CardGrid />
      
      <div className="hidden md:block absolute bottom-2 right-2 text-[10px] text-gray-600">
        v1.0 • Built with React & Zustand
      </div>
    </div>
  );
};

export default App;
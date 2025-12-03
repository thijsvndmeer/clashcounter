import React, { useEffect, useState, useRef } from 'react';
import { ElixirBar } from './components/ElixirBar';
import { DeckPredictor } from './components/DeckPredictor';
import { CardGrid } from './components/CardGrid';
import { useGameStore } from './store/gameStore';

const App: React.FC = () => {
  const { tick, isPlaying, resetGame, togglePlay, isOverlayMode, toggleOverlayMode } = useGameStore();

  // The Game Loop
  useEffect(() => {
    const intervalMs = 100;
    const intervalSec = intervalMs / 1000;

    const intervalId = setInterval(() => {
      tick(intervalSec);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [tick]);

  // Draggable Logic for Overlay Mode
  const [position, setPosition] = useState({ x: 20, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only allow dragging from header/empty areas to avoid conflict with buttons
    // But for simplicity, we allow dragging the header area
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON') return;

    setIsDragging(true);
    // e.clientX is global, position.x is current offset
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    target.setPointerCapture(e.pointerId);
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


  // --- OVERLAY MODE RENDER ---
  if (isOverlayMode) {
    return (
      // Transparent root container that covers the screen but allows pointer events to pass through 
      // where the widget isn't. However, in a web view, usually the whole body is the view.
      // We make the background transparent.
      <div className="min-h-screen w-full bg-transparent overflow-hidden">
        <div 
            className="fixed flex flex-col w-64 rounded-xl border border-gray-600/50 bg-black/80 backdrop-blur-md shadow-2xl overflow-hidden touch-none"
            style={{ 
                left: position.x, 
                top: position.y,
                cursor: isDragging ? 'grabbing' : 'grab' 
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {/* Row 1: Controls (Drag Handle) */}
            <div className="flex justify-between items-center p-1.5 bg-gray-800/50 border-b border-gray-700/50 select-none">
                <div className="flex gap-2">
                    {/* Play/Pause */}
                    <button 
                        onClick={togglePlay}
                        className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${isPlaying ? 'bg-yellow-600/90 text-white' : 'bg-green-600/90 text-white'}`}
                    >
                        {isPlaying ? '||' : '▶'}
                    </button>

                    {/* Reset */}
                    <button 
                        onClick={resetGame}
                        className="w-6 h-6 rounded bg-gray-600/90 text-gray-200 flex items-center justify-center text-[10px] font-bold"
                    >
                        ↺
                    </button>
                </div>
                
                {/* Drag Indicator */}
                <div className="flex gap-0.5 opacity-50">
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                </div>
            </div>

            {/* Row 2: Elixir Bar */}
            <ElixirBar />

            {/* Row 3: Cards (Horizontal) */}
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
        <h1 className="text-fuchsia-500 font-black italic tracking-tighter text-lg">
            CR <span className="text-white not-italic font-normal">TRACKER</span>
        </h1>
       
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

      {/* Main Section 1: Elixir & Deck Prediction (Sticky Top) */}
      <div className="flex-none flex flex-col">
        <ElixirBar />
        <DeckPredictor />
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
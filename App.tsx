import React, { useEffect, useState, useRef } from 'react';
import { ElixirBar } from './components/ElixirBar';
import { CardGrid } from './components/CardGrid';
import { useGameStore } from './store/gameStore';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

interface OverlayPlugin {
  start(options?: { url?: string }): Promise<void>;
  stop(): Promise<void>;
  resize(options: { width: number; height: number }): Promise<void>;
}

const Overlay = registerPlugin<OverlayPlugin>('Overlay');

const App: React.FC = () => {
  const { tick, isPlaying, resetGame, togglePlay, isOverlayMode, toggleOverlayMode, definitiveDeck, gameTime, setOverlayMode, overlayScale, setOverlayScale } = useGameStore();

  // Handle URL params for Overlay Mode (Native)
  useEffect(() => {
    const checkMode = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'overlay' || window.location.hash === '#overlay') {
        setOverlayMode(true);
      }
    };

    checkMode();
    window.addEventListener('hashchange', checkMode);
    return () => window.removeEventListener('hashchange', checkMode);
  }, [setOverlayMode]);

  useEffect(() => {
    if (isOverlayMode) {
      document.body.classList.add('is-overlay-mode');
      document.documentElement.classList.add('is-overlay-mode');
    } else {
      document.body.classList.remove('is-overlay-mode');
      document.documentElement.classList.remove('is-overlay-mode');
    }
  }, [isOverlayMode]);


  // Enhanced Toggle for Nativezz
  const handleToggleOverlay = async () => {
    // Check for direct Android Overlay interface (running inside the overlay)
    const androidOverlay = (window as any).AndroidOverlay;
    if (androidOverlay && androidOverlay.close) {
      androidOverlay.close();
      return;
    }

    if (Capacitor.isNativePlatform()) {
      if (isOverlayMode) {
        try {
          await Overlay.stop();
        } catch (e) {
          console.error("Failed to stop overlay", e);
        }
      } else {
        try {
          await Overlay.start({});
          await CapApp.minimizeApp();
        } catch (e) {
          console.error("Failed to start overlay", e);
          alert("Overlay permission needed or error: " + e);
        }
      }
    } else {
      toggleOverlayMode(); // Web behavior
    }
  };

  const isDeckLocked = Boolean(definitiveDeck && definitiveDeck.length === 8);

  // The Game Loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const loop = (time: number) => {
      const deltaMs = time - lastTime;
      // Cap delta to prevent huge jumps if tab was backgrounded or spiral of death
      const safeDeltaMs = Math.min(deltaMs, 100);
      const deltaSec = safeDeltaMs / 1000;

      lastTime = time;

      if (isPlaying) {
        tick(deltaSec);
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, [tick, isPlaying]);


  const formatGameTime = (seconds: number) => {
    const isOvertime = seconds >= 180;
    let remaining = 0;
    if (!isOvertime) {
      remaining = 180 - seconds;
    } else {
      remaining = 300 - seconds;
    }
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

  // --- GESTURE LOGIC (PointerEvents) ---
  const activePointers = useRef<Map<number, { x: number, y: number }>>(new Map());
  const initialPinchDist = useRef<number | null>(null);
  const initialScale = useRef<number>(1);

  const handleGestureStart = (e: React.PointerEvent) => {
    // Buttons stop propagation, so we don't need to filter here heavily
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size === 2) {
      const points = Array.from(activePointers.current.values());
      const p1 = points[0] as { x: number, y: number };
      const p2 = points[1] as { x: number, y: number };
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      initialPinchDist.current = dist;
      initialScale.current = overlayScale;
    }
  };

  const handleGestureMove = (e: React.PointerEvent) => {
    if (activePointers.current.has(e.pointerId)) {
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.current.size === 2 && initialPinchDist.current) {
        const points = Array.from(activePointers.current.values());
        const p1 = points[0] as { x: number, y: number };
        const p2 = points[1] as { x: number, y: number };
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

        // Calculate new scale
        const scaleChange = dist / initialPinchDist.current;
        const newScale = initialScale.current * scaleChange;

        // Update store (with limits)
        setOverlayScale(newScale);
      }
    }
  };

  const handleGestureEnd = (e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (activePointers.current.size < 2) {
      initialPinchDist.current = null;
    }
  };

  // --- OVERLAY RESIZE ---
  const scaledElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOverlayMode && scaledElementRef.current) {
      const updateSize = () => {
        if (scaledElementRef.current) {
          const dpr = window.devicePixelRatio || 1;
          const width = Math.ceil(scaledElementRef.current.offsetWidth * overlayScale * dpr);
          const height = Math.ceil(scaledElementRef.current.offsetHeight * overlayScale * dpr);

          // Direct Interface Check (ALWAYS check this first, bypasses Capacitor check)
          const androidOverlay = (window as any).AndroidOverlay;
          if (androidOverlay && androidOverlay.resize) {
            // alert(`Resize to: ${width}x${height}`);
            androidOverlay.resize(width, height);
            // Update a global var for debug text if we want, or just rely on the bridge status
          }

          if (Capacitor.isNativePlatform()) {
            Overlay.resize({ width, height }).catch(e => {
              // Ignore standard plugin errors in overlay mode if bridge missing
            });
          }
        }
      };

      // Create ResizeObserver to watch for content size changes
      const resizeObserver = new ResizeObserver(() => {
        // Debounce slightly or just call
        requestAnimationFrame(updateSize);
      });

      resizeObserver.observe(scaledElementRef.current);

      // Also call immediately to ensure size is correct on mount/scale change
      updateSize();

      return () => resizeObserver.disconnect();
    }
  }, [isOverlayMode, overlayScale]);


  // --- OVERLAY MODE RENDER ---
  if (isOverlayMode) {
    return (
      <div
        className="h-auto min-h-0 bg-transparent overflow-hidden"
        style={{ touchAction: 'none', width: 'fit-content', height: 'fit-content' }}
        onPointerDown={handleGestureStart}
        onPointerMove={handleGestureMove}
        onPointerUp={handleGestureEnd}
        onPointerCancel={handleGestureEnd}
        onPointerLeave={handleGestureEnd}
      >
        <div
          ref={scaledElementRef}
          className={`
              flex flex-col w-full rounded-2xl border overflow-hidden
          ${isDeckLocked ? 'border-[#4C8BD9]/50 shadow-[0_0_20px_rgba(76,139,217,0.2)]' : 'border-[#2D3748] shadow-2xl'}
          bg-[#1C212E]/90 backdrop-blur-xl
            `}
          style={{
            transform: `scale(${overlayScale})`,
            transformOrigin: 'top left',
            width: '260px',
          }}
        >

          {/* Row 1: Integrated Elixir Bar & Controls */}
          <div className="relative h-8 bg-[#151B26] border-b-2 border-[#0D1117] select-none overflow-hidden touch-auto">
            {/* Integrated Elixir Bar */}
            <div className="absolute inset-0">
              <ElixirBar />
            </div>

            {/* Header Controls (Overlaid) */}
            <div className="relative z-10 h-full flex justify-between items-center px-3">
              {/* Left: Start/Pause Button OR Play State */}
              <div className="flex items-center gap-2">
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={isPlaying ? resetGame : togglePlay}
                  className={`
                      h-7 px-3 rounded-full flex items-center justify-center gap-1.5 
                      text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95
                      ${isPlaying
                      ? 'bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20'
                      : 'bg-[#4C8BD9] border border-[#1A3C6E] text-white hover:brightness-110 shadow-[#4C8BD9]/20'
                    }
                    `}
                >
                  {isPlaying ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                      <span>{timerDisplay.text}</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span>Start</span>
                    </>
                  )}
                </button>

                {isPlaying && timerDisplay.multiplier > 1 && (
                  <div className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40">
                    <span className="text-[10px] font-black text-purple-300 leading-none">
                      {timerDisplay.multiplier}x
                    </span>
                  </div>
                )}
              </div>

              {/* Close Overlay */}
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleToggleOverlay}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors active:scale-95"
                aria-label="Close overlay"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Row 2: Cards (Horizontal) */}
          <div className="bg-transparent">
            <CardGrid />
          </div>
        </div>
      </div >
    );
  }

  // --- NORMAL MODE RENDER ---
  return (
    <div className="h-screen w-full flex flex-col bg-[#1C212E] mx-auto shadow-2xl overflow-hidden relative max-w-lg font-body text-white">

      {/* Header / Controls */}
      <header className="flex justify-between items-center bg-[#151B26] border-b-2 border-[#0D1117] p-3 pt-16 shadow-lg z-20">
        <div className="flex flex-col">
          <h1 className="text-white font-heading tracking-wide text-xl text-stroke-black leading-none drop-shadow-md">
            CR TRACKER
          </h1>
          {isPlaying && (
            <span className="text-[11px] text-gray-400 font-bold mt-1 tracking-wide">
              {timerDisplay.text} {timerDisplay.isOvertime ? '(OT)' : ''} {timerDisplay.multiplier > 1 ? `• ${timerDisplay.multiplier}x` : ''}
            </span>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <div className="flex gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className={`btn-clash-yellow px-4 py-1 text-sm font-bold rounded-lg`}
            >
              {isPlaying ? 'Pause' : 'Start'}
            </button>

            {/* Reset */}
            <button
              onClick={resetGame}
              className="btn-clash-red px-3 py-1 text-sm font-bold rounded-lg"
            >
              Reset
            </button>
          </div>

          {/* Toggle Overlay Mode */}
          <button
            onClick={handleToggleOverlay}
            className="btn-clash px-3 py-1 flex items-center justify-center rounded-lg"
            title="Compact Mode"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Section 1: Elixir Bar (Sticky Top) */}
      <div className="flex-none flex flex-col z-10 bg-[#1C212E]">
        <ElixirBar />
      </div>

      {/* Main Section 2: Card Grid (Scrollable) */}
      <CardGrid />

      <div className="hidden md:block absolute bottom-2 right-2 text-[10px] text-gray-500 font-bold opacity-50">
        v2.0 • Data Driven
      </div>
    </div>
  );
};

export default App;

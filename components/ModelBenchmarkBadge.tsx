import React, { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { MODEL_BENCHMARK_REPORT, getBenchmarkForSeenCards } from '../data/modelBenchmarks';

export const ModelBenchmarkBadge: React.FC = () => {
  const seenCards = useGameStore((state) => state.seenCards);
  const isOverlayMode = useGameStore((state) => state.isOverlayMode);

  const uniqueSeenCount = useMemo(() => new Set(seenCards).size, [seenCards]);
  const stage = getBenchmarkForSeenCards(uniqueSeenCount || 1);

  if (isOverlayMode) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute bottom-2 right-2 text-[10px] text-gray-500 font-semibold opacity-55 text-right leading-tight">
      <div>
        ML Bench · seen {Math.min(uniqueSeenCount, 8)}/8 · Top-1 {stage.top1.toFixed(1)}% · Top-3 {stage.top3.toFixed(1)}%
      </div>
      <div className="text-[9px] text-gray-600">
        Sim {MODEL_BENCHMARK_REPORT.simulatedMatches.toLocaleString()} · Bayes Δ{MODEL_BENCHMARK_REPORT.bayesianDeltaTop1Pp.toFixed(1)}pp
      </div>
    </div>
  );
};

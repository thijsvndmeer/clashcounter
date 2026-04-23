export interface StageBenchmark {
  seenCards: number;
  top1: number;
  top3: number;
  mrr: number;
}

export interface ModelBenchmarkReport {
  evaluatedAt: string;
  simulatedMatches: number;
  candidateDecks: number;
  verdict: string;
  bayesianDeltaTop1Pp: number;
  stages: StageBenchmark[];
}

export const MODEL_BENCHMARK_REPORT: ModelBenchmarkReport = {
  evaluatedAt: '2026-04-23',
  simulatedMatches: 10000,
  candidateDecks: 1000,
  verdict: 'Current frequency-ordered match-count ranking is already near-optimal on available meta-deck data.',
  bayesianDeltaTop1Pp: 0,
  stages: [
    { seenCards: 1, top1: 25.08, top3: 42.76, mrr: 37.72 },
    { seenCards: 2, top1: 45.35, top3: 68.01, mrr: 59.09 },
    { seenCards: 3, top1: 61.8, top3: 81.56, mrr: 73.04 },
    { seenCards: 4, top1: 72.65, top3: 88.69, mrr: 81.43 },
    { seenCards: 5, top1: 80.13, top3: 92.73, mrr: 86.91 },
    { seenCards: 6, top1: 86.53, top3: 95.7, mrr: 91.36 },
    { seenCards: 7, top1: 92.95, top3: 97.77, mrr: 95.51 },
    { seenCards: 8, top1: 98.87, top3: 98.95, mrr: 99.04 },
  ],
};

export const getBenchmarkForSeenCards = (seenCards: number): StageBenchmark => {
  const clamped = Math.min(8, Math.max(1, seenCards));
  return (
    MODEL_BENCHMARK_REPORT.stages.find((stage) => stage.seenCards === clamped) ??
    MODEL_BENCHMARK_REPORT.stages[0]
  );
};

import type { BenchmarkSession, ScalingBenchmarkResult } from "@/types/benchmark";
import {
  getItem,
  setItem,
} from "./storage";
import { reviveBenchmarkSession, reviveScalingResult } from "./dateReviver";

export const BENCHMARK_HISTORY_KEY = "cryptoviz-benchmark-history";
export const SCALING_HISTORY_KEY = "cryptoviz-scaling-history";
export const MAX_BENCHMARK_HISTORY = 20;
export const MAX_SCALING_HISTORY = 20;

export function loadBenchmarkHistory(): BenchmarkSession[] {
  const parsed = getItem<BenchmarkSession[]>(
    BENCHMARK_HISTORY_KEY,
    [],
    (val): val is BenchmarkSession[] => Array.isArray(val),
  );
  return parsed.map(reviveBenchmarkSession);
}

export function saveBenchmarkHistory(sessions: BenchmarkSession[]): void {
  setItem(
    BENCHMARK_HISTORY_KEY,
    sessions.slice(0, MAX_BENCHMARK_HISTORY),
  );
}

export function addBenchmarkSession(
  sessions: BenchmarkSession[],
  session: BenchmarkSession,
): BenchmarkSession[] {
  return [session, ...sessions.filter((item) => item.id !== session.id)].slice(
    0,
    MAX_BENCHMARK_HISTORY,
  );
}

export { formatBytes } from "@/lib/formatters";

export function loadScalingHistory(): ScalingBenchmarkResult[] {
  const parsed = getItem<ScalingBenchmarkResult[]>(
    SCALING_HISTORY_KEY,
    [],
    (val): val is ScalingBenchmarkResult[] => Array.isArray(val),
  );
  return parsed.map(reviveScalingResult);
}

export function saveScalingHistory(results: ScalingBenchmarkResult[]): void {
  setItem(
    SCALING_HISTORY_KEY,
    results.slice(0, MAX_SCALING_HISTORY),
  );
}

export function addScalingResult(
  history: ScalingBenchmarkResult[],
  result: ScalingBenchmarkResult,
): ScalingBenchmarkResult[] {
  return [result, ...history.filter((item) => item.cipherId !== result.cipherId)].slice(
    0,
    MAX_SCALING_HISTORY,
  );
}

/**
 * Performance profiling types for cipher performance measurement and regression testing.
 * This module provides the foundational types for the performance profiling framework.
 */

export type PerformanceMetric = 'executionTime' | 'memoryUsage' | 'throughput' | 'latency'

export interface PerformanceProfile {
  cipherId: string
  cipherName: string
  category: 'classical' | 'symmetric' | 'asymmetric' | 'hash'
  timestamp: Date
  environment: EnvironmentInfo
  metrics: PerformanceMetrics
  operation: 'encrypt' | 'decrypt' | 'hash'
  inputSize: number
  iterations: number
}

export interface PerformanceMetrics {
  executionTime: ExecutionTimeMetrics
  memoryUsage: MemoryMetrics
  throughput?: ThroughputMetrics
  latency?: LatencyMetrics
}

export interface ExecutionTimeMetrics {
  averageMs: number
  minMs: number
  maxMs: number
  medianMs: number
  p95Ms: number
  p99Ms: number
  stdDevMs: number
  totalMs: number
}

export interface MemoryMetrics {
  averageBytes: number
  minBytes: number
  maxBytes: number
  peakBytes: number
  baselineBytes: number
}

export interface ThroughputMetrics {
  bytesPerSecond: number
  operationsPerSecond: number
  formatted: string
}

export interface LatencyMetrics {
  averageMs: number
  p95Ms: number
  p99Ms: number
}

export interface EnvironmentInfo {
  nodeVersion?: string
  platform: string
  arch: string
  cpuCount: number
  totalMemory: number
  runtime: 'node' | 'browser'
  userAgent?: string
}

export interface PerformanceBaseline {
  cipherId: string
  version: string
  commitHash: string
  timestamp: Date
  metrics: PerformanceMetrics
  environment: EnvironmentInfo
}

export interface PerformanceComparison {
  cipherId: string
  current: PerformanceProfile
  baseline: PerformanceBaseline
  differences: PerformanceDifferences
  regression: RegressionStatus
}

export interface PerformanceDifferences {
  executionTime: {
    averageChange: number
    averageChangePercent: number
    p95Change: number
    p95ChangePercent: number
    status: 'improved' | 'degraded' | 'stable'
  }
  memoryUsage: {
    averageChange: number
    averageChangePercent: number
    peakChange: number
    peakChangePercent: number
    status: 'improved' | 'degraded' | 'stable'
  }
  throughput?: {
    change: number
    changePercent: number
    status: 'improved' | 'degraded' | 'stable'
  }
}

export type RegressionStatus = 'regression' | 'improvement' | 'stable' | 'inconclusive'

export interface PerformanceReport {
  generatedAt: Date
  environment: EnvironmentInfo
  profiles: PerformanceProfile[]
  comparisons: PerformanceComparison[]
  summary: PerformanceSummary
}

export interface PerformanceSummary {
  totalCiphers: number
  regressions: number
  improvements: number
  stable: number
  inconclusive: number
  averageExecutionTimeChange: number
  averageMemoryChange: number
}

export interface ProfilingOptions {
  iterations?: number
  warmupIterations?: number
  inputSize?: number
  collectMemory?: boolean
  collectThroughput?: boolean
  collectLatency?: boolean
  timeoutMs?: number
}

export interface RegressionThresholds {
  executionTimeRegressionPercent: number
  memoryRegressionPercent: number
  throughputRegressionPercent: number
  minimumChangePercent: number
}

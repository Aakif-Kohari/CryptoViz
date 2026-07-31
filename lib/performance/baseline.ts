/**
 * Performance baseline management and comparison system.
 * Handles baseline snapshots, storage, and regression detection.
 * Works in both browser (localStorage) and Node.js (file system) environments.
 */

import type {
  PerformanceBaseline,
  PerformanceProfile,
  PerformanceComparison,
  PerformanceDifferences,
  RegressionStatus,
  RegressionThresholds,
} from './types'

const DEFAULT_REGRESSION_THRESHOLDS: RegressionThresholds = {
  executionTimeRegressionPercent: 10,
  memoryRegressionPercent: 15,
  throughputRegressionPercent: 10,
  minimumChangePercent: 1,
}

const STORAGE_KEY = 'cryptoviz-performance-baselines'

export class BaselineManager {
  /**
   * Check if running in browser environment
   */
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
  }

  /**
   * Load all baselines from storage
   */
  static loadBaselines(): Map<string, PerformanceBaseline> {
    try {
      if (this.isBrowser()) {
        const data = localStorage.getItem(STORAGE_KEY)
        if (!data) return new Map()

        const baselines: PerformanceBaseline[] = JSON.parse(data, (key, value) => {
          if (key === 'timestamp') return new Date(value)
          return value
        })

        const map = new Map<string, PerformanceBaseline>()
        for (const baseline of baselines) {
          map.set(baseline.cipherId, baseline)
        }

        return map
      } else {
        // Node.js environment
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs')
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const path = require('path')
        const filePath = path.join(process.cwd(), '.performance-baselines', 'baselines.json')

        if (!fs.existsSync(filePath)) {
          return new Map()
        }

        const data = fs.readFileSync(filePath, 'utf-8')
        const baselines: PerformanceBaseline[] = JSON.parse(data, (key, value) => {
          if (key === 'timestamp') return new Date(value)
          return value
        })

        const map = new Map<string, PerformanceBaseline>()
        for (const baseline of baselines) {
          map.set(baseline.cipherId, baseline)
        }

        return map
      }
    } catch (error) {
      console.error('Failed to load baselines:', error)
      return new Map()
    }
  }

  /**
   * Save baselines to storage
   */
  static saveBaselines(baselines: Map<string, PerformanceBaseline>): void {
    try {
      const data = JSON.stringify(Array.from(baselines.values()), null, 2)

      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_KEY, data)
      } else {
        // Node.js environment
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs')
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const path = require('path')
        const dir = path.join(process.cwd(), '.performance-baselines')

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }

        const filePath = path.join(dir, 'baselines.json')
        fs.writeFileSync(filePath, data, 'utf-8')
      }
    } catch (error) {
      console.error('Failed to save baselines:', error)
    }
  }

  /**
   * Create a baseline from a performance profile
   */
  static createBaseline(
    profile: PerformanceProfile,
    version: string,
    commitHash: string,
  ): PerformanceBaseline {
    return {
      cipherId: profile.cipherId,
      version,
      commitHash,
      timestamp: profile.timestamp,
      metrics: profile.metrics,
      environment: profile.environment,
    }
  }

  /**
   * Save a baseline for a specific cipher
   */
  static saveBaseline(
    profile: PerformanceProfile,
    version: string,
    commitHash: string,
  ): void {
    const baselines = this.loadBaselines()
    const baseline = this.createBaseline(profile, version, commitHash)
    baselines.set(profile.cipherId, baseline)
    this.saveBaselines(baselines)
  }

  /**
   * Get baseline for a specific cipher
   */
  static getBaseline(cipherId: string): PerformanceBaseline | null {
    const baselines = this.loadBaselines()
    return baselines.get(cipherId) || null
  }

  /**
   * Remove baseline for a specific cipher
   */
  static removeBaseline(cipherId: string): void {
    const baselines = this.loadBaselines()
    baselines.delete(cipherId)
    this.saveBaselines(baselines)
  }

  /**
   * Clear all baselines
   */
  static clearBaselines(): void {
    try {
      if (this.isBrowser()) {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        // Node.js environment
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs')
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const path = require('path')
        const filePath = path.join(process.cwd(), '.performance-baselines', 'baselines.json')
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }
    } catch (error) {
      console.error('Failed to clear baselines:', error)
    }
  }

  /**
   * Compare current performance against baseline
   */
  static compare(
    profile: PerformanceProfile,
    baseline: PerformanceBaseline,
    thresholds: Partial<RegressionThresholds> = {},
  ): PerformanceComparison {
    const opts = { ...DEFAULT_REGRESSION_THRESHOLDS, ...thresholds }

    const differences = this.calculateDifferences(profile, baseline, opts)
    const regression = this.determineRegressionStatus(differences)

    return {
      cipherId: profile.cipherId,
      current: profile,
      baseline,
      differences,
      regression,
    }
  }

  /**
   * Calculate performance differences between current and baseline
   */
  private static calculateDifferences(
    profile: PerformanceProfile,
    baseline: PerformanceBaseline,
    thresholds: RegressionThresholds,
  ): PerformanceDifferences {
    const current = profile.metrics.executionTime
    const baselineExec = baseline.metrics.executionTime

    const averageTimeChange = current.averageMs - baselineExec.averageMs
    const averageTimeChangePercent = (averageTimeChange / baselineExec.averageMs) * 100
    const p95TimeChange = current.p95Ms - baselineExec.p95Ms
    const p95TimeChangePercent = (p95TimeChange / baselineExec.p95Ms) * 100

    const execTimeStatus = this.determineMetricStatus(
      averageTimeChangePercent,
      thresholds.executionTimeRegressionPercent,
      thresholds.minimumChangePercent,
      false, // Lower is better for execution time
    )

    const currentMem = profile.metrics.memoryUsage
    const baselineMem = baseline.metrics.memoryUsage

    const averageMemChange = currentMem.averageBytes - baselineMem.averageBytes
    const averageMemChangePercent = (averageMemChange / baselineMem.averageBytes) * 100
    const peakMemChange = currentMem.peakBytes - baselineMem.peakBytes
    const peakMemChangePercent = (peakMemChange / baselineMem.peakBytes) * 100

    const memStatus = this.determineMetricStatus(
      averageMemChangePercent,
      thresholds.memoryRegressionPercent,
      thresholds.minimumChangePercent,
      false, // Lower is better for memory
    )

    const differences: PerformanceDifferences = {
      executionTime: {
        averageChange: averageTimeChange,
        averageChangePercent: averageTimeChangePercent,
        p95Change: p95TimeChange,
        p95ChangePercent: p95TimeChangePercent,
        status: execTimeStatus,
      },
      memoryUsage: {
        averageChange: averageMemChange,
        averageChangePercent: averageMemChangePercent,
        peakChange: peakMemChange,
        peakChangePercent: peakMemChangePercent,
        status: memStatus,
      },
    }

    // Add throughput comparison if available
    if (profile.metrics.throughput && baseline.metrics.throughput) {
      const currentThroughput = profile.metrics.throughput.bytesPerSecond
      const baselineThroughput = baseline.metrics.throughput.bytesPerSecond
      const throughputChange = currentThroughput - baselineThroughput
      const throughputChangePercent = (throughputChange / baselineThroughput) * 100

      differences.throughput = {
        change: throughputChange,
        changePercent: throughputChangePercent,
        status: this.determineMetricStatus(
          throughputChangePercent,
          thresholds.throughputRegressionPercent,
          thresholds.minimumChangePercent,
          true, // Higher is better for throughput
        ),
      }
    }

    return differences
  }

  /**
   * Determine if a metric has improved, degraded, or stayed stable
   */
  private static determineMetricStatus(
    changePercent: number,
    regressionThreshold: number,
    minimumThreshold: number,
    higherIsBetter: boolean,
  ): 'improved' | 'degraded' | 'stable' {
    if (Math.abs(changePercent) < minimumThreshold) {
      return 'stable'
    }

    // Check if change exceeds regression threshold
    const absoluteChange = Math.abs(changePercent)
    if (absoluteChange < regressionThreshold) {
      return 'stable'
    }

    if (higherIsBetter) {
      return changePercent > 0 ? 'improved' : 'degraded'
    } else {
      return changePercent < 0 ? 'improved' : 'degraded'
    }
  }

  /**
   * Determine overall regression status
   */
  private static determineRegressionStatus(
    differences: PerformanceDifferences,
  ): RegressionStatus {
    const execTimeRegressed = differences.executionTime.status === 'degraded'
    const memoryRegressed = differences.memoryUsage.status === 'degraded'
    const throughputRegressed = differences.throughput?.status === 'degraded'

    const execTimeImproved = differences.executionTime.status === 'improved'
    const memoryImproved = differences.memoryUsage.status === 'improved'
    const throughputImproved = differences.throughput?.status === 'improved'

    const hasRegressions = execTimeRegressed || memoryRegressed || throughputRegressed
    const hasImprovements = execTimeImproved || memoryImproved || throughputImproved

    if (hasRegressions && hasImprovements) {
      return 'inconclusive'
    }

    if (hasRegressions) {
      return 'regression'
    }

    if (hasImprovements) {
      return 'improvement'
    }

    return 'stable'
  }

  /**
   * Batch compare multiple profiles against their baselines
   */
  static batchCompare(
    profiles: PerformanceProfile[],
    thresholds: Partial<RegressionThresholds> = {},
  ): PerformanceComparison[] {
    const comparisons: PerformanceComparison[] = []

    for (const profile of profiles) {
      const baseline = this.getBaseline(profile.cipherId)
      if (baseline) {
        comparisons.push(this.compare(profile, baseline, thresholds))
      }
    }

    return comparisons
  }

  /**
   * Export baselines to JSON string
   */
  static exportBaselinesToString(): string {
    const baselines = this.loadBaselines()
    return JSON.stringify(Array.from(baselines.values()), null, 2)
  }

  /**
   * Import baselines from JSON string
   */
  static importBaselinesFromString(data: string): void {
    const baselines: PerformanceBaseline[] = JSON.parse(data, (key, value) => {
      if (key === 'timestamp') return new Date(value)
      return value
    })

    const map = new Map<string, PerformanceBaseline>()
    for (const baseline of baselines) {
      map.set(baseline.cipherId, baseline)
    }

    this.saveBaselines(map)
  }

  /**
   * Get baseline summary statistics
   */
  static getBaselineSummary(): {
    count: number
    ciphers: string[]
    versions: string[]
    dateRange: { oldest: Date; newest: Date } | null
  } {
    const baselines = this.loadBaselines()
    const cipherIds = Array.from(baselines.keys())
    const baselineArray = Array.from(baselines.values())

    if (baselineArray.length === 0) {
      return {
        count: 0,
        ciphers: [],
        versions: [],
        dateRange: null,
      }
    }

    const versions = Array.from(new Set(baselineArray.map((b) => b.version)))
    const timestamps = baselineArray.map((b) => b.timestamp.getTime())
    const oldest = new Date(Math.min(...timestamps))
    const newest = new Date(Math.max(...timestamps))

    return {
      count: baselineArray.length,
      ciphers: cipherIds,
      versions,
      dateRange: { oldest, newest },
    }
  }
}

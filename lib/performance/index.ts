/**
 * Performance Profiling Framework
 * 
 * A comprehensive performance profiling and regression testing framework for cipher operations.
 * 
 * @example
 * ```typescript
 * import { PerformanceProfiler, BaselineManager, PerformanceReporter, PerformanceCI } from '@/lib/performance'
 * 
 * // Profile a cipher operation
 * const profile = await PerformanceProfiler.profile(
 *   'aes',
 *   'AES',
 *   'symmetric',
 *   'encrypt',
 *   async () => { /* cipher operation *\/ },
 *   1024,
 *   { iterations: 100 }
 * )
 * 
 * // Save as baseline
 * BaselineManager.saveBaseline(profile, '1.0.0', 'abc123')
 * 
 * // Compare against baseline
 * const baseline = BaselineManager.getBaseline('aes')
 * const comparison = BaselineManager.compare(profile, baseline)
 * 
 * // Generate report
 * const report = PerformanceReporter.generateReport([profile], [comparison])
 * console.log(PerformanceReporter.formatTextReport(report))
 * 
 * // CI integration
 * const ciResult = await PerformanceCI.runRegressionCheck([profile], {
 *   failOnRegression: true,
 *   outputFormat: 'json'
 * })
 * ```
 */

export * from './types'
export { PerformanceProfiler } from './profiler'
export { BaselineManager } from './baseline'
export { PerformanceReporter } from './reporter'
export { PerformanceCI } from './ci'

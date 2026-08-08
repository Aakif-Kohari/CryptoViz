import { DeviceInfo } from '@/types/benchmark'

/**
 * Collects browser and device information for benchmark context
 */
export function getDeviceInfo(): DeviceInfo {
  const navigator = typeof window !== 'undefined' ? window.navigator : null
  const screen = typeof window !== 'undefined' ? window.screen : null

  return {
    userAgent: navigator?.userAgent || 'Unknown',
    hardwareConcurrency: navigator?.hardwareConcurrency || 1,
    deviceMemory: navigator && 'deviceMemory' in navigator ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory : undefined,
    language: navigator?.language || 'Unknown',
    platform: navigator?.platform || 'Unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      width: screen?.width || 0,
      height: screen?.height || 0,
      colorDepth: screen?.colorDepth || 0,
      pixelDepth: screen?.pixelDepth || 0,
    },
  }
}

/**
 * Formats device info for display
 */
export function formatDeviceInfo(info: DeviceInfo): Record<string, string> {
  return {
    'CPU Cores': String(info.hardwareConcurrency),
    'Device Memory': info.deviceMemory ? `${info.deviceMemory} GB` : 'Unknown',
    'Platform': info.platform,
    'Language': info.language,
    'Timezone': info.timezone,
    'Screen': `${info.screen.width}x${info.screen.height}`,
    'User Agent': info.userAgent,
  }
}

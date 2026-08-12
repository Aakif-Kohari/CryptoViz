/**
 * Environment detection utilities for development vs production behavior.
 */

/**
 * Checks if the application is running in development mode.
 * In Next.js, this is determined by the NODE_ENV environment variable.
 */
export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Checks if the application is running in production mode.
 */
export function isProductionMode(): boolean {
  return process.env.NODE_ENV === 'production';
}

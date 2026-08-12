/**
 * CryptoViz Logger Utility
 * Wraps console logging methods to prevent unhandled console output in production builds.
 * 
 * - In development (process.env.NODE_ENV !== 'production'): Logs pass through to standard console methods.
 * - In production: Console methods are silenced or routed to appropriate telemetry/monitoring services.
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  log: (...args: unknown[]): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  info: (...args: unknown[]): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },
  error: (...args: unknown[]): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  },
};

export default logger;

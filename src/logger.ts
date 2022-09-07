/**
 * Simple Logger implementation.
 *
 * Will only log errors to console. Provide an alternative implementation
 * to log more details / log in a different way.
 *
 * @see ./logger.spec.ts for more details
 */
export class Logger {
  info?: (message: string, ...details: any[]) => void;
  warn?: (message: string, ...details: any[]) => void;
  error(message: string, ...details: any[]) {
    console.error(message, ...details);
  }
}

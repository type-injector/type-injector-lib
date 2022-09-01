export class Logger {
  info?: (message: string, ...details: any[]) => void;
  warn?: (message: string, ...details: any[]) => void;
  error(message: string, ...details: any[]) {
    console.error(message, ...details);
  }
}

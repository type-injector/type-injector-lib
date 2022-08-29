export class Logger {
  info(message: string, ...details: any[]) {
    console.log(message, ...details);
  }
  warn(message: string, ...details: any[]) {
    console.warn(message, ...details);
  }
  error(message: string, ...details: any[]) {
    console.error(message, ...details);
  }
}

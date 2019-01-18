export enum LogLevel {
  DEBUG,
  INFO,
  ERROR,
}

class Logger {
  public constructor(private logLevel: LogLevel) {}

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;

    const firstLogString = "Logging with level:";

    switch (this.logLevel) {
      case LogLevel.DEBUG:
        this.debug(firstLogString, "DEBUG");
        break;
      case LogLevel.INFO:
        this.log(firstLogString, "INFO");
        break;
      case LogLevel.ERROR:
        this.error(firstLogString, "ERROR");
    }
  }

  public debug(message?: any, ...optionalParams: any[]): void {
    if (this.logLevel === LogLevel.DEBUG) {
      console.debug(this.getDate(), "[DEBUG]", message, ...optionalParams);
    }
  }

  public log(message?: any, ...optionalParams: any[]): void {
    if (this.logLevel !== LogLevel.ERROR) {
      console.log(this.getDate(), "[INFO]", message, ...optionalParams);
    }
  }

  public error(message?: any, ...optionalParams: any[]): void {
    console.error(this.getDate(), "[ERROR]", message, ...optionalParams);
  }

  private getDate(): string {
    return `(${new Date().toLocaleString()})`;
  }
}

export const logger = new Logger(LogLevel.DEBUG);

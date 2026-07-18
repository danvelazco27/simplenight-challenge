/**
 * Simple Logger utility for Playwright tests
 * Provides structured logging for metrics, observability, and debugging
 * Integrates with Playwright's test.step for visibility in reports
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  step?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private minLogLevel: LogLevel = LogLevel.DEBUG;

  private getLevelWeight(level: LogLevel): number {
    const weights: Record<LogLevel, number> = {
      [LogLevel.TRACE]: 0,
      [LogLevel.DEBUG]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.WARN]: 3,
      [LogLevel.ERROR]: 4,
    };
    return weights[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return this.getLevelWeight(level) >= this.getLevelWeight(this.minLogLevel);
  }

  private formatLog(entry: LogEntry): string {
    const contextStr = entry.context ? ` | ${JSON.stringify(entry.context)}` : '';
    const stepStr = entry.step ? ` [${entry.step}]` : '';
    return `[${entry.timestamp}] ${entry.level}${stepStr}: ${entry.message}${contextStr}`;
  }

  log(level: LogLevel, message: string, context?: Record<string, unknown>, step?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      step,
    };

    this.logs.push(entry);
    console.log(this.formatLog(entry));
  }

  error(message: string, context?: Record<string, unknown>, step?: string): void {
    this.log(LogLevel.ERROR, message, context, step);
  }

  warn(message: string, context?: Record<string, unknown>, step?: string): void {
    this.log(LogLevel.WARN, message, context, step);
  }

  info(message: string, context?: Record<string, unknown>, step?: string): void {
    this.log(LogLevel.INFO, message, context, step);
  }

  debug(message: string, context?: Record<string, unknown>, step?: string): void {
    this.log(LogLevel.DEBUG, message, context, step);
  }

  trace(message: string, context?: Record<string, unknown>, step?: string): void {
    this.log(LogLevel.TRACE, message, context, step);
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  getLogsSummary(): { total: number; byLevel: Record<LogLevel, number> } {
    const byLevel = Object.values(LogLevel).reduce(
      (acc, level) => {
        acc[level] = this.logs.filter((log) => log.level === level).length;
        return acc;
      },
      {} as Record<LogLevel, number>,
    );

    return {
      total: this.logs.length,
      byLevel,
    };
  }

  clear(): void {
    this.logs = [];
  }

  setMinLogLevel(level: LogLevel): void {
    this.minLogLevel = level;
  }
}

export const logger = new Logger();

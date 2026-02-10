type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: any): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  private log(level: LogLevel, message: string, context?: any) {
    const entry = this.formatMessage(level, message, context);
    
    // In development, show all. In production, show warn/error/info
    const shouldLog = this.isDevelopment || ['error', 'warn', 'info'].includes(level);

    if (shouldLog) {
      const consoleMethod = level === 'debug' ? 'debug' : level;
      (console as any)[consoleMethod](
        `[${entry.timestamp}] [${level.toUpperCase()}] ${message}`,
        context ? JSON.stringify(context, null, 2) : ''
      );
    }
  }

  info(message: string, context?: any) {
    this.log('info', message, context);
  }

  warn(message: string, context?: any) {
    this.log('warn', message, context);
  }

  error(message: string, context?: any) {
    this.log('error', message, context);
  }

  debug(message: string, context?: any) {
    this.log('debug', message, context);
  }
}

export const logger = new Logger();

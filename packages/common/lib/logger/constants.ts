import type { ConsoleLoggerConfig, ConsoleLoggerMethod, ConsoleLoggerStyle, LoggerLevel } from './types.ts';

export const DEFAULT_CONSOLE_LOGGER_CONFIG: ConsoleLoggerConfig = {
    errorStack: false,
    timestamp: false,
    styles: true
};

export const CONSOLE_LOGGER_METHOD_MAP: Record<
    LoggerLevel,
    ConsoleLoggerMethod
> = {
    error: 'error',
    info: 'info',
    log: 'log',
    success: 'log',
    warning: 'warn'
};

export const CONSOLE_LOGGER_STYLE_MAP: Partial<
    Record<LoggerLevel, ConsoleLoggerStyle>
> = {
    error: 'red',
    info: 'cyan',
    success: 'green',
    warning: 'yellow'
};

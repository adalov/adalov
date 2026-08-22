import { styleText } from 'node:util';

export type ConsoleLoggerStyle = Exclude<
    Parameters<typeof styleText>[0],
    unknown[]
>;

export type LoggerLevel = 'error' | 'info' | 'log' | 'success' | 'warning';

export type ConsoleLoggerMethod = 'error' | 'info' | 'log' | 'warn';

export type LoggerEventDetails = Record<string, unknown>;

export interface LoggerOutputConfig {
    errorStack: boolean;
    timestamp: boolean;
}

export interface LoggerEvent {
    details?: LoggerEventDetails;
    error?: Error;
    level: LoggerLevel;
    message: string;
}

export interface LoggerOutput {
    write(event: LoggerEvent): void;
}

export interface ConsoleLoggerConfig extends LoggerOutputConfig {
    styles: boolean;
}

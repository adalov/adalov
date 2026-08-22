import {
    stderr,
    stdout
} from 'node:process';
import {
    inspect,
    styleText
} from 'node:util';

import type {
    LoggerEvent,
    LoggerEventDetails,
    LoggerLevel,
    LoggerOutput,
    LoggerOutputConfig
} from './logger.ts';

type ConsoleLoggerMethod = 'error' | 'info' | 'log' | 'warn';

type ConsoleLoggerStyle = Exclude<
    Parameters<typeof styleText>[0],
    unknown[]
>;

export interface ConsoleLoggerConfig extends LoggerOutputConfig {
    styles: boolean;
}

const CONSOLE_LOGGER_METHOD_MAP: Record<
    LoggerLevel,
    ConsoleLoggerMethod
> = {
    error: 'error',
    info: 'info',
    log: 'log',
    success: 'log',
    warning: 'warn'
};

const CONSOLE_LOGGER_STYLE_MAP: Partial<
    Record<LoggerLevel, ConsoleLoggerStyle>
> = {
    error: 'red',
    info: 'cyan',
    success: 'green',
    warning: 'yellow'
};

const DEFAULT_CONSOLE_LOGGER_CONFIG: ConsoleLoggerConfig = {
    errorStack: false,
    timestamp: false,
    styles: true
};

export class ConsoleLoggerOutput implements LoggerOutput {
    private readonly config: ConsoleLoggerConfig;

    constructor(config: Partial<ConsoleLoggerConfig> = {}) {
        this.config = {
            ...DEFAULT_CONSOLE_LOGGER_CONFIG,
            ...config
        };
    }

    public write(event: LoggerEvent): void {
        const method = CONSOLE_LOGGER_METHOD_MAP[event.level];
        const stream = method === 'error' || method === 'warn'
            ? stderr
            : stdout;
        const styles = this.config.styles
            && typeof stream.hasColors === 'function'
            && stream.hasColors();

        const messageSegments: string[] = [];

        if (this.config.timestamp) {
            messageSegments.push(
                this.formatTimestamp(new Date(), styles)
            );
        }

        messageSegments.push(
            this.formatMessage(event.message, event.level, styles)
        );

        if (this.config.errorStack && event.error?.stack) {
            messageSegments.push(
                this.formatErrorStack(event.error.stack)
            );
        }

        if (event.details) {
            messageSegments.push(
                this.formatDetails(event.details, styles)
            );
        }

        console[method](...messageSegments);
    }

    private formatTimestamp(now: Date, styles: boolean): string {
        const isoDate = [
            now.getFullYear(),
            this.pad(now.getMonth() + 1),
            this.pad(now.getDate())
        ].join('-');
        const isoTime = [
            this.pad(now.getHours()),
            this.pad(now.getMinutes()),
            this.pad(now.getSeconds())
        ].join(':');
        const isoDateTime = `${isoDate} ${isoTime}`;

        if (styles) {
            const isoDateTimeStyled = styleText(
                'gray',
                isoDateTime,
                { validateStream: false }
            );

            return `[${isoDateTimeStyled}]`;
        } else {
            return `[${isoDateTime}]`;
        }
    }

    private formatMessage(
        message: string,
        loggerLevel: LoggerLevel,
        styles: boolean
    ): string {
        const messageStyle = CONSOLE_LOGGER_STYLE_MAP[loggerLevel];

        if (styles && messageStyle) {
            return styleText(messageStyle, message, {
                validateStream: false
            });
        } else {
            return message;
        }
    }

    private formatErrorStack(errorStack: string): string {
        return `\n${errorStack.split('\n').slice(1).join('\n')}`;
    }

    private formatDetails(
        details: LoggerEventDetails,
        styles: boolean
    ): string {
        return `\n${inspect(details, {
            colors: styles,
            compact: false,
            maxArrayLength: 5
        })}`;
    }

    private pad(value: number): string {
        return value.toString().padStart(2, '0');
    }
}

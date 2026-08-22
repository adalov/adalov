import { inspect, styleText } from 'node:util';
import { CONSOLE_LOGGER_METHOD_MAP, CONSOLE_LOGGER_STYLE_MAP, DEFAULT_CONSOLE_LOGGER_CONFIG } from './constants.ts';
import type { ConsoleLoggerConfig, LoggerEvent, LoggerEventDetails, LoggerLevel, LoggerOutput } from './types.ts';

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
        const messageSegments: string[] = [];

        if (this.config.timestamp) {
            messageSegments.push(
                this.formatTimestamp(new Date())
            );
        }

        messageSegments.push(
            this.formatMessage(event.message, event.level)
        );
        
        if (this.config.errorStack && event.error?.stack) {
            messageSegments.push(
                this.formatErrorStack(event.error.stack)
            );
        }

        if (event.details) {
            messageSegments.push(
                this.formatDetails(event.details)
            );
        }

        console[method](...messageSegments);
    }

    private formatTimestamp(now: Date): string {
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

        if (this.config.styles) {
            return `[${styleText('gray', isoDateTime)}]`;
        } else {
            return `[${isoDateTime}]`;
        }
    }

    private formatMessage(message: string, loggerLevel: LoggerLevel): string {
        const messageStyle = CONSOLE_LOGGER_STYLE_MAP[loggerLevel];
        
        if (this.config.styles && messageStyle) {
            return styleText(messageStyle, message);
        } else {
            return message;
        }
    }

    private formatErrorStack(errorStack: string): string {
        return `\n${errorStack.split('\n').slice(1).join('\n')}`;
    }

    private formatDetails(details: LoggerEventDetails): string {
        return `\n${inspect(details, {
            colors: this.config.styles,
            compact: false,
            maxArrayLength: 5
        })}`;
    }

    private pad(value: number): string {
        return value.toString().padStart(2, '0');
    }
}

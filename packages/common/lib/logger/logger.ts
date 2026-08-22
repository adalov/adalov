import type { LoggerEventDetails, LoggerLevel, LoggerOutput } from './types.ts';

export class Logger {
    constructor(
        private readonly output: LoggerOutput
    ) {}

    public error(message: string, details?: LoggerEventDetails): void;
    public error(error: Error, details?: LoggerEventDetails): void;
    public error(input: string | Error, details?: LoggerEventDetails): void {
        this.write(
            'error', 
            input instanceof Error ? input.message : input,
            details,
            input instanceof Error ? input : undefined
        );
    }

    public info(message: string, details?: LoggerEventDetails): void {
        this.write('info', message, details);
    }

    public log(message: string, details?: LoggerEventDetails): void {
        this.write('log', message, details);
    }

    public success(message: string, details?: LoggerEventDetails): void {
        this.write('success', message, details);
    }

    public warning(message: string, details?: LoggerEventDetails): void {
        this.write('warning', message, details);
    }

    private write(
        level: LoggerLevel,
        message: string,
        details?: LoggerEventDetails,
        error?: Error
    ): void {
        this.output.write({
            level,
            message,
            ...(details !== undefined && { details }),
            ...(error !== undefined && { error })
        });
    }
}

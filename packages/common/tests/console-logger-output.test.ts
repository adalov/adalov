import assert from 'node:assert/strict';
import {
    stderr,
    stdout
} from 'node:process';
import {
    describe,
    it,
    type TestContext
} from 'node:test';
import {
    inspect,
    stripVTControlCharacters,
    styleText
} from 'node:util';
import {
    ConsoleLoggerOutput
} from '@adalov/common';

const TIMESTAMP_PATTERN = /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]$/;

const mockStreamHasColors = (
    context: TestContext,
    stream: NodeJS.WriteStream,
    value: boolean | undefined
): void => {
    const descriptor = Object.getOwnPropertyDescriptor(stream, 'hasColors');

    Object.defineProperty(stream, 'hasColors', {
        configurable: true,
        writable: true,
        value: value === undefined
            ? undefined
            : (): boolean => value
    });

    context.after(() => {
        if (descriptor) {
            Object.defineProperty(stream, 'hasColors', descriptor);
        } else {
            Reflect.deleteProperty(stream, 'hasColors');
        }
    });
};

describe('[@adalov/common] ConsoleLoggerOutput', () => {
    describe('console routing', () => {
        it('routes every logger level to its expected console method', (context) => {
            const error = context.mock.method(console, 'error', () => {});
            const info = context.mock.method(console, 'info', () => {});
            const log = context.mock.method(console, 'log', () => {});
            const warn = context.mock.method(console, 'warn', () => {});
            const output = new ConsoleLoggerOutput({ styles: false });

            output.write({ level: 'error', message: 'Error' });
            output.write({ level: 'info', message: 'Info' });
            output.write({ level: 'log', message: 'Log' });
            output.write({ level: 'success', message: 'Success' });
            output.write({ level: 'warning', message: 'Warning' });

            assert.deepEqual(error.mock.calls[0]?.arguments, ['Error']);
            assert.deepEqual(info.mock.calls[0]?.arguments, ['Info']);
            assert.deepEqual(log.mock.calls[0]?.arguments, ['Log']);
            assert.deepEqual(log.mock.calls[1]?.arguments, ['Success']);
            assert.deepEqual(warn.mock.calls[0]?.arguments, ['Warning']);
        });
    });

    describe('styles', () => {
        it('styles supported logger levels when their stream supports colors', (context) => {
            mockStreamHasColors(context, stdout, true);
            mockStreamHasColors(context, stderr, true);

            const error = context.mock.method(console, 'error', () => {});
            const info = context.mock.method(console, 'info', () => {});
            const log = context.mock.method(console, 'log', () => {});
            const warn = context.mock.method(console, 'warn', () => {});
            const output = new ConsoleLoggerOutput();

            output.write({ level: 'error', message: 'Error' });
            output.write({ level: 'info', message: 'Info' });
            output.write({ level: 'log', message: 'Log' });
            output.write({ level: 'success', message: 'Success' });
            output.write({ level: 'warning', message: 'Warning' });

            assert.deepEqual(error.mock.calls[0]?.arguments, [
                styleText('red', 'Error', { validateStream: false })
            ]);
            assert.deepEqual(info.mock.calls[0]?.arguments, [
                styleText('cyan', 'Info', { validateStream: false })
            ]);
            assert.deepEqual(log.mock.calls[0]?.arguments, ['Log']);
            assert.deepEqual(log.mock.calls[1]?.arguments, [
                styleText('green', 'Success', { validateStream: false })
            ]);
            assert.deepEqual(warn.mock.calls[0]?.arguments, [
                styleText('yellow', 'Warning', { validateStream: false })
            ]);
        });

        it('does not style output when styles are disabled by config', (context) => {
            mockStreamHasColors(context, stdout, true);

            const info = context.mock.method(console, 'info', () => {});
            const output = new ConsoleLoggerOutput({ styles: false });

            output.write({ level: 'info', message: 'Info' });

            assert.deepEqual(info.mock.calls[0]?.arguments, ['Info']);
        });

        it('does not style output when the stream reports colors disabled', (context) => {
            mockStreamHasColors(context, stdout, false);

            const info = context.mock.method(console, 'info', () => {});
            const output = new ConsoleLoggerOutput();

            output.write({ level: 'info', message: 'Info' });

            assert.deepEqual(info.mock.calls[0]?.arguments, ['Info']);
        });

        it('does not fail when stdout is not a TTY and hasColors is unavailable', (context) => {
            mockStreamHasColors(context, stdout, undefined);

            const info = context.mock.method(console, 'info', () => {});
            const output = new ConsoleLoggerOutput();

            output.write({ level: 'info', message: 'Info' });

            assert.deepEqual(info.mock.calls[0]?.arguments, ['Info']);
        });
    });

    describe('timestamps', () => {
        it('prepends an unstyled local timestamp when enabled without styles', (context) => {
            const log = context.mock.method(console, 'log', () => {});
            const output = new ConsoleLoggerOutput({
                styles: false,
                timestamp: true
            });

            output.write({ level: 'log', message: 'Message' });

            const timestamp = log.mock.calls[0]?.arguments[0];

            assert.equal(typeof timestamp, 'string');
            assert.match(timestamp, TIMESTAMP_PATTERN);
            assert.deepEqual(log.mock.calls[0]?.arguments.slice(1), ['Message']);
        });

        it('styles the timestamp in gray when colors are enabled', (context) => {
            mockStreamHasColors(context, stdout, true);

            const log = context.mock.method(console, 'log', () => {});
            const output = new ConsoleLoggerOutput({ timestamp: true });

            output.write({ level: 'log', message: 'Message' });

            const timestamp = log.mock.calls[0]?.arguments[0];

            assert.equal(typeof timestamp, 'string');

            const plainTimestamp = stripVTControlCharacters(timestamp);
            assert.match(plainTimestamp, TIMESTAMP_PATTERN);

            const dateTime = plainTimestamp.slice(1, -1);
            assert.equal(
                timestamp,
                `[${styleText('gray', dateTime, { validateStream: false })}]`
            );
            assert.deepEqual(log.mock.calls[0]?.arguments.slice(1), ['Message']);
        });
    });

    describe('error stacks', () => {
        it('appends an error stack without its first line when enabled', (context) => {
            const errorConsole = context.mock.method(console, 'error', () => {});
            const output = new ConsoleLoggerOutput({
                errorStack: true,
                styles: false
            });
            const error = new Error('Unexpected failure');
            error.stack = [
                'Error: Unexpected failure',
                '    at first (first.js:1:1)',
                '    at second (second.js:2:2)'
            ].join('\n');

            output.write({
                level: 'error',
                message: error.message,
                error
            });

            assert.deepEqual(errorConsole.mock.calls[0]?.arguments, [
                'Unexpected failure',
                '\n    at first (first.js:1:1)\n    at second (second.js:2:2)'
            ]);
        });

        it('does not append an error stack when disabled', (context) => {
            const errorConsole = context.mock.method(console, 'error', () => {});
            const output = new ConsoleLoggerOutput({ styles: false });
            const error = new Error('Unexpected failure');

            output.write({
                level: 'error',
                message: error.message,
                error
            });

            assert.deepEqual(errorConsole.mock.calls[0]?.arguments, [
                'Unexpected failure'
            ]);
        });

        it('does not append an error stack when the Error has no stack', (context) => {
            const errorConsole = context.mock.method(console, 'error', () => {});
            const output = new ConsoleLoggerOutput({
                errorStack: true,
                styles: false
            });
            const error = new Error('Unexpected failure');
            delete error.stack;

            output.write({
                level: 'error',
                message: error.message,
                error
            });

            assert.deepEqual(errorConsole.mock.calls[0]?.arguments, [
                'Unexpected failure'
            ]);
        });
    });

    describe('details', () => {
        it('appends inspected details without colors', (context) => {
            const log = context.mock.method(console, 'log', () => {});
            const output = new ConsoleLoggerOutput({ styles: false });
            const details = {
                requestId: 'request-1',
                values: [1, 2, 3, 4, 5, 6]
            };

            output.write({
                level: 'log',
                message: 'Message',
                details
            });

            assert.deepEqual(log.mock.calls[0]?.arguments, [
                'Message',
                `\n${inspect(details, {
                    colors: false,
                    compact: false,
                    maxArrayLength: 5
                })}`
            ]);
        });

        it('appends inspected details with colors when the stream supports them', (context) => {
            mockStreamHasColors(context, stdout, true);

            const log = context.mock.method(console, 'log', () => {});
            const output = new ConsoleLoggerOutput();
            const details = {
                requestId: 'request-1'
            };

            output.write({
                level: 'log',
                message: 'Message',
                details
            });

            assert.deepEqual(log.mock.calls[0]?.arguments, [
                'Message',
                `\n${inspect(details, {
                    colors: true,
                    compact: false,
                    maxArrayLength: 5
                })}`
            ]);
        });

        it('includes empty details objects', (context) => {
            const log = context.mock.method(console, 'log', () => {});
            const output = new ConsoleLoggerOutput({ styles: false });
            const details = {};

            output.write({
                level: 'log',
                message: 'Message',
                details
            });

            assert.deepEqual(log.mock.calls[0]?.arguments, [
                'Message',
                `\n${inspect(details, {
                    colors: false,
                    compact: false,
                    maxArrayLength: 5
                })}`
            ]);
        });
    });

    it('preserves segment order when timestamp, stack, and details are enabled', (context) => {
        const errorConsole = context.mock.method(console, 'error', () => {});
        const output = new ConsoleLoggerOutput({
            errorStack: true,
            styles: false,
            timestamp: true
        });
        const error = new Error('Unexpected failure');
        error.stack = 'Error: Unexpected failure\n    at first (first.js:1:1)';
        const details = {
            requestId: 'request-1'
        };

        output.write({
            level: 'error',
            message: error.message,
            error,
            details
        });

        const segments = errorConsole.mock.calls[0]?.arguments;
        const timestamp = segments?.[0];

        assert.equal(typeof timestamp, 'string');
        assert.match(timestamp, TIMESTAMP_PATTERN);
        assert.deepEqual(segments?.slice(1), [
            'Unexpected failure',
            '\n    at first (first.js:1:1)',
            `\n${inspect(details, {
                colors: false,
                compact: false,
                maxArrayLength: 5
            })}`
        ]);
    });
});

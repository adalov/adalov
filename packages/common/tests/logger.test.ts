import assert from 'node:assert/strict';
import {
    describe,
    it
} from 'node:test';
import {
    Logger,
    type LoggerEvent,
    type LoggerEventDetails,
    type LoggerLevel
} from '@adalov/common';

const LEVEL_CASES: ReadonlyArray<{
    level: Exclude<LoggerLevel, 'error'>;
    invoke: (
        logger: Logger,
        message: string,
        details?: LoggerEventDetails
    ) => void;
}> = [
    {
        level: 'info',
        invoke: (logger, message, details) => logger.info(message, details)
    },
    {
        level: 'log',
        invoke: (logger, message, details) => logger.log(message, details)
    },
    {
        level: 'success',
        invoke: (logger, message, details) => logger.success(message, details)
    },
    {
        level: 'warning',
        invoke: (logger, message, details) => logger.warning(message, details)
    }
];

describe('[@adalov/common] Logger', () => {
    describe('level methods', () => {
        for (const testCase of LEVEL_CASES) {
            it(`forwards ${testCase.level} events without optional fields`, (context) => {
                const write = context.mock.fn((_event: LoggerEvent): void => {});
                const logger = new Logger({ write });

                testCase.invoke(logger, 'Message');

                assert.equal(write.mock.callCount(), 1);
                assert.deepEqual(write.mock.calls[0]?.arguments, [
                    {
                        level: testCase.level,
                        message: 'Message'
                    }
                ]);
            });

            it(`forwards ${testCase.level} event details`, (context) => {
                const write = context.mock.fn((_event: LoggerEvent): void => {});
                const logger = new Logger({ write });
                const details = {
                    requestId: 'request-1'
                };

                testCase.invoke(logger, 'Message', details);

                assert.equal(write.mock.callCount(), 1);
                assert.deepEqual(write.mock.calls[0]?.arguments, [
                    {
                        level: testCase.level,
                        message: 'Message',
                        details
                    }
                ]);
            });
        }
    });

    describe('error', () => {
        it('forwards string errors without an Error instance', (context) => {
            const write = context.mock.fn((_event: LoggerEvent): void => {});
            const logger = new Logger({ write });

            logger.error('Unexpected failure');

            assert.equal(write.mock.callCount(), 1);
            assert.deepEqual(write.mock.calls[0]?.arguments, [
                {
                    level: 'error',
                    message: 'Unexpected failure'
                }
            ]);
        });

        it('forwards string error details', (context) => {
            const write = context.mock.fn((_event: LoggerEvent): void => {});
            const logger = new Logger({ write });
            const details = {
                requestId: 'request-1'
            };

            logger.error('Unexpected failure', details);

            assert.equal(write.mock.callCount(), 1);
            assert.deepEqual(write.mock.calls[0]?.arguments, [
                {
                    level: 'error',
                    message: 'Unexpected failure',
                    details
                }
            ]);
        });

        it('forwards Error instances with their original reference', (context) => {
            const write = context.mock.fn((_event: LoggerEvent): void => {});
            const logger = new Logger({ write });
            const error = new Error('Unexpected failure');

            logger.error(error);

            assert.equal(write.mock.callCount(), 1);
            assert.deepEqual(write.mock.calls[0]?.arguments, [
                {
                    level: 'error',
                    message: 'Unexpected failure',
                    error
                }
            ]);
        });

        it('forwards Error instances together with details', (context) => {
            const write = context.mock.fn((_event: LoggerEvent): void => {});
            const logger = new Logger({ write });
            const error = new Error('Unexpected failure');
            const details = {
                requestId: 'request-1'
            };

            logger.error(error, details);

            assert.equal(write.mock.callCount(), 1);
            assert.deepEqual(write.mock.calls[0]?.arguments, [
                {
                    level: 'error',
                    message: 'Unexpected failure',
                    details,
                    error
                }
            ]);
        });
    });
});

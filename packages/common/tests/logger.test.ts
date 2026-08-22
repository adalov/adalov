import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    Logger,
    type LoggerEvent
} from '@adalov/common';

test('Logger forwards log events to its output', (context) => {
    const write = context.mock.fn((_event: LoggerEvent): void => {});
    const logger = new Logger({ write });
    const details = {
        requestId: 'request-1'
    };

    logger.log('Request received', details);

    assert.equal(write.mock.callCount(), 1);
    assert.deepEqual(write.mock.calls[0]?.arguments, [
        {
            level: 'log',
            message: 'Request received',
            details
        }
    ]);
});

test('Logger forwards Error instances with their original reference', (context) => {
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

import { afterEach, describe, expect, it, vi } from 'vitest';

import { logStartup, StartupTimer } from './startup-timer.js';

describe('startup timer', () => {
  const originalVitest = process.env.VITEST;
  const originalDebug = process.env.DIFIT_DEBUG;

  afterEach(() => {
    process.env.VITEST = originalVitest;
    if (originalDebug === undefined) {
      delete process.env.DIFIT_DEBUG;
    } else {
      process.env.DIFIT_DEBUG = originalDebug;
    }
    vi.restoreAllMocks();
  });

  it('does not log by default', () => {
    delete process.env.DIFIT_DEBUG;
    process.env.VITEST = '';
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    logStartup('example', 12);

    expect(log).not.toHaveBeenCalled();
  });

  it('does not log while tests are running', () => {
    process.env.DIFIT_DEBUG = '1';
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    logStartup('example', 12);

    expect(log).not.toHaveBeenCalled();
  });

  it('logs step durations when DIFIT_DEBUG=1', () => {
    process.env.VITEST = '';
    process.env.DIFIT_DEBUG = '1';
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const timer = new StartupTimer();

    timer.mark('example');
    timer.total('ready');

    expect(log).toHaveBeenCalledWith(expect.stringMatching(/^\[startup] example: \d+ms$/));
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/^\[startup] ready: \d+ms$/));
  });
});

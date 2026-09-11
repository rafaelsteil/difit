import { afterEach, describe, expect, it, vi } from 'vitest';

import { logStartup, StartupTimer } from './startup-timer.js';

describe('startup timer', () => {
  const originalVitest = process.env.VITEST;

  afterEach(() => {
    process.env.VITEST = originalVitest;
    vi.restoreAllMocks();
  });

  it('does not log while tests are running', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    logStartup('example', 12);

    expect(log).not.toHaveBeenCalled();
  });

  it('logs step durations when enabled', () => {
    process.env.VITEST = '';
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const timer = new StartupTimer();

    timer.mark('example');
    timer.total('ready');

    expect(log).toHaveBeenCalledWith(expect.stringMatching(/^\[startup] example: \d+ms$/));
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/^\[startup] ready: \d+ms$/));
  });
});

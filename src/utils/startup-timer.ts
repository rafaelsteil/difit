function shouldLogStartup(): boolean {
  return !process.env.VITEST;
}

function formatMs(ms: number): string {
  return `${Math.round(ms)}ms`;
}

export function logStartup(label: string, durationMs: number, extra?: string): void {
  if (!shouldLogStartup()) {
    return;
  }

  const detail = extra ? ` ${extra}` : '';
  console.log(`[startup] ${label}: ${formatMs(durationMs)}${detail}`);
}

export class StartupTimer {
  private readonly startedAt = performance.now();
  private last = this.startedAt;

  mark(label: string, extra?: string): void {
    const now = performance.now();
    logStartup(label, now - this.last, extra);
    this.last = now;
  }

  total(label = 'ready'): void {
    logStartup(label, performance.now() - this.startedAt);
  }
}

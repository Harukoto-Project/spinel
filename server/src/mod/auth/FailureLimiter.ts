export class FailureLimiter {
  private readonly failures = new Map<string, number[]>();

  public constructor(
    private readonly maxFailures: number = 5,
    private readonly windowMs: number = 60_000,
  ) {}

  public isBlocked(key: string, now: number = Date.now()): boolean {
    return this.recent(key, now).length >= this.maxFailures;
  }

  public recordFailure(key: string, now: number = Date.now()): void {
    this.failures.set(key, [...this.recent(key, now), now]);
  }

  public reset(key: string): void {
    this.failures.delete(key);
  }

  private recent(key: string, now: number): number[] {
    const recent = (this.failures.get(key) ?? []).filter((at) => now - at < this.windowMs);
    if (recent.length === 0) {
      this.failures.delete(key);
    } else {
      this.failures.set(key, recent);
    }
    return recent;
  }
}

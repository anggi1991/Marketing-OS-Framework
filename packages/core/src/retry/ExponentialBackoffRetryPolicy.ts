import { RetryPolicy } from './RetryPolicy';

export interface ExponentialBackoffOptions {
  maxRetries: number;
  initialDelayMs: number;
  multiplier: number;
  maxDelayMs?: number;
}

export class ExponentialBackoffRetryPolicy implements RetryPolicy {
  private options: ExponentialBackoffOptions;

  constructor(options: Partial<ExponentialBackoffOptions> = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      initialDelayMs: options.initialDelayMs ?? 1000,
      multiplier: options.multiplier ?? 2,
      maxDelayMs: options.maxDelayMs ?? 30000, // max 30 seconds default
    };
  }

  public async execute<T>(task: () => Promise<T>): Promise<T> {
    let attempt = 0;
    let currentDelay = this.options.initialDelayMs;

    while (true) {
      try {
        return await task();
      } catch (error) {
        attempt++;
        if (attempt > this.options.maxRetries) {
          throw error; // Menyerah setelah batas max tercapai
        }

        // Tunggu sebelum mencoba lagi
        await this.delay(currentDelay);
        
        // Kalkulasi jeda berikutnya
        currentDelay = Math.min(
          currentDelay * this.options.multiplier,
          this.options.maxDelayMs!
        );
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

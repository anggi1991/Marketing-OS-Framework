import { RetryPolicy } from './RetryPolicy';

export class NoRetryPolicy implements RetryPolicy {
  public async execute<T>(task: () => Promise<T>): Promise<T> {
    // Mengeksekusi tugas tanpa retry sama sekali.
    // Jika gagal, akan langsung throw error ke atas.
    return await task();
  }
}

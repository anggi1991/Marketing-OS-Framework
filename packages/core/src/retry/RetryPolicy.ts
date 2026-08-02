export interface RetryPolicy {
  /**
   * Mengeksekusi tugas dengan mekanisme retry.
   * Jika pada akhirnya tetap gagal, metode ini akan melempar error terakhir.
   * 
   * @param task Fungsi asinkron yang akan dieksekusi
   */
  execute<T>(task: () => Promise<T>): Promise<T>;
}

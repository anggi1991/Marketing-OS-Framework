# RFC: 0001 - Plugin SDK

- **Status:** Proposed
- **Author:** anggi1991 (Ecosystem Maintainer)
- **Date:** 2026-08-02

## 1. Ringkasan (Summary)
Mendefinisikan siklus hidup (lifecycle) `RuntimePlugin` secara formal. Plugin akan memiliki _hooks_ eksplisit yang menjamin keteraturan inisialisasi framework, sehingga `Runtime` dapat mendaftarkan adapter, provider, atau agen sebelum dijalankan.

## 2. Motivasi (Motivation)
Framework saat ini memiliki `runtime.use(plugin)`. Namun, tanpa spesifikasi yang jelas mengenai kapan _hooks_ dalam plugin dipanggil, developer dapat keliru melakukan mutasi pada state internal `Runtime` secara asinkron atau dalam urutan yang salah. Kita membutuhkan kontrak publik (SDK) agar siapapun bisa menulis plugin eksternal dengan *Developer Experience* (DX) yang terprediksi.

## 3. Desain Teknis (Detailed Design)
Interface `RuntimePlugin` akan mendefinisikan empat *lifecycle hooks* opsional:

```typescript
export interface RuntimePlugin {
  /** Nama unik plugin untuk mempermudah debugging dan registri */
  name: string;

  /**
   * Dipanggil secara sinkronous saat `runtime.use(plugin)` dieksekusi.
   * Digunakan HANYA untuk registrasi token, provider, dan adapter.
   * DILARANG melakukan I/O asinkronous di sini.
   */
  onRegister?(runtime: Runtime): void;

  /**
   * Dipanggil saat `runtime.start()` dimulai (Fase 1).
   * Digunakan untuk inisialisasi I/O berat, seperti koneksi DB atau Redis.
   */
  onBoot?(runtime: Runtime): Promise<void> | void;

  /**
   * Dipanggil setelah EventBus terhubung dan agen siap (Fase 2).
   * Digunakan untuk broadcast event "System Ready" atau post-initialization.
   */
  onReady?(runtime: Runtime): Promise<void> | void;

  /**
   * Dipanggil saat `runtime.stop()` dieksekusi (Fase 3).
   * Digunakan untuk pembersihan resource (cleanup) dengan rapi.
   */
  onShutdown?(runtime: Runtime): Promise<void> | void;
}
```

### Aturan Ketat Plugin:
1. **No State Mutation**: Plugin tidak boleh menimpa (override) array `agents` atau `pipelines` milik `Runtime` secara paksa (misalnya via Reflection atau any-casting).
2. **Registration Phase**: Registrasi dependensi (memanggil `runtime.registerAdapter`) HANYA boleh dilakukan di `onRegister`.

## 4. Kelemahan (Drawbacks)
- Menambahkan sedikit kompleksitas *boilerplate* untuk developer plugin karena harus mengikuti empat fase lifecycle ini.
- Jika ada plugin dengan fase `onBoot` yang sangat lama atau *hang*, seluruh runtime akan tertunda saat *start*. (Mitigasi: Runtime perlu menambahkan konfigurasi timeout saat *boot* di masa depan).

## 5. Alternatif (Alternatives)
- **Callback Hell**: Tidak menggunakan class/interface, hanya callback `setup(runtime)`. Kelemahannya sulit untuk melakukan *teardown* (shutdown) dengan rapi.
- **Dependency Injection Framework Otomatis**: Menggunakan library seperti InversifyJS. Kelemahannya menambah dependensi besar ke dalam `@agent-runtime/core` dan bertentangan dengan prinsip *lightweight*.

## 6. Pertanyaan Terbuka (Unresolved Questions)
- Haruskah plugin bisa menolak plugin lain? (misal: Redis Plugin bentrok dengan RabbitMQ Plugin jika mencoba mendaftarkan `EventBusAdapter` di namespace yang sama). Solusi saat ini: *Last plugin wins* atau *overwrite*.

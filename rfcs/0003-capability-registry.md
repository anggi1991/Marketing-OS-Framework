# RFC: 0003 - Capability Registry

- **Status:** Proposed
- **Author:** anggi1991 (Ecosystem Maintainer)
- **Date:** 2026-08-02

## 1. Ringkasan (Summary)
Memformalkan struktur registrasi dependensi di dalam `Runtime`. `Capability Registry` bertanggung jawab untuk mengelola *Adapters* (infrastruktur internal framework seperti EventBus, Logger) dan *Providers* (kapabilitas eksternal yang dikonsumsi oleh agen). 

## 2. Motivasi (Motivation)
Mencegah terjadinya _"plugin explosion"_ (seperti `plugin-openai`, `plugin-anthropic`, `plugin-sendgrid`). Alih-alih merancang sistem yang terikat pada *merk* (brand) teknologi, kita mengikatnya pada **Capability/Kapabilitas**.

## 3. Desain Teknis (Detailed Design)
`Runtime` berfungsi sebagai wadah *Inversion of Control* (IoC) primitif.

- **Adapters** menggantikan komponen fundamental dari kerangka kerja itu sendiri (misal: mengganti `InMemoryAdapter` dengan `RedisEventBusAdapter`).
- **Providers** menyediakan alat tambahan untuk logika bisnis (misal: `AIProvider`).

```typescript
export class Runtime {
  private providers: Map<string, RuntimeProvider> = new Map();
  private adapters: Map<string, RuntimeAdapter> = new Map();

  // Mendaftarkan infrastruktur internal
  public registerAdapter(token: string, adapter: RuntimeAdapter): this;
  
  // Mengambil infrastruktur internal (Hanya digunakan oleh core framework)
  public getAdapter<T extends RuntimeAdapter>(token: string): T;

  // Mendaftarkan tools bisnis
  public registerProvider(token: string, provider: RuntimeProvider): this;
  
  // Mengambil tools bisnis (Digunakan oleh Agent & Pipeline)
  public getProvider<T extends RuntimeProvider>(token: string): T;
}
```

### Autowiring Terbatas
Jika token `EventBusAdapter` didaftarkan, `Runtime` akan secara otomatis mengganti adapter *default* (InMemory) dengan adapter tersebut. 
_Registry_ harus menolak *registration* jika status `Runtime` adalah `isRunning = true` (Immutable setelah boot).

## 4. Kelemahan (Drawbacks)
- Registry ini sangat sederhana. Berbeda dengan *IoC Containers* seperti NestJS/Inversify yang bisa memecahkan dependensi berantai (A butuh B, B butuh C). (Namun ini sejalan dengan *design principles* kita: sederhana & ringan).

## 5. Alternatif (Alternatives)
- **Mengekspos Map secara Langsung**: Tidak aman, karena plugin bisa secara tidak sengaja menghapus kapabilitas lain secara sewenang-wenang menggunakan `runtime.providers.clear()`. Abstraksi API via metode `register` dan `get` memastikan framework dapat memvalidasi token atau menerapkan properti pembekuan (freezing).

## 6. Pertanyaan Terbuka (Unresolved Questions)
- Apakah kita perlu mengimplementasikan "Capability Aliasing" (misalnya `registerProvider('AI', 'OpenAIProvider')`)?
- Haruskah registry ini *read-only* setelah `runtime.start()` dipanggil? (Secara teknis iya, agar state konsisten dan aman dari race-conditions).
